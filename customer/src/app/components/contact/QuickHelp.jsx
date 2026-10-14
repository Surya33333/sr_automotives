import Link from "next/link";
import {
    FiArrowRight,
    FiBox,
    FiShoppingCart,
    FiTool,
} from "react-icons/fi";
const helpItems = [
    {
        icon: FiShoppingCart,
        title: "Products",
        description:
            "Need help choosing the right accessories for your vehicle?",
        link: "/products",
        label: "Explore Products",
    },
    {
        icon: FiTool,
        title: "Services",
        description:
            "Have a question about fitting or our automotive services?",
        link: "/services",
        label: "Explore Services",
    },
    {
        icon: FiBox,
        title: "Orders & Support",
        description:
            "Track your order or get help with an existing purchase.",
        link: "/account/orders",
        label: "Get Support",
    },
];
export default function QuickHelp() {
    return (
        <section
            className="
                bg-[var(--brand-cream)]
                pb-14
                sm:pb-16
                lg:pb-20
            "
        >
            <div className="section-container">
                <p
                    className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.1em]
                        text-[var(--brand-gold-dark)]
                    "
                >
                    Need quick help?
                </p>
                <h2
                    className="
                        mt-2
                        text-2xl
                        font-extrabold
                        tracking-[-0.02em]
                        text-[var(--text-primary)]
                        sm:text-3xl
                    "
                >
                    Find what you&apos;re looking for.
                </h2>
                <div
                    className="
                        mt-6
                        grid
                        gap-3
                        sm:grid-cols-3
                        sm:gap-4
                    "
                >
                    {helpItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.title}
                                href={item.link}
                                className="
                                    group
                                    flex
                                    gap-4
                                    rounded-xl
                                    border
                                    border-[var(--border)]
                                    bg-white
                                    p-5
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:border-[var(--brand-gold)]
                                    hover:shadow-md
                                "
                            >
                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[var(--brand-gold-light)]
                                        text-[var(--brand-black)]
                                    "
                                >
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <h3
                                        className="
                                            text-sm
                                            font-bold
                                            text-[var(--text-primary)]
                                        "
                                    >
                                        {item.title}
                                    </h3>
                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            leading-5
                                            text-[var(--text-secondary)]
                                        "
                                    >
                                        {item.description}
                                    </p>
                                    <span
                                        className="
                                            mt-3
                                            inline-flex
                                            items-center
                                            gap-1
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.06em]
                                            text-[var(--brand-gold-dark)]
                                        "
                                    >
                                        {item.label}
                                        <FiArrowRight
                                            className="
                                                transition-transform
                                                duration-300
                                                group-hover:
                                                translate-x-1
                                            "
                                        />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}