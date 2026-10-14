import pool from "../config/db.js";
export const addVehicle = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const {
            vehicle_brand,
            vehicle_model,
            vehicle_licenseplate,
            vehicle_year,
            vehicle_images
        } = req.body;
        if (!vehicle_brand || !vehicle_licenseplate) {
            return res.status(400).json({
                success: false,
                message: "Vehicle brand and licenseplate are required"
            });
        }
        const [result] = await pool.query(
            `INSERT INTO customer_vehicles
            (
                customer_id,
                vehicle_brand,
                vehicle_model,
                vehicle_licenseplate,
                vehicle_year,
                vehicle_images
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                customerId,
                vehicle_brand,
                vehicle_model,
                vehicle_licenseplate || null,
                vehicle_year || null,
                vehicle_images ? JSON.stringify(vehicle_images) : null
            ]
        );
        res.status(201).json({
            success: true,
            message: "Vehicle added successfully",
            vehicle: {
                vehicle_id: result.insertId,
                customer_id: customerId,
                vehicle_brand,
                vehicle_model,
                vehicle_licenseplate: vehicle_licenseplate || null,
                vehicle_year: vehicle_year || null,
                vehicle_images: vehicle_images || null
            }
        });
    } catch (error) {
        console.error("Add Vehicle Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add vehicle"
        });
    }
};
export const getCustomerVehicles = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const [vehicles] = await pool.query(
            `SELECT
                vehicle_licenseplate,
                vehicle_brand,
                vehicle_model,
                vehicle_year,
                vehicle_images,
                created_at,
                updated_at
             FROM customer_vehicles
             WHERE customer_id = ?
             ORDER BY created_at DESC`,
            [customerId]
        );
        res.status(200).json({
            success: true,
            count: vehicles.length,
            vehicles
        });
    } catch (error) {
        console.error("Get Customer Vehicles Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicles"
        });
    }
};
export const updateVehicle = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const { licensePlate } = req.params;
        const {
            vehicle_brand,
            vehicle_model,
            vehicle_year,
            vehicle_images
        } = req.body;
        // Check required fields
        if (!vehicle_brand || !vehicle_model || !vehicle_year) {
            return res.status(400).json({
                success: false,
                message: "Brand, model and year are required"
            });
        }
        // Check whether the vehicle belongs to the logged-in customer
        const [vehicles] = await pool.query(
            `SELECT vehicle_licenseplate
             FROM customer_vehicles
             WHERE vehicle_licenseplate = ?
             AND customer_id = ?`,
            [licensePlate, customerId]
        );
        if (vehicles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }
        // Update vehicle
        await pool.query(
            `UPDATE customer_vehicles
             SET
                vehicle_brand = ?,
                vehicle_model = ?,
                vehicle_year = ?,
                vehicle_images = ?
             WHERE vehicle_licenseplate = ?
             AND customer_id = ?`,
            [
                vehicle_brand,
                vehicle_model,
                vehicle_year,
                vehicle_images
                    ? JSON.stringify(vehicle_images)
                    : null,
                licensePlate,
                customerId
            ]
        );
        // Get updated vehicle
        const [updatedVehicles] = await pool.query(
            `SELECT
                vehicle_licenseplate,
                vehicle_brand,
                vehicle_model,
                vehicle_year,
                vehicle_images,
                created_at,
                updated_at
             FROM customer_vehicles
             WHERE vehicle_licenseplate = ?
             AND customer_id = ?`,
            [licensePlate, customerId]
        );
        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            vehicle: updatedVehicles[0]
        });
    } catch (error) {
        console.error("Update Vehicle Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update vehicle"
        });
    }
};
export const deleteVehicle = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const { licensePlate } = req.params;
        // Check whether the vehicle belongs to the logged-in customer
        const [vehicles] = await pool.query(
            `SELECT vehicle_licenseplate
             FROM customer_vehicles
             WHERE vehicle_licenseplate = ?
             AND customer_id = ?`,
            [licensePlate, customerId]
        );
        if (vehicles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }
        // Delete vehicle
        await pool.query(
            `DELETE FROM customer_vehicles
             WHERE vehicle_licenseplate = ?
             AND customer_id = ?`,
            [licensePlate, customerId]
        );
        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully"
        });
    } catch (error) {
        console.error("Delete Vehicle Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete vehicle"
        });
    }
};