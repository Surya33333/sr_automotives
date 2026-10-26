
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function OrderSummary() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, count, subtotal, busy, cartLoading } = useCart();

  const hasUnavailable = items.some(
    (item) =>
      item.unavailable ||
      (item.stock != null && item.quantity > Number(item.stock))
  );

  function proceed() {
    if (isAuthenticated) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  }

  return (
    <aside className="rounded-xl border border-[var(--border)] bg-white p-5 sm:p-6 lg:sticky lg:top-24">
      <h2 className="border-b border-[var(--border)] pb-4 text-xl font-bold">
        Order Summary
      </h2>

      <div className="space-y-4 py-5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[var(--text-secondary)]">
            Subtotal ({count} items)
          </span>
          <span className="font-semibold">{currency(subtotal)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-[var(--text-secondary)]">
            Shipping
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            Calculated at checkout
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-[var(--text-secondary)]">
            Discounts
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            Calculated at checkout
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-5">
        <span className="font-semibold">Estimated Subtotal</span>
        <span className="text-2xl font-bold">
          {currency(subtotal)}
        </span>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-secondary)]">
        Final prices and availability will be confirmed during checkout.
      </p>

      <button
        type="button"
        onClick={proceed}
        disabled={!items.length || busy || cartLoading || hasUnavailable}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--brand-gold)] text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
        <FiArrowRight />
      </button>

      {hasUnavailable && (
        <p className="mt-3 text-xs text-red-600">
          Please remove unavailable items or adjust quantities.
        </p>
      )}

      <Link
        href="/products"
        className="mt-3 flex h-11 items-center justify-center rounded-md border border-[var(--border)] text-sm font-semibold transition hover:border-[var(--brand-gold)]"
      >
        Continue Shopping
      </Link>
    </aside>
  );
}
