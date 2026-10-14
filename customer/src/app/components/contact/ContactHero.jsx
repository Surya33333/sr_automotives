import Image from "next/image";
import {
    FiArrowRight,
    FiPhone,
} from "react-icons/fi";

import {
    contactDetails,
} from "../../data/contactData";

export default function ContactHero() {
    return (
        <section
            className="
                relative
                min-h-screen
                overflow-hidden
                bg-[var(--brand-black)]
                text-white
            "
        >
            {/* =========================
                FULL SCREEN BACKGROUND
            ========================= */}

            <Image
                src="/contacthero.png"
                alt="SR Automotives customer consultation"
                fill
                priority
                unoptimized
                sizes="100vw"
                className="
                    object-cover
                    object-center
                "
            />

            {/* =========================
                HERO CONTENT
            ========================= */}

            <div
                className="
                    section-container
                    relative
                    z-10
                    flex
                    min-h-screen
                    items-center
                "
            >
                <div
                    className="
                        max-w-[600px]
                        pt-20
                    "
                >
                    {/* LABEL */}

                    <p
                        className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-[var(--brand-gold)]
                        "
                    >
                        Contact SR Automotives
                    </p>

                    {/* TITLE */}

                    <h1
                        className="
                            mt-4
                            max-w-[570px]

                            text-[42px]
                            font-extrabold
                            leading-[0.98]
                            tracking-[-0.04em]

                            text-white

                            sm:text-[52px]
                            lg:text-[64px]
                        "
                    >
                        Let&apos;s talk about

                        <span className="block">
                            your car.
                        </span>
                    </h1>

                    {/* DESCRIPTION */}

                    <p
                        className="
                            mt-6
                            max-w-[510px]

                            text-sm
                            leading-6
                            text-white/80

                            sm:text-[15px]
                            sm:leading-7
                        "
                    >
                        Whether you need accessories,
                        fitting assistance or expert
                        automotive service, our team is
                        here to help.
                    </p>

                    {/* CTA */}

                    <div
                        className="
                            mt-8
                            flex
                            flex-wrap
                            gap-3
                        "
                    >
                        <a
                            href="#contact-form"
                            className="
                                inline-flex
                                h-12
                                items-center
                                justify-center
                                gap-2

                                rounded-full
                                bg-[var(--brand-gold)]

                                px-6

                                text-xs
                                font-bold
                                uppercase
                                tracking-[0.04em]

                                text-[var(--brand-black)]

                                transition-all
                                duration-300

                                hover:bg-[var(--brand-gold-light)]
                            "
                        >
                            Get in Touch

                            <FiArrowRight />
                        </a>

                        <a
                            href={`tel:${contactDetails.phoneLink}`}
                            className="
                                inline-flex
                                h-12
                                items-center
                                justify-center
                                gap-2

                                rounded-full

                                border
                                border-[var(--brand-gold)]

                                px-6

                                text-xs
                                font-bold
                                uppercase
                                tracking-[0.04em]

                                text-white

                                transition-all
                                duration-300

                                hover:bg-[var(--brand-gold)]
                                hover:text-[var(--brand-black)]
                            "
                        >
                            <FiPhone />

                            Call Us
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}