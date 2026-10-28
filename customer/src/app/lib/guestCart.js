
export const GUEST_CART_KEY = "sr_guest_cart";

export function getCartItemId(item) {
  return (
    item.item_id ??
    item.product_id ??
    item.service_id ??
    item.offer_id ??
    null
  );
}


export function normalizeGuestEntry(item) {
  if (!item || typeof item !== "object") return null;

  let type = item.item_type;

  // Support older guest cart entries
  if (!type) {
    if (item.product_id != null) {
      type = "product";
    } else if (item.service_id != null) {
      type = "service";
    } else if (item.offer_id != null) {
      type = "offer";
    }
  }

  const id =
    item.item_id ??
    item.product_id ??
    item.service_id ??
    item.offer_id;

  if (
    !["product", "service", "offer"].includes(type) ||
    id == null
  ) {
    return null;
  }

  return {
    ...item,
    item_type: type,
    item_id: String(id),
    quantity: Math.max(1, Number(item.quantity) || 1),
  };
}


export function readGuestCart() {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(GUEST_CART_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved.map(normalizeGuestEntry).filter(Boolean);
  } catch {
    return [];
  }
}

export function writeGuestCart(items, notify = true) {
  if (typeof window === "undefined") return;

  const normalized = items
    .map(normalizeGuestEntry)
    .filter(Boolean);

  localStorage.setItem(
    GUEST_CART_KEY,
    JSON.stringify(normalized)
  );

  if (notify) {
    window.dispatchEvent(new Event("sr-cart-changed"));
  }
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new Event("sr-cart-changed"));
}

export function cartItemKey(item) {
  return JSON.stringify([
    item.item_type,
    String(getCartItemId(item)),
    item.selected_offer_items ?? null,
  ]);
}

export function addGuestCartItem(item) {
  const normalized = normalizeGuestEntry(item);

  if (!normalized) {
    throw new Error("Invalid guest cart item");
  }

  const items = readGuestCart();
  const key = cartItemKey(normalized);

  const index = items.findIndex(
    (entry) => cartItemKey(entry) === key
  );

  if (index >= 0) {
    items[index] = {
      ...items[index],
      ...normalized,
      quantity:
        Number(items[index].quantity) +
        Number(normalized.quantity),
    };
  } else {
    items.push(normalized);
  }

  writeGuestCart(items);
  return items;
}
