"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    FiChevronLeft,
    FiChevronRight,
    FiMinus,
    FiPlus,
    FiShoppingCart,
    FiStar,
    FiCheck,
    FiAlertCircle,
} from "react-icons/fi";
const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
const parseJSON = (value, fallback) => {
    if (value == null) return fallback;
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};
const getImages = (product) => {
    const images = parseJSON(product?.product_images, []);
    if (!Array.isArray(images)) return [];
    return images
        .map((image) =>
            typeof image === "string"
                ? image
                : image?.url || image?.src || ""
        )
        .filter(Boolean);
};
const getDiscount = (product) => {
    const mrp = Number(product?.product_mrp) || 0;
    const price = Number(product?.product_selling_price) || 0;
    if (mrp <= price || mrp === 0) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
};
const getRating = (product) =>
    Number(product?.average_rating ?? product?.rating ?? 0);
const getReviewCount = (product) =>
    Number(product?.review_count ?? product?.total_reviews ?? 0);
export default function ProductDetailsPage() {
    const params = useParams();
    const productSlug = params?.productSlug;
    const [product, setProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("specifications");
    const [cartMessage, setCartMessage] = useState("");
    const touchStartX = useRef(null);
    // Fetch product data
    useEffect(() => {
        if (!productSlug) return;
        let cancelled = false;
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch(`${API_URL}/products`);
                if (!response.ok) {
                    throw new Error("Unable to fetch products");
                }
                const data = await response.json();
                const products = Array.isArray(data.products)
                    ? data.products
                    : [];
                const selectedProduct = products.find(
                    (item) =>
                        item.product_slug?.toLowerCase() ===
                        String(productSlug).toLowerCase()
                );
                if (cancelled) return;
                setAllProducts(products);
                setProduct(selectedProduct || null);
                setActiveImage(0);
                setQuantity(1);
                setActiveTab("specifications");
                if (!selectedProduct) {
                    setError("Product not found.");
                }
            } catch (err) {
                if (cancelled) return;
                console.error("Product details error:", err);
                setError("Unable to load product details.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchProduct();
        return () => {
            cancelled = true;
        };
    }, [productSlug]);
    const images = useMemo(() => getImages(product), [product]);
    const specifications = useMemo(() => {
        const parsed = parseJSON(product?.product_specifications, {});
        if (Array.isArray(parsed)) {
            return parsed.map((item, index) => ({
                label: item?.name || item?.key || `Specification ${index + 1}`,
                value: item?.value ?? "",
            }));
        }
        if (parsed && typeof parsed === "object") {
            return Object.entries(parsed).map(([key, value]) => ({
                label: key.replace(/_/g, " "),
                value:
                    typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value ?? ""),
            }));
        }
        return [];
    }, [product]);
    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return allProducts
            .filter(
                (item) =>
                    item.product_id !== product.product_id &&
                    Number(item.category_id) ===
                    Number(product.category_id)
            )
            .slice(0, 4);
    }, [allProducts, product]);
    const stock = Number(product?.product_stock) || 0;
    const outOfStock = stock <= 0;
    const sellingPrice = Number(product?.product_selling_price) || 0;
    const mrp = Number(product?.product_mrp) || 0;
    const discount = getDiscount(product);
    const rating = getRating(product);
    const reviewCount = getReviewCount(product);
    // Auto slide every 4.5 seconds
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setActiveImage((current) => (current + 1) % images.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [images.length]);
    const nextImage = () => {
        if (images.length <= 1) return;
        setActiveImage((current) => (current + 1) % images.length);
    };
    const previousImage = () => {
        if (images.length <= 1) return;
        setActiveImage(
            (current) => (current - 1 + images.length) % images.length
        );
    };
    const handleTouchStart = (event) => {
        touchStartX.current = event.touches[0].clientX;
    };
    const handleTouchEnd = (event) => {
        if (touchStartX.current === null) return;
        const distance =
            event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(distance) > 50) {
            if (distance < 0) {
                nextImage();
            } else {
                previousImage();
            }
        }
        touchStartX.current = null;
    };
    const decreaseQuantity = () => {
        setQuantity((current) => Math.max(1, current - 1));
    };
    const increaseQuantity = () => {
        setQuantity((current) => Math.min(stock, current + 1));
    };
    // Temporary guest cart handling.
    // Replace with your existing cart API/context during cart integration.
    const handleAddToCart = () => {
        if (!product || outOfStock) return;
        try {
            const existingCart = JSON.parse(
                localStorage.getItem("sr_guest_cart") || "[]"
            );
            const cart = Array.isArray(existingCart) ? existingCart : [];
            const existingIndex = cart.findIndex(
                (item) => item.product_id === product.product_id
            );
            if (existingIndex >= 0) {
                cart[existingIndex].quantity = Math.min(
                    stock,
                    Number(cart[existingIndex].quantity || 0) + quantity
                );
            } else {
                cart.push({
                    product_id: product.product_id,
                    quantity,
                });
            }
            localStorage.setItem("sr_guest_cart", JSON.stringify(cart));
            setCartMessage("Product added to cart!");
            setTimeout(() => setCartMessage(""), 2500);
        } catch (err) {
            console.error("Add to cart error:", err);
            setCartMessage("Unable to add product to cart.");
        }
    };
    if (loading) {
        return (
            <main className="min-h-screen bg-[#F8F6F1] pt-28">
                <div className="section-container py-12">
                    <div className="grid gap-10 lg:grid-cols-2">
                        <div className="aspect-square animate-pulse rounded-xl bg-[#E5DED1]" />
                        <div className="space-y-5">
                            <div className="h-12 w-3/4 animate-pulse rounded bg-[#E5DED1]" />
                            <div className="h-6 w-1/3 animate-pulse rounded bg-[#E5DED1]" />
                            <div className="h-8 w-1/2 animate-pulse rounded bg-[#E5DED1]" />
                            <div className="h-24 animate-pulse rounded bg-[#E5DED1]" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }
    if (error || !product) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8F6F1] px-5 pt-10">
                <div className="text-center">
                    <FiAlertCircle
                        size={42}
                        className="mx-auto mb-5 text-[#B89655]"
                    />
                    <h1 className="text-2xl font-bold text-[#111111]">
                        Product Not Available
                    </h1>
                    <p className="mt-3 text-sm text-[#6F6B64]">
                        {error || "The requested product could not be found."}
                    </p>
                    <Link
                        href="/products"
                        className="mt-7 inline-block rounded-md bg-[#D8B66F] px-7 py-3 text-sm font-bold text-[#111111]"
                    >
                        Browse Products
                    </Link>
                </div>
            </main>
        );
    }
    return (
        <main className="min-h-screen bg-[#F8F6F1] pt-14 text-[#111111] lg:pt-20">
            <div className="section-container pb-16 pt-6 lg:pb-24">
                {/* BREADCRUMBS */}
                <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#6F6B64]">
                    <Link href="/" className="hover:text-[#B89655]">
                        Home
                    </Link>
                    <FiChevronRight size={12} />
                    <Link
                        href="/products"
                        className="hover:text-[#B89655]"
                    >
                        Products
                    </Link>
                    <FiChevronRight size={12} />
                    <span className="font-semibold text-[#111111]">
                        {product.product_name}
                    </span>
                </nav>
                {/* PRODUCT MAIN SECTION */}
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
                    {/* IMAGE GALLERY */}
                    <div className="min-w-0">
                        <div
                            className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#E5DED1] bg-white shadow-sm lg:aspect-[5/4]"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            {images.length > 0 ? (
                                <div
                                    className="flex h-full transition-transform duration-700 ease-in-out"
                                    style={{
                                        transform: `translateX(-${activeImage * 100}%)`,
                                    }}
                                >
                                    {images.map((src, index) => (
                                        <div
                                            key={`${src}-${index}`}
                                            className="relative h-full min-w-full"
                                        >
                                            <Image
                                                src={src}
                                                alt={`${product.product_name} - Image ${index + 1}`}
                                                fill
                                                unoptimized
                                                priority={index === 0}
                                                sizes="(max-width: 1024px) 100vw, 42vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-[#6F6B64]">
                                    No product image available
                                </div>
                            )}
                            {discount > 0 && (
                                <span className="absolute left-4 top-4 z-10 rounded bg-[#D8B66F] px-3 py-1.5 text-xs font-bold text-[#111111]">
                                    {discount}% OFF
                                </span>
                            )}
                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={previousImage}
                                        aria-label="Previous image"
                                        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5DED1] bg-white/90 shadow-sm transition hover:bg-[#D8B66F]"
                                    >
                                        <FiChevronLeft size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextImage}
                                        aria-label="Next image"
                                        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5DED1] bg-white/90 shadow-sm transition hover:bg-[#D8B66F]"
                                    >
                                        <FiChevronRight size={20} />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setActiveImage(index)}
                                                aria-label={`View image ${index + 1}`}
                                                className={`h-2.5 w-2.5 rounded-full transition-all ${activeImage === index
                                                    ? "bg-[#B89655]"
                                                    : "bg-[#D9D9D9]"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        {/* THUMBNAILS */}
                        {images.length > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                {images.map((src, index) => (
                                    <button
                                        key={`${src}-thumb-${index}`}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        aria-label={`Select product image ${index + 1}`}
                                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-all sm:h-24 sm:w-24 ${activeImage === index
                                            ? "border-[#D8B66F]"
                                            : "border-[#E5DED1] hover:border-[#B89655]"
                                            }`}
                                    >
                                        <Image
                                            src={src}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            unoptimized
                                            sizes="96px"
                                            className="object-contain p-2"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* PRODUCT INFORMATION */}
                    <div className="min-w-0">
                        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight sm:text-[38px] lg:text-[44px]">
                            {product.product_name}
                        </h1>
                        {/* RATINGS */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <FiStar
                                        key={index}
                                        size={16}
                                        className={
                                            index < Math.round(rating)
                                                ? "fill-[#C99C37] text-[#C99C37]"
                                                : "text-[#D8D1C5]"
                                        }
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-[#6F6B64]">
                                {rating > 0 ? rating.toFixed(1) : "No ratings"}
                                {" "}
                                ({reviewCount} customer reviews)
                            </span>
                        </div>
                        {/* PRICE */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <span className="text-3xl font-extrabold text-[#B89655] sm:text-4xl">
                                {formatPrice(sellingPrice)}
                            </span>
                            {mrp > sellingPrice && (
                                <>
                                    <span className="text-lg text-[#9A958C] line-through">
                                        {formatPrice(mrp)}
                                    </span>
                                    <span className="rounded-md bg-[#F0DCA9] px-3 py-1.5 text-xs font-bold text-[#111111]">
                                        {discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                        {/* DESCRIPTION */}
                        <p className="mt-6 text-sm leading-7 text-[#55514B] sm:text-base">
                            {product.product_description ||
                                "Explore this quality automotive product from SR Automotives."}
                        </p>
                        {/* QUANTITY & CART */}
                        <div className="mt-8 border-t border-[#E5DED1] pt-7">
                            <div className="mb-4 flex items-center gap-5">
                                <span className="text-sm font-semibold">
                                    Quantity:
                                </span>
                                <div className="flex h-12 items-center overflow-hidden rounded-md border border-[#E5DED1] bg-white">
                                    <button
                                        type="button"
                                        onClick={decreaseQuantity}
                                        disabled={quantity <= 1 || outOfStock}
                                        aria-label="Decrease quantity"
                                        className="flex h-full w-12 items-center justify-center transition hover:bg-[#F8F6F1] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <FiMinus size={16} />
                                    </button>
                                    <span className="flex h-full w-12 items-center justify-center border-x border-[#E5DED1] text-sm font-bold">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={increaseQuantity}
                                        disabled={outOfStock || quantity >= stock}
                                        aria-label="Increase quantity"
                                        className="flex h-full w-12 items-center justify-center transition hover:bg-[#F8F6F1] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <FiPlus size={16} />
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={outOfStock}
                                className="flex w-full items-center justify-center gap-3 rounded-md bg-[#D8B66F] px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-[#080909] transition-colors hover:bg-[#B89655] disabled:cursor-not-allowed disabled:bg-[#E5DED1] disabled:text-[#6F6B64]"
                            >
                                <FiShoppingCart size={19} />
                                {outOfStock ? "Out of Stock" : "Add to Cart"}
                            </button>
                            {cartMessage && (
                                <p
                                    role="status"
                                    className="mt-3 flex items-center gap-2 text-sm font-medium text-[#6F6B64]"
                                >
                                    <FiCheck className="text-[#B89655]" />
                                    {cartMessage}
                                </p>
                            )}
                            {!outOfStock && (
                                <p className="mt-3 text-xs text-[#6F6B64]">
                                    {stock} units available
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                {/* PRODUCT TABS */}
                <section className="mt-14 lg:mt-20">
                    <div className="flex gap-1 overflow-x-auto border-b border-[#E5DED1] sm:gap-3">
                        {[
                            { key: "specifications", label: "Specifications" },
                            { key: "description", label: "Description" },
                            { key: "reviews", label: `Reviews (${reviewCount})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative shrink-0 rounded-t-lg px-4 py-4 text-xs font-bold transition-colors sm:px-7 sm:text-sm ${activeTab === tab.key
                                    ? "bg-white text-[#111111]"
                                    : "text-[#6F6B64] hover:text-[#111111]"
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#D8B66F]" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="min-h-[180px] rounded-b-xl border border-t-0 border-[#E5DED1] bg-white p-4 sm:p-7">
                        {activeTab === "specifications" && (
                            specifications.length > 0 ? (
                                <div className="overflow-hidden rounded-md">
                                    {specifications.map((spec, index) => (
                                        <div
                                            key={`${spec.label}-${index}`}
                                            className={`grid grid-cols-[minmax(110px,35%)_minmax(0,1fr)] gap-4 px-4 py-3 text-sm ${index % 2 === 0
                                                ? "bg-[#F8F6F1]"
                                                : "bg-white"
                                                }`}
                                        >
                                            <span className="font-semibold capitalize text-[#111111]">
                                                {spec.label}
                                            </span>
                                            <span className="break-words text-[#55514B]">
                                                {spec.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#6F6B64]">
                                    Specifications are not available for this product.
                                </p>
                            )
                        )}
                        {activeTab === "description" && (
                            <div>
                                <h3 className="mb-4 text-lg font-bold">
                                    Product Description
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-8 text-[#55514B]">
                                    {product.product_description ||
                                        "No additional description is available."}
                                </p>
                            </div>
                        )}
                        {activeTab === "reviews" && (
                            <div>
                                <h3 className="text-lg font-bold">
                                    Customer Reviews
                                </h3>
                                <p className="mt-3 text-sm text-[#6F6B64]">
                                    {reviewCount === 0
                                        ? "There are no reviews yet."
                                        : `This product has ${reviewCount} customer reviews.`}
                                </p>
                                <p className="mt-3 text-xs text-[#6F6B64]">
                                    Individual customer reviews will be displayed
                                    once the product reviews API is connected.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
                {/* RELATED PRODUCTS */}
                {relatedProducts.length > 0 && (
                    <section className="mt-14 lg:mt-20">
                        <div className="mb-7 flex items-center justify-between gap-4">
                            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Related Products
                            </h2>
                            <Link
                                href="/products"
                                className="shrink-0 text-sm font-semibold text-[#6F6B64] transition hover:text-[#B89655]"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                            {relatedProducts.map((item) => {
                                const itemImages = getImages(item);
                                const itemPrice =
                                    Number(item.product_selling_price) || 0;
                                return (
                                    <div
                                        key={item.product_id}
                                        className="overflow-hidden rounded-xl border border-[#E5DED1] bg-white transition-shadow hover:shadow-lg"
                                    >
                                        <Link
                                            href={`/products/${item.product_slug}`}
                                            className="block"
                                        >
                                            <div className="relative aspect-square bg-white">
                                                {itemImages[0] ? (
                                                    <Image
                                                        src={itemImages[0]}
                                                        alt={item.product_name}
                                                        fill
                                                        unoptimized
                                                        sizes="(max-width: 640px) 50vw, 25vw"
                                                        className="object-contain p-4 transition-transform duration-300 hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-[#6F6B64]">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-3 pt-2 sm:px-4">
                                                <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold text-[#111111]">
                                                    {item.product_name}
                                                </h3>
                                                <div className="mt-2 flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, index) => (
                                                        <FiStar
                                                            key={index}
                                                            size={12}
                                                            className={
                                                                index < Math.round(getRating(item))
                                                                    ? "fill-[#C99C37] text-[#C99C37]"
                                                                    : "text-[#D8D1C5]"
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                                <p className="mt-3 text-base font-extrabold text-[#B89655]">
                                                    {formatPrice(itemPrice)}
                                                </p>
                                            </div>
                                        </Link>
                                        <div className="p-3 pt-4 sm:p-4">
                                            <Link
                                                href={`/products/${item.product_slug}`}
                                                className="block rounded-md bg-[#D8B66F] px-3 py-3 text-center text-xs font-bold uppercase text-[#111111] transition hover:bg-[#B89655]"
                                            >
                                                View Product
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
