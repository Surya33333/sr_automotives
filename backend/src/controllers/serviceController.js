import pool from "../config/db.js";
export const getServices = async (req, res) => {
    try {
        const [services] = await pool.query(
            `SELECT
                service_id,
                service_title,
                service_description,
                service_price,
                service_selling_price,
                service_media,
                service_keywords,
                service_slug,
                created_at,
                updated_at
             FROM services
             ORDER BY created_at DESC`
        );
        res.status(200).json({
            success: true,
            count: services.length,
            services
        });
    } catch (error) {
        console.error("Get Services Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch services"
        });
    }
};