
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiArrowRight,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartItem from "../../app/components/cart/CartItem";
import OrderSummary from "../../app/components/cart/OrderSummary";

const sections = [
  { type: "product", title: "Products" },
  { type: "service", title: "Services" },
  { type: "offer", title: "Special Offers" },
];

export default function CartPage() {
  const {
    items,
    count,
    cartLoading,
    cartError,
    busy,
    clearCart,
    refreshCart,
  } = useCart();

  const { isAuthenticated, authLoading } = useAuth();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = async () => {
    try {
      await clearCart();
      setConfirmClear(false);
    } catch (error) {
      console.error("Clear cart failed:", error.message);
    }
  };

  return (
    <main
      className="
    min-h-[100svh]
    bg-[var(--brand-cream)]
    pt-[calc(64px+24px)]
    pb-12
    text-[var(--text-primary)]
    sm:pt-[calc(64px+32px)]
    sm:pb-16
  "
    >
      <div className="section-container mx-auto px-4 sm:px-6">
        <nav className="mb-7 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--brand-gold)]">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[var(--text-primary)]">
            Shopping Cart
          </span>
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
              SR AUTOMOTIVES
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Shopping Cart
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {count} {count === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-red-600 disabled:opacity-50"
            >
              <FiTrash2 />
              Clear Cart
            </button>
          )}
        </div>

        {!authLoading && !isAuthenticated && items.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white px-5 py-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Your cart is saved on this device. Sign in to keep it
              with your account.
            </p>

            <Link
              href="/login?redirect=/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-gold)]"
            >
              Sign In <FiArrowRight />
            </Link>
          </div>
        )}

        {cartError && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{cartError}</p>
            <button
              type="button"
              onClick={refreshCart}
              className="mt-2 text-xs font-semibold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {authLoading || cartLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Loading your cart...
            </p>
          </div>
        ) : items.length === 0 && !cartError ? (
          <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[var(--brand-gold)]">
              <FiShoppingBag size={34} />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Your cart is empty
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              Explore our premium accessories, professional services,
              and exclusive offers for your vehicle.
            </p>

            <Link
              href="/products"
              className="mt-7 flex h-12 items-center gap-2 rounded-md bg-[var(--brand-gold)] px-8 text-sm font-semibold text-white"
            >
              Explore Products <FiArrowRight />
            </Link>
          </div>
        ) : items.length > 0 && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              {sections.map((section) => {
                const sectionItems = items.filter(
                  (item) => item.item_type === section.type
                );

                if (!sectionItems.length) return null;

                return (
                  <section
                    key={section.type}
                    className="overflow-hidden rounded-xl border border-[var(--border)] bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
                      <h2 className="text-lg font-bold">
                        {section.title}
                      </h2>
                      <span className="rounded-full bg-[var(--brand-cream)] px-3 py-1 text-xs font-semibold">
                        {sectionItems.length}
                      </span>
                    </div>

                    <div className="px-4 sm:px-6">
                      {sectionItems.map((item) => (
                        <CartItem
                          key={
                            item.cart_item_id ??
                            `${item.item_type}-${item.item_id}-${JSON.stringify(item.selected_offer_items ?? null)}`
                          }
                          item={item}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <OrderSummary />
          </div>
        )}

        {confirmClear && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-cart-title"
              className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
            >
              <h2 id="clear-cart-title" className="text-xl font-bold">
                Clear your cart?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                All items will be removed from your shopping cart.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 rounded-md border border-[var(--border)] px-4 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={busy}
                  className="flex-1 rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Clearing..." : "Clear Cart"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
