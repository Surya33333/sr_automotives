
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";
import { cartApi, loadCartCatalog } from "../lib/api";
import {
  addGuestCartItem,
  cartItemKey,
  clearGuestCart,
  readGuestCart,
  writeGuestCart,
} from "../lib/guestCart";

const CartContext = createContext(null);

function parseJson(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function firstImage(value) {
  const parsed = parseJson(value);

  if (Array.isArray(parsed)) {
    const first = parsed[0];
    return typeof first === "string" ? first : first?.url || "";
  }

  if (parsed && typeof parsed === "object") {
    return firstImage(parsed.images || parsed.url || "");
  }

  return typeof parsed === "string" ? parsed : "";
}

function normalizeServerItem(item) {
  return {
    ...item,
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
    image: firstImage(item.images || item.media || item.image),
  };
}

function normalizeGuestItem(item, catalog) {
  const type = item.item_type;
  const id = item.item_id;

  const record = (catalog[type] || []).find((entry) => {
    const recordId =
      type === "product"
        ? entry.product_id
        : type === "service"
          ? entry.service_id
          : entry.offer_id;

    return String(recordId) === String(id);
  });

  return {
    ...item,
    quantity: Number(item.quantity) || 1,
    name:
      record?.product_name ||
      record?.service_title ||
      record?.offer_title ||
      `${type} ${id}`,
    unit_price: Number(
      record?.product_selling_price ??
      record?.service_selling_price ??
      record?.offer_price ??
      0
    ),
    image: firstImage(
      record?.product_images ??
      record?.service_media ??
      record?.offer_images
    ),
    stock:
      type === "product"
        ? record?.product_stock
        : type === "offer"
          ? record?.offer_stock
          : undefined,
    unavailable: !record,
  };
}

export function CartProvider({ children }) {
  const { customer, isAuthenticated, authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [busy, setBusy] = useState(false);

  const generation = useRef(0);
  const operationLock = useRef(false);
  const customerId = customer?.customer_id ?? null;

  const loadGuestCart = useCallback(async (version) => {
    const saved = readGuestCart();

    if (!saved.length) {
      if (version === generation.current) setItems([]);
      return;
    }

    const catalog = await loadCartCatalog();
    if (version !== generation.current) return;

    setItems(
      saved.map((item) => normalizeGuestItem(item, catalog))
    );
  }, []);

  const refreshCart = useCallback(async () => {
    if (authLoading) return;

    const version = ++generation.current;
    setCartLoading(true);
    setCartError("");

    try {
      if (isAuthenticated) {
        const guestItems = readGuestCart();

        if (guestItems.length) {
          // Merge before loading the authenticated cart.
          await cartApi.merge(
            guestItems.map((item) => ({
              item_type: item.item_type,
              item_id: item.item_id,
              quantity: Number(item.quantity) || 1,
              ...(item.selected_offer_items != null
                ? { selected_offer_items: item.selected_offer_items }
                : {}),
            }))
          );

          if (version !== generation.current) return;

          // Clear only after the merge API succeeds.
          clearGuestCart();
        }

        const result = await cartApi.get();

        if (version === generation.current) {
          setItems((result.cart || []).map(normalizeServerItem));
        }
      } else {
        await loadGuestCart(version);
      }
    } catch (error) {
      if (version === generation.current) {
        setCartError(error.message);
        // Don't erase the guest cart after a failed merge.
      }
    } finally {
      if (version === generation.current) {
        setCartLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, loadGuestCart]);

  useEffect(() => {
    if (authLoading) return;

    refreshCart();

    return () => {
      generation.current += 1;
    };
  }, [authLoading, customerId, refreshCart]);

  useEffect(() => {
    if (authLoading || isAuthenticated) return;

    const sync = () => refreshCart();

    window.addEventListener("sr-cart-changed", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("sr-cart-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [authLoading, isAuthenticated, refreshCart]);

  const runMutation = useCallback(async (callback) => {
    if (operationLock.current) return;

    operationLock.current = true;
    setBusy(true);
    setCartError("");

    try {
      await callback();
      await refreshCart();
    } catch (error) {
      setCartError(error.message);
      throw error;
    } finally {
      operationLock.current = false;
      setBusy(false);
    }
  }, [refreshCart]);

  const addItem = useCallback(async (item) => {
    if (authLoading) return;

    await runMutation(async () => {
      if (isAuthenticated) {
        await cartApi.add(item);
      } else {
        addGuestCartItem(item);
      }
    });
  }, [authLoading, isAuthenticated, runMutation]);

  const updateQuantity = useCallback(async (item, quantity) => {
    if (quantity < 1) return;

    await runMutation(async () => {
      if (isAuthenticated) {
        await cartApi.update(item.cart_item_id, quantity);
      } else {
        const saved = readGuestCart();
        const key = cartItemKey(item);

        writeGuestCart(
          saved.map((entry) =>
            cartItemKey(entry) === key
              ? { ...entry, quantity }
              : entry
          )
        );
      }
    });
  }, [isAuthenticated, runMutation]);

  const removeItem = useCallback(async (item) => {
    await runMutation(async () => {
      if (isAuthenticated) {
        await cartApi.remove(item.cart_item_id);
      } else {
        const key = cartItemKey(item);

        writeGuestCart(
          readGuestCart().filter(
            (entry) => cartItemKey(entry) !== key
          )
        );
      }
    });
  }, [isAuthenticated, runMutation]);

  const clearCart = useCallback(async () => {
    await runMutation(async () => {
      if (isAuthenticated) {
        await cartApi.clear();
      } else {
        clearGuestCart();
      }
    });
  }, [isAuthenticated, runMutation]);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.unit_price) * item.quantity,
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        cartLoading,
        cartError,
        busy,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
