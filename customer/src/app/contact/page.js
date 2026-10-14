import ContactHero from "../components/contact/ContactHero";
import ContactSection from "../components/contact/ContactSection";
import QuickHelp from "../components/contact/QuickHelp";
import ContactFAQ from "../components/contact/ContactFAQ";
export const metadata = {
    title: "Contact Us",
    description:
        "Contact SR Automotives for car accessories, product assistance, fitting, automotive services and order support.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "Contact SR Automotives",
        description:
            "Talk to SR Automotives about car accessories, fitting, automotive services and customer support.",
        url: "/contact",
        type: "website",
    },
};
export default function ContactPage() {
    return (
        <main className="bg-[var(--brand-cream)]">
            <ContactHero />
            <ContactSection />
            <QuickHelp />
            <ContactFAQ />
        </main>
    );
}