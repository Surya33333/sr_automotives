import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function SectionHeading({
  title,
  description,
  href,
  linkText = "View All",
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[var(--brand-gold-dark)] transition-colors hover:text-[var(--brand-black)] sm:flex"
        >
          {linkText}
          <FiArrowRight />
        </Link>
      )}
    </div>
  );
}