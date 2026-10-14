"use client";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
    FiArrowLeft,
    FiArrowRight,
    FiChevronRight,
} from "react-icons/fi";
/* =========================================================
   CONFIG
========================================================= */
const AUTOPLAY_DELAY = 4000;
const SWIPE_THRESHOLD = 40;
/* =========================================================
   STATIC MAIN HERO
   IMPORTANT:
   Make sure this file exists:
   public/hero/main-hero-desktop.webp
========================================================= */
const mainHero = {
    id: "main",
    type: "hero",
    badge: "",
    title: "DRIVE YOUR",
    highlightedTitle: "DREAMS TODAY",
    description:
        "Top-quality parts, expert services and everything your car needs all in one place.",
    desktopMedia: "/hero1.png",
    mobileMedia: "/hero1.png",
    mediaType: "image",
};
/* =========================================================
   TEMPORARY OFFERS
   No images required for these temporary slides.
   Once backend is connected, replace this array with
   the API response.
========================================================= */
const temporaryOffers = [
    {
        id: 1,
        type: "offer",
        badge: "LIMITED TIME OFFER",
        title: "Complete Interior Upgrade Package",
        description:
            "Upgrade your cabin with premium interior accessories bundled together at a special price.",
        originalPrice: "₹6,999",
        offerPrice: "₹4,999",
        discount: "29% OFF",
        ctaText: "View Offer",
        ctaLink: "/offers",
        /*
         * No image right now.
         * CSS background will be displayed instead.
         */
        desktopMedia: '/offer1.png',
        mobileMedia: null,
        mediaType: "image",
    },
    {
        id: 2,
        type: "offer",
        badge: "SPECIAL OFFER",
        title: "Premium LED Headlights",
        description:
            "Upgrade your drive with brighter, safer and longer-lasting premium LED headlights.",
        originalPrice: "₹4,499",
        offerPrice: "₹2,999",
        discount: "33% OFF",
        ctaText: "Shop Offer",
        ctaLink: "/offers",
        desktopMedia: '/offer2.png',
        mobileMedia: null,
        mediaType: "image",
    },
];
/* =========================================================
   SLIDE MEDIA
========================================================= */
function SlideMedia({ slide, priority }) {
    /*
     * If the slide doesn't have media yet,
     * show a safe background.
     *
     * This prevents 404 errors.
     */
    if (!slide.desktopMedia) {
        return (
            <div
                className="
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-[#080909]
                    via-[#151515]
                    to-[#211b12]
                "
            />
        );
    }
    /* ---------------- VIDEO ---------------- */
    if (slide.mediaType === "video") {
        return (
            <>
                {/* Desktop */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={slide.desktopPoster}
                    className="
                        absolute
                        inset-0
                        hidden
                        h-full
                        w-full
                        object-cover
                        md:block
                    "
                >
                    <source
                        src={slide.desktopMedia}
                        type="video/mp4"
                    />
                </video>
                {/* Mobile */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={
                        slide.mobilePoster ||
                        slide.desktopPoster
                    }
                    className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        md:hidden
                    "
                >
                    <source
                        src={
                            slide.mobileMedia ||
                            slide.desktopMedia
                        }
                        type="video/mp4"
                    />
                </video>
            </>
        );
    }
    /* ---------------- IMAGE ---------------- */
    return (
        <>
            {/* Desktop */}
            <Image
                src={slide.desktopMedia}
                alt=""
                fill
                priority={priority}
                quality={90}
                sizes="100vw"
                className="
                    hidden
                    object-cover
                    md:block
                "
            />
            {/* Mobile */}
            <Image
                src={
                    slide.mobileMedia ||
                    slide.desktopMedia
                }
                alt=""
                fill
                priority={priority}
                quality={90}
                sizes="100vw"
                className="
                    object-cover
                    md:hidden
                "
            />
        </>
    );
}
/* =========================================================
   MAIN HERO CONTENT
========================================================= */
function MainHeroContent() {
    return (
        <div
            className="
                relative
                z-10
                flex
                h-full
                items-end
                pb-16
                md:items-center
                md:pb-0
            "
        >
            <div className="section-container">
                <div
                    className="
                        max-w-[590px]
                    "
                >
                    {/* BADGE */}
                    <div
                        className="
                            mb-4
                            flex
                            items-center
                            gap-3
                        "
                    >
                        <span
                            className="
                                h-[3px]
                                w-8
                                rounded-full
                                bg-[var(--brand-gold)]
                            "
                        />
                        <span
                            className="
                                text-[11px]
                                font-semibold
                                tracking-[0.15em]
                                text-[var(--brand-gold)]
                                sm:text-sm
                            "
                        >
                            {mainHero.badge}
                        </span>
                    </div>
                    {/* TITLE */}
                    <h1
                        className="
                            text-[30px]
                            font-extrabold
                            leading-[1.08]
                            tracking-tight
                            text-white
                            xs:text-[34px]
                            sm:text-[42px]
                            md:text-[46px]
                            lg:text-[52px]
                            xl:text-[58px]
                        "
                    >
                        {mainHero.title}
                        <br />
                        <span
                            className="
                                text-[var(--brand-gold)]
                            "
                        >
                            {mainHero.highlightedTitle}
                        </span>
                    </h1>
                    {/* DESCRIPTION */}
                    <p
                        className="
                            mt-4
                            max-w-[510px]
                            text-sm
                            leading-6
                            text-white/80
                            sm:text-base
                            sm:leading-7
                            lg:text-lg
                        "
                    >
                        {mainHero.description}
                    </p>
                    {/* CTA BUTTONS */}
                    <div className="mt-6 flex flex-nowrap gap-3 sm:mt-7 sm:gap-4">
                        <Link
                            href="/products"
                            className="
                                        inline-flex
                                        h-11
                                        flex-1
                                        items-center
                                        justify-center
                                        gap-2
                                        whitespace-nowrap
                                        rounded-md
                                        bg-[var(--brand-gold)]
                                        px-3
                                        text-sm
                                        font-semibold
                                        text-[var(--brand-black)]
                                        sm:h-12
                                        sm:flex-none
                                        sm:px-6"
                        >
                            Shop Products
                            <FiChevronRight />
                        </Link>
                        <Link
                            href="/services"
                            className="
                                        inline-flex
                                        h-11
                                        flex-1
                                        items-center
                                        justify-center
                                        whitespace-nowrap
                                        rounded-md
                                        border
                                        border-[var(--brand-gold)]
                                        px-3
                                        text-sm
                                        font-semibold
                                        text-white
                                        sm:h-12
                                        sm:flex-none
                                        sm:px-6"
                        >
                            Explore Services
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
/* =========================================================
   OFFER CONTENT
========================================================= */
function OfferContent({ slide }) {
    return (
        <div
            className="
                relative
                z-10
                flex
                h-full
                items-end
                pb-16
                md:items-center
                md:pb-0
            "
        >
            <div className="section-container">
                <div
                    className="
                        max-w-[570px]
                    "
                >
                    {/* BADGE */}
                    {slide.badge && (
                        <div
                            className="
                                mb-4
                                inline-flex
                                rounded-full
                                border
                                border-[var(--brand-gold)]/60
                                bg-black/30
                                px-3
                                py-1.5
                                text-[10px]
                                font-semibold
                                tracking-[0.12em]
                                text-[var(--brand-gold)]
                                backdrop-blur-sm
                                sm:text-xs
                            "
                        >
                            {slide.badge}
                        </div>
                    )}
                    {/* TITLE */}
                    <h2
                        className="
                            max-w-[560px]
                            text-[30px]
                            font-extrabold
                            leading-[1.08]
                            text-white
                            xs:text-[34px]
                            sm:text-[42px]
                            md:text-[46px]
                            lg:text-[52px]
                        "
                    >
                        {slide.title}
                    </h2>
                    {/* DESCRIPTION */}
                    <p
                        className="
                            mt-4
                            max-w-[500px]
                            text-sm
                            leading-6
                            text-white/75
                            sm:text-base
                            sm:leading-7
                        "
                    >
                        {slide.description}
                    </p>
                    {/* PRICE */}
                    {slide.offerPrice && (
                        <div
                            className="
                                mt-5
                                flex
                                flex-wrap
                                items-end
                                gap-3
                            "
                        >
                            <div>
                                {slide.originalPrice && (
                                    <p
                                        className="
                                            text-sm
                                            text-white/45
                                            line-through
                                        "
                                    >
                                        {slide.originalPrice}
                                    </p>
                                )}
                                <p
                                    className="
                                        text-2xl
                                        font-bold
                                        text-[var(--brand-gold-light)]
                                        sm:text-3xl
                                    "
                                >
                                    {slide.offerPrice}
                                </p>
                            </div>
                            {slide.discount && (
                                <span
                                    className="
                                        mb-1
                                        rounded-full
                                        bg-red-600
                                        px-3
                                        py-1
                                        text-xs
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {slide.discount}
                                </span>
                            )}
                        </div>
                    )}
                    {/* CTA */}
                    <Link
                        href={slide.ctaLink || "/offers"}
                        draggable={false}
                        className="
                            relative
                            z-30
                            mt-6
                            inline-flex
                            h-11
                            items-center
                            justify-center
                            gap-2
                            rounded-md
                            bg-[var(--brand-gold)]
                            px-5
                            text-sm
                            font-semibold
                            text-[var(--brand-black)]
                            transition-colors
                            hover:bg-[var(--brand-gold-light)]
                            sm:h-12
                            sm:px-6
                        "
                    >
                        {slide.ctaText || "View Offer"}
                        <FiChevronRight />
                    </Link>
                </div>
            </div>
        </div>
    );
}
/* =========================================================
   HERO SECTION
========================================================= */
export default function HeroSection() {
    const slides = [
        mainHero,
        ...temporaryOffers,
    ];
    /* ---------------- STATE ---------------- */
    const [currentSlide, setCurrentSlide] =
        useState(0);
    const [isPaused, setIsPaused] =
        useState(false);
    /* ---------------- DRAG ---------------- */
    const dragStartX = useRef(null);
    const dragCurrentX = useRef(null);
    const isDragging = useRef(false);
    /* =====================================================
       NEXT
    ===================================================== */
    const nextSlide = useCallback(() => {
        setCurrentSlide((current) =>
            current === slides.length - 1
                ? 0
                : current + 1
        );
    }, [slides.length]);
    /* =====================================================
       PREVIOUS
    ===================================================== */
    const previousSlide = useCallback(() => {
        setCurrentSlide((current) =>
            current === 0
                ? slides.length - 1
                : current - 1
        );
    }, [slides.length]);
    /* =====================================================
       AUTOPLAY
    ===================================================== */
    useEffect(() => {
        if (
            isPaused ||
            slides.length <= 1
        ) {
            return;
        }
        const timer = setTimeout(() => {
            nextSlide();
        }, AUTOPLAY_DELAY);
        return () =>
            clearTimeout(timer);
    }, [
        currentSlide,
        isPaused,
        nextSlide,
        slides.length,
    ]);
    /* =====================================================
       POINTER DOWN
    ===================================================== */
    const handlePointerDown = (event) => {
        /*
         * IMPORTANT:
         *
         * Don't start dragging when the user
         * clicks a button/link/input.
         *
         * This fixes CTA clicks.
         */
        if (
            event.target.closest(
                "a, button, input, select, textarea"
            )
        ) {
            return;
        }
        dragStartX.current =
            event.clientX;
        dragCurrentX.current =
            event.clientX;
        isDragging.current =
            false;
        setIsPaused(true);
        event.currentTarget
            .setPointerCapture?.(
                event.pointerId
            );
    };
    /* =====================================================
       POINTER MOVE
    ===================================================== */
    const handlePointerMove = (event) => {
        if (
            dragStartX.current === null
        ) {
            return;
        }
        dragCurrentX.current =
            event.clientX;
        const distance =
            dragCurrentX.current -
            dragStartX.current;
        if (
            Math.abs(distance) > 10
        ) {
            isDragging.current = true;
        }
    };
    /* =====================================================
       POINTER UP
    ===================================================== */
    const handlePointerUp = (event) => {
        if (
            dragStartX.current === null
        ) {
            return;
        }
        const distance =
            dragCurrentX.current -
            dragStartX.current;
        if (
            Math.abs(distance) >=
            SWIPE_THRESHOLD
        ) {
            if (distance < 0) {
                nextSlide();
            } else {
                previousSlide();
            }
        }
        dragStartX.current = null;
        dragCurrentX.current = null;
        isDragging.current = false;
        setIsPaused(false);
        event.currentTarget
            .releasePointerCapture?.(
                event.pointerId
            );
    };
    /* =====================================================
       POINTER CANCEL
    ===================================================== */
    const handlePointerCancel = () => {
        dragStartX.current = null;
        dragCurrentX.current = null;
        isDragging.current = false;
        setIsPaused(false);
    };
    /* =====================================================
       RENDER
    ===================================================== */
    return (
        <section
            aria-label="Featured content"
            className="
                relative
                w-full
                overflow-hidden
                bg-[var(--brand-black)]
                select-none
                touch-pan-y
            "
            onMouseEnter={() =>
                setIsPaused(true)
            }
            onMouseLeave={() =>
                setIsPaused(false)
            }
            onPointerDown={
                handlePointerDown
            }
            onPointerMove={
                handlePointerMove
            }
            onPointerUp={
                handlePointerUp
            }
            onPointerCancel={
                handlePointerCancel
            }
        >
            {/* =================================================
                HERO HEIGHT
            ================================================= */}
            <div
                className="relative h-[100svh] w-full">
                {/* =============================================
                    SLIDES
                ============================================= */}
                {slides.map(
                    (slide, index) => {
                        const active =
                            currentSlide === index;
                        return (
                            <div
                                key={slide.id}
                                aria-hidden={
                                    !active
                                }
                                className={`
                                    absolute
                                    inset-0
                                    transition-opacity
                                    duration-700
                                    ease-in-out
                                    ${active
                                        ? "visible opacity-100"
                                        : "invisible opacity-0"
                                    }
                                `}
                            >
                                {/* MEDIA */}
                                <SlideMedia
                                    slide={slide}
                                    priority={
                                        index === 0
                                    }
                                />
                                {/* DESKTOP GRADIENT */}
                                <div
                                    className="
                                        absolute
                                        inset-0
                                        hidden
                                        bg-gradient-to-r
                                        from-black/85
                                        via-black/35
                                        to-transparent
                                        md:block
                                    "
                                />
                                {/* MOBILE GRADIENT */}
                                <div
                                    className="
                                        absolute
                                        inset-0
                                        bg-gradient-to-t
                                        from-black/95
                                        via-black/45
                                        to-black/10
                                        md:hidden
                                    "
                                />
                                {/* CONTENT */}
                                {slide.type ===
                                    "hero" ? (
                                    <MainHeroContent />
                                ) : (
                                    <OfferContent
                                        slide={
                                            slide
                                        }
                                    />
                                )}
                            </div>
                        );
                    }
                )}
                {/* =============================================
                    PREVIOUS BUTTON
                ============================================= */}
                {slides.length > 1 && (
                    <button
                        type="button"
                        aria-label="Previous slide"
                        onClick={
                            previousSlide
                        }
                        className="
                            absolute
                            left-3
                            top-1/2
                            z-30
                            hidden
                            h-11
                            w-11
                            -translate-y-1/2
                            items-center
                            justify-center
                            bg-black/40
                            text-white
                            backdrop-blur-sm
                            transition
                            hover:border-[var(--brand-gold)]
                            hover:text-[var(--brand-gold)]
                            sm:flex
                            lg:left-5
                        "
                    >
                        <FiArrowLeft
                            size={20}
                        />
                    </button>
                )}
                {/* =============================================
                    NEXT BUTTON
                ============================================= */}
                {slides.length > 1 && (
                    <button
                        type="button"
                        aria-label="Next slide"
                        onClick={
                            nextSlide
                        }
                        className="
                            absolute
                            right-3
                            top-1/2
                            z-30
                            hidden
                            h-11
                            w-11
                            -translate-y-1/2
                            items-center
                            justify-center
                            bg-black/40
                            text-white
                            backdrop-blur-sm
                            transition
                            hover:border-[var(--brand-gold)]
                            hover:text-[var(--brand-gold)]
                            sm:flex
                            lg:right-5
                        "
                    >
                        <FiArrowRight
                            size={20}
                        />
                    </button>
                )}
                {/* =============================================
                    PAGINATION
                ============================================= */}
                {slides.length > 1 && (
                    <div
                        className="
                            absolute
                            bottom-5
                            left-1/2
                            z-30
                            flex
                            -translate-x-1/2
                            items-center
                            gap-2
                        "
                    >
                        {slides.map(
                            (slide, index) => (
                                <button
                                    key={
                                        slide.id
                                    }
                                    type="button"
                                    aria-label={`Go to slide ${index + 1
                                        }`}
                                    onClick={() =>
                                        setCurrentSlide(
                                            index
                                        )
                                    }
                                    className={`
                                        h-[5px]
                                        rounded-full
                                        transition-all
                                        duration-300
                                        ${currentSlide ===
                                            index
                                            ? "w-8 bg-[var(--brand-gold)]"
                                            : "w-4 bg-white/35 hover:bg-white/60"
                                        }
                                    `}
                                />
                            )
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}