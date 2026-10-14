"use client";
import { useEffect } from "react";
import {
    FiCheck,
    FiSliders,
    FiX,
} from "react-icons/fi";
import {
    HiOutlineSwitchVertical,
} from "react-icons/hi";
import ServiceFilters from "./ServiceFilters";
export default function MobileServiceBar({
    filtersOpen,
    setFiltersOpen,
    sortOpen,
    setSortOpen,
    serviceTypes,
    selectedTypes,
    toggleType,
    maxPrice,
    setMaxPrice,
    maximumPrice,
    clearFilters,
    sortBy,
    setSortBy,
    sortOptions,
}) {
    useEffect(() => {
        if (filtersOpen || sortOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [filtersOpen, sortOpen]);
    return (
        <>
            {/* FIXED BOTTOM BAR */}
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
                <div className="grid h-16 grid-cols-2">
                    <button
                        type="button"
                        onClick={() => {
                            setSortOpen(false);
                            setFiltersOpen(true);
                        }}
                        className="
                            flex
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
                    <button
                        type="button"
                        onClick={() => {
                            setFiltersOpen(false);
                            setSortOpen(true);
                        }}
                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            text-sm
                            font-semibold
                            text-white
                        "
                    >
                        <HiOutlineSwitchVertical />
                        Sort By
                    </button>
                </div>
            </div>
            {/* FILTER SHEET */}
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
                                    setFiltersOpen(false)
                                }
                            >
                                <FiX size={21} />
                            </button>
                        </div>
                        <div className="px-5">
                            <ServiceFilters
                                mobile
                                serviceTypes={serviceTypes}
                                selectedTypes={selectedTypes}
                                toggleType={toggleType}
                                maxPrice={maxPrice}
                                setMaxPrice={setMaxPrice}
                                maximumPrice={maximumPrice}
                                clearFilters={clearFilters}
                            />
                        </div>
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
                                onClick={clearFilters}
                                className="
                                    h-11
                                    rounded-lg
                                    border
                                    border-[var(--brand-black)]
                                    text-sm
                                    font-semibold
                                "
                            >
                                Clear All
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setFiltersOpen(false)
                                }
                                className="
                                    h-11
                                    rounded-lg
                                    bg-[var(--brand-black)]
                                    text-sm
                                    font-semibold
                                    text-white
                                "
                            >
                                Show Services
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* SORT SHEET */}
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
                            <h2 className="text-lg font-bold">
                                Sort By
                            </h2>
                            <button
                                type="button"
                                onClick={() =>
                                    setSortOpen(false)
                                }
                            >
                                <FiX size={21} />
                            </button>
                        </div>
                        <div className="px-5 py-2">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setSortBy(option.value);
                                        setSortOpen(false);
                                    }}
                                    className="
                                        flex
                                        w-full
                                        items-center
                                        justify-between
                                        border-b
                                        border-[var(--border)]
                                        py-4
                                        text-left
                                        last:border-0
                                    "
                                >
                                    <span
                                        className={
                                            sortBy === option.value
                                                ? "font-bold text-[var(--text-primary)]"
                                                : "text-[var(--text-secondary)]"
                                        }
                                    >
                                        {option.label}
                                    </span>
                                    {sortBy === option.value && (
                                        <FiCheck
                                            className="
                                                text-[var(--brand-gold-dark)]
                                            "
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}