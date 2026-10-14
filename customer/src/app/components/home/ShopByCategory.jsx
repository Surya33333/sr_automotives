"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import api from "../../domainurl/api.js";
export default function ShopByCategory() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await api.get("/categories");
                setCategories(response.data.categories);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                setError("Unable to load categories.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);
    return (
        <section className="w-full bg-[var(--brand-cream)] py-10 sm:py-12 lg:py-16">
            <div className="section-container">
                {/* Section Header */}
                <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
                    <div>
                        <p
                            className="
                                mb-1.5
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-[var(--brand-gold-dark)]
                                sm:text-xs
                            "
                        >
                            Explore our collection
                        </p>
                        <h2
                            className="
                                text-2xl
                                font-bold
                                tracking-tight
                                text-[var(--text-primary)]
                                sm:text-3xl
                                lg:text-4xl
                            "
                        >
                            Shop by Category
                        </h2>
                        <p
                            className="
                                mt-2
                                hidden
                                max-w-xl
                                text-sm
                                leading-6
                                text-[var(--text-secondary)]
                                sm:block
                            "
                        >
                            Find premium accessories, parts and upgrades
                            made for your car.
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="
                            group/view
                            flex
                            shrink-0
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            text-[var(--text-primary)]
                            transition-colors
                            hover:text-[var(--brand-gold-dark)]
                            sm:gap-2
                            sm:text-sm
                        "
                    >
                        View All
                        <FiArrowRight
                            className="
                                transition-transform
                                duration-300
                                group-hover/view:translate-x-1
                            "
                        />
                    </Link>
                </div>
                {/* Loading */}
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
                                    aspect-[4/5]
                                    animate-pulse
                                    rounded-2xl
                                    bg-white
                                "
                            />
                        ))}
                    </div>
                )}
                {/* Error */}
                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}
                {/* Category Grid */}
                {!loading && !error && categories.length > 0 && (
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
                        {categories.map((category) => (
                            <Link
                                key={category.category_slug}
                                href={`/category/${category.category_slug}`}
                                className="
                                    group
                                    relative
                                    overflow-hidden
                                    rounded-lg
                                    border
                                    border-[var(--border)]
                                    bg-white
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:border-[var(--brand-gold)]
                                    hover:shadow-[0_14px_35px_rgba(8,9,9,0.10)]
                                "
                            >
                                {/* Image */}
                                <div
                                    className="
                                        relative
                                        h-[110px]
                                        w-full
                                        overflow-hidden
                                        bg-[#f2f0eb]
                                        xs:h-[120px]
                                        sm:h-[135px]
                                        lg:h-[145px]
                                        xl:h-[155px]
                                    "
                                >
                                    <Image
                                        src={
                                            category.category_image
                                                ? `/${category.category_image}`
                                                : "/category-placeholder.jpg"
                                        }
                                        alt={category.category_name}
                                        fill
                                        sizes="
                                            (max-width: 639px) 50vw,
                                            (max-width: 767px) 50vw,
                                            (max-width: 1023px) 33vw,
                                            (max-width: 1279px) 25vw,
                                            20vw
                                        "
                                        className="
                                            object-cover
                                            transition-transform
                                            duration-500
                                            ease-out
                                            group-hover:scale-[1.05]
                                        "
                                    />
                                    {/* Subtle image gradient */}
                                    <div
                                        className="
                                            pointer-events-none
                                            absolute
                                            inset-x-0
                                            bottom-0
                                            h-16
                                            bg-gradient-to-t
                                            from-black/10
                                            to-transparent
                                        "
                                    />
                                    {/* Product Count Badge */}
                                    <div
                                        className="
                                            absolute
                                            left-2.5
                                            top-2.5
                                            rounded-full
                                            border
                                            border-white/60
                                            bg-white/90
                                            px-2.5
                                            py-1
                                            text-[10px]
                                            font-semibold
                                            text-[var(--text-primary)]
                                            shadow-sm
                                            backdrop-blur-md
                                            sm:left-3
                                            sm:top-3
                                            sm:text-[11px]
                                        "
                                    >
                                        {category.product_count}{" "}
                                        {category.product_count === 1
                                            ? "Product"
                                            : "Products"}
                                    </div>
                                </div>
                                {/* Content */}
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-2
                                        p-3
                                        sm:p-4
                                    "
                                >
                                    <div className="min-w-0">
                                        <h3
                                            className="
                                                truncate
                                                text-sm
                                                font-bold
                                                text-[var(--text-primary)]
                                                sm:text-base
                                                lg:text-[17px]
                                            "
                                        >
                                            {category.category_name}
                                        </h3>
                                        <p
                                            className="
                                                mt-0.5
                                                text-[10px]
                                                font-medium
                                                text-[var(--text-secondary)]
                                                sm:text-xs
                                            "
                                        >
                                            Explore Collection
                                        </p>
                                    </div>
                                    {/* Arrow */}
                                    <div
                                        className="
                                            flex
                                            h-8
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            border-[var(--border)]
                                            bg-[var(--brand-cream)]
                                            transition-all
                                            duration-300
                                            group-hover:border-[var(--brand-gold)]
                                            group-hover:bg-[var(--brand-black)]
                                            group-hover:text-[var(--brand-gold)]
                                            sm:h-9
                                            sm:w-9
                                        "
                                    >
                                        <FiArrowRight
                                            className="
                                                text-sm
                                                transition-transform
                                                duration-300
                                                group-hover:translate-x-0.5
                                            "
                                        />
                                    </div>
                                </div>
                                {/* Gold bottom accent */}
                                <div
                                    className="
                                        absolute
                                        bottom-0
                                        left-0
                                        h-[2px]
                                        w-0
                                        bg-[var(--brand-gold)]
                                        transition-all
                                        duration-500
                                        group-hover:w-full
                                    "
                                />
                            </Link>
                        ))}
                    </div>
                )}
                {/* Empty */}
                {!loading && !error && categories.length === 0 && (
                    <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-10 text-center">
                        <p className="text-sm text-[var(--text-secondary)]">
                            No categories available.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}