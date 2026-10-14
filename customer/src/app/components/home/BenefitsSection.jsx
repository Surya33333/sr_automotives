import {
    FiTruck,
    FiTag,
    FiPackage,
    FiShield,
} from "react-icons/fi";
const benefits = [
    {
        id: 1,
        title: "Wide Range",
        description: "Thousands of parts and accessories",
        icon: FiTruck,
    },
    {
        id: 2,
        title: "Best Prices",
        description: "High quality, competitive pricing",
        icon: FiTag,
    },
    {
        id: 3,
        title: "Fast Delivery",
        description: "Reliable and quick shipping to your door",
        icon: FiPackage,
    },
    {
        id: 4,
        title: "Secure Payments",
        description: "100% safe and protected transactions",
        icon: FiShield,
    },
];
export default function BenefitsSection() {
    return (
        <section className="w-full bg-white">
            <div className="section-container">
                <div
                    className="
                        grid
                        grid-cols-1
                        py-5
                        xs:grid-cols-2
                        lg:grid-cols-4
                        lg:py-7
                    "
                >
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <div
                                key={benefit.id}
                                className={`
                                    flex
                                    items-center
                                    gap-3
                                    px-2
                                    py-4
                                    sm:gap-4
                                    sm:px-4
                                    lg:px-6
                                    lg:py-2
                                    ${
                                        index % 2 !== 0
                                            ? "xs:border-l xs:border-[var(--border)]"
                                            : ""
                                    }
                                    ${
                                        index !== 0
                                            ? "lg:border-l lg:border-[var(--border)]"
                                            : "lg:border-l-0"
                                    }
                                    ${
                                        index >= 2
                                            ? "xs:border-t xs:border-[var(--border)] lg:border-t-0"
                                            : ""
                                    }
                                `}
                            >
                                {/* Icon */}
                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[var(--brand-gold)]
                                        sm:h-12
                                        sm:w-12
                                        lg:h-14
                                        lg:w-14
                                    "
                                >
                                    <Icon
                                        className="
                                            text-2xl
                                            text-[var(--brand-black)]
                                        "
                                    />
                                </div>
                                {/* Content */}
                                <div className="min-w-0">
                                    <h3
                                        className="
                                            text-sm
                                            font-bold
                                            text-[var(--text-primary)]
                                            sm:text-[15px]
                                            lg:text-base
                                        "
                                    >
                                        {benefit.title}
                                    </h3>
                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            leading-5
                                            text-[var(--text-secondary)]
                                            lg:text-sm
                                        "
                                    >
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}