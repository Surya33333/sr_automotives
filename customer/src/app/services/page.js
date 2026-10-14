import ServicesClient from "../components/service/ServicesClient";
export const metadata = {
    title: "Automotive Services",
    description:
        "Explore professional automotive services from SR Automotives including car care, installation, maintenance and vehicle upgrades.",
    alternates: {
        canonical: "/services",
    },
    openGraph: {
        title: "Automotive Services | SR Automotives",
        description:
            "Professional automotive care, installation and vehicle services from SR Automotives.",
        url: "/services",
        type: "website",
    },
};
async function getServices() {
    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/services`, {
            next: {
                revalidate: 60,
            },
        });
        if (!response.ok) {
            console.error("Services API error:", response.status);
            return [];
        }
        const data = await response.json();
        return Array.isArray(data)
            ? data
            : data.services || [];
    } catch (error) {
        console.error("Services fetch error:", error);
        return [];
    }
}
export default async function ServicesPage() {
    const services = await getServices();
    return (
        <main className="min-h-screen bg-[var(--brand-cream)]">
            <ServicesClient initialServices={services} />
        </main>
    );
}