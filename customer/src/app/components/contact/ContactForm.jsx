"use client";
import {
    useState,
} from "react";
import {
    FiArrowRight,
} from "react-icons/fi";
const initialForm = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
};
export default function ContactForm() {
    const [form, setForm] =
        useState(initialForm);
    const [submitted, setSubmitted] =
        useState(false);
    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
        setSubmitted(false);
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(
            "Contact enquiry:",
            form
        );
        setSubmitted(true);
        /*
            Later:
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/contact`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );
        */
    };
    const inputClass = `
        h-12
        w-full
        rounded-md
        border
        border-[var(--border)]
        bg-white
        px-4
        text-sm
        text-[var(--text-primary)]
        outline-none
        transition-colors
        placeholder:text-[var(--text-secondary)]/60
        focus:border-[var(--brand-gold)]
    `;
    return (
        <form
            id="contact-form"
            onSubmit={handleSubmit}
            className="
                scroll-mt-28
                rounded-2xl
                border
                border-[var(--border)]
                bg-white
                p-5
                shadow-[0_16px_45px_rgba(8,9,9,0.06)]
                sm:p-7
                lg:p-8
            "
        >
            <div>
                <h2
                    className="
                        text-2xl
                        font-extrabold
                        tracking-[-0.02em]
                        text-[var(--text-primary)]
                    "
                >
                    Send us a message
                </h2>
                <p
                    className="
                        mt-2
                        text-sm
                        text-[var(--text-secondary)]
                    "
                >
                    Share a few details and our
                    team will get back to you
                    shortly.
                </p>
            </div>
            <div
                className="
                    mt-6
                    grid
                    gap-4
                    sm:grid-cols-2
                "
            >
                {/* NAME */}
                <div>
                    <label
                        htmlFor="contact-name"
                        className="
                            mb-2
                            block
                            text-[10px]
                            font-bold
                            uppercase
                            text-[var(--text-primary)]
                        "
                    >
                        Name *
                    </label>
                    <input
                        id="contact-name"
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={inputClass}
                    />
                </div>
                {/* EMAIL */}
                <div>
                    <label
                        htmlFor="contact-email"
                        className="
                            mb-2
                            block
                            text-[10px]
                            font-bold
                            uppercase
                            text-[var(--text-primary)]
                        "
                    >
                        Email *
                    </label>
                    <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={inputClass}
                    />
                </div>
                {/* PHONE */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="contact-phone"
                        className="
                            mb-2
                            block
                            text-[10px]
                            font-bold
                            uppercase
                            text-[var(--text-primary)]
                        "
                    >
                        Phone
                    </label>
                    <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                        className={inputClass}
                    />
                </div>
                {/* SUBJECT */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="contact-subject"
                        className="
                            mb-2
                            block
                            text-[10px]
                            font-bold
                            uppercase
                            text-[var(--text-primary)]
                        "
                    >
                        Subject
                    </label>
                    <select
                        id="contact-subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        <option value="">
                            Select a subject
                        </option>
                        <option value="product">
                            Product Enquiry
                        </option>
                        <option value="service">
                            Service Enquiry
                        </option>
                        <option value="order">
                            Order Support
                        </option>
                        <option value="fitting">
                            Fitting Assistance
                        </option>
                        <option value="general">
                            General Enquiry
                        </option>
                    </select>
                </div>
                {/* MESSAGE */}
                <div className="sm:col-span-2">
                    <div
                        className="
                            mb-2
                            flex
                            items-center
                            justify-between
                        "
                    >
                        <label
                            htmlFor="contact-message"
                            className="
                                text-[10px]
                                font-bold
                                uppercase
                                text-[var(--text-primary)]
                            "
                        >
                            Message *
                        </label>
                        <span
                            className="
                                text-[9px]
                                text-[var(--text-secondary)]
                            "
                        >
                            {form.message.length}/500
                        </span>
                    </div>
                    <textarea
                        id="contact-message"
                        name="message"
                        required
                        maxLength={500}
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="
                            w-full
                            resize-none
                            rounded-md
                            border
                            border-[var(--border)]
                            bg-white
                            p-4
                            text-sm
                            outline-none
                            transition-colors
                            placeholder:text-[var(--text-secondary)]/60
                            focus:border-[var(--brand-gold)]
                        "
                    />
                </div>
            </div>
            <button
                type="submit"
                className="
                    mt-5
                    flex
                    h-12
                    w-full
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-md
                    bg-[var(--brand-gold)]
                    text-xs
                    font-extrabold
                    uppercase
                    tracking-[0.04em]
                    text-[var(--brand-black)]
                    transition-all
                    duration-300
                    hover:bg-[var(--brand-gold-dark)]
                "
            >
                Send Message
                <FiArrowRight />
            </button>
            {submitted && (
                <p
                    className="
                        mt-3
                        text-center
                        text-xs
                        font-medium
                        text-[var(--brand-gold-dark)]
                    "
                >
                    Form validated successfully.
                    API submission will be connected
                    next.
                </p>
            )}
        </form>
    );
}