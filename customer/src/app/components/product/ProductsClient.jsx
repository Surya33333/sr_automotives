"use client";
import {
    useMemo,
    useState,
} from "react";
import {
    FiSearch,
    FiSliders,
} from "react-icons/fi";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import MobileProductBar from "./MobileProductBar";
import PopularProducts from "../home/PopularProducts";

const SORT_OPTIONS = [
    {
        value: "recommended",
        label: "Recommended",
    },
    {
        value: "newest",
        label: "New Arrivals",
    },
    {
        value: "price-low",
        label: "Price: Low to High",
    },
    {
        value: "price-high",
        label: "Price: High to Low",
    },
];
export default function ProductsClient({
    initialProducts = [],
    initialCategories = [],
    featuredProducts = {},
}) {
    /* =========================================================
       STATES
    ========================================================= */
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] =
        useState([]);
    const [activeTab, setActiveTab] =
        useState("all");
    const [sortBy, setSortBy] =
        useState("recommended");
    const [mobileFiltersOpen, setMobileFiltersOpen] =
        useState(false);
    const [mobileSortOpen, setMobileSortOpen] =
        useState(false);

    const bestSellerIds = useMemo(
        () =>
            new Set(
                (featuredProducts.best_sellers || []).map(
                    (product) => product.product_id
                )
            ),
        [featuredProducts]
    );

    const topRatedIds = useMemo(
        () =>
            new Set(
                (featuredProducts.top_rated || []).map(
                    (product) => product.product_id
                )
            ),
        [featuredProducts]
    );
    /* =========================================================
       MAX PRODUCT PRICE
    ========================================================= */
    const maximumProductPrice = useMemo(() => {
        if (!initialProducts.length) {
            return 50000;
        }
        const highestPrice = Math.max(
            ...initialProducts.map(
                (product) =>
                    Number(
                        product.product_selling_price || 0
                    )
            )
        );
        return Math.ceil(
            highestPrice / 1000
        ) * 1000;
    }, [initialProducts]);
    const [maxPrice, setMaxPrice] = useState(
        maximumProductPrice
    );
    /* =========================================================
       CATEGORIES FROM PRODUCTS
       No hardcoded categories.
    ========================================================= */
    const categories = useMemo(() => {
        return initialCategories.map((category) => ({
            id: category.category_id,
            name: category.category_name,

            count: initialProducts.filter(
                (product) =>
                    Number(product.category_id) ===
                    Number(category.category_id)
            ).length,
        }));
    }, [initialCategories, initialProducts]);
    /* =========================================================
       CATEGORY CHANGE
    ========================================================= */
    const toggleCategory = (categoryId) => {
        setSelectedCategories((current) => {
            if (
                current.includes(categoryId)
            ) {
                return current.filter(
                    (id) => id !== categoryId
                );
            }
            return [
                ...current,
                categoryId,
            ];
        });
    };
    /* =========================================================
       CLEAR FILTERS
    ========================================================= */
    const clearFilters = () => {
        setSelectedCategories([]);
        setMaxPrice(
            maximumProductPrice
        );
        setSearch("");
    };
    /* =========================================================
       FILTER PRODUCTS
    ========================================================= */
    const filteredProducts = useMemo(() => {
        let products = [
            ...initialProducts,
        ];
        /* SEARCH */
        const searchTerm =
            search
                .trim()
                .toLowerCase();
        if (searchTerm) {
            products = products.filter(
                (product) => {
                    const searchableText = [
                        product.product_name,
                        product.product_brand,
                        product.category_name,
                        product.subcategory_name,
                        product.product_description,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();
                    return searchableText.includes(
                        searchTerm
                    );
                }
            );
        }
        /* CATEGORY */
        if (
            selectedCategories.length > 0
        ) {
            products = products.filter(
                (product) => {
                    const categoryValue =
                        product.category_id ??
                        product.category_name;
                    return selectedCategories.includes(
                        categoryValue
                    );
                }
            );
        }
        /* PRICE */
        products = products.filter(
            (product) =>
                Number(
                    product.product_selling_price || 0
                ) <= maxPrice
        );
        /* =====================================================
           TAB FILTERS
        ===================================================== */
        /* BEST SELLERS */
        if (activeTab === "best-sellers") {
            products = products.filter((product) =>
                bestSellerIds.has(product.product_id)
            );
        }

        if (activeTab === "top-rated") {
            products = products.filter((product) =>
                topRatedIds.has(product.product_id)
            );
        }
        /* =====================================================
           SORT
        ===================================================== */
        switch (sortBy) {
            case "newest":
                products.sort(
                    (a, b) =>
                        new Date(
                            b.created_at || 0
                        ) -
                        new Date(
                            a.created_at || 0
                        )
                );
                break;
            case "best-selling":
                products.sort(
                    (a, b) =>
                        Number(
                            b.total_sold || 0
                        ) -
                        Number(
                            a.total_sold || 0
                        )
                );
                break;
            case "top-rated":
                products.sort(
                    (a, b) =>
                        Number(
                            b.average_rating || 0
                        ) -
                        Number(
                            a.average_rating || 0
                        )
                );
                break;
            case "price-low":
                products.sort(
                    (a, b) =>
                        Number(
                            a.product_selling_price || 0
                        ) -
                        Number(
                            b.product_selling_price || 0
                        )
                );
                break;
            case "price-high":
                products.sort(
                    (a, b) =>
                        Number(
                            b.product_selling_price || 0
                        ) -
                        Number(
                            a.product_selling_price || 0
                        )
                );
                break;
            default:
                break;
        }
        return products;
    }, [
        initialProducts,
        search,
        selectedCategories,
        maxPrice,
        activeTab,
        sortBy,
        bestSellerIds,
        topRatedIds,
    ]);
    /* =========================================================
       PAGE
    ========================================================= */
    return (
        <>
            <div
                className="
        section-container
        pb-28
        pt-[96px]
        sm:pt-[104px]
        lg:pb-20
        lg:pt-[110px]
    "
            >
                {/* =================================================
                    PAGE HEADER
                ================================================= */}
                <div
                    className="
                        flex
                        flex-col
                        gap-6
                        lg:flex-row
                        lg:items-end
                        lg:justify-between
                    "
                >
                    <div>
                        <h1
                            className="
        text-[34px]
        font-extrabold
        leading-none
        tracking-[-0.035em]
        text-[var(--text-primary)]
        sm:text-[40px]
        lg:text-[44px]
    "
                        >
                            All Products
                        </h1>
                    </div>
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
                {/* =================================================
                    MAIN PRODUCTS AREA
                ================================================= */}
                <div
                    className="
                        mt-10
                        lg:grid
                        lg:grid-cols-[250px_minmax(0,1fr)]
                        lg:gap-7
                        xl:grid-cols-[270px_minmax(0,1fr)]
                        xl:gap-8
                    "
                >
                    {/* =================================================
                        DESKTOP FILTERS
                    ================================================= */}
                    <aside
                        className="
                            hidden
                            lg:block
                        "
                    >
                        <ProductFilters
                            categories={categories}
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
                    </aside>
                    {/* =================================================
                        RIGHT PRODUCTS
                    ================================================= */}
                    <div className="min-w-0">
                        {/* =============================================
                            PRODUCT COUNT + DESKTOP SORT
                        ============================================= */}
                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-4
                            "
                        >
                            <p
                                className="
                                    text-xs
                                    text-[var(--text-secondary)]
                                    sm:text-sm
                                "
                            >
                                <strong
                                    className="
                                        text-[var(--text-primary)]
                                    "
                                >
                                    {
                                        filteredProducts.length
                                    }
                                </strong>{" "}
                                products found
                            </p>
                        </div>
                        {/* =============================================
                            TABS
                        ============================================= */}
                        <div
                            className="
                                mt-5
                                flex
                                gap-2
                                overflow-x-auto
                                pb-1
                                scrollbar-hide
                                justify-between
                                sm:gap-3
                                wrap
                            "
                        >
                            <div className="flex gap-2">
                                <TabButton
                                    active={
                                        activeTab ===
                                        "all"
                                    }
                                    onClick={() =>
                                        setActiveTab(
                                            "all"
                                        )
                                    }
                                >
                                    All Products
                                </TabButton>
                                <TabButton
                                    active={
                                        activeTab ===
                                        "best-sellers"
                                    }
                                    onClick={() =>
                                        setActiveTab(
                                            "best-sellers"
                                        )
                                    }
                                >
                                    Best Sellers
                                </TabButton>
                                <TabButton
                                    active={
                                        activeTab ===
                                        "top-rated"
                                    }
                                    onClick={() =>
                                        setActiveTab(
                                            "top-rated"
                                        )
                                    }
                                >
                                    Top Rated
                                </TabButton>
                            </div>
                            <div>
                                {/* DESKTOP SORT */}
                                <label
                                    className="
                                    hidden
                                    items-center
                                    gap-2
                                    text-sm
                                    lg:flex
                                "
                                >
                                    <span>
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
                                        cursor-pointer
                                        rounded-lg
                                        border
                                        border-[var(--border)]
                                        bg-white
                                        px-3
                                        py-2
                                        font-semibold
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
                                                    {
                                                        option.label
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>
                            </div>
                        </div>
                        {/* =============================================
                            PRODUCTS GRID
                        ============================================= */}
                        {filteredProducts.length > 0 ? (
                            <div
                                className="
                                    mt-5
                                    grid
                                    grid-cols-2
                                    gap-3
                                    sm:gap-4
                                    md:grid-cols-3
                                    xl:grid-cols-4
                                "
                            >
                                {filteredProducts.map(
                                    (product) => (
                                        <ProductCard
                                            key={
                                                product.product_id
                                            }
                                            product={
                                                product
                                            }
                                            showBestSeller={
                                                product.is_best_seller ===
                                                true ||
                                                product.is_best_seller ===
                                                1
                                            }
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <div
                                className="
                                    mt-8
                                    flex
                                    min-h-[350px]
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
                                        text-[var(--text-primary)]
                                    "
                                >
                                    No products found
                                </h2>
                                <p
                                    className="
                                        mt-2
                                        max-w-sm
                                        text-sm
                                        text-[var(--text-secondary)]
                                    "
                                >
                                    Try changing your
                                    search or filters.
                                </p>
                                <button
                                    type="button"
                                    onClick={
                                        clearFilters
                                    }
                                    className="
                                        mt-5
                                        cursor-pointer
                                        rounded-lg
                                        bg-[var(--brand-black)]
                                        px-5
                                        py-2.5
                                        text-xs
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
            </div>
            {/* =================================================
                MOBILE FILTER / SORT
            ================================================= */}
            <MobileProductBar
                filtersOpen={
                    mobileFiltersOpen
                }
                setFiltersOpen={
                    setMobileFiltersOpen
                }
                sortOpen={
                    mobileSortOpen
                }
                setSortOpen={
                    setMobileSortOpen
                }
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
                sortBy={
                    sortBy
                }
                setSortBy={
                    setSortBy
                }
                sortOptions={
                    SORT_OPTIONS
                }
            />
        </>
    );
}
/* =========================================================
   TAB BUTTON
========================================================= */
function TabButton({
    active,
    onClick,
    children,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                shrink-0
                cursor-pointer
                rounded-full
                border
                px-4
                py-2
                text-[11px]
                font-semibold
                transition-all
                sm:px-5
                sm:text-xs
                ${active
                    ? `
                            border-[var(--brand-black)]
                            bg-[var(--brand-black)]
                            text-white
                        `
                    : `
                            border-[var(--border)]
                            bg-white
                            text-[var(--text-primary)]
                            hover:border-[var(--brand-gold)]
                        `
                }
            `}
        >
            {children}
        </button>
    );
}