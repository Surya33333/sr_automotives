
"use client";

import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function CartItem({ item }) {
  const { updateQuantity, removeItem, busy } = useCart();

  const changeQuantity = async (quantity) => {
    try {
      await updateQuantity(item, quantity);
    } catch (error) {
      console.error("Quantity update failed:", error.message);
    }
  };

  const remove = async () => {
    try {
      await removeItem(item);
    } catch (error) {
      console.error("Remove failed:", error.message);
    }
  };

  const maxStock =
    item.stock == null ? Infinity : Number(item.stock);

  return (
    <article className="flex gap-3 border-b border-[var(--border)] py-5 last:border-b-0 sm:gap-5">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--brand-cream)] sm:h-32 sm:w-32">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name || "Cart item"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="px-2 text-center text-xs text-[var(--text-secondary)]">
            SR AUTOMOTIVES
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-gold)]">
              {item.item_type}
            </p>
            <h3 className="text-sm font-semibold leading-snug text-[var(--text-primary)] sm:text-base">
              {item.name}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Item ID: {item.item_id}
            </p>
            {item.unavailable && (
              <p className="mt-1 text-xs text-red-600">
                Item currently unavailable
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={busy}
            aria-label={`Remove ${item.name}`}
            className="rounded-md p-2 text-[var(--text-secondary)] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <FiTrash2 size={17} />
          </button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex h-9 items-center rounded-md border border-[var(--border)]">
            <button
              type="button"
              disabled={busy || item.quantity <= 1}
              onClick={() => changeQuantity(item.quantity - 1)}
              className="flex h-full w-9 items-center justify-center disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <FiMinus size={13} />
            </button>

            <span className="w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>

            <button
              type="button"
              disabled={busy || item.quantity >= maxStock}
              onClick={() => changeQuantity(item.quantity + 1)}
              className="flex h-full w-9 items-center justify-center disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <FiPlus size={13} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-base font-bold text-[var(--text-primary)] sm:text-lg">
              {currency(item.unit_price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-[11px] text-[var(--text-secondary)]">
                {currency(item.unit_price)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
