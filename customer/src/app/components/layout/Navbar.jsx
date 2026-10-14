"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiSearch,
    FiUser,
    FiShoppingCart,
    FiMenu,
    FiX,
    FiHome,
    FiGrid,
    FiTool,
    FiTag,
    FiMail,
    FiLogIn,
} from "react-icons/fi";
const navLinks = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "About Us", href: "/about", icon: FiUser },
    { name: "Products", href: "/products", icon: FiGrid },
    { name: "Services", href: "/services", icon: FiTool },
    { name: "Offers", href: "/offers", icon: FiTag },
    { name: "Contact", href: "/contact", icon: FiMail },
];
export default function Navbar() {

    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    // Temporary until CartContext/AuthContext are connected
    const cartCount = 3;
    useEffect(() => {
        setMenuOpen(false);
        setSearchOpen(false);
    }, [pathname]);
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);
    const isActive = (href) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const useSolidNavbar =
        pathname === "/products" ||
        pathname.startsWith("/products/") || pathname.startsWith("/services/") || pathname === "/services" || pathname.startsWith("/category") || pathname.startsWith("/offers");
    return (
        <>
            <header
                className={`
                            fixed left-0 top-0 z-50 w-full
                            transition-all duration-300
                            ${scrolled || useSolidNavbar
                        ? "bg-black shadow-sm"
                        : "bg-transparent"
                    }
                `}
            >
                <nav
                    aria-label="Main navigation"
                    className="section-container flex h-[60px] items-center justify-between lg:h-[60px]"
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex shrink-0 items-center gap-2.5"
                        aria-label="SR Automotives home"
                    >
                        <Image
                            src="/logo.png"
                            alt="SR Automotives"
                            width={60}
                            height={60}
                            priority
                            className="h-16 w-16 object-cover"
                        />
                        <span className="hidden text-base xs:block font-bold tracking-wide text-[var(--brand-gold)]
                            ">SR AUTOMOTIVES
                        </span>
                    </Link>
                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-1 lg:flex xl:gap-2">
                        {navLinks.map(({ name, href }) => {
                            const active = isActive(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`
                                            relative rounded-md px-3 py-2
                                            text-sm font-medium
                                            transition-colors duration-300
                                            ${active
                                            ? "text-[var(--brand-gold)]"
                                            : "text-[#e8e8e8] hover:text-[var(--brand-gold)]"
                                        }
                                    `}
                                >
                                    {name}
                                    <span
                                        className={`
                                                    absolute bottom-0 left-1/2 h-[2px]
                                                    -translate-x-1/2 rounded-full
                                                    bg-[var(--brand-gold)]
                                                    transition-all duration-300
                                                    ${active ? "w-7" : "w-0"}
                                                    `}
                                    />
                                </Link>
                            );
                        })}
                    </div>
                    {/* Desktop Actions */}
                    <div className="hidden items-center gap-3 lg:flex">
                        {/* Search */}
                        <div
                            className={`
                flex h-10 items-center overflow-hidden rounded-full
                border border-white/5 bg-[var(--brand-charcoal)]
                transition-all duration-300
                ${searchOpen ? "w-64" : "w-44 xl:w-56"}
              `}
                        >
                            <input
                                type="search"
                                placeholder="Search products..."
                                aria-label="Search products"
                                className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/40"
                            />
                            <button
                                type="button"
                                aria-label="Search"
                                onClick={() => setSearchOpen(true)}
                                className="flex h-10 w-11 shrink-0 items-center justify-center text-[var(--brand-gold)] transition-colors hover:text-[var(--brand-gold-light)]"
                            >
                                <FiSearch size={18} />
                            </button>
                        </div>
                        {/* Account */}
                        <Link
                            href="/login"
                            aria-label="Login or sign up"
                            title="Login / Sign Up"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--brand-gold)] transition-colors hover:bg-white/5 hover:text-[var(--brand-gold-light)]"
                        >
                            <FiUser size={22} />
                        </Link>
                        {/* Cart */}
                        <Link
                            href="/cart"
                            aria-label={`Shopping cart with ${cartCount} items`}
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--brand-gold)] transition-colors hover:bg-white/5 hover:text-[var(--brand-gold-light)]"
                        >
                            <FiShoppingCart size={23} />
                            {cartCount > 0 && (
                                <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--brand-gold)] px-1 text-[10px] font-bold text-[var(--brand-black)]">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                    {/* Mobile Actions */}
                    <div className="flex items-center gap-1 lg:hidden">
                        <button
                            type="button"
                            aria-label="Search products"
                            onClick={() => setSearchOpen((prev) => !prev)}
                            className="flex h-11 w-11 items-center justify-center text-[var(--brand-gold)]"
                        >
                            <FiSearch size={21} />
                        </button>
                        <Link
                            href="/cart"
                            aria-label={`Shopping cart with ${cartCount} items`}
                            className="relative flex h-11 w-11 items-center justify-center text-[var(--brand-gold)]"
                        >
                            <FiShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--brand-gold)] px-1 text-[10px] font-bold text-[var(--brand-black)]">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                            className="flex h-11 w-11 items-center justify-center text-white transition-colors hover:text-[var(--brand-gold)]"
                        >
                            <FiMenu size={26} />
                        </button>
                    </div>
                </nav>
                {/* Mobile Search */}
                <div
                    className={`
            overflow-hidden border-white/10 bg-[var(--brand-black)]
            transition-all duration-300 lg:hidden
            ${searchOpen
                            ? "max-h-20 border-t opacity-100"
                            : "max-h-0 opacity-0"
                        }
          `}
                >
                    <form
                        role="search"
                        className="section-container flex py-3"
                    >
                        <div className="flex h-11 w-full items-center rounded-lg border border-white/10 bg-[var(--brand-charcoal)]">
                            <FiSearch
                                className="ml-4 shrink-0 text-[var(--brand-gold)]"
                                size={18}
                            />
                            <input
                                type="search"
                                placeholder="Search products..."
                                aria-label="Search products"
                                autoFocus={searchOpen}
                                className="h-full w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
                            />
                        </div>
                    </form>
                </div>
            </header>
            {/* Mobile Dark Overlay */}
            <div
                aria-hidden="true"
                onClick={() => setMenuOpen(false)}
                className={`
          fixed inset-0 z-[60] bg-black/70 backdrop-blur-[2px]
          transition-opacity duration-300 lg:hidden
          ${menuOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                    }
        `}
            />
            {/* Mobile Drawer */}
            <aside
                aria-label="Mobile navigation"
                className={`
          fixed right-0 top-0 z-[70] flex h-dvh
          w-[86%] max-w-[360px] flex-col
          border-l border-[var(--brand-gold)]/20
          bg-[var(--brand-black)]
          shadow-2xl
          transition-transform duration-300 ease-out
          lg:hidden
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
        `}
            >
                {/* Drawer Header */}
                <div className="flex min-h-[86px] items-center justify-between border-b border-white/10 px-5">
                    <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3"
                    >
                        <Image
                            src="/logo.png"
                            alt="SR Automotives"
                            width={52}
                            height={52}
                            className="h-16 w-16 object-contain"
                        />
                        <span className="text-xs font-bold tracking-wide text-[var(--brand-gold)]">
                            SR AUTOMOTIVES
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close navigation menu"
                        className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/5 hover:text-[var(--brand-gold)]"
                    >
                        <FiX size={25} />
                    </button>
                </div>
                {/* Main Menu */}
                <div className="flex-1 overflow-y-auto px-4 py-5">
                    <div className="space-y-1">
                        {navLinks.map(({ name, href, icon: Icon }, index) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    transitionDelay: menuOpen
                                        ? `${index * 40}ms`
                                        : "0ms",
                                }}
                                className={`
                  flex min-h-12 items-center gap-4 rounded-lg
                  border-l-2 px-4 py-3
                  text-[15px] font-medium
                  transition-all duration-300
                  ${menuOpen
                                        ? "translate-x-0 opacity-100"
                                        : "translate-x-8 opacity-0"
                                    }
                  ${isActive(href)
                                        ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/15 text-[var(--brand-gold-light)]"
                                        : "border-transparent text-white/85 hover:bg-white/5 hover:text-[var(--brand-gold)]"
                                    }
                `}
                            >
                                <Icon
                                    size={19}
                                    className={
                                        isActive(href)
                                            ? "text-[var(--brand-gold)]"
                                            : "text-white/65"
                                    }
                                />
                                {name}
                            </Link>
                        ))}
                    </div>
                    <div className="my-5 h-px bg-white/10" />
                    {/* Auth - temporary guest state */}
                    <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 items-center gap-4 rounded-lg border-l-2 border-transparent px-4 py-3 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-[var(--brand-gold)]"
                    >
                        <FiLogIn size={19} className="text-[var(--brand-gold)]" />
                        Login / Sign Up
                    </Link>
                    {/* Cart - same style as normal menu */}
                    <Link
                        href="/cart"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 items-center gap-4 rounded-lg border-l-2 border-transparent px-4 py-3 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-[var(--brand-gold)]"
                    >
                        <FiShoppingCart
                            size={19}
                            className="text-[var(--brand-gold)]"
                        />
                        <span className="flex-1">Cart</span>
                        {cartCount > 0 && (
                            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--brand-gold)] px-1.5 text-xs font-bold text-[var(--brand-black)]">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>
                </div>
                <div className="border-t border-white/10 px-5 py-4">
                    <p className="text-xs leading-5 text-white/40">
                        Premium car accessories & expert automotive services.
                    </p>
                </div>
            </aside>
        </>
    );
}