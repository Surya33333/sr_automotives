import Image from "next/image";
import Link from "next/link";
import {
    FiAward,
    FiBox,
    FiHeadphones,
    FiShield,
    FiStar,
    FiTool,
    FiUsers,
} from "react-icons/fi";
import Testimonials from "../components/about/Testimonials";
/* =========================================================
   SEO
========================================================= */
export const metadata = {
    title: "About Us",
    description:
        "Learn about SR Automotives, our passion for premium car accessories, professional automotive services and dependable customer care.",
    alternates: {
        canonical: "/about",
    },
    openGraph: {
        title: "About SR Automotives",
        description:
            "Premium car accessories, professional automotive services and trusted customer care.",
        url: "/about",
        type: "website",
    },
};
/* =========================================================
   DATA
========================================================= */
const highlights = [
    {
        icon: FiStar,
        title: "Quality Products",
    },
    {
        icon: FiShield,
        title: "Trusted Experts",
    },
    {
        icon: FiTool,
        title: "Complete Car Care",
    },
];
const stats = [
    {
        icon: FiUsers,
        value: "8K+",
        label: "Happy Customers",
    },
    {
        icon: FiBox,
        value: "50+",
        label: "Premium Brands",
    },
    {
        icon: FiTool,
        value: "256+",
        label: "Expert Installations",
    },
    {
        icon: FiAward,
        value: "1+",
        label: "Years of Experience",
    },
];
const reasons = [
    {
        icon: FiBox,
        title: "Wide Product Range",
        description:
            "Quality car accessories and automotive products selected for different vehicle needs.",
    },
    {
        icon: FiTool,
        title: "Expert Services",
        description:
            "Professional fitting, installation and automotive care from experienced technicians.",
    },
    {
        icon: FiStar,
        title: "Best Value",
        description:
            "Reliable products and professional services at competitive prices.",
    },
    {
        icon: FiHeadphones,
        title: "Customer Support",
        description:
            "Helpful support before, during and after your purchase or service.",
    },
];
/* =========================================================
   TESTIMONIALS API
========================================================= */
async function getTestimonials() {
    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000/api";
        const response = await fetch(
            `${apiUrl}/customer_reviews`,
            {
                next: {
                    revalidate: 300,
                },
            }
        );
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        return data.reviews || [];
    } catch (error) {
        console.error(
            "Testimonials fetch error:",
            error
        );
        return [];
    }
}
/* =========================================================
   PAGE
========================================================= */
export default async function AboutPage() {
    const testimonials = await getTestimonials();
    return (
        <main className="bg-[var(--brand-cream)]">
            {/* =================================================
                HERO
                Navbar:
                mobile  = 72px
                desktop = 78px
                Navbar + Hero = full viewport
            ================================================= */}
            <section
                className="
        relative
        h-[calc(100svh-72px)]
        min-h-[560px]
        overflow-hidden
        bg-[var(--brand-black)]
        lg:h-[calc(100svh-78px)]
        lg:min-h-[620px]
    "
            >
                <Image
                    src="/aboutus.png"
                    alt=""
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className="
            object-cover
            object-[62%_center]
            sm:object-[65%_center]
            lg:object-center
        "
                />
                <div
                    className="
            absolute inset-0
            bg-gradient-to-r
            from-black/90
            via-black/50
            to-black/10
            lg:via-black/35
            lg:to-transparent
        "
                />
                <div className="section-container relative z-10 flex h-full items-center">
                    <div className="w-full max-w-[680px] lg:max-w-[650px] xl:max-w-[700px]">
                        <h1
                            className="
                    text-[40px]
                    font-extrabold
                    leading-[0.98]
                    tracking-[-0.035em]
                    text-white
                    min-[400px]:text-[46px]
                    sm:text-[54px]
                    md:text-[60px]
                    lg:text-[64px]
                    xl:text-[68px]
                "
                        >
                            ABOUT
                            <span className="mt-2 block text-[var(--brand-gold)]">
                                SR AUTOMOTIVES
                            </span>
                        </h1>
                        <p
                            className="
                    mt-6
                    max-w-[590px]
                    text-[15px]
                    leading-7
                    text-white/80
                    sm:text-base
                    lg:text-[17px]
                "
                        >
                            Your trusted destination for premium car accessories
                            and expert automotive services.
                        </p>
                        <div
                            className="
                    mt-8
                    grid
                    max-w-[650px]
                    grid-cols-1
                    gap-4
                    min-[450px]:grid-cols-3
                    sm:mt-10
                    sm:gap-6
                "
                        >
                            {highlights.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className="flex items-center gap-3"
                                    >
                                        <Icon
                                            size={28}
                                            strokeWidth={1.8}
                                            className="shrink-0 text-[var(--brand-gold)]"
                                        />
                                        <span className="text-[13px] font-semibold leading-5 text-white sm:text-sm">
                                            {item.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
            {/* =================================================
                OUR STORY
            ================================================= */}
            <section className="bg-[var(--brand-cream)] py-14 sm:py-16 lg:py-24">
                {/* Same alignment as navbar */}
                <div className="section-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* =========================================
                        STORY IMAGE
                    ========================================= */}
                    <div
                        className="
                            group
                            relative
                            aspect-[16/11]
                            overflow-hidden
                            rounded-2xl
                            bg-[var(--brand-charcoal)]
                            shadow-[0_20px_50px_rgba(0,0,0,0.10)]
                            sm:aspect-[16/10]
                            lg:aspect-[4/3]
                        "
                    >
                        <Image
                            src="/ourstory.png"
                            alt="SR Automotives professional automotive workshop"
                            fill
                            quality={95}
                            sizes="
                                (max-width: 1024px) 100vw,
                                50vw
                            "
                            className="
                                object-cover
                                object-center
                                transition-transform
                                duration-700
                                ease-out
                                group-hover:scale-[1.025]
                            "
                        />
                        <div
                            className="
                                absolute
                                inset-0
                                bg-gradient-to-t
                                from-black/15
                                via-transparent
                                to-transparent
                            "
                        />
                    </div>
                    {/* =========================================
                        STORY CONTENT
                    ========================================= */}
                    <div>
                        <div
                            className="
                                mb-5
                                flex
                                items-center
                                gap-3
                            "
                        >
                            <span
                                className="
                                    h-[2px]
                                    w-8
                                    bg-[var(--brand-gold-dark)]
                                "
                            />
                            <span
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[var(--brand-gold-dark)]
                                "
                            >
                                Our Story
                            </span>
                        </div>
                        <h2
                            className="
                                text-3xl
                                font-bold
                                leading-[1.15]
                                tracking-tight
                                text-[var(--text-primary)]
                                sm:text-4xl
                                lg:text-[44px]
                            "
                        >
                            Driven by Passion.
                            <span className="mt-1 block">
                                Built on{" "}
                                <span
                                    className="
                                        text-[var(--brand-gold-dark)]
                                    "
                                >
                                    Trust.
                                </span>
                            </span>
                        </h2>
                        <div
                            className="
                                mt-6
                                max-w-xl
                                space-y-4
                                text-sm
                                leading-7
                                text-[var(--text-secondary)]
                                sm:text-base
                            "
                        >
                            <p>
                                SR Automotives was founded with a simple
                                vision — to make quality car accessories
                                and professional automotive services easily
                                accessible to every car owner.
                            </p>
                            <p>
                                From helping customers choose the right
                                accessories to professional fitting and
                                vehicle care, we focus on quality,
                                reliability and a better overall ownership
                                experience.
                            </p>
                        </div>
                        <div
                            className="
                                mt-8
                                h-[3px]
                                w-16
                                rounded-full
                                bg-[var(--brand-gold)]
                            "
                        />
                    </div>
                </div>
            </section>
            {/* =================================================
                STATS
            ================================================= */}
            <section className="bg-[var(--brand-black)]">
                <div className="section-container grid grid-cols-2 py-8 md:grid-cols-4 lg:py-10">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className={`
                                    flex
                                    items-center
                                    gap-3
                                    px-2
                                    py-5
                                    sm:justify-center
                                    sm:gap-4
                                    md:py-2
                                    ${index !== stats.length - 1
                                        ? "md:border-r md:border-white/15"
                                        : ""
                                    }
                                `}
                            >
                                <Icon
                                    size={30}
                                    className="
                                        shrink-0
                                        text-[var(--brand-gold)]
                                        sm:h-9
                                        sm:w-9
                                    "
                                />
                                <div>
                                    <strong
                                        className="
                                            block
                                            text-xl
                                            font-bold
                                            text-[var(--brand-gold)]
                                            sm:text-2xl
                                            lg:text-3xl
                                        "
                                    >
                                        {stat.value}
                                    </strong>
                                    <span
                                        className="
                                            text-[10px]
                                            text-white/65
                                            sm:text-xs
                                            lg:text-sm
                                        "
                                    >
                                        {stat.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
            {/* =================================================
                WHY CHOOSE US
            ================================================= */}
            <section className="border-t border-[var(--border)] bg-white py-14 sm:py-16 lg:py-20">
                <div className="section-container">
                    {/* Heading */}
                    <div
                        className="
                            mx-auto
                            mb-10
                            max-w-2xl
                            text-center
                            sm:mb-12
                        "
                    >
                        <div
                            className="
                                mb-3
                                flex
                                items-center
                                justify-center
                                gap-3
                            "
                        >
                            <span
                                className="
                                    h-[2px]
                                    w-8
                                    bg-[var(--brand-gold-dark)]
                                "
                            />
                            <span
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[var(--brand-gold-dark)]
                                "
                            >
                                Why Choose Us?
                            </span>
                            <span
                                className="
                                    h-[2px]
                                    w-8
                                    bg-[var(--brand-gold-dark)]
                                "
                            />
                        </div>
                        <h2
                            className="
                                text-3xl
                                font-bold
                                tracking-tight
                                text-[var(--text-primary)]
                                sm:text-4xl
                            "
                        >
                            More Than{" "}
                            <span
                                className="
                                    text-[var(--brand-gold-dark)]
                                "
                            >
                                Just a Store
                            </span>
                        </h2>
                        <p
                            className="
                                mt-3
                                text-sm
                                leading-6
                                text-[var(--text-secondary)]
                                sm:text-base
                            "
                        >
                            Products, professional services and support
                            designed around your vehicle.
                        </p>
                    </div>
                    {/* Cards */}
                    <div
                        className="
                            grid
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >
                        {reasons.map((reason) => {
                            const Icon = reason.icon;
                            return (
                                <article
                                    key={reason.title}
                                    className="
                                        group
                                        rounded-xl
                                        border
                                        border-[var(--border)]
                                        bg-[var(--brand-cream)]
                                        p-5
                                        transition-all
                                        duration-300
                                        hover:-translate-y-1
                                        hover:border-[var(--brand-gold)]
                                        hover:shadow-lg
                                        sm:p-6
                                    "
                                >
                                    <div
                                        className="
                                            mb-5
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[var(--brand-gold-light)]
                                            text-[var(--brand-gold-dark)]
                                        "
                                    >
                                        <Icon size={23} />
                                    </div>
                                    <h3
                                        className="
                                            text-base
                                            font-bold
                                            text-[var(--text-primary)]
                                        "
                                    >
                                        {reason.title}
                                    </h3>
                                    <p
                                        className="
                                            mt-2
                                            text-sm
                                            leading-6
                                            text-[var(--text-secondary)]
                                        "
                                    >
                                        {reason.description}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>
            {/* =================================================
                TESTIMONIALS
            ================================================= */}
            {testimonials.length > 0 && (
                <Testimonials
                    testimonials={testimonials}
                />
            )}
        </main>
    );
}