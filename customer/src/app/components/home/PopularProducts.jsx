"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link.js";
import {
    FiArrowLeft,
    FiArrowRight,
} from "react-icons/fi";
import api from "../../domainurl/api.js";
import ProductCard from "../product/ProductCard.jsx";
const tabs = [
    {
        id: "best_sellers",
        label: "Best Sellers",
    },
    {
        id: "new_arrivals",
        label: "New Arrivals",
    },
    {
        id: "top_rated",
        label: "Top Rated",
    },
];
export default function PopularProducts() {
    const [activeTab, setActiveTab] = useState("best_sellers");
    const [products, setProducts] = useState({
        best_sellers: [],
        top_rated: [],
        new_arrivals: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const sliderRef = useRef(null);
    // ==========================================
    // Fetch Products
    // ==========================================
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await api.get("/featuredproducts");
                setProducts({
                    best_sellers:
                        response.data.best_sellers || [],
                    top_rated:
                        response.data.top_rated || [],
                    new_arrivals:
                        response.data.new_arrivals || [],
                });
            } catch (error) {
                console.error(
                    "Failed to fetch products:",
                    error
                );
                setError("Unable to load products.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
    // ==========================================
    // Current Tab Products
    // ==========================================
    const currentProducts =
        products[activeTab] || [];
    // ==========================================
    // Change Tab
    // ==========================================
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        sliderRef.current?.scrollTo({
            left: 0,
            behavior: "smooth",
        });
    };
    // ==========================================
    // Slider
    // ==========================================
    const scrollProducts = (direction) => {
        if (!sliderRef.current) return;
        const card =
            sliderRef.current.querySelector(
                "[data-product-card]"
            );
        if (!card) return;
        const gap = 16;
        sliderRef.current.scrollBy({
            left:
                direction === "next"
                    ? card.offsetWidth + gap
                    : -(card.offsetWidth + gap),
            behavior: "smooth",
        });
    };
    return (
        <section
            className="
                w-full
                bg-[var(--brand-cream)]
                py-10
                sm:py-12
                lg:py-14
            "
        >
            <div className="section-container">
                {/* ==========================================
                    HEADER
                ========================================== */}
                {/* SECTION HEADER */}
                <div className="mb-6">
                    <div className="flex items-center justify-between gap-3">
                        {/* TITLE */}
                        <h2
                            className="
                text-xl
                font-bold
                tracking-tight
                text-[var(--text-primary)]
                sm:text-3xl
            "
                        >
                            Popular Products
                        </h2>

                        {/* VIEW ALL - MOBILE ONLY */}
                        <Link
                            href="/products"
                            className="
                group
                inline-flex
                shrink-0
                items-center
                gap-1.5
                text-xs
                font-semibold
                text-[var(--text-primary)]
                transition-colors
                hover:text-[var(--brand-gold-dark)]
                sm:hidden
            "
                        >
                            View All
                            <span className="text-lg text-[var(--brand-gold-dark)] transition-transform group-hover:translate-x-1">
                                →
                            </span>
                        </Link>

                        {/* TABS - DESKTOP */}
                        <div className="hidden items-center gap-2 sm:flex">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`
                        shrink-0
                        cursor-pointer
                        rounded-full
                        px-5
                        py-3
                        text-xs
                        font-semibold
                        transition-all
                        duration-300
                        ${activeTab === tab.id
                                            ? "bg-[var(--brand-gold)] text-[var(--brand-black)] shadow-sm"
                                            : "bg-[#efeeeb] text-[var(--text-primary)] hover:bg-[var(--brand-gold-light)]"
                                        }
                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TABS - MOBILE ONLY */}
                    <div
                        className="
            mt-5
            flex
            gap-2
            overflow-x-auto
            pb-1
            sm:hidden
            [&::-webkit-scrollbar]:hidden
            [scrollbar-width:none]
        "
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabChange(tab.id)}
                                className={`
                    shrink-0
                    cursor-pointer
                    rounded-full
                    px-3
                    py-2.5
                    text-xs
                    font-semibold
                    transition-all
                    duration-300
                    ${activeTab === tab.id
                                        ? "bg-[var(--brand-gold)] text-[var(--brand-black)] shadow-sm"
                                        : "bg-[#efeeeb] text-[var(--text-primary)]"
                                    }
                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* ==========================================
                    LOADING
                ========================================== */}
                {loading && (
                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-3
                            sm:gap-4
                            md:grid-cols-3
                            lg:grid-cols-4
                            xl:grid-cols-5
                        "
                    >
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="
                                    h-[330px]
                                    animate-pulse
                                    rounded-xl
                                    border
                                    border-[var(--border)]
                                    bg-white
                                "
                            />
                        ))}
                    </div>
                )}
                {/* ==========================================
                    ERROR
                ========================================== */}
                {!loading && error && (
                    <div
                        className="
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-10
                            text-center
                        "
                    >
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}
                {/* ==========================================
                    PRODUCTS
                ========================================== */}
                {!loading &&
                    !error &&
                    currentProducts.length > 0 && (
                        <div className="relative">
                            {/* Previous Arrow */}
                            {currentProducts.length > 5 && (
                                <button
                                    type="button"
                                    aria-label="Previous products"
                                    onClick={() =>
                                        scrollProducts("prev")
                                    }
                                    className="
                                    absolute
                                    -left-4
                                    top-1/2
                                    z-20
                                    hidden
                                    h-10
                                    w-10
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-[var(--border)]
                                    bg-white
                                    shadow-md
                                    transition-all
                                    hover:border-[var(--brand-gold)]
                                    hover:bg-[var(--brand-black)]
                                    hover:text-[var(--brand-gold)]
                                    lg:flex
                                "
                                >
                                    <FiArrowLeft />
                                </button>
                            )}
                            {/* Product Slider */}
                            <div
                                ref={sliderRef}
                                className="
                                flex
                                snap-x
                                snap-mandatory
                                gap-3
                                overflow-x-auto
                                scroll-smooth
                                pb-2
                                sm:gap-4
                                [&::-webkit-scrollbar]:hidden
                                [scrollbar-width:none]
                            "
                            >
                                {currentProducts.map((product) => (
                                    <div
                                        key={product.product_id}
                                        data-product-card
                                        className="
                                        w-[calc((100%-12px)/2)]
                                        shrink-0
                                        snap-start
                                        md:w-[calc((100%-32px)/3)]
                                        lg:w-[calc((100%-48px)/4)]
                                        xl:w-[calc((100%-64px)/5)]
                                    "
                                    >
                                        <ProductCard
                                            product={product}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Next Arrow */}
                            {currentProducts.length > 5 && (
                                <button
                                    type="button"
                                    aria-label="Next products"
                                    onClick={() =>
                                        scrollProducts("next")
                                    }
                                    className="
                                    absolute
                                    -right-4
                                    top-1/2
                                    z-20
                                    hidden
                                    h-10
                                    w-10
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-[var(--border)]
                                    bg-white
                                    shadow-md
                                    transition-all
                                    hover:border-[var(--brand-gold)]
                                    hover:bg-[var(--brand-black)]
                                    hover:text-[var(--brand-gold)]
                                    lg:flex
                                "
                                >
                                    <FiArrowRight />
                                </button>
                            )}
                        </div>
                    )}
                {/* ==========================================
                    EMPTY
                ========================================== */}
                {!loading &&
                    !error &&
                    currentProducts.length === 0 && (
                        <div
                            className="
                            rounded-xl
                            border
                            border-[var(--border)]
                            bg-white
                            px-4
                            py-10
                            text-center
                        "
                        >
                            <p
                                className="
                                text-sm
                                text-[var(--text-secondary)]
                            "
                            >
                                No products available yet.
                            </p>
                        </div>
                    )}
            </div>
        </section>
    );
}