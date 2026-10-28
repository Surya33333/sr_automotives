
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const error = new Error(
      data.message || `Request failed (${response.status})`
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export const cartApi = {
  get: () => apiRequest("/cart"),

  add: (item) =>
    apiRequest("/cart", {
      method: "POST",
      body: JSON.stringify({
        item_type: item.item_type,
        quantity: item.quantity || 1,
        ...(item.item_type === "product"
          ? { product_id: item.item_id }
          : {}),
        ...(item.item_type === "service"
          ? { service_id: item.item_id }
          : {}),
        ...(item.item_type === "offer"
          ? { offer_id: item.item_id }
          : {}),
        ...(item.selected_offer_items != null
          ? { selected_offer_items: item.selected_offer_items }
          : {}),
      }),
    }),

  update: (cartItemId, quantity) =>
    apiRequest(`/cart/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  remove: (cartItemId) =>
    apiRequest(`/cart/${cartItemId}`, {
      method: "DELETE",
    }),

  clear: () =>
    apiRequest("/cart", { method: "DELETE" }),

  merge: (items) =>
    apiRequest("/cart/merge", {
      method: "POST",
      body: JSON.stringify({ cart: items }),
    }),
};


export async function loadCartCatalog() {
  const [productResponse, serviceResponse, offerResponse] =
    await Promise.allSettled([
      apiRequest("/products"),
      apiRequest("/services"),
      apiRequest("/offers"),
    ]);

  function extractItems(result, key) {
    if (result.status === "rejected") {
      console.error(
        `Failed to load ${key}:`,
        result.reason?.message
      );
      return null;
    }

    const data = result.value;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) {
      return data.data[key];
    }
    if (Array.isArray(data?.data)) return data.data;

    console.warn(`Unexpected ${key} API response`, data);
    return null;
  }

  return {
    product: extractItems(productResponse, "products"),
    service: extractItems(serviceResponse, "services"),
    offer: extractItems(offerResponse, "offers"),
  };
}

