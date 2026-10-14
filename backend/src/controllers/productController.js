import pool from "../config/db.js";
// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query(
            `SELECT
                    pc.category_id,
                    pc.category_name,
                    pc.category_description,
                    pc.category_slug,
                    pc.category_image,
                    COUNT(p.product_id) AS product_count
                FROM product_categories pc
                LEFT JOIN products p
                    ON pc.category_id = p.category_id
                GROUP BY
                    pc.category_id,
                    pc.category_name,
                    pc.category_description,
                    pc.category_slug,
                    pc.category_image
                ORDER BY pc.category_id;`
        );
        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
};
// GET SUBCATEGORIES BY CATEGORY
export const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const [subcategories] = await pool.query(
            `SELECT
                subcategory_id,
                category_id,
                subcategory_name,
                subcategory_description
             FROM product_subcategories
             WHERE category_id = ?
             ORDER BY subcategory_id`,
            [categoryId]
        );
        res.status(200).json({
            success: true,
            count: subcategories.length,
            subcategories
        });
    } catch (error) {
        console.error("Get Subcategories Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch subcategories"
        });
    }
};
export const getProducts = async (req, res) => {
    try {

        const [products] = await pool.query(`
            SELECT
                p.*,

                COALESCE(
                    ROUND(AVG(pr.rating), 1),
                    0
                ) AS average_rating,

                COUNT(pr.rating) AS review_count

            FROM products p

            LEFT JOIN product_reviews pr
                ON p.product_id = pr.product_id

            GROUP BY p.product_id

            ORDER BY p.product_id
        `);


        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });

    } catch (error) {

        console.error(
            "Get Products Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });

    }
};
export const getProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;

        const [products] = await pool.query(
            `SELECT p.*
             FROM products p
             INNER JOIN product_categories c
                 ON p.category_id = c.category_id
             WHERE c.category_slug = ?
             ORDER BY p.product_id`,
            [categoryName]
        );

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Get Products by Category Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};
export const getFeaturedProducts = async (req, res) => {
    try {
        const bestSellerQuery = `
            SELECT
                p.product_id,
                p.product_name,
                p.product_mrp,
                p.product_selling_price,
                p.product_images,
                p.product_stock,
                SUM(oi.quantity) AS total_sold,
                COALESCE(ROUND(AVG(pr.rating), 1), 0)
                    AS average_rating,
                COUNT(DISTINCT pr.review_id)
                    AS review_count
            FROM products p
            JOIN order_items oi
                ON p.product_id = oi.product_id
            JOIN orders o
                ON oi.order_id = o.order_id
            LEFT JOIN product_reviews pr
                ON p.product_id = pr.product_id
            WHERE o.order_status = 'delivered'
            GROUP BY
                p.product_id,
                p.product_name,
                p.product_mrp,
                p.product_selling_price,
                p.product_images,
                p.product_stock
            ORDER BY total_sold DESC
            LIMIT 10
        `;
        const topRatedQuery = `
            SELECT
                p.product_id,
                p.product_name,
                p.product_mrp,
                p.product_selling_price,
                p.product_images,
                p.product_stock,
                COALESCE(ROUND(AVG(pr.rating), 1), 0)
                    AS average_rating,
                COUNT(pr.review_id)
                    AS review_count
            FROM products p
            JOIN product_reviews pr
                ON p.product_id = pr.product_id
            GROUP BY
                p.product_id,
                p.product_name,
                p.product_mrp,
                p.product_selling_price,
                p.product_images,
                p.product_stock
            ORDER BY
                average_rating DESC,
                review_count DESC
            LIMIT 10
        `;
        const newArrivalsQuery = `
            SELECT
                p.product_id,
                p.product_name,
                p.product_mrp,
                p.product_selling_price,
                p.product_images,
                p.product_stock,
                p.created_at,
                COALESCE(ROUND(AVG(pr.rating), 1), 0)
                    AS average_rating,
                COUNT(pr.review_id)
                    AS review_count
            FROM products p
            LEFT JOIN product_reviews pr
                ON p.product_id = pr.product_id
            GROUP BY
                p.product_id,
                p.product_name,
                p.product_mrp,
                p.product_selling_price,
                p.product_images,
                p.product_stock,
                p.created_at
            ORDER BY p.created_at DESC
            LIMIT 10
        `;
        const [
            [bestSellers],
            [topRated],
            [newArrivals],
        ] = await Promise.all([
            pool.query(bestSellerQuery),
            pool.query(topRatedQuery),
            pool.query(newArrivalsQuery),
        ]);
        res.status(200).json({
            success: true,
            best_sellers: bestSellers,
            top_rated: topRated,
            new_arrivals: newArrivals,
        });
    } catch (error) {
        console.error("Home products error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch home products",
        });
    }
};
export const getTestimonials = async (req, res) => {
    try {
        const [reviews] = await pool.query(
            `SELECT
                pr.review_id,
                pr.rating,
                pr.review_text,
                pr.created_at,
                c.customer_fullname AS customer_name,
                p.product_id,
                p.product_name
             FROM product_reviews pr
             INNER JOIN customers c
                ON pr.customer_id = c.customer_id
             INNER JOIN products p
                ON pr.product_id = p.product_id
             WHERE pr.rating >= 4
               AND pr.review_text IS NOT NULL
               AND TRIM(pr.review_text) != ''
             ORDER BY
                pr.rating DESC,
                pr.created_at DESC
             LIMIT 10`
        );
        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews,
        });
    } catch (error) {
        console.error(
            "Get Testimonials Error:",
            error
        );
        res.status(500).json({
            success: false,
            message: "Failed to fetch testimonials",
        });
    }
};