"use client";
import {
    useState,
} from "react";
import {
    FiMinus,
    FiPlus,
} from "react-icons/fi";
import {
    contactFAQs,
} from "../../data/contactData";
export default function ContactFAQ() {
    const [openIndex, setOpenIndex] =
        useState(null);
    const toggleFAQ = (index) => {
        setOpenIndex((current) =>
            current === index
                ? null
                : index
        );
    };
    return (
        <section
            className="
                bg-[var(--brand-black)]
                py-14
                text-white
                sm:py-16
                lg:py-20
            "
        >
            <div className="section-container">
                <div
                    className="
                        grid
                        gap-10
                        lg:grid-cols-[0.65fr_1.35fr]
                        lg:gap-16
                    "
                >
                    {/* LEFT */}
                    <div>
                        <p
                            className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.1em]
                                text-[var(--brand-gold)]
                            "
                        >
                            Good to know
                        </p>
                        <h2
                            className="
                                mt-3
                                max-w-[360px]
                                text-[34px]
                                font-extrabold
                                leading-[1.02]
                                tracking-[-0.03em]
                                sm:text-[40px]
                                lg:text-[44px]
                            "
                        >
                            Answers before
                            <span className="block">
                                you ask.
                            </span>
                        </h2>
                        <p
                            className="
                                mt-5
                                max-w-[340px]
                                text-sm
                                leading-6
                                text-white/55
                            "
                        >
                            Quick answers to common
                            questions before contacting
                            our team.
                        </p>
                    </div>
                    {/* FAQ */}
                    <div
                        className="
                            border-t
                            border-[var(--brand-gold)]/40
                        "
                    >
                        {contactFAQs.map(
                            (faq, index) => {
                                const isOpen =
                                    openIndex === index;
                                return (
                                    <div
                                        key={faq.question}
                                        className="
                                            border-b
                                            border-[var(--brand-gold)]/30
                                        "
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleFAQ(
                                                    index
                                                )
                                            }
                                            aria-expanded={
                                                isOpen
                                            }
                                            className="
                                                flex
                                                w-full
                                                cursor-pointer
                                                items-center
                                                gap-4
                                                py-5
                                                text-left
                                            "
                                        >
                                            <span
                                                className="
                                                    shrink-0
                                                    text-[10px]
                                                    font-bold
                                                    text-[var(--brand-gold)]
                                                "
                                            >
                                                {String(
                                                    index +
                                                        1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </span>
                                            <span
                                                className="
                                                    flex-1
                                                    text-sm
                                                    font-medium
                                                    text-white
                                                "
                                            >
                                                {
                                                    faq.question
                                                }
                                            </span>
                                            <span
                                                className="
                                                    text-[var(--brand-gold)]
                                                "
                                            >
                                                {isOpen ? (
                                                    <FiMinus />
                                                ) : (
                                                    <FiPlus />
                                                )}
                                            </span>
                                        </button>
                                        {/* ANSWER */}
                                        <div
                                            className={`
                                                grid
                                                transition-all
                                                duration-300
                                                ease-out
                                                ${
                                                    isOpen
                                                        ? "grid-rows-[1fr] opacity-100"
                                                        : "grid-rows-[0fr] opacity-0"
                                                }
                                            `}
                                        >
                                            <div className="overflow-hidden">
                                                <p
                                                    className="
                                                        pb-5
                                                        pl-8
                                                        pr-8
                                                        text-sm
                                                        leading-6
                                                        text-white/60
                                                    "
                                                >
                                                    {
                                                        faq.answer
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}