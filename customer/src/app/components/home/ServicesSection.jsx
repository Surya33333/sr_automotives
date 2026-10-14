import Link from "next/link";
import {
    FaGear,
    FaWrench,
    FaShieldHalved,
    FaHeadset,
} from "react-icons/fa6";
const services = [
    {
        id: 1,
        title: "Installation & Fitting",
        description: "Professional fitting services",
        icon: FaGear,
    },
    {
        id: 2,
        title: "Car Customization",
        description: "Personalize your ride",
        icon: FaWrench,
    },
    {
        id: 3,
        title: "Maintenance Support",
        description: "Keep your car in top shape",
        icon: FaShieldHalved,
    },
    {
        id: 4,
        title: "Expert Guidance",
        description: "Get advice from our experts",
        icon: FaHeadset,
    },
];
export default function ServicesSection() {
    return (
        <section className="w-full bg-[var(--brand-cream)] pb-10 sm:pb-12 lg:pb-14">
            <div className="section-container">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                        Our Services
                    </h2>
                    <Link
                        href="/services"
                        className="
                            group flex items-center gap-2
                            text-xs font-semibold
                            text-[var(--text-primary)]
                            transition-colors
                            hover:text-[var(--brand-gold-dark)]
                            sm:text-sm
                        "
                    >
                        View All
                        <span
                            className="
                                text-lg text-[var(--brand-gold-dark)]
                                transition-transform duration-300
                                group-hover:translate-x-1
                            "
                        >
                            →
                        </span>
                    </Link>
                </div>
                {/* Services */}
                <div
                    className="
                        grid grid-cols-1 gap-3
                        sm:grid-cols-2
                        lg:grid-cols-4
                        lg:gap-4
                    "
                >
                    {services.map((service) => {
                        const Icon = service.icon;
                        return (
                            <Link
                                key={service.id}
                                href="/services"
                                className="
                                    group
                                    flex min-h-[82px] items-center
                                    rounded-xl
                                    border border-[var(--border)]
                                    bg-white
                                    px-4 py-3
                                    transition-all duration-300
                                    hover:border-[var(--brand-gold)]
                                    hover:shadow-[0_8px_24px_rgba(8,9,9,0.06)]
                                "
                            >
                                {/* Icon */}
                                <div
                                    className="
                                        mr-4
                                        flex h-12 w-12 shrink-0
                                        items-center justify-center
                                        rounded-full
                                        bg-[var(--brand-gold)]
                                        transition-transform duration-300
                                        group-hover:scale-105
                                        sm:h-14 sm:w-14
                                    "
                                >
                                    <Icon
                                        className="
                                            text-xl
                                            text-[var(--brand-black)]
                                            sm:text-2xl
                                        "
                                    />
                                </div>
                                {/* Text */}
                                <div className="min-w-0">
                                    <h3
                                        className="
                                            text-sm font-bold
                                            leading-snug
                                            text-[var(--text-primary)]
                                            sm:text-[15px]
                                        "
                                    >
                                        {service.title}
                                    </h3>
                                    <p
                                        className="
                                            mt-1
                                            text-[11px]
                                            leading-relaxed
                                            text-[var(--text-secondary)]
                                            sm:text-xs
                                        "
                                    >
                                        {service.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}