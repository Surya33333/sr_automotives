
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiCreditCard,
  FiEdit2,
  FiMapPin,
  FiShield,
  FiShoppingBag,
  FiSmartphone,
  FiTruck,
  FiDollarSign,
} from "react-icons/fi";
import { useAuth } from "../../app/context/AuthContext";
import { useCart } from "../../app/context/CartContext";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const emptyAddress = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const paymentMethods = [
  { id: "ONLINE", title: "Pay Online", description: "UPI, cards, net banking and wallets through Razorpay", icon: FiCreditCard },
  { id: "COD", title: "Cash on Delivery", description: "Pay when your order is delivered", icon: FiTruck },
];


function parseAddress(value) {
  if (!value) return null;

  try {
    let parsed = value;

    // Handle JSON stored as a string
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    // Handle double-stringified JSON, if present
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    return {
      full_name: parsed.full_name ?? parsed.fullName ?? "",
      phone: parsed.phone ?? "",
      address_line1:
        parsed.address_line1 ?? parsed.addressLine1 ?? "",
      address_line2:
        parsed.address_line2 ?? parsed.addressLine2 ?? "",
      city: parsed.city ?? "",
      state: parsed.state ?? "",
      pincode: String(parsed.pincode ?? ""),
      country: parsed.country ?? "India",
    };
  } catch (error) {
    console.error("Unable to parse shipping address:", error);
    return null;
  }
}


