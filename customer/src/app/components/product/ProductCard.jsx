"use client";
import Image from "next/image";
import Link from "next/link";
import {
    FiStar,FiShoppingCart
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";
export default function ProductCard({
    product,
}) {
    /* =============================================
       PRODUCT DATA
    ============================================= */
    const sellingPrice = Number(
        product.product_selling_price || 0
    );
    const mrp = Number(
        product.product_mrp || 0
    );
    const rating = Number(
        product.average_rating || 0
    );
    const reviewCount = Number(
        product.review_count || 0
    );
    /* =============================================
       SALE
    ============================================= */
    const isOnSale =
        mrp > 0 &&
        sellingPrice > 0 &&
        mrp > sellingPrice;
    const discountPercentage = isOnSale
        ? Math.round(
            ((mrp - sellingPrice) / mrp) * 100
        )
        : 0;

    const { addItem, busy } = useCart();

    async function handleAddToCart(event) {
        event.preventDefault();
        event.stopPropagation();

        try {
            await addItem({
                item_type: "product",
                item_id: product.product_id,
                quantity: 1,
            });
        } catch (error) {
            console.error("Add to cart failed:", error);
        }
    }
    /* =============================================
       PRODUCT IMAGE
    ============================================= */
    const getProductImage = () => {
        let images = product.product_images;
        if (typeof images === "string") {
            try {
                images = JSON.parse(images);
            } catch {
                images = [];
            }
        }
        if (
            Array.isArray(images) &&
            images.length > 0
        ) {
            return images[0];
        }
        return "/images/products/product-placeholder.png";
    };
    const productImage =
        getProductImage();
    /* =============================================
       CATEGORY
    ============================================= */
    const categoryName =
        product.category_name ||
        product.product_category ||
        product.category ||
        "SR Automotives";
    const productSlug = product.product_slug;
    /* =============================================
       RATING STARS
    ============================================= */
    const renderStars = () => {
        return [1, 2, 3, 4, 5].map(
            (star) => (
                <FiStar
                    key={star}
                    size={12}
                    className={
                        star <=
                            Math.round(rating)
                            ? `
                                fill-[var(--brand-gold)]
                                text-[var(--brand-gold)]
                            `
                            : `
                                text-[var(--border)]
                            `
                    }
                />
            )
        );
    };
    console.log(productSlug);
    return (
        <Link
            href={`/products/${productSlug}`}
            className="
                block
                h-full
                min-w-0
            "
        >
            <article
                className="
                    group
                    flex
                    h-full
                    min-w-0
                    flex-col
                    overflow-hidden
                    rounded-[14px]
                    border
                    border-[var(--border)]
                    bg-white
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[var(--brand-gold)]
                    hover:shadow-[0_12px_30px_rgba(8,9,9,0.08)]
                "
            >
                {/* =============================================
                    PRODUCT IMAGE
                ============================================= */}
                <div
                    className="
                        relative
                        h-[145px]
                        w-full
                        overflow-hidden
                        bg-[var(--brand-cream)]
                        sm:h-[190px]
                        lg:h-[210px]
                        xl:h-[220px]
                    "
                >
                    <Image
                        src={productImage}
                        alt={
                            product.product_name ||
                            "SR Automotives product"
                        }
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
                    {/* =============================================
                        SALE BADGE
                    ============================================= */}
                    {isOnSale && (
                        <span
                            className="
                                absolute
                                left-2
                                top-2
                                z-20
                                rounded-full
                                bg-[var(--brand-black)]
                                px-2
                                py-1
                                text-[7px]
                                font-bold
                                uppercase
                                tracking-[0.04em]
                                text-white
                                shadow-sm
                                sm:left-3
                                sm:top-3
                                sm:px-2.5
                                sm:py-1.5
                                sm:text-[8px]
                            "
                        >
                            Sale{" "}
                            <span
                                className="
                                    text-[var(--brand-gold)]
                                "
                            >
                                {discountPercentage}% Off
                            </span>
                        </span>
                    )}
                </div>
                {/* =============================================
                    PRODUCT INFORMATION
                ============================================= */}
                <div
                    className="
                        flex
                        flex-1
                        flex-col
                        p-3.5
                        sm:p-4
                        lg:p-5
                    "
                >
                    {/* CATEGORY */}
                    <p
                        className="
                            mb-2
                            truncate
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-[0.06em]
                            text-[var(--brand-gold-dark)]
                            sm:text-[9px]
                        "
                    >
                        {categoryName}
                    </p>
                    {/* PRODUCT NAME */}
                    <h2
                        className="
                            line-clamp-2
                            min-h-[40px]
                            text-[13px]
                            font-bold
                            leading-5
                            text-[var(--text-primary)]
                            transition-colors
                            duration-200
                            group-hover:text-[var(--brand-gold-dark)]
                            sm:text-sm
                            lg:text-[15px]
                        "
                    >
                        {product.product_name}
                    </h2>
                    {/* =============================================
                        RATING
                    ============================================= */}
                    <div
                        className="
                            mt-3
                            flex
                            min-h-[16px]
                            items-center
                            gap-2
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-[2px]
                            "
                        >
                            {renderStars()}
                        </div>
                        {reviewCount > 0 && (
                            <span
                                className="
                                    text-[9px]
                                    text-[var(--text-secondary)]
                                    sm:text-[10px]
                                "
                            >
                                ({reviewCount})
                            </span>
                        )}
                    </div>
                    {/* =============================================
                        PRICE
                    ============================================= */}
                    <div className="mt-auto pt-4 flex gap-3 items-center justify-between">
                        <div
                            className="
                                flex
                                flex-wrap
                                flex-col
                                items-baseline
                                gap-x-2
                                gap-y-1
                            "
                        >
                            {/* SELLING PRICE */}
                            <span
                                className="
                                    whitespace-nowrap
                                    text-[17px]
                                    font-extrabold
                                    leading-none
                                    text-[var(--text-primary)]
                                    sm:text-lg
                                    lg:text-[21px]
                                "
                            >
                                ₹
                                {sellingPrice.toLocaleString(
                                    "en-IN"
                                )}
                            </span>
                            {/* MRP */}
                            {isOnSale && (
                                <span
                                    className="
                                        whitespace-nowrap
                                        text-[9px]
                                        font-medium
                                        text-[var(--text-secondary)]
                                        line-through
                                        sm:text-[10px]
                                        lg:text-[11px]
                                    "
                                >
                                    ₹
                                    {mrp.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>
                            )}
                        </div>
                        <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={busy}
                        className="
    mt-4
    rounded-lg
    bg-[var(--brand-gold)]
    px-4
    py-3
    text-sm
    font-semibold
    text-[var(--brand-black)]
    transition-colors
    hover:bg-[var(--brand-gold-dark)]
    disabled:cursor-not-allowed
    disabled:opacity-60
    cursor-pointer
  "
                    >
                        {busy ? "Updating..." : <FiShoppingCart size={19}/>}
                    </button>
                    </div>
                </div>
            </article>
        </Link>
    );
}