"use client";
import { FiRefreshCw } from "react-icons/fi";
export default function ServiceFilters({
    serviceTypes = [],
    selectedTypes = [],
    toggleType,
    maxPrice,
    setMaxPrice,
    maximumPrice,
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
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                        Filters
                    </h2>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="
                            flex
                            cursor-pointer
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            text-[var(--text-primary)]
                            hover:text-[var(--brand-gold-dark)]
                        "
                    >
                        <FiRefreshCw />
                        Clear All
                    </button>
                </div>
            )}
            {/* PRICE */}
            <div className="py-5">
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
                    max={maximumPrice}
                    step="100"
                    value={maxPrice}
                    onChange={(event) =>
                        setMaxPrice(Number(event.target.value))
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
                        justify-between
                        text-xs
                        font-medium
                        text-[var(--text-primary)]
                    "
                >
                    <span>₹0</span>
                    <span>
                        ₹{Number(maxPrice).toLocaleString("en-IN")}
                    </span>
                </div>
            </div>
            {/* SERVICE TYPE */}
            <div
                className="
                    border-b
                    border-[var(--border)]
                    py-5
                "
            >
                <h3
                    className="
                        mb-4
                        text-sm
                        font-bold
                        text-[var(--text-primary)]
                    "
                >
                    Service Type
                </h3>
                {serviceTypes.length > 0 ? (
                    <div className="space-y-3.5">
                        {serviceTypes.map((type) => (
                            <label
                                key={type.name}
                                className="
                                    flex
                                    cursor-pointer
                                    items-center
                                    text-sm
                                "
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(type.name)}
                                    onChange={() =>
                                        toggleType(type.name)
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
                                    {type.name}
                                </span>
                                <span
                                    className="
                                        text-xs
                                        text-[var(--text-secondary)]
                                    "
                                >
                                    ({type.count})
                                </span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-[var(--text-secondary)]">
                        No service types available.
                    </p>
                )}
            </div>            
        </div>
    );
}