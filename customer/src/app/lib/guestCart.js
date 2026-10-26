
export const GUEST_CART_KEY = "sr_guest_cart";

export function readGuestCart() {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(GUEST_CART_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("sr-cart-changed"));
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new Event("sr-cart-changed"));
}

export function cartItemKey(item) {
  return [
    item.item_type,
    item.item_id,
    JSON.stringify(item.selected_offer_items ?? null),
  ].join(":");
}

export function addGuestCartItem(item) {
  const items = readGuestCart();
  const key = cartItemKey(item);
  const existing = items.find((entry) => cartItemKey(entry) === key);

  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    items.push({
      item_type: item.item_type,
      item_id: item.item_id,
      quantity: item.quantity || 1,
      ...(item.selected_offer_items != null
        ? { selected_offer_items: item.selected_offer_items }
        : {}),
    });
  }

  writeGuestCart(items);
  return items;
}
