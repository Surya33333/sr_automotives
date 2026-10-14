import ProductsClient from "../components/product/ProductsClient";

export const metadata = {
    title: "All Products",
    description:
        "Shop premium car accessories, automotive parts and vehicle upgrades from SR Automotives.",
    alternates: {
        canonical: "/products",
    },
};

async function getFeaturedProducts() {
    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000/api";

        const response = await fetch(
            `${apiUrl}/featuredproducts`,
            {
                next: {
                    revalidate: 60,
                },
            }
        );

        if (!response.ok) {
            return {
                best_sellers: [],
                top_rated: [],
                new_arrivals: [],
            };
        }

        return await response.json();

    } catch (error) {
        console.error(
            "Featured products fetch error:",
            error
        );

        return {
            best_sellers: [],
            top_rated: [],
            new_arrivals: [],
        };
    }
}

async function getProducts() {
    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000/api";

        const response = await fetch(`${apiUrl}/products`, {
            next: {
                revalidate: 60,
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        return Array.isArray(data)
            ? data
            : data.products || [];
    } catch (error) {
        console.error("Products fetch error:", error);
        return [];
    }
}

async function getCategories() {
    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000/api";

        const response = await fetch(`${apiUrl}/categories`, {
            next: {
                revalidate: 300,
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        return Array.isArray(data)
            ? data
            : data.categories || [];
    } catch (error) {
        console.error("Categories fetch error:", error);
        return [];
    }
}

export default async function ProductsPage() {

    const [
        products,
        categories,
        featuredProducts,
    ] = await Promise.all([
        getProducts(),
        getCategories(),
        getFeaturedProducts(),
    ]);

    return (
        <main className="min-h-screen bg-[var(--brand-cream)]">
            <ProductsClient
                initialProducts={products}
                initialCategories={categories}
                featuredProducts={featuredProducts}
            />
        </main>
    );
}