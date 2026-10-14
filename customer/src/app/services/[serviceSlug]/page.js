"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    FiChevronLeft,
    FiChevronRight,
    FiArrowUpRight,
    FiTool,
    FiCheckCircle,
    FiCalendar,
    FiAlertCircle,
} from "react-icons/fi";
const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
// FORMAT PRICE
const formatPrice = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
};
// PARSE SERVICE MEDIA
const parseServiceMedia = (media) => {
    if (!media) return { images: [], video: null };
    try {
        const parsed =
            typeof media === "string"
                ? JSON.parse(media)
                : media;
        if (Array.isArray(parsed)) {
            return {
                images: parsed.filter(Boolean),
                video: null,
            };
        }
        return {
            images: Array.isArray(parsed?.images)
                ? parsed.images.filter(
                      (url) => typeof url === "string" && url.trim()
                  )
                : [],
            video:
                typeof parsed?.video === "string" && parsed.video.trim()
                    ? parsed.video
                    : null,
        };
    } catch {
        return { images: [], video: null };
    }
};
// CALCULATE DISCOUNT
const getDiscount = (service) => {
    const mrp = Number(service?.service_price) || 0;
    const sellingPrice = Number(service?.service_selling_price) || 0;
    if (!mrp || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
};
export default function ServiceDetailsPage() {
    const params = useParams();
    const serviceSlug = params?.serviceSlug;
    const [service, setService] = useState(null);
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeImage, setActiveImage] = useState(0);
    const touchStartX = useRef(null);
    // FETCH SERVICE DETAILS
    useEffect(() => {
        if (!serviceSlug) return;
        let cancelled = false;
        const fetchService = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch(`${API_URL}/services`);
                if (!response.ok) {
                    throw new Error("Failed to fetch services");
                }
                const data = await response.json();
                const services = Array.isArray(data.services)
                    ? data.services
                    : [];
                const selectedService = services.find(
                    (item) =>
                        item.service_slug?.toLowerCase() ===
                        String(serviceSlug).toLowerCase()
                );
                if (cancelled) return;
                setService(selectedService || null);
                setAllServices(services);
                setActiveImage(0);
                if (!selectedService) {
                    setError("Service not found.");
                }
            } catch (err) {
                if (cancelled) return;
                console.error("Service details error:", err);
                setError("Unable to load service details.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchService();
        return () => {
            cancelled = true;
        };
    }, [serviceSlug]);
    const media = useMemo(
        () => parseServiceMedia(service?.service_media),
        [service]
    );
    const images = media.images;
    const relatedServices = useMemo(() => {
        if (!service) return [];
        return allServices
            .filter((item) => item.service_id !== service.service_id)
            .slice(0, 4);
    }, [allServices, service]);
    const mrp = Number(service?.service_price) || 0;
    const sellingPrice = Number(service?.service_selling_price) || 0;
    const discount = getDiscount(service);
    // AUTO SLIDE
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setActiveImage((current) => (current + 1) % images.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [images.length]);
    const nextImage = () => {
        if (images.length <= 1) return;
        setActiveImage((current) => (current + 1) % images.length);
    };
    const previousImage = () => {
        if (images.length <= 1) return;
        setActiveImage(
            (current) => (current - 1 + images.length) % images.length
        );
    };
    const handleTouchStart = (event) => {
        touchStartX.current = event.touches[0].clientX;
    };
    const handleTouchEnd = (event) => {
        if (touchStartX.current === null) return;
        const distance =
            event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(distance) > 50) {
            if (distance < 0) {
                nextImage();
            } else {
                previousImage();
            }
        }
        touchStartX.current = null;
    };
    if (loading) {
        return (
            <main className="min-h-screen bg-[#F8F6F1] pt-28">
                <div className="section-container py-12">
                    <div className="grid gap-10 lg:grid-cols-2">
                        <div className="aspect-[5/4] animate-pulse rounded-xl bg-[#E5DED1]" />
                        <div className="space-y-5">
                            <div className="h-12 w-3/4 animate-pulse rounded bg-[#E5DED1]" />
                            <div className="h-8 w-1/3 animate-pulse rounded bg-[#E5DED1]" />
                            <div className="h-24 animate-pulse rounded bg-[#E5DED1]" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }
    if (error || !service) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8F6F1] px-5 pt-28">
                <div className="text-center">
                    <FiAlertCircle
                        size={42}
                        className="mx-auto mb-5 text-[#B89655]"
                    />
                    <h1 className="text-2xl font-bold">
                        Service Not Available
                    </h1>
                    <p className="mt-3 text-sm text-[#6F6B64]">
                        {error || "The requested service could not be found."}
                    </p>
                    <Link
                        href="/services"
                        className="mt-7 inline-block rounded-md bg-[#D8B66F] px-7 py-3 text-sm font-bold"
                    >
                        Browse Services
                    </Link>
                </div>
            </main>
        );
    }
    return (
        <main className="min-h-screen bg-[#F8F6F1] pt-24 text-[#111111] lg:pt-28">
            <div className="section-container pb-16 pt-6 lg:pb-24">
                {/* BREADCRUMBS */}
                <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#6F6B64]">
                    <Link href="/" className="hover:text-[#B89655]">
                        Home
                    </Link>
                    <FiChevronRight size={12} />
                    <Link
                        href="/services"
                        className="hover:text-[#B89655]"
                    >
                        Services
                    </Link>
                    <FiChevronRight size={12} />
                    <span className="font-semibold text-[#111111]">
                        {service.service_title}
                    </span>
                </nav>
                {/* MAIN SERVICE SECTION */}
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[42%_minmax(0,1fr)] lg:gap-10 xl:gap-14">
                    {/* IMAGE GALLERY */}
                    <div className="min-w-0">
                        <div
                            className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#E5DED1] bg-white shadow-sm lg:aspect-[5/4]"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            {images.length > 0 ? (
                                <div
                                    className="flex h-full transition-transform duration-700 ease-in-out"
                                    style={{
                                        transform: `translateX(-${activeImage * 100}%)`,
                                    }}
                                >
                                    {images.map((src, index) => (
                                        <div
                                            key={`${src}-${index}`}
                                            className="relative h-full min-w-full"
                                        >
                                            <Image
                                                src={src}
                                                alt={`${service.service_title} - Image ${index + 1}`}
                                                fill
                                                unoptimized
                                                priority={index === 0}
                                                sizes="(max-width: 1024px) 100vw, 42vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#151515]">
                                    <FiTool
                                        size={45}
                                        className="text-[#D8B66F]"
                                    />
                                    <p className="text-sm text-white/70">
                                        Image not available
                                    </p>
                                </div>
                            )}
                            {discount > 0 && (
                                <span className="absolute left-4 top-4 z-10 rounded bg-[#D8B66F] px-3 py-1.5 text-xs font-bold">
                                    {discount}% OFF
                                </span>
                            )}
                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={previousImage}
                                        aria-label="Previous image"
                                        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5DED1] bg-white/90 shadow-sm transition hover:bg-[#D8B66F]"
                                    >
                                        <FiChevronLeft size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextImage}
                                        aria-label="Next image"
                                        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5DED1] bg-white/90 shadow-sm transition hover:bg-[#D8B66F]"
                                    >
                                        <FiChevronRight size={20} />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setActiveImage(index)}
                                                aria-label={`View image ${index + 1}`}
                                                className={`h-2.5 w-2.5 rounded-full ${
                                                    activeImage === index
                                                        ? "bg-[#B89655]"
                                                        : "bg-white/70"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        {/* THUMBNAILS */}
                        {images.length > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                {images.map((src, index) => (
                                    <button
                                        key={`${src}-thumb-${index}`}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white sm:h-24 sm:w-24 ${
                                            activeImage === index
                                                ? "border-[#D8B66F]"
                                                : "border-[#E5DED1]"
                                        }`}
                                    >
                                        <Image
                                            src={src}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            unoptimized
                                            sizes="96px"
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* SERVICE DETAILS */}
                    <div className="min-w-0">
                        <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#B89655]">
                            <FiTool size={15} />
                            SR Automotives Services
                        </span>
                        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight sm:text-[38px] lg:text-[44px]">
                            {service.service_title}
                        </h1>
                        {/* PRICE */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <span className="text-3xl font-extrabold text-[#B89655] sm:text-4xl">
                                {formatPrice(sellingPrice)}
                            </span>
                            {mrp > sellingPrice && (
                                <>
                                    <span className="text-lg text-[#9A958C] line-through">
                                        {formatPrice(mrp)}
                                    </span>
                                    <span className="rounded-md bg-[#F0DCA9] px-3 py-1.5 text-xs font-bold">
                                        {discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                        {/* DESCRIPTION */}
                        <p className="mt-6 text-sm leading-7 text-[#55514B] sm:text-base">
                            {service.service_description ||
                                "Professional automotive care by SR Automotives."}
                        </p>
                        {/* BOOKING CTA */}
                        <div className="mt-8 border-t border-[#E5DED1] pt-7">
                            <Link
                                href={`/contact?service=${encodeURIComponent(
                                    service.service_slug
                                )}`}
                                className="flex w-full items-center justify-center gap-3 rounded-md bg-[#D8B66F] px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-[#080909] transition-colors hover:bg-[#B89655]"
                            >
                                <FiCalendar size={19} />
                                Enquire About This Service
                            </Link>
                            <p className="mt-3 text-xs leading-5 text-[#6F6B64]">
                                Contact SR Automotives for availability,
                                scheduling, and service details.
                            </p>
                        </div>
                        {/* SERVICE KEYWORDS */}
                        {Array.isArray(service.service_keywords) &&
                            service.service_keywords.length > 0 && (
                                <div className="mt-8 border-t border-[#E5DED1] pt-6">
                                    <h3 className="mb-3 text-sm font-bold">
                                        Service Highlights
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {service.service_keywords.map(
                                            (keyword, index) => (
                                                <span
                                                    key={`${keyword}-${index}`}
                                                    className="inline-flex items-center gap-2 rounded-full border border-[#E5DED1] bg-white px-3 py-2 text-xs text-[#55514B]"
                                                >
                                                    <FiCheckCircle
                                                        size={13}
                                                        className="text-[#B89655]"
                                                    />
                                                    {keyword}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
                {/* SERVICE DESCRIPTION */}
                <section className="mt-14 lg:mt-20">
                    <div className="border-b border-[#E5DED1]">
                        <h2 className="inline-block border-b-2 border-[#D8B66F] px-4 py-4 text-sm font-bold">
                            Service Description
                        </h2>
                    </div>
                    <div className="rounded-b-xl border border-t-0 border-[#E5DED1] bg-white p-5 sm:p-7">
                        <h3 className="mb-4 text-lg font-bold">
                            About {service.service_title}
                        </h3>
                        <p className="whitespace-pre-line text-sm leading-8 text-[#55514B]">
                            {service.service_description ||
                                "Contact us to learn more about this service."}
                        </p>
                    </div>
                </section>
                {/* RELATED SERVICES GRID */}
                {relatedServices.length > 0 && (
                    <section className="mt-14 lg:mt-20">
                        <div className="mb-7 flex items-center justify-between gap-4">
                            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Other Services
                            </h2>
                            <Link
                                href="/services"
                                className="shrink-0 text-sm font-semibold text-[#6F6B64] hover:text-[#B89655]"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                            {relatedServices.map((item) => {
                                const itemMedia = parseServiceMedia(
                                    item.service_media
                                );
                                const itemImage = itemMedia.images[0] || null;
                                return (
                                    <Link
                                        key={item.service_id}
                                        href={`/services/${item.service_slug}`}
                                        className="group overflow-hidden rounded-xl border border-[#E5DED1] bg-white transition-all hover:-translate-y-1 hover:border-[#D8B66F] hover:shadow-lg"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-[#151515]">
                                            {itemImage ? (
                                                <Image
                                                    src={itemImage}
                                                    alt={item.service_title}
                                                    fill
                                                    unoptimized
                                                    sizes="(max-width: 640px) 50vw, 25vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <FiTool
                                                        size={30}
                                                        className="text-[#D8B66F]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 sm:p-4">
                                            <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold">
                                                {item.service_title}
                                            </h3>
                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#6F6B64]">
                                                {item.service_description}
                                            </p>
                                            <p className="mt-3 text-base font-extrabold text-[#B89655]">
                                                {formatPrice(
                                                    item.service_selling_price
                                                )}
                                            </p>
                                            <div className="mt-4 flex items-center gap-1 text-xs font-bold uppercase text-[#B89655]">
                                                View Service
                                                <FiArrowUpRight
                                                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
