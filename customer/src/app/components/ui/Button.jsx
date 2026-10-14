import Link from "next/link";

const variants = {
  primary:
    "bg-[var(--brand-gold)] text-[var(--brand-black)] hover:bg-[var(--brand-gold-dark)] hover:cursor-pointer",

  secondary:
    "border border-[var(--brand-gold)] text-[var(--brand-gold)] hover:bg-[var(--brand-gold)] hover:text-[var(--brand-black)] hover:cursor-pointer",

  dark:
    "bg-[var(--brand-black)] text-white hover:bg-[var(--brand-charcoal)] hover:cursor-pointer",

  light:
    "border border-[var(--border)] bg-white text-[var(--text-primary)] hover:border-[var(--brand-gold)] hover:cursor-pointer",
};

export default function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  className = "",
  ...props
}) {
  const styles = `
    inline-flex items-center justify-center gap-2
    rounded-lg px-5 py-3
    text-sm font-semibold
    transition-all duration-300
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-[var(--brand-gold)]
    focus-visible:ring-offset-2
    disabled:pointer-events-none
    disabled:opacity-50
    ${variants[variant]}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={styles} {...props}>
      {children}
    </button>
  );
}