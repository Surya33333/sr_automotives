"use client";
import { useEffect, useState } from "react";
import {
    FiChevronLeft,
    FiChevronRight,
    FiStar,
} from "react-icons/fi";
export default function Testimonials({ testimonials = [] }) {
    const [current, setCurrent] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    useEffect(() => {
        const updateItemsPerPage = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3);
            }
        };
        updateItemsPerPage();
        window.addEventListener("resize", updateItemsPerPage);
        return () => {
            window.removeEventListener(
                "resize",
                updateItemsPerPage
            );
        };
    }, []);
    useEffect(() => {
        setCurrent(0);
    }, [itemsPerPage]);
    if (!testimonials.length) {
        return null;
    }
    const maxIndex = Math.max(
        0,
        testimonials.length - itemsPerPage
    );
    const previous = () => {
        setCurrent((prev) =>
            prev <= 0 ? maxIndex : prev - 1
        );
    };
    const next = () => {
        setCurrent((prev) =>
            prev >= maxIndex ? 0 : prev + 1
        );
    };
    return (
        <section
            aria-labelledby="testimonials-heading"
            className="bg-[var(--brand-cream)] py-12 sm:py-16 lg:py-20"
        >
            <div className="section-container">
                {/* Heading */}
                <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
                    <div className="mb-3 flex items-center justify-center gap-3">
                        <span className="h-[2px] w-8 bg-[var(--brand-gold-dark)]" />
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-gold-dark)]">
                            Customer Testimonials
                        </span>
                        <span className="h-[2px] w-8 bg-[var(--brand-gold-dark)]" />
                    </div>
                    <h2
                        id="testimonials-heading"
                        className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl"
                    >
                        What Our Customers Say
                    </h2>
                    <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
                        Experiences shared by customers who chose
                        SR Automotives.
                    </p>
                </div>
                <div className="relative">
                    {/* Cards */}
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{
                                transform: `translateX(-${
                                    current * (100 / itemsPerPage)
                                }%)`,
                            }}
                        >
                            {testimonials.map((review) => (
                                <div
                                    key={review.review_id}
                                    className={`
                                        shrink-0 px-2
                                        ${
                                            itemsPerPage === 1
                                                ? "w-full"
                                                : itemsPerPage === 2
                                                  ? "w-1/2"
                                                  : "w-1/3"
                                        }
                                    `}
                                >
                                    <article className="flex h-full min-h-[210px] flex-col rounded-xl border border-[var(--border)] bg-white p-6 transition-all duration-300 hover:border-[var(--brand-gold)] hover:shadow-md sm:p-7">
                                        <span className="mb-3 text-4xl font-bold leading-none text-[var(--brand-gold)]">
                                            “
                                        </span>
                                        <p className="flex-1 text-sm leading-6 text-[var(--text-primary)]">
                                            {review.review_text}
                                        </p>
                                        {/* Rating */}
                                        <div
                                            className="mt-5 flex gap-1"
                                            aria-label={`${review.rating} out of 5 stars`}
                                        >
                                            {Array.from({
                                                length: 5,
                                            }).map((_, index) => (
                                                <FiStar
                                                    key={index}
                                                    size={15}
                                                    className={
                                                        index <
                                                        Number(
                                                            review.rating
                                                        )
                                                            ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]"
                                                            : "text-[var(--border)]"
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                                            {review.customer_name}
                                        </p>
                                        {review.product_name && (
                                            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                                Purchased{" "}
                                                {review.product_name}
                                            </p>
                                        )}
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Controls */}
                    {testimonials.length > itemsPerPage && (
                        <>
                            <button
                                type="button"
                                onClick={previous}
                                aria-label="Previous testimonial"
                                className="
                                    absolute left-0 top-1/2
                                    flex h-10 w-10
                                    -translate-x-2 -translate-y-1/2
                                    items-center justify-center
                                    rounded-full
                                    bg-[var(--brand-gold)]
                                    text-[var(--brand-black)]
                                    shadow-md
                                    transition-transform
                                    hover:scale-105
                                    sm:-translate-x-5
                                "
                            >
                                <FiChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={next}
                                aria-label="Next testimonial"
                                className="
                                    absolute right-0 top-1/2
                                    flex h-10 w-10
                                    translate-x-2 -translate-y-1/2
                                    items-center justify-center
                                    rounded-full
                                    bg-[var(--brand-gold)]
                                    text-[var(--brand-black)]
                                    shadow-md
                                    transition-transform
                                    hover:scale-105
                                    sm:translate-x-5
                                "
                            >
                                <FiChevronRight size={20} />
                            </button>
                        </>
                    )}
                </div>
                {/* Indicators */}
                {testimonials.length > itemsPerPage && (
                    <div className="mt-7 flex justify-center gap-2">
                        {Array.from({
                            length: maxIndex + 1,
                        }).map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                aria-label={`Show testimonials ${
                                    index + 1
                                }`}
                                onClick={() => setCurrent(index)}
                                className={`
                                    h-2 rounded-full
                                    transition-all duration-300
                                    ${
                                        current === index
                                            ? "w-6 bg-[var(--brand-gold-dark)]"
                                            : "w-2 bg-[var(--border)]"
                                    }
                                `}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}