"use client";
import {
    useMemo,
    useState,
} from "react";
import {
    FiHeadphones,
    FiSearch,
    FiSettings,
    FiShield,
    FiSliders,
    FiTruck,
} from "react-icons/fi";
import ServiceCard from "./ServiceCard";
import ServiceFilters from "./ServiceFilters";
import MobileServiceBar from "./MobileServiceBar";
const SORT_OPTIONS = [
    {
        value: "recommended",
        label: "Recommended",
    },
    {
        value: "price-low",
        label: "Price: Low to High",
    },
    {
        value: "price-high",
        label: "Price: High to Low",
    },
    {
        value: "rating",
        label: "Customer Rating",
    },
];
function parseArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed)
                ? parsed
                : [];
        } catch {
            return [];
        }
    }
    return [];
}
export default function ServicesClient({
    initialServices = [],
}) {
    const [search, setSearch] =
        useState("");
    const [selectedTypes, setSelectedTypes] =
        useState([]);
    const [sortBy, setSortBy] =
        useState("recommended");
    const [filtersOpen, setFiltersOpen] =
        useState(false);
    const [sortOpen, setSortOpen] =
        useState(false);
    /\* NORMALIZE JSON \*/
    const services = useMemo(() => {
        return initialServices.map((service) => ({
            ...service,
            service_media: service.service_media ?? { images: [] },
            service_keywords:
                parseArray(service.service_keywords),
        }));
    }, [initialServices]);
    /\* MAX PRICE \*/
    const maximumPrice = useMemo(() => {
        if (!services.length) {
            return 15000;
        }
        const highest = Math.max(
            ...services.map((service) =>
                Number(
                    service.service_selling_price ||
                    service.service_price ||
                    0
                )
            )
        );
        return Math.max(
            1000,
            Math.ceil(highest / 1000) * 1000
        );
    }, [services]);
    const [maxPrice, setMaxPrice] =
        useState(maximumPrice);
    const serviceTypes = useMemo(() => {
        const map = new Map();
        services.forEach((service) => {
            service.service_keywords.forEach(
                (keyword) => {
                    const normalized =
                        String(keyword).trim();
                    if (!normalized) {
                        return;
                    }
                    map.set(
                        normalized,
                        (map.get(normalized) || 0) + 1
                    );
                }
            );
        });
        return Array.from(map.entries()).map(
            ([name, count]) => ({
                name,
                count,
            })
        );
    }, [services]);
    const toggleType = (type) => {
        setSelectedTypes((current) => {
            if (current.includes(type)) {
                return current.filter(
                    (item) => item !== type
                );
            }
            return [
                ...current,
                type,
            ];
        });
    };
    const clearFilters = () => {
        setSearch("");
        setSelectedTypes([]);
        setMaxPrice(maximumPrice);
        setSortBy("recommended");
    };
    /\* FILTER + SORT \*/
    const filteredServices = useMemo(() => {
        let result = [...services];
        /\* SEARCH \*/
        const term =
            search.trim().toLowerCase();
        if (term) {
            result = result.filter((service) => {
                const searchable = [
                    service.service_title,
                    service.service_description,
                    ...service.service_keywords,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return searchable.includes(term);
            });
        }
        /\* SERVICE TYPE \*/
        if (selectedTypes.length > 0) {
            result = result.filter((service) =>
                selectedTypes.some((type) =>
                    service.service_keywords.includes(type)
                )
            );
        }
        /\* PRICE \*/
        result = result.filter(
            (service) =>
                Number(
                    service.service_selling_price ||
                    service.service_price ||
                    0
                ) <= maxPrice
        );
        /\* SORT \*/
        switch (sortBy) {
            case "price-low":
                result.sort(
                    (a, b) =>
                        Number(
                            a.service_selling_price ||
                            a.service_price ||
                            0
                        ) -
                        Number(
                            b.service_selling_price ||
                            b.service_price ||
                            0
                        )
                );
                break;
            case "price-high":
                result.sort(
                    (a, b) =>
                        Number(
                            b.service_selling_price ||
                            b.service_price ||
                            0
                        ) -
                        Number(
                            a.service_selling_price ||
                            a.service_price ||
                            0
                        )
                );
                break;
            case "rating":
                result.sort(
                    (a, b) =>
                        Number(b.average_rating || 0) -
                        Number(a.average_rating || 0)
                );
                break;
            default:
                break;
        }
        return result;
    }, [
        services,
        search,
        selectedTypes,
        maxPrice,
        sortBy,
    ]);
    return (
        <>
            {/* =================================================
                SERVICES
            ================================================= */}
            <section
                className="
                    section-container
                    pb-28
                    pt-[96px]
                    sm:pt-[104px]
                    lg:pb-20
                    lg:pt-[110px]
                "
            >
                {/* PAGE HEADER */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-[34px] font-extrabold leading-none tracking-[-0.035em] text-[var(--text-primary)] sm:text-[40px] lg:text-[44px]">
                            Our Services
                        </h1>
                    </div>
                    <div className="relative w-full lg:max-w-[380px]">
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search services..."
                            className="h-12 w-full rounded-lg border border-[var(--border)] bg-white pl-4 pr-12 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--brand-gold)]"
                        />
                        <div className="pointer-events-none absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md bg-[var(--brand-black)] text-[var(--brand-gold)]">
                            <FiSearch size={17} />
                        </div>
                    </div>
                </div>
                <div
                    className="
                        mt-10
                        lg:grid
                        lg:grid-cols-[250px_minmax(0,1fr)]
                        lg:gap-6
                        xl:grid-cols-[270px_minmax(0,1fr)]
                        xl:gap-8
                    "
                >
                    {/* DESKTOP FILTERS */}
                    <aside className="hidden lg:block">
                        <ServiceFilters
                            serviceTypes={serviceTypes}
                            selectedTypes={selectedTypes}
                            toggleType={toggleType}
                            maxPrice={maxPrice}
                            setMaxPrice={setMaxPrice}
                            maximumPrice={maximumPrice}
                            clearFilters={clearFilters}
                        />
                    </aside>
                    {/* SERVICES */}
                    <div className="min-w-0">
                        {/* TOP CONTROLS */}
                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >
                            <p
                                className="
                                    text-sm
                                    text-[var(--text-secondary)]
                                "
                            >
                                <strong
                                    className="
                                        text-[var(--text-primary)]
                                    "
                                >
                                    {filteredServices.length}
                                </strong>{" "}
                                services found
                            </p>
                            <div
                                className="
                                    flex
                                    w-full
                                    gap-3
                                    sm:w-auto
                                "
                            >
                                {/* DESKTOP SORT */}
                                <label
                                    className="
                                        hidden
                                        items-center
                                        gap-2
                                        lg:flex
                                    "
                                >
                                    <span className="whitespace-nowrap text-sm">
                                        Sort by :
                                    </span>
                                    <select
                                        value={sortBy}
                                        onChange={(event) =>
                                            setSortBy(
                                                event.target.value
                                            )
                                        }
                                        className="
                                            h-11
                                            rounded-lg
                                            border
                                            border-[var(--border)]
                                            bg-white
                                            px-3
                                            text-sm
                                            outline-none
                                            focus:border-[var(--brand-gold)]
                                        "
                                    >
                                        {SORT_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    key={
                                                        option.value
                                                    }
                                                    value={
                                                        option.value
                                                    }
                                                >
                                                    {option.label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>
                            </div>
                        </div>
                        {/* GRID */}
                        {filteredServices.length > 0 ? (
                            <div
                                className="
                                mt-5
                                grid
                                grid-cols-2
                                gap-3
                                sm:gap-4
                                md:grid-cols-3
                                xl:grid-cols-4
                                xl:gap-5
                            "
                            >
                                {filteredServices.map((service, index) => (
                                    <ServiceCard
                                        key={service.service_id}
                                        service={service}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                className="
                                    mt-5
                                    flex
                                    min-h-[380px]
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-[var(--border)]
                                    bg-white
                                    px-5
                                    text-center
                                "
                            >
                                <FiSliders
                                    size={32}
                                    className="
                                        text-[var(--brand-gold-dark)]
                                    "
                                />
                                <h2
                                    className="
                                        mt-4
                                        text-xl
                                        font-bold
                                    "
                                >
                                    No services found
                                </h2>
                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        text-[var(--text-secondary)]
                                    "
                                >
                                    Try changing your search or
                                    filters.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="
                                        mt-5
                                        rounded-lg
                                        bg-[var(--brand-black)]
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                    "
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <MobileServiceBar
                filtersOpen={filtersOpen}
                setFiltersOpen={setFiltersOpen}
                sortOpen={sortOpen}
                setSortOpen={setSortOpen}
                serviceTypes={serviceTypes}
                selectedTypes={selectedTypes}
                toggleType={toggleType}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                maximumPrice={maximumPrice}
                clearFilters={clearFilters}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOptions={SORT_OPTIONS}
            />
        </>
    );
}