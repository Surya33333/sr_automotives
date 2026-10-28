
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
  getCartItemId
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

  if (!parsed) return "";

  if (Array.isArray(parsed)) {
    return firstImage(parsed[0]);
  }

  if (typeof parsed === "object") {
    return firstImage(
      parsed.url ??
      parsed.src ??
      parsed.image_url ??
      parsed.image ??
      parsed.images ??
      parsed.media ??
      ""
    );
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
  const id = getCartItemId(item);

  const records = catalog[type];

  const record = Array.isArray(records)
    ? records.find((entry) => {
      const recordId =
        type === "product"
          ? entry.product_id
          : type === "service"
            ? entry.service_id
            : entry.offer_id;

      return String(recordId) === String(id);
    })
    : null;

  const name =
    record?.product_name ??
    record?.service_title ??
    record?.offer_title ??
    item.name ??
    `${type} ${id}`;

  const image =
    firstImage(
      record?.product_images ??
      record?.service_media ??
      record?.offer_images
    ) ||
    firstImage(item.image ?? item.images ?? item.media);

  const unitPrice = Number(
    record?.product_selling_price ??
    record?.service_selling_price ??
    record?.offer_price ??
    item.unit_price ??
    0
  );

  const mrp = Number(
    record?.product_mrp ??
    record?.service_mrp ??
    record?.actual_price ??
    item.mrp ??
    unitPrice
  );

  const stock =
    type === "product"
      ? record?.product_stock ?? item.stock ?? null
      : type === "offer"
        ? record?.offer_stock ?? item.stock ?? null
        : null;

  return {
    ...item,
    item_type: type,
    item_id: String(id),
    name,
    image,
    unit_price: unitPrice,
    mrp,
    quantity: Number(item.quantity) || 1,
    stock,
    brand:
      record?.product_brand ??
      item.brand ??
      "SR Automotives",
    description:
      record?.product_description ??
      record?.service_description ??
      record?.offer_description ??
      item.description ??
      "",
    unavailable:
      Array.isArray(records)
        ? !record
        : Boolean(item.unavailable),
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
      if (version === generation.current) {
        setItems([]);
      }
      return;
    }

    const catalog = await loadCartCatalog();

    if (version !== generation.current) return;

    const enrichedItems = saved.map((item) =>
      normalizeGuestItem(item, catalog)
    );

    writeGuestCart(enrichedItems, false);
    setItems(enrichedItems);
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

          const mergeItems = guestItems.map((item) => ({
            item_type: item.item_type,
            item_id: getCartItemId(item),
            quantity: Number(item.quantity) || 1,
            ...(item.selected_offer_items != null
              ? { selected_offer_items: item.selected_offer_items }
              : {}),
          }));

          if (mergeItems.some((item) => !item.item_id)) {
            throw new Error(
              "Some guest cart items have invalid IDs. Cart was not merged."
            );
          }

          await cartApi.merge(mergeItems);


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
        // Avoid a second refresh from the cart-change event.
        const normalized = addGuestCartItem(item);

        // Update immediately using the available guest-cart data.
        setItems(normalized);
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
