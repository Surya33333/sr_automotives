import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
// ==========================
// CUSTOMER REGISTER
// ==========================
export const registerCustomer = async (req, res) => {
    try {
        const {
            customer_id,
            customer_fullname,
            customer_phone,
            customer_password
        } = req.body;
        // Validate required fields
        if (
            !customer_fullname ||
            !customer_phone ||
            !customer_password
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, phone and password are required"
            });
        }
        // Check existing customer
        const [existingCustomer] = await pool.query(
            `SELECT customer_id 
             FROM customers 
             WHERE customer_phone = ?`,
            [customer_phone]
        );
        if (existingCustomer.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Customer with this phone number already exists"
            });
        }
        // Hash password
        const passwordHash = await bcrypt.hash(customer_password, 10);
        // Insert customer
        const [result] = await pool.query(
            `INSERT INTO customers
            (
                customer_id,
                customer_fullname,
                customer_phone,
                customer_passwordhash
            )
            VALUES (?, ?, ?, ?)`,
            [
                customer_id,
                customer_fullname,
                customer_phone,
                passwordHash
            ]
        );
        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                customer_id,
                customer_fullname,
                customer_phone
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};
// ==========================
// CUSTOMER LOGIN
// ==========================
export const loginCustomer = async (req, res) => {
    try {
        const {
            customer_phone,
            customer_password
        } = req.body;
        if (!customer_phone || !customer_password) {
            return res.status(400).json({
                success: false,
                message: "Phone and password are required"
            });
        }
        // Find customer
        const [customers] = await pool.query(
            `SELECT *
             FROM customers
             WHERE customer_phone = ?`,
            [customer_phone]
        );
        if (customers.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone number or password"
            });
        }
        const customer = customers[0];
        // Compare password
        const passwordMatch = await bcrypt.compare(
            customer_password,
            customer.customer_passwordhash
        );
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid phone number or password"
            });
        }
        // Generate JWT
        const token = jwt.sign(
            {
                customer_id: customer.customer_id,
                customer_phone: customer.customer_phone
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );
        res.json({
            success: true,
            message: "Login successful",
            token,
            customer: {
                customer_id: customer.customer_id,
                customer_fullname: customer.customer_fullname,
                customer_phone: customer.customer_phone,
                customer_shippingaddress:
                    customer.customer_shippingaddress,
                customer_profileurl:
                    customer.customer_profileurl
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};
// ==========================
// GET CUSTOMER PROFILE
// ==========================
export const getCustomerProfile = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const [customers] = await pool.query(
            `SELECT
                customer_id,
                customer_fullname,
                customer_phone,
                customer_shippingaddress,
                customer_profileurl,
                customer_createdat
             FROM customers
             WHERE customer_id = ?`,
            [customerId]
        );
        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }
        res.json({
            success: true,
            customer: customers[0]
        });
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
};
export const updateCustomerProfile = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const {
            customer_fullname,
            customer_phone,
            customer_shippingaddress,
            customer_profileurl
        } = req.body;
        // Required fields
        if (!customer_fullname || !customer_phone) {
            return res.status(400).json({
                success: false,
                message: "Name and phone are required"
            });
        }
        // Check whether phone number is already used
        const [existingCustomer] = await pool.query(
            `SELECT customer_id
             FROM customers
             WHERE customer_phone = ?
             AND customer_id != ?`,
            [customer_phone, customerId]
        );
        if (existingCustomer.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered"
            });
        }
        // Update profile
        await pool.query(
            `UPDATE customers
             SET
                customer_fullname = ?,
                customer_phone = ?,
                customer_shippingaddress = ?,
                customer_profileurl = ?
             WHERE customer_id = ?`,
            [
                customer_fullname,
                customer_phone,
                customer_shippingaddress
                    ? JSON.stringify(customer_shippingaddress)
                    : null,
                customer_profileurl || null,
                customerId
            ]
        );
        // Get updated profile
        const [customers] = await pool.query(
            `SELECT
                customer_id,
                customer_fullname,
                customer_phone,
                customer_shippingaddress,
                customer_profileurl,
                customer_createdat
             FROM customers
             WHERE customer_id = ?`,
            [customerId]
        );
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            customer: customers[0]
        });
    } catch (error) {
        console.error("Update Customer Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update customer profile"
        });
    }
};
export const changePassword = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const {
            current_password,
            new_password
        } = req.body;
        // Validate input
        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }
        // Validate new password
        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long"
            });
        }
        // Get current password hash
        const [customers] = await pool.query(
            `SELECT customer_passwordhash
             FROM customers
             WHERE customer_id = ?`,
            [customerId]
        );
        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }
        const storedPasswordHash = customers[0].customer_passwordhash;
        // Verify current password
        const isPasswordValid = await bcrypt.compare(
            current_password,
            storedPasswordHash
        );
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }
        // Prevent using the same password
        const isSamePassword = await bcrypt.compare(
            new_password,
            storedPasswordHash
        );
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }
        // Hash new password
        const newPasswordHash = await bcrypt.hash(new_password, 10);
        // Update password
        await pool.query(
            `UPDATE customers
             SET customer_passwordhash = ?
             WHERE customer_id = ?`,
            [newPasswordHash, customerId]
        );
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update password"
        });
    }
};