function validateAddress(address) {
  if (!address.full_name.trim()) return "Enter your full name.";

  if (!/^[6-9]\d{9}$/.test(address.phone)) {
    return "Enter a valid 10-digit mobile number.";
  }

  if (!address.address_line1.trim()) {
    return "Enter your street address.";
  }

  if (!address.city.trim()) return "Enter your city.";
  if (!address.state.trim()) return "Enter your state.";

  if (!/^\d{6}$/.test(address.pincode)) {
    return "Enter a valid 6-digit PIN code.";
  }

  return "";
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-cream)] text-[var(--brand-gold)]">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function AddressField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[var(--text-primary)]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-gold)]"
      />
    </label>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const {
    customer,
    isAuthenticated,
    authLoading,
  } = useAuth();

  const {
    items,
    count,
    subtotal,
    cartLoading,
    cartError,
  } = useCart();

  const [address, setAddress] = useState(emptyAddress);
  const [savedAddress, setSavedAddress] = useState(null);
  const [editingAddress, setEditingAddress] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [step, setStep] = useState(1);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/checkout");
    }
  }, [authLoading, isAuthenticated, router]);


  useEffect(() => {
    if (!customer) return;

    const existing = parseAddress(
      customer.customer_shippingaddress
    );

    const initial = {
      ...emptyAddress,
      ...(existing || {}),

      // Prefer address-specific values if available;
      // otherwise use the customer's profile details.
      full_name:
        existing?.full_name ||
        customer.customer_fullname ||
        "",

      phone:
        existing?.phone ||
        customer.customer_phone ||
        "",
    };

    setAddress(initial);
    setSavedAddress(existing);
    const hasSavedAddress = Boolean(
      existing?.address_line1 &&
      existing?.city &&
      existing?.state &&
      existing?.pincode
    );

    setEditingAddress(!hasSavedAddress);
  }, [customer]);


  const groupedItems = useMemo(
    () => ({
      product: items.filter((item) => item.item_type === "product"),
      service: items.filter((item) => item.item_type === "service"),
      offer: items.filter((item) => item.item_type === "offer"),
    }),
    [items]
  );

  const changeAddress = (event) => {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]:
        name === "phone" || name === "pincode"
          ? value.replace(/\D/g, "")
          : value,
    }));

    setAddressError("");
  };

  const confirmAddress = async () => {
  // 1. Validate address first
  const error = validateAddress(address);

  if (error) {
    setAddressError(error);
    return;
  }

  // 2. Clear previous errors
  setAddressError("");
  setSavingAddress(true);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/checkout-address`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipping_address: address,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to update shipping address"
      );
    }

    // 3. Update address with saved database values
    setAddress(result.shipping_address);
    setSavedAddress(result.shipping_address);

    // 4. Close editor and continue to review order
    setEditingAddress(false);
    setStep(2);

  } catch (error) {
    console.error("Address update failed:", error);

    setAddressError(
      error.message || "Unable to save shipping address"
    );
  } finally {
    setSavingAddress(false);
  }
};

  const handlePayment = async () => {
    if (paymentLoading) return;

    if (editingAddress || validateAddress(address)) {
      setPaymentError("Please confirm your shipping address.");
      return;
    }

    if (paymentMethod === "COD") {
      setPaymentError(
        "Cash on Delivery is not enabled yet. Please choose Pay Online."
      );
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      const createResponse = await fetch(
        `${API_URL}/payments/create-order`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shipping_address: address,
          }),
        }
      );

      const order = await createResponse.json();

      if (!createResponse.ok || !order.success) {
        throw new Error(order.message || "Unable to create order.");
      }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "SR Automotives",
        description: "Secure Order Payment",
        order_id: order.razorpay_order_id,

        prefill: {
          name: address.full_name,
          contact: address.phone,
        },

        theme: {
          color: "#D8B66F",
        },

        handler: async (response) => {
          try {
            const verifyResponse = await fetch(
              `${API_URL}/payments/verify`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  order_id: order.order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const result = await verifyResponse.json();

            if (!verifyResponse.ok || !result.success) {
              throw new Error(
                result.message ||
                "Payment confirmation is pending. Please check your order status."
              );
            }

            router.push(`/orders/${order.order_id}`);
          } catch (error) {
            setPaymentError(
              error.message ||
              "Unable to confirm payment. Please check your order status before retrying."
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setPaymentError(
          response.error?.description || "Payment failed."
        );
        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      setPaymentError(error.message || "Payment could not be started.");
      setPaymentLoading(false);
    }
  };

  if (authLoading || cartLoading) {
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
        <p className="text-sm text-[var(--text-secondary)]">
          Preparing your checkout...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) return null;

  if (cartError) {
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
        <p className="font-semibold">Unable to load checkout</p>
        <p className="text-sm text-red-600">{cartError}</p>
        <Link href="/cart" className="text-sm underline">
          Return to Cart
        </Link>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="flex min-h-[70svh] flex-col items-center justify-center bg-[var(--brand-cream)] px-4 text-center">
        <FiShoppingBag
          size={40}
          className="text-[var(--brand-gold)]"
        />
        <h1 className="mt-5 text-2xl font-bold">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Add some items before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="mt-6 rounded-md bg-[var(--brand-gold)] px-6 py-3 text-sm font-semibold text-white"
        >
          Explore Products
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--brand-cream)] pb-16 pt-8 text-[var(--text-primary)]">
      <div className="section-container mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--brand-gold)]">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/cart"
            className="hover:text-[var(--brand-gold)]"
          >
            Cart
          </Link>
          <span>/</span>
          <span className="font-semibold text-[var(--text-primary)]">
            Checkout
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Complete your order securely.
          </p>
        </div>

        {/* Progress */}
        <div className="mx-auto mb-10 flex max-w-2xl items-center justify-between">
          {[
            "Confirm Address",
            "Pay Securely",
          ].map((label, index) => {
            const number = index + 1;
            const active = step >= number;

            return (
              <div
                key={label}
                className="flex min-w-0 flex-1 items-center"
              >
                <div className="flex min-w-0 flex-col items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ${active
                      ? "border-[var(--brand-gold)] bg-[var(--brand-gold)] text-white"
                      : "border-gray-300 bg-white text-gray-400"
                      }`}
                  >
                    {step > number ? <FiCheck /> : number}
                  </div>

                  <span
                    className={`text-center text-[10px] font-medium sm:text-xs ${active
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                      }`}
                  >
                    {label}
                  </span>
                </div>

                {index < 1 && (
                  <div
                    className={`mx-2 mb-6 h-px flex-1 ${step > number
                      ? "bg-[var(--brand-gold)]"
                      : "bg-gray-300"
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* LEFT */}
          <div className="min-w-0 space-y-6">
            {/* Shipping address */}
            <section className="rounded-xl border border-[var(--border)] bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionHeading
                  icon={FiMapPin}
                  title="Shipping Address"
                  description="Your delivery details"
                />

              </div>

              {editingAddress ? (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AddressField
                      label="Full Name"
                      name="full_name"
                      value={address.full_name}
                      onChange={changeAddress}
                      required
                    />

                    <AddressField
                      label="Phone Number"
                      name="phone"
                      value={address.phone}
                      onChange={changeAddress}
                      maxLength={10}
                      required
                    />
                  </div>

                  <AddressField
                    label="Address Line 1"
                    name="address_line1"
                    value={address.address_line1}
                    onChange={changeAddress}
                    placeholder="House number, building, street"
                    required
                  />

                  <AddressField
                    label="Address Line 2"
                    name="address_line2"
                    value={address.address_line2}
                    onChange={changeAddress}
                    placeholder="Area, landmark (optional)"
                  />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <AddressField
                      label="City"
                      name="city"
                      value={address.city}
                      onChange={changeAddress}
                      required
                    />

                    <AddressField
                      label="State"
                      name="state"
                      value={address.state}
                      onChange={changeAddress}
                      required
                    />

                    <AddressField
                      label="PIN Code"
                      name="pincode"
                      value={address.pincode}
                      onChange={changeAddress}
                      maxLength={6}
                      required
                    />
                  </div>

                  <AddressField
                    label="Country"
                    name="country"
                    value={address.country}
                    onChange={changeAddress}
                    required
                  />

                  {addressError && (
                    <p role="alert" className="text-sm text-red-600">
                      {addressError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Your address will be saved to your account.
                    </p>

                    <button
                      type="button"
                      onClick={confirmAddress}
                      disabled={savingAddress}
                      className="rounded-md bg-[var(--brand-gold)] px-5 py-3 text-sm font-semibold text-white"
                    >
                      {savingAddress ? "Saving..." : "Confirm Address"}
                    </button>

                  </div>
                </div>
              ) : (
                <div className="relative rounded-lg border border-[var(--border)] bg-[var(--brand-cream)] px-4 py-3 pr-12">
                  <button type="button" aria-label="Edit shipping address" title="Edit shipping address"
                    onClick={() => { setEditingAddress(true); setStep(1); setAddressError(""); setPaymentError(""); }}
                    className="absolute right-3 top-3 rounded-md p-2 text-[var(--brand-gold)] hover:bg-white focus-visible:outline-2 focus-visible:outline-[var(--brand-gold)]">
                    <FiEdit2 size={16} />
                  </button>
                  <p className="flex items-center gap-2 text-xs font-semibold"><FiCheckCircle className="text-[var(--brand-gold)]" /> Delivery Address</p>
                  <p className="mt-2 text-sm font-semibold">{address.full_name} <span className="font-normal text-[var(--text-secondary)]">· +91 {address.phone}</span></p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                    {[address.address_line1, address.address_line2, address.city, address.state, address.pincode, address.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
              {!editingAddress && step === 1 && (
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={() => { setAddressError(""); setStep(2); }}
                    className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-gold)] px-5 py-3 text-sm font-semibold text-white">
                    Continue to Payment <FiArrowRight />
                  </button>
                </div>
              )}
            </section>

            {/* Review */}
            <section className="rounded-xl border border-[var(--border)] bg-white p-5 sm:p-7">
              <SectionHeading
                icon={FiShoppingBag}
                title="Review Order"
                description="Check your items before payment"
              />

              <div className="space-y-4">
                {[
                  ["product", "Products"],
                  ["service", "Services"],
                  ["offer", "Offers"],
                ].map(([type, title]) => {
                  const group = groupedItems[type];

                  if (!group.length) return null;

                  return (
                    <div key={type}>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--brand-gold)]">
                        {title}
                      </h3>

                      {group.map((item, index) => (
                        <div
                          key={
                            item.cart_item_id ||
                            `${type}-${item.item_id}-${index}`
                          }
                          className="flex gap-3 border-b border-[var(--border)] py-3 last:border-b-0"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--brand-cream)]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || "Item"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <FiShoppingBag className="text-[var(--brand-gold)]" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-bold">
                            {formatPrice(
                              item.unit_price * item.quantity
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <Link
                href="/cart"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-gold)]"
              >
                <FiEdit2 />
                Edit Cart
              </Link>

            </section>

            {/* Payment */}
            <section className="rounded-xl border border-[var(--border)] bg-white p-5 sm:p-7">
              <SectionHeading
                icon={FiCreditCard}
                title="Payment Options"
                description="Choose your preferred payment method"
              />

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const selected = paymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${selected
                        ? "border-[var(--brand-gold)] bg-[var(--brand-cream)]"
                        : "border-[var(--border)] hover:border-[var(--brand-gold)]"
                        }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={selected}
                        onChange={() => setPaymentMethod(method.id)}
                        className="accent-[var(--brand-gold)]"
                      />

                      <Icon
                        size={23}
                        className="shrink-0 text-[var(--brand-gold)]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {method.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[var(--text-secondary)]">
                Online payment methods are selected securely inside Razorpay Checkout.
              </p>

              {paymentMethod === "COD" && <p role="status" className="mt-3 text-xs text-amber-700">Cash on Delivery is not yet supported by the backend. Select Pay Online to place your order.</p>}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-gold)]"
                >
                  <FiArrowLeft />
                  Back to Cart
                </Link>

                {paymentError && (
                  <p role="alert" className="mb-4 text-sm text-red-600">
                    {paymentError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={step !== 2 || editingAddress || paymentLoading || paymentMethod === "COD"}
                  className="flex items-center gap-2 rounded-md bg-[var(--brand-gold)] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentLoading ? "Processing..." : paymentMethod === "COD" ? "COD Coming Soon" : "Pay Securely"}
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="min-w-0 space-y-5 lg:sticky lg:top-24">
            <div className="rounded-xl border border-[var(--border)] bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <Link
                  href="/cart"
                  className="text-xs font-semibold text-[var(--brand-gold)] underline"
                >
                  Edit Cart
                </Link>
              </div>

              <div className="space-y-4 border-b border-[var(--border)] pb-5 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--text-secondary)]">
                    Subtotal ({count} items)
                  </span>
                  <span className="font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[var(--text-secondary)]">
                    Shipping
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Calculated later
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[var(--text-secondary)]">
                    Discount
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Not applied
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-5">
                <span className="font-bold">
                  Estimated Subtotal
                </span>
                <span className="text-2xl font-extrabold">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                Final total will be calculated by the backend
                before payment.
              </p>
            </div>

            <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-white p-5">
              <FiShield
                size={22}
                className="shrink-0 text-[var(--brand-gold)]"
              />

              <div>
                <p className="text-sm font-bold">
                  Secure Checkout
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  Online payments are processed securely through Razorpay.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}