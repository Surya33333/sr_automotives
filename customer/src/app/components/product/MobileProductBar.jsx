"use client";
import {
    useEffect,
} from "react";
import {
    FiSliders,
    FiX,
} from "react-icons/fi";
import {
    HiOutlineSwitchVertical,
} from "react-icons/hi";
import ProductFilters from "./ProductFilters";
export default function MobileProductBar({
    filtersOpen,
    setFiltersOpen,
    sortOpen,
    setSortOpen,
    categories,
    selectedCategories,
    toggleCategory,
    maxPrice,
    setMaxPrice,
    maximumProductPrice,
    clearFilters,
    sortBy,
    setSortBy,
    sortOptions,
}) {
    /* =========================================================
       BODY SCROLL LOCK
    ========================================================= */
    useEffect(() => {
        if (
            filtersOpen ||
            sortOpen
        ) {
            document.body.style.overflow =
                "hidden";
        } else {
            document.body.style.overflow =
                "";
        }
        return () => {
            document.body.style.overflow =
                "";
        };
    }, [
        filtersOpen,
        sortOpen,
    ]);
    return (
        <>
            {/* =================================================
                FIXED MOBILE BAR
            ================================================= */}
            <div
                className="
                    fixed
                    bottom-0
                    left-0
                    right-0
                    z-40
                    border-t
                    border-white/10
                    bg-[var(--brand-black)]
                    px-4
                    lg:hidden
                "
            >
                <div
                    className="
                        grid
                        h-16
                        grid-cols-2
                    "
                >
                    {/* FILTER */}
                    <button
                        type="button"
                        onClick={() => {
                            setSortOpen(false);
                            setFiltersOpen(true);
                        }}
                        className="
                            flex
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            border-r
                            border-white/20
                            text-sm
                            font-semibold
                            text-white
                        "
                    >
                        <FiSliders />
                        Filters
                    </button>
                    {/* SORT */}
                    <button
                        type="button"
                        onClick={() => {
                            setFiltersOpen(false);
                            setSortOpen(true);
                        }}
                        className="
                            flex
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            text-sm
                            font-semibold
                            text-white
                        "
                    >
                        <HiOutlineSwitchVertical />
                        Sort by
                    </button>
                </div>
            </div>
            {/* =================================================
                FILTER OVERLAY
            ================================================= */}
            {filtersOpen && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black/55
                        lg:hidden
                    "
                    onClick={() =>
                        setFiltersOpen(false)
                    }
                >
                    {/* Bottom Sheet */}
                    <div
                        className="
                            absolute
                            bottom-0
                            left-0
                            right-0
                            max-h-[85svh]
                            overflow-y-auto
                            rounded-t-2xl
                            bg-white
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* HEADER */}
                        <div
                            className="
                                sticky
                                top-0
                                z-10
                                flex
                                items-center
                                justify-between
                                border-b
                                border-[var(--border)]
                                bg-white
                                px-5
                                py-4
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
                                onClick={() =>
                                    setFiltersOpen(
                                        false
                                    )
                                }
                                className="
                                    flex
                                    h-8
                                    w-8
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-[var(--text-primary)]
                                "
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        {/* FILTER CONTENT */}
                        <div className="px-5">
                            <ProductFilters
                                mobile
                                categories={
                                    categories
                                }
                                selectedCategories={
                                    selectedCategories
                                }
                                toggleCategory={
                                    toggleCategory
                                }
                                maxPrice={
                                    maxPrice
                                }
                                setMaxPrice={
                                    setMaxPrice
                                }
                                maximumProductPrice={
                                    maximumProductPrice
                                }
                                clearFilters={
                                    clearFilters
                                }
                            />
                        </div>
                        {/* ACTIONS */}
                        <div
                            className="
                                sticky
                                bottom-0
                                grid
                                grid-cols-2
                                gap-3
                                border-t
                                border-[var(--border)]
                                bg-white
                                p-4
                            "
                        >
                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                                className="
                                    h-11
                                    cursor-pointer
                                    rounded-lg
                                    border
                                    border-[var(--brand-black)]
                                    text-sm
                                    font-semibold
                                    text-[var(--brand-black)]
                                "
                            >
                                Clear All
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setFiltersOpen(
                                        false
                                    )
                                }
                                className="
                                    h-11
                                    cursor-pointer
                                    rounded-lg
                                    bg-[var(--brand-black)]
                                    text-sm
                                    font-semibold
                                    text-white
                                "
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* =================================================
                SORT OVERLAY
            ================================================= */}
            {sortOpen && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black/55
                        lg:hidden
                    "
                    onClick={() =>
                        setSortOpen(false)
                    }
                >
                    <div
                        className="
                            absolute
                            bottom-0
                            left-0
                            right-0
                            rounded-t-2xl
                            bg-white
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* HEADER */}
                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-[var(--border)]
                                px-5
                                py-4
                            "
                        >
                            <h2
                                className="
                                    text-lg
                                    font-bold
                                    text-[var(--text-primary)]
                                "
                            >
                                Sort By
                            </h2>
                            <button
                                type="button"
                                onClick={() =>
                                    setSortOpen(false)
                                }
                                className="
                                    flex
                                    h-8
                                    w-8
                                    cursor-pointer
                                    items-center
                                    justify-center
                                "
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        {/* OPTIONS */}
                        <div
                            className="
                                px-5
                                py-2
                            "
                        >
                            {sortOptions.map(
                                (option) => (
                                    <label
                                        key={
                                            option.value
                                        }
                                        className="
                                            flex
                                            cursor-pointer
                                            items-center
                                            justify-between
                                            border-b
                                            border-[var(--border)]
                                            py-4
                                            text-sm
                                            last:border-0
                                        "
                                    >
                                        <span
                                            className={
                                                sortBy ===
                                                option.value
                                                    ? "font-bold text-[var(--text-primary)]"
                                                    : "text-[var(--text-secondary)]"
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </span>
                                        <input
                                            type="radio"
                                            name="mobile-sort"
                                            value={
                                                option.value
                                            }
                                            checked={
                                                sortBy ===
                                                option.value
                                            }
                                            onChange={() =>
                                                setSortBy(
                                                    option.value
                                                )
                                            }
                                            className="
                                                h-4
                                                w-4
                                                accent-[var(--brand-gold-dark)]
                                            "
                                        />
                                    </label>
                                )
                            )}
                        </div>
                        {/* APPLY */}
                        <div
                            className="
                                border-t
                                border-[var(--border)]
                                p-4
                            "
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setSortOpen(false)
                                }
                                className="
                                    h-11
                                    w-full
                                    cursor-pointer
                                    rounded-lg
                                    bg-[var(--brand-black)]
                                    text-sm
                                    font-semibold
                                    text-white
                                "
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}