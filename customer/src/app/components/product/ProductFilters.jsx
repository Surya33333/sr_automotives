"use client";
import {
    FiRefreshCw,
} from "react-icons/fi";
export default function ProductFilters({
    categories = [],
    selectedCategories = [],
    toggleCategory,
    maxPrice,
    setMaxPrice,
    maximumProductPrice,
    clearFilters,
    mobile = false,
}) {
    return (
        <div
            className={
                mobile
                    ? "w-full"
                    : `
                        sticky
                        top-24
                        rounded-xl
                        border
                        border-[var(--border)]
                        bg-white
                        p-5
                    `
            }
        >
            {/* =================================================
                HEADER
            ================================================= */}
            {!mobile && (
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[var(--border)]
                        pb-4
                    "
                >
                    <h2
                        className="
                            text-lg
                            font-bold
                            text-[var(--text-primary)]
                        "
                    >
                        Filters
                    </h2>
                    <button
                        type="button"
                        onClick={
                            clearFilters
                        }
                        className="
                            flex
                            cursor-pointer
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            text-[var(--text-primary)]
                            transition-colors
                            hover:text-[var(--brand-gold-dark)]
                        "
                    >
                        <FiRefreshCw />
                        Clear All
                    </button>
                </div>
            )}
            {/* =================================================
                PRICE
            ================================================= */}
            <div
                className="
                    border-b
                    border-[var(--border)]
                    py-5
                "
            >
                <h3
                    className="
                        text-sm
                        font-bold
                        text-[var(--text-primary)]
                    "
                >
                    Price Range
                </h3>
                <input
                    type="range"
                    min="0"
                    max={
                        maximumProductPrice
                    }
                    step="100"
                    value={
                        maxPrice
                    }
                    onChange={(event) =>
                        setMaxPrice(
                            Number(
                                event.target.value
                            )
                        )
                    }
                    className="
                        mt-5
                        w-full
                        cursor-pointer
                        accent-[var(--brand-gold-dark)]
                    "
                />
                <div
                    className="
                        mt-3
                        flex
                        items-center
                        justify-between
                        text-xs
                        font-medium
                        text-[var(--text-primary)]
                    "
                >
                    <span>
                        ₹0
                    </span>
                    <span>
                        ₹
                        {Number(
                            maxPrice
                        ).toLocaleString(
                            "en-IN"
                        )}
                    </span>
                </div>
            </div>
            {/* =================================================
                CATEGORIES
            ================================================= */}
            <div className="py-5">
                <h3
                    className="
                        mb-4
                        text-sm
                        font-bold
                        text-[var(--text-primary)]
                    "
                >
                    Categories
                </h3>
                <div
                    className="
                        space-y-3.5
                    "
                >
                    {categories.map(
                        (category) => (
                            <label
                                key={
                                    category.id
                                }
                                className="
                                    flex
                                    cursor-pointer
                                    items-center
                                    text-sm
                                "
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedCategories.includes(
                                            category.id
                                        )
                                    }
                                    onChange={() =>
                                        toggleCategory(
                                            category.id
                                        )
                                    }
                                    className="
                                        h-4
                                        w-4
                                        cursor-pointer
                                        accent-[var(--brand-gold-dark)]
                                    "
                                />
                                <span
                                    className="
                                        ml-3
                                        flex-1
                                        text-[var(--text-primary)]
                                    "
                                >
                                    {
                                        category.name
                                    }
                                </span>
                                <span
                                    className="
                                        text-xs
                                        text-[var(--text-secondary)]
                                    "
                                >
                                    (
                                    {
                                        category.count
                                    }
                                    )
                                </span>
                            </label>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}