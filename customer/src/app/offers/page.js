"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    FiArrowUpRight,
    FiChevronRight,
    FiGift,
    FiSearch,
    FiRefreshCw,
    FiPackage,
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
function parseJSON(value, fallback) {
    if (value == null) return fallback;
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}
function getOfferImages(offer) {
    const media = parseJSON(offer.offer_images, []);
    const images = Array.isArray(media)
        ? media
        : Array.isArray(media?.images)
          ? media.images
          : [];
    return images
        .map((item) => {
            if (typeof item === "string") return item;
            return item?.url || item?.src || "";
        })
        .filter((url) => typeof url === "string" && url.trim());
}
function getBundleCount(offer) {
    const bundle = parseJSON(offer.product_bundle, []);
    if (Array.isArray(bundle)) {
        return bundle.length;
    }
    if (Array.isArray(bundle?.products)) {
        return bundle.products.length;
    }
    if (Array.isArray(bundle?.items)) {
        return bundle.items.length;
    }
    return 0;
}
function getDiscount(offer) {
    const actual = Number(offer.actual_price) || 0;
    const price = Number(offer.offer_price) || 0;
    if (!actual || actual <= price) return 0;
    return Math.round(((actual - price) / actual) * 100);
}
function getSavings(offer) {
    const actual = Number(offer.actual_price) || 0;
    const price = Number(offer.offer_price) || 0;
    return Math.max(0, actual - price);
}
function isOfferActive(offer) {
    const status = offer.offer_status;
    const enabled =
        status === undefined ||
        status === null ||
        status === true ||
        status === 1 ||
        status === "1";
    if (!enabled) return false;
    const now = Date.now();
    if (
        offer.start_date &&
        new Date(offer.start_date).getTime() > now
    ) {
        return false;
    }
    if (
        offer.end_date &&
        new Date(offer.end_date).getTime() < now
    ) {
        return false;
    }
    return true;
}
export default function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("recommended");
    const [filter, setFilter] = useState("all");
    useEffect(() => {
        let cancelled = false;
        const fetchOffers = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch(`${API_URL}/offers`);
                if (!response.ok) {
                    throw new Error("Unable to fetch offers");
                }
                const data = await response.json();
                if (cancelled) return;
                setOffers(
                    Array.isArray(data.offers) ? data.offers : []
                );
            } catch (err) {
                if (cancelled) return;
                console.error("Offers fetch error:", err);
                setError("Unable to load offers right now.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchOffers();
        return () => {
            cancelled = true;
        };
    }, []);
    const activeOffers = useMemo(
        () => offers.filter(isOfferActive),
        [offers]
    );
    const displayedOffers = useMemo(() => {
        let result = [...activeOffers];
        const query = search.trim().toLowerCase();
        if (query) {
            result = result.filter((offer) => {
                const title = String(offer.offer_title || "");
                const description = String(
                    offer.offer_description || ""
                );
                return `${title} ${description}`
                    .toLowerCase()
                    .includes(query);
            });
        }
        if (filter === "highest-discount") {
            result = result.filter(
                (offer) => getDiscount(offer) >= 20
            );
        }
        if (filter === "budget") {
            result = result.filter(
                (offer) => Number(offer.offer_price) <= 5000
            );
        }
        if (sortBy === "price-low") {
            result.sort(
                (a, b) =>
                    Number(a.offer_price) - Number(b.offer_price)
            );
        }
        if (sortBy === "price-high") {
            result.sort(
                (a, b) =>
                    Number(b.offer_price) - Number(a.offer_price)
            );
        }
        if (sortBy === "discount") {
            result.sort(
                (a, b) => getDiscount(b) - getDiscount(a)
            );
        }
        if (sortBy === "newest") {
            result.sort(
                (a, b) =>
                    new Date(b.created_at || 0).getTime() -
                    new Date(a.created_at || 0).getTime()
            );
        }
        return result;
    }, [activeOffers, search, sortBy, filter]);
    return (
        <main className="min-h-screen bg-[#F8F6F1] pt-14 text-[#111111] lg:pt-14">
            <div className="section-container pb-16 pt-8 lg:pb-24">
                {/* BREADCRUMBS */}
                <nav className="mb-8 flex items-center gap-2 text-xs text-[#6F6B64]">
                    <Link
                        href="/"
                        className="transition hover:text-[#B89655]"
                    >
                        Home
                    </Link>
                    <FiChevronRight size={13} />
                    <span className="font-semibold text-[#111111]">
                        Offers
                    </span>
                </nav>
                {/* PAGE HEADER */}
                <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#B89655]">
                            <FiGift size={16} />
                            Exclusive Deals
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                            Special Offers
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-[#6F6B64] sm:text-base">
                            Explore exclusive automotive packages and
                            bundled deals at special prices.
                        </p>
                    </div>
                    {/* SEARCH */}
                    <div className="relative w-full lg:max-w-[380px]">
                        <FiSearch
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F6B64]"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search offers..."
                            className="h-12 w-full rounded-lg border border-[#E5DED1] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#D8B66F]"
                        />
                    </div>
                </div>
                {/* PROMOTIONAL BANNER */}
                <section className="relative mb-10 overflow-hidden rounded-2xl bg-[#080909] px-6 py-9 text-white sm:px-10 sm:py-12 lg:px-14">
                    <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#D8B66F]/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 right-32 h-56 w-56 rounded-full bg-[#D8B66F]/10 blur-3xl" />
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#D8B66F]/40 bg-[#D8B66F]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#F0DCA9]">
                            <FiGift size={14} />
                            SR Automotives Offers
                        </span>
                        <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                            More for your car.
                            <span className="block text-[#D8B66F]">
                                Better value for you.
                            </span>
                        </h2>
                        <p className="mt-5 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
                            Discover thoughtfully bundled automotive
                            accessories and services, all in one
                            convenient package.
                        </p>
                        <a
                            href="#available-offers"
                            className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#D8B66F] px-6 py-3 text-xs font-extrabold uppercase tracking-wide text-[#080909] transition hover:bg-[#B89655]"
                        >
                            Explore Offers
                            <FiArrowUpRight size={17} />
                        </a>
                    </div>
                    <FiGift
                        size={100}
                        strokeWidth={0.7}
                        className="pointer-events-none absolute bottom-2 -right-2 hidden rotate-[-10deg] text-[#D8B66F]/20 lg:block"
                    />
                    <FiGift
                        size={150}
                        strokeWidth={0.7}
                        className="pointer-events-none absolute bottom-1 right-17 hidden text-[#D8B66F]/20 lg:block"
                    />
                </section>
                {/* FILTER BAR */}
                <section
                    id="available-offers"
                    className="scroll-mt-28"
                >
                    <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                        <div>
                            <h2 className="text-xl font-extrabold sm:text-2xl">
                                Available Offers
                            </h2>
                            <p className="mt-1 text-sm text-[#6F6B64]">
                                {loading
                                    ? "Loading offers..."
                                    : `${displayedOffers.length} offers found`}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {[
                                    {
                                        value: "all",
                                        label: "All Offers",
                                    },
                                    {
                                        value: "highest-discount",
                                        label: "20%+ Off",
                                    },
                                    {
                                        value: "budget",
                                        label: "Under ₹5,000",
                                    },
                                ].map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() =>
                                            setFilter(item.value)
                                        }
                                        className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                                            filter === item.value
                                                ? "border-[#080909] bg-[#080909] text-white"
                                                : "border-[#E5DED1] bg-white text-[#111111] hover:border-[#D8B66F]"
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                            <select
                                value={sortBy}
                                onChange={(event) =>
                                    setSortBy(event.target.value)
                                }
                                aria-label="Sort offers"
                                className="h-11 rounded-lg border border-[#E5DED1] bg-white px-3 text-xs font-medium outline-none focus:border-[#D8B66F]"
                            >
                                <option value="recommended">
                                    Recommended
                                </option>
                                <option value="newest">
                                    Newest First
                                </option>
                                <option value="price-low">
                                    Price: Low to High
                                </option>
                                <option value="price-high">
                                    Price: High to Low
                                </option>
                                <option value="discount">
                                    Highest Discount
                                </option>
                            </select>
                        </div>
                    </div>
                    {/* LOADING */}
                    {loading && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-xl border border-[#E5DED1] bg-white"
                                    >
                                        <div className="aspect-[4/3] animate-pulse bg-[#E5DED1]" />
                                        <div className="space-y-4 p-5">
                                            <div className="h-5 w-3/4 animate-pulse rounded bg-[#E5DED1]" />
                                            <div className="h-4 w-full animate-pulse rounded bg-[#E5DED1]" />
                                            <div className="h-8 w-1/2 animate-pulse rounded bg-[#E5DED1]" />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                    {/* ERROR */}
                    {!loading && error && (
                        <div className="rounded-xl border border-[#E5DED1] bg-white px-6 py-14 text-center">
                            <FiAlertCircle
                                size={38}
                                className="mx-auto text-[#B89655]"
                            />
                            <h3 className="mt-4 text-lg font-bold">
                                Unable to Load Offers
                            </h3>
                            <p className="mt-2 text-sm text-[#6F6B64]">
                                {error}
                            </p>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#D8B66F] px-5 py-3 text-xs font-bold"
                            >
                                <FiRefreshCw size={15} />
                                Try Again
                            </button>
                        </div>
                    )}
                    {/* EMPTY STATE */}
                    {!loading &&
                        !error &&
                        displayedOffers.length === 0 && (
                            <div className="rounded-xl border border-[#E5DED1] bg-white px-6 py-16 text-center">
                                <FiGift
                                    size={42}
                                    className="mx-auto text-[#B89655]"
                                />
                                <h3 className="mt-4 text-lg font-bold">
                                    No Offers Found
                                </h3>
                                <p className="mt-2 text-sm text-[#6F6B64]">
                                    Try another search or filter.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setFilter("all");
                                        setSortBy("recommended");
                                    }}
                                    className="mt-6 rounded-md bg-[#D8B66F] px-6 py-3 text-xs font-bold"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    {/* OFFERS GRID */}
                    {!loading && !error && displayedOffers.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
                            {displayedOffers.map((offer) => {
                                const images = getOfferImages(offer);
                                const offerImage = images[0] || null;
                                const discount = getDiscount(offer);
                                const savings = getSavings(offer);
                                const bundleCount = getBundleCount(offer);
                                const outOfStock =
                                    offer.offer_stock != null &&
                                    Number(offer.offer_stock) <= 0;
                                return (
                                    <article
                                        key={offer.offer_id}
                                        className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E5DED1] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#D8B66F] hover:shadow-[0_14px_35px_rgba(8,9,9,0.08)]"
                                    >
                                        {/* IMAGE */}
                                        <Link
                                            href={`/offers/${encodeURIComponent(offer.offer_id)}`}
                                            className="relative block aspect-[4/3] overflow-hidden bg-[#F8F6F1]"
                                        >
                                            {offerImage ? (
                                                <Image
                                                    src={offerImage}
                                                    alt={offer.offer_title}
                                                    fill
                                                    unoptimized
                                                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                                                    className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#151515]">
                                                    <FiGift
                                                        size={48}
                                                        className="text-[#D8B66F]"
                                                    />
                                                    <span className="text-xs text-white/60">
                                                        Offer Package
                                                    </span>
                                                </div>
                                            )}
                                            {discount > 0 && (
                                                <span className="absolute left-4 top-4 rounded-md bg-[#D8B66F] px-3 py-2 text-xs font-extrabold text-[#080909]">
                                                    {discount}% OFF
                                                </span>
                                            )}
                                            {outOfStock && (
                                                <span className="absolute right-4 top-4 rounded-md bg-[#080909] px-3 py-2 text-xs font-bold text-white">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </Link>
                                        {/* CONTENT */}
                                        <div className="flex flex-1 flex-col p-5">
                                            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#B89655]">
                                                <FiPackage size={14} />
                                                Bundle Offer
                                                {bundleCount > 0 && (
                                                    <span className="text-[#6F6B64]">
                                                        · {bundleCount} items
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={`/offers/${encodeURIComponent(offer.offer_id)}`}
                                            >
                                                <h3 className="line-clamp-2 text-lg font-extrabold leading-snug transition-colors group-hover:text-[#B89655]">
                                                    {offer.offer_title}
                                                </h3>
                                            </Link>
                                            <p className="mt-3 line-clamp-3 min-h-[60px] text-xs leading-5 text-[#6F6B64]">
                                                {offer.offer_description ||
                                                    "Explore this exclusive SR Automotives package."}
                                            </p>
                                            <div className="mt-auto pt-5">
                                                <div className="flex flex-wrap items-baseline gap-2">
                                                    <span className="text-2xl font-extrabold text-[#B89655]">
                                                        {formatPrice(
                                                            offer.offer_price
                                                        )}
                                                    </span>
                                                    {Number(offer.actual_price) >
                                                        Number(offer.offer_price) && (
                                                        <span className="text-sm text-[#9A958C] line-through">
                                                            {formatPrice(
                                                                offer.actual_price
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                {savings > 0 && (
                                                    <p className="mt-2 text-xs font-semibold text-[#6F6B64]">
                                                        You save{" "}
                                                        <span className="text-[#B89655]">
                                                            {formatPrice(savings)}
                                                        </span>
                                                    </p>
                                                )}
                                                <Link
                                                    href={`/offers/${encodeURIComponent(offer.offer_id)}`}
                                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#D8B66F] px-5 py-3.5 text-xs font-extrabold uppercase tracking-wide text-[#080909] transition hover:bg-[#B89655]"
                                                >
                                                    View Offer
                                                    <FiArrowUpRight size={17} />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
