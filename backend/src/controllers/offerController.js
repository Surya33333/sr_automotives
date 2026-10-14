import pool from "../config/db.js";
export const getOffers = async (req, res) => {
    try {
        const [offers] = await pool.query(
            `SELECT
                offer_id,
                offer_title,
                offer_description,
                offer_items,
                actual_price,
                offer_price,
                start_date,
                end_date,
                offer_images,
                offer_stock,
                offer_status,
                created_at,
                updated_at
             FROM offers
             WHERE offer_status = 1
             ORDER BY created_at DESC`
        );
        res.status(200).json({
            success: true,
            count: offers.length,
            offers
        });
    } catch (error) {
        console.error("Get Offers Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch offers"
        });
    }
};