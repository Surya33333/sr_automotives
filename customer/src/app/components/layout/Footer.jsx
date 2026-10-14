import Link from "next/link";
import {
    FaInstagram,
    FaFacebookF,
    FaYoutube,
    FaWhatsapp,
} from "react-icons/fa";
import {
    FiMapPin,
    FiPhone,
    FiMail,
} from "react-icons/fi";
import Image from "next/image";
export default function Footer() {
    return (
        <footer className="w-full bg-[var(--brand-black)]">
            {/* MAIN FOOTER */}
            <div className="section-container lg:py-12">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8 sm:pt-10">
                    <div className="sm:col-span-2 lg:col-span-2 place-items-start">
                        <div className="flex items-center ">
                            <div>
                                <h2 className="whitespace-nowrap text-base font-bold tracking-wide text-[var(--brand-gold)]">
                                    SR AUTOMOTIVES
                                </h2>
                                <p className="mt-4 max-w-xs text-sm leading-6 text-gray-400">
                                    Your trusted partner for premium car accessories
                                    and expert automotive services.
                                </p>
                                <div className="flex gap-4 py-4">
                                    <a
                                        href="#"
                                        aria-label="Instagram"
                                        className="text-lg text-[var(--brand-gold)] transition hover:text-white"
                                    >
                                        <FaInstagram />
                                    </a>
                                    <a
                                        href="#"
                                        aria-label="Facebook"
                                        className="text-lg text-[var(--brand-gold)] transition hover:text-white"
                                    >
                                        <FaFacebookF />
                                    </a>
                                    <a
                                        href="#"
                                        aria-label="YouTube"
                                        className="text-lg text-[var(--brand-gold)] transition hover:text-white"
                                    >
                                        <FaYoutube />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* QUICK LINKS */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white">
                            Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link href="/" className="transition hover:text-[var(--brand-gold)]">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="transition hover:text-[var(--brand-gold)]">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="transition hover:text-[var(--brand-gold)]">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="transition hover:text-[var(--brand-gold)]">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/offers" className="transition hover:text-[var(--brand-gold)]">
                                    Offers
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="transition hover:text-[var(--brand-gold)]">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                    {/* CUSTOMER SUPPORT */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white">
                            Customer Support
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link href="/account" className="transition hover:text-[var(--brand-gold)]">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/orders" className="transition hover:text-[var(--brand-gold)]">
                                    My Orders
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping-policy" className="transition hover:text-[var(--brand-gold)]">
                                    Shipping Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="transition hover:text-[var(--brand-gold)]">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="transition hover:text-[var(--brand-gold)]">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="transition hover:text-[var(--brand-gold)]">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                    {/* CONTACT */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <h3 className="mb-4 text-sm font-semibold text-white">
                            Contact Info
                        </h3>
                        <div className="space-y-4 text-sm text-gray-400">
                            <div className="flex items-start gap-3">
                                <FiMapPin className="mt-0.5 shrink-0 text-lg text-[var(--brand-gold)]" />
                                <span>
                                    Hyderabad, Telangana, India
                                </span>
                            </div>
                            <a
                                href="tel:+919876543210"
                                className="flex items-center gap-3 transition hover:text-white"
                            >
                                <FiPhone className="shrink-0 text-lg text-[var(--brand-gold)]" />
                                +91 98765 43210
                            </a>
                            <a
                                href="mailto:support@srautomotives.com"
                                className="flex items-center gap-3 transition hover:text-white"
                            >
                                <FiMail className="shrink-0 text-lg text-[var(--brand-gold)]" />
                                <span className="break-all">
                                    support@srautomotives.com
                                </span>
                            </a>
                            {/* WHATSAPP */}
                            <a
                                href="#"
                                className="flex w-fit items-center gap-2 text-white transition hover:text-[var(--brand-gold)]"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-lg text-white">
                                    <FaWhatsapp />
                                </span>
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* BOTTOM BAR */}
            <div className="border-t border-white/10">
                <div
                    className="section-container flex flex-col gap-3 py-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p>© 2026 SR Automotives. All rights reserved.</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/privacy"
                            className="transition hover:text-white"
                        >
                            Privacy Policy
                        </Link>
                        <span className="text-gray-700">|</span>
                        <Link
                            href="/terms"
                            className="transition hover:text-white"
                        >
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}