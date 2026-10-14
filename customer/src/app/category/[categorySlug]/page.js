import CategoryProductsClient from "../../../app/components/product/CategoryProductsClient";

export default async function CategoryPage({ params }) {
    const { categorySlug } = await params;

    return <CategoryProductsClient categorySlug={categorySlug} />;
}