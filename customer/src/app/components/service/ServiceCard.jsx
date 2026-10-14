import Image from "next/image";
import Link from "next/link";
import {
    FiArrowUpRight,
    FiTool,
} from "react-icons/fi";
function parseServiceMedia(media) {
    if (!media) return [];
    try {
        const parsed =
            typeof media === "string"
                ? JSON.parse(media)
                : media;
        if (Array.isArray(parsed)) {
            return parsed.filter(Boolean);
        }
        if (parsed && Array.isArray(parsed.images)) {
            return parsed.images.filter(Boolean);
        }
        return [];
    } catch (error) {
        console.error("Service media parsing error:", error);
        return [];
    }
}
export default function ServiceCard({
    service,
    index = 0,
}) {
    const serviceImages = parseServiceMedia(service.service_media);
    const serviceImage = serviceImages[0] || null;

    return (
        <article
            className={`
                group
                h-full
                overflow-hidden
                rounded-[14px]
                border
                border-[var(--border)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[var(--brand-gold)]
                hover:shadow-[0_14px_35px_rgba(8,9,9,0.08)]
            `}
        >
            <Link
                href={`/services/${service.service_slug}`}
                className="flex h-full flex-col"
            >
                {/* IMAGE */}
                <div
                    className="
        relative
        aspect-[1.55/1]
        overflow-hidden
        bg-[var(--brand-charcoal)]
    "
                >
                    {serviceImage ? (
                        <Image
                            src={serviceImage}
                            alt={service.service_title}
                            fill
                            unoptimized
                            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#151515]">
                            <FiTool size={36} className="text-[#D8B66F]" />
                        </div>
                    )}
                    {/* Subtle image shade */}
                    <div
                        className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/15
            via-transparent
            to-transparent
        "
                    />
                </div>
                {/* CONTENT */}
                <div
                    className="
                        flex
                        flex-1
                        flex-col
                        p-3
                        sm:p-4
                        lg:p-5
                    "
                >
                    {/* TITLE */}
                    <h2
                        className="
                            line-clamp-2
                            text-[13px]
                            font-bold
                            leading-[1.25]
                            text-[var(--text-primary)]
                            sm:text-sm
                            lg:text-[16px]
                        "
                    >
                        {service.service_title}
                    </h2>
                    {/* DESCRIPTION */}
                    <p
                        className="
                            mt-2
                            line-clamp-3
                            text-[10px]
                            leading-[1.55]
                            text-[var(--text-secondary)]
                            sm:text-[11px]
                            lg:text-xs
                        "
                    >
                        {service.service_description}
                    </p>
                    {/* LEARN MORE */}
                    <div
                        className="
                            mt-auto
                            flex
                            items-center
                            gap-1
                            pt-4
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[var(--brand-gold-dark)]
                            sm:text-[9px]
                        "
                    >
                        Learn More
                        <FiArrowUpRight
                            className="
                                transition-transform
                                duration-300
                                group-hover:
                                translate-x-[2px]
                                group-hover:
                                -translate-y-[2px]
                            "
                        />
                    </div>
                </div>
            </Link>
        </article>
    );
}