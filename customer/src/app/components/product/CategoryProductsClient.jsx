"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    FiSearch,
    FiSliders,
    FiX,
    FiChevronDown,
    FiFilter,
    FiRefreshCw,
} from "react-icons/fi";
import ProductCard from "./ProductCard";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "discount", label: "Biggest Discount" },
    { value: "rating", label: "Top Rated" },
];
const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
const getPrice = (product) =>
    Number(product.product_selling_price) || 0;
const getDiscount = (product) => {
    const mrp = Number(product.product_mrp) || 0;
    const price = getPrice(product);
    if (mrp <= price || mrp === 0) return 0;
    return ((mrp - price) / mrp) * 100;
};
const getRating = (product) =>
    Number(product.average_rating ?? product.rating ?? 0);
const getCategoryTitle = (slug = "") =>
    slug
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

export default function CategoryProductsClient({ categorySlug }) {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("featured");
    const [maxAvailablePrice, setMaxAvailablePrice] = useState(10000);
    const [priceRange, setPriceRange] = useState(10000);
    const [mobilePanel, setMobilePanel] = useState(null);
    useEffect(() => {
        let cancelled = false;
        const fetchCategoryData = async () => {
            try {
                setLoading(true);
                setError("");
                setProducts([]);
                setCategory(null);
                setSearch("");
                setSortBy("featured");
                setMobilePanel(null);
                const slug = encodeURIComponent(categorySlug);
                const [productsResponse, categoriesResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/products/${slug}`),
                        fetch(`${API_URL}/categories`),
                    ]);
                if (!productsResponse.ok) {
                    throw new Error("Failed to fetch category products");
                }
                const productsData = await productsResponse.json();
                if (productsData.success === false) {
                    throw new Error(
                        productsData.message || "Failed to fetch products"
                    );
                }
                const fetchedProducts = Array.isArray(productsData.products)
                    ? productsData.products
                    : [];
                let selectedCategory = null;
                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    const categories = Array.isArray(categoriesData.categories)
                        ? categoriesData.categories
                        : [];
                    selectedCategory =
                        categories.find(
                            (item) =>
                                item.category_slug?.toLowerCase() ===
                                categorySlug.toLowerCase()
                        ) || null;
                }
                const highestPrice = Math.max(
                    1000,
                    ...fetchedProducts.map(getPrice)
                );
                if (cancelled) return;
                setProducts(fetchedProducts);
                setCategory(selectedCategory);
                setMaxAvailablePrice(Math.ceil(highestPrice / 500) * 500);
                setPriceRange(Math.ceil(highestPrice / 500) * 500);
                console.log("Category Slug:", categorySlug);
                console.log("Category:", selectedCategory);
                console.log("Category Products:", fetchedProducts);
            } catch (err) {
                if (cancelled) return;
                console.error("Category products error:", err);
                setError("Unable to load products. Please try again.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        if (categorySlug) {
            fetchCategoryData();
        }
        return () => {
            cancelled = true;
        };
    }, [categorySlug]);
    const categoryTitle =
        category?.category_name || getCategoryTitle(categorySlug);
    const categoryDescription = category?.category_description;
    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();
        let result = products.filter((product) => {
            const searchableText = [
                product.product_name,
                product.product_brand,
                product.product_description,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            const matchesSearch =
                !query || searchableText.includes(query);
            const matchesPrice = getPrice(product) <= priceRange;
            return matchesSearch && matchesPrice;
        });
        switch (sortBy) {
            case "newest":
                result.sort(
                    (a, b) =>
                        new Date(b.created_at || 0) -
                        new Date(a.created_at || 0)
                );
                break;
            case "price-low":
                result.sort((a, b) => getPrice(a) - getPrice(b));
                break;
            case "price-high":
                result.sort((a, b) => getPrice(b) - getPrice(a));
                break;
            case "discount":
                result.sort((a, b) => getDiscount(b) - getDiscount(a));
                break;
            case "rating":
                result.sort((a, b) => getRating(b) - getRating(a));
                break;
            default:
                break;
        }
        return result;
    }, [products, search, priceRange, sortBy]);
    const hasActiveFilters =
        search.trim() !== "" || priceRange < maxAvailablePrice;
    const resetFilters = () => {
        setSearch("");
        setPriceRange(maxAvailablePrice);
    };
    const FilterContent = () => (
        <div className="space-y-8">
            <div className="">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#111111]">
                        Price Range
                    </h3>
                </div>
                <input
                    type="range"
                    min={0}
                    max={maxAvailablePrice}
                    step={100}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full cursor-pointer accent-[#B89655]"
                />
                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex-1 rounded-md border border-[#E5DED1] bg-white px-3 py-3">
                        <span className="block text-[10px] uppercase tracking-wider text-[#6F6B64]">
                            Min Price
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-[#111111]">
                            {formatPrice(0)}
                        </span>
                    </div>
                    <span className="text-[#6F6B64]">—</span>
                    <div className="flex-1 rounded-md border border-[#E5DED1] bg-white px-3 py-3">
                        <span className="block text-[10px] uppercase tracking-wider text-[#6F6B64]">
                            Max Price
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-[#111111]">
                            {formatPrice(priceRange)}
                        </span>
                    </div>
                </div>
            </div>
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={resetFilters}
                    className="
                        flex w-full items-center justify-center gap-2
                        rounded-md border border-[#E5DED1]
                        px-4 py-3 text-xs font-bold
                        uppercase tracking-wider text-[#111111]
                        transition-colors hover:border-[#B89655]
                        hover:text-[#B89655]
                    "
                >
                    <FiRefreshCw size={14} />
                    Clear Filters
                </button>
            )}
        </div>
    );
    const SortContent = () => (
        <div className="space-y-2">
            {SORT_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                        setSortBy(option.value);
                        setMobilePanel(null);
                    }}
                    className={`
                        flex w-full items-center justify-between
                        rounded-md border px-4 py-4 text-left
                        text-sm transition-colors
                        ${sortBy === option.value
                            ? "border-[#B89655] bg-[#F8F6F1] font-semibold text-[#111111]"
                            : "border-[#E5DED1] text-[#6F6B64]"
                        }
                    `}
                >
                    {option.label}
                    {sortBy === option.value && (
                        <span className="h-2 w-2 rounded-full bg-[#B89655]" />
                    )}
                </button>
            ))}
        </div>
    );
    return (
        <main className="min-h-screen bg-gray pb-20 lg:pb-0">
            {/* CATEGORY HERO */}
            <section className="relative isolate flex items-center overflow-hidden pt-6">
                <div className="section-container relative z-10 w-full pt-14 text-black">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs tracking-wide text-black/70">
                        <Link href="/" className="text-black hover:text-[#D8B66F] font-semibold">
                            Home
                        </Link>
                        <span>/</span>
                        <Link
                            href="/products"
                            className="hover:text-[#D8B66F] text-black font-semibold"
                        >
                            Products
                        </Link>
                        <span>/</span>
                        <span className="text-[#D8B66F] font-bold">
                            {categoryTitle}
                        </span>
                    </div>
                </div>
            </section>
            {/* CATEGORY PRODUCTS */}
            <section className="section-container py-2 sm:py-14 lg:py-16">
                {/* CATEGORY TITLE + SEARCH */}
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <h2 className="shrink-0 text-[34px] font-extrabold leading-none tracking-[-0.035em] text-[#111111] sm:text-[40px] lg:text-[44px]">
                        {categoryTitle}
                        </h2>
                    {/* SEARCH */}
                    <div
                        className="
                            relative
                            w-full
                            lg:max-w-[380px]
                        "
                    >
                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search parts, brands, categories..."
                            className="
                                h-12
                                w-full
                                rounded-lg
                                border
                                border-[var(--border)]
                                bg-white
                                pl-4
                                pr-12
                                text-sm
                                text-[var(--text-primary)]
                                outline-none
                                transition-colors
                                placeholder:text-[var(--text-secondary)]
                                focus:border-[var(--brand-gold)]
                            "
                        />
                        <div
                            className="
                                pointer-events-none
                                absolute
                                right-1.5
                                top-1/2
                                flex
                                h-9
                                w-9
                                -translate-y-1/2
                                items-center
                                justify-center
                                rounded-md
                                bg-[var(--brand-black)]
                                text-[var(--brand-gold)]
                            "
                        >
                            <FiSearch size={17} />
                        </div>
                    </div>
                </div>
                <div className="mb-2 flex flex-wrap items-end justify-between gap-5 pb-6">
                    <p className="mt-2 text-sm text-[#000000]">
                        {loading
                            ? "Loading products..."
                            : `Showing ${filteredProducts.length} of ${products.length} products`}
                    </p>
                    <div className="hidden items-center gap-3 lg:flex">
                        <span className="text-sm text-black">
                            Sort By :
                        </span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="
                                    min-w-[210px] appearance-none
                                    rounded-md border border-[#E5DED1]
                                    bg-white px-4 py-3 pr-10
                                    text-sm font-medium text-[#111111]
                                    outline-none focus:border-[#B89655]
                                "
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown
                                size={15}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                            />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-12">
                    {/* DESKTOP FILTER SIDEBAR */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 rounded-lg border border-[#E5DED1] bg-white p-6">
                            <div className="mb-7 flex items-center gap-3 border-b border-[#E5DED1] pb-5">
                                <FiSliders size={19} className="text-[#B89655]" />
                                <h2 className="text-lg font-bold uppercase tracking-wide text-[#111111]">
                                    Filters
                                </h2>
                            </div>
                            <FilterContent />
                        </div>
                    </aside>
                    {/* PRODUCT LIST */}
                    <div className="min-w-0">
                        {loading ? (
                            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:gap-6">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="animate-pulse overflow-hidden rounded-lg border border-[#E5DED1]"
                                    >
                                        <div className="aspect-square bg-[#F0EDE7]" />
                                        <div className="space-y-3 p-4">
                                            <div className="h-3 w-1/3 rounded bg-[#F0EDE7]" />
                                            <div className="h-4 w-4/5 rounded bg-[#F0EDE7]" />
                                            <div className="h-4 w-1/2 rounded bg-[#F0EDE7]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-lg border border-[#E5DED1] px-6 text-center">
                                <FiX size={36} className="mb-4 text-[#B89655]" />
                                <h3 className="text-xl font-bold text-[#111111]">
                                    Something went wrong
                                </h3>
                                <p className="mt-2 text-sm text-[#6F6B64]">
                                    {error}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="mt-6 rounded-md bg-[#111111] px-6 py-3 text-sm font-semibold text-white hover:bg-[#B89655]"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-lg border border-[#E5DED1] px-6 text-center">
                                <FiSearch
                                    size={38}
                                    className="mb-5 text-[#B89655]"
                                />
                                <h3 className="text-xl font-bold text-[#111111]">
                                    No Products Found
                                </h3>
                                <p className="mt-3 max-w-sm text-sm leading-6 text-[#6F6B64]">
                                    {products.length === 0
                                        ? "There are no products available in this category yet."
                                        : "No products match your current search or price range."}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="mt-6 rounded-md bg-[#111111] px-6 py-3 text-sm font-semibold text-white hover:bg-[#B89655]"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 sm:gap-5 md:grid-cols-4 xl:gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.product_id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {/* MOBILE BOTTOM BAR */}
            <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#E5DED1] bg-white shadow-[0\_-5px_25px_rgba(0,0,0,0.06)] lg:hidden">
                <button
                    type="button"
                    onClick={() => setMobilePanel("filter")}
                    className="flex flex-1 items-center justify-center gap-2 border-r border-[#E5DED1] py-4 text-xs font-bold uppercase tracking-wider text-[#111111]"
                >
                    <FiFilter size={17} />
                    Filter
                    {hasActiveFilters && (
                        <span className="h-2 w-2 rounded-full bg-[#B89655]" />
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setMobilePanel("sort")}
                    className="flex flex-1 items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider text-[#111111]"
                >
                    <FiSliders size={17} />
                    Sort
                </button>
            </div>
            {/* MOBILE DRAWER */}
            {mobilePanel && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close panel"
                        onClick={() => setMobilePanel(null)}
                        className="absolute inset-0 bg-black/60"
                    />
                    <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5DED1] bg-white px-6 py-5">
                            <h3 className="text-lg font-bold uppercase tracking-wide text-[#111111]">
                                {mobilePanel === "filter"
                                    ? "Filter Products"
                                    : "Sort Products"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setMobilePanel(null)}
                                aria-label="Close"
                                className="rounded-full p-2 text-[#111111] hover:bg-[#F8F6F1]"
                            >
                                <FiX size={22} />
                            </button>
                        </div>
                        <div className="px-6 py-7">
                            {mobilePanel === "filter" ? (
                                <FilterContent />
                            ) : (
                                <SortContent />
                            )}
                        </div>
                        {mobilePanel === "filter" && (
                            <div className="sticky bottom-0 border-t border-[#E5DED1] bg-white p-5">
                                <button
                                    type="button"
                                    onClick={() => setMobilePanel(null)}
                                    className="w-full rounded-md bg-[#111111] py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#B89655]"
                                >
                                    Show {filteredProducts.length} Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
