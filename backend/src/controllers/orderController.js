import pool from "../config/db.js";
export const createOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const customerId = req.customer.customer_id;
        await connection.beginTransaction();
        // 1. Get customer
        const [customers] = await connection.query(
            `SELECT
                customer_id,
                customer_fullname,
                customer_phone,
                customer_shippingaddress
             FROM customers
             WHERE customer_id = ?`,
            [customerId]
        );
        if (customers.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }
        const customer = customers[0];
        // 2. Get cart
        const [cartItems] = await connection.query(
            `SELECT
                cart_item_id,
                item_type,
                product_id,
                service_id,
                offer_id,
                quantity,
                unit_price,
                selected_offer_items
             FROM cart
             WHERE customer_id = ?
             FOR UPDATE`,
            [customerId]
        );
        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }
        const orderItems = [];
        let subtotal = 0;
        // 3. Validate cart items
        for (const item of cartItems) {
            // PRODUCT
            if (item.item_type === "product") {
                const [products] = await connection.query(
                    `SELECT
                        product_id,
                        product_name,
                        product_description,
                        product_selling_price,
                        product_stock,
                        product_images
                     FROM products
                     WHERE product_id = ?
                     FOR UPDATE`,
                    [item.product_id]
                );
                if (products.length === 0) {
                    throw new Error(
                        `Product ${item.product_id} not found`
                    );
                }
                const product = products[0];
                if (item.quantity > product.product_stock) {
                    throw new Error(
                        `${product.product_name} has only ${product.product_stock} items available`
                    );
                }
                const total =
                    Number(item.unit_price) * Number(item.quantity);
                subtotal += total;
                orderItems.push({
                    item_type: "product",
                    item_id: product.product_id,
                    name: product.product_name,
                    quantity: item.quantity,
                    unit_price: Number(item.unit_price),
                    total,
                    shiprocket_required: true
                });
            }
            // SERVICE
            else if (item.item_type === "service") {
                const [services] = await connection.query(
                    `SELECT
                        service_id,
                        service_title,
                        service_description,
                        service_selling_price,
                        service_media
                     FROM services
                     WHERE service_id = ?`,
                    [item.service_id]
                );
                if (services.length === 0) {
                    throw new Error(
                        `Service ${item.service_id} not found`
                    );
                }
                const service = services[0];
                const total =
                    Number(item.unit_price) * Number(item.quantity);
                subtotal += total;
                orderItems.push({
                    item_type: "service",
                    item_id: service.service_id,
                    name: service.service_title,
                    quantity: item.quantity,
                    unit_price: Number(item.unit_price),
                    total,
                    shiprocket_required: false
                });
            }
            // OFFER
            else if (item.item_type === "offer") {
                const [offers] = await connection.query(
                    `SELECT
                        offer_id,
                        offer_title,
                        offer_description,
                        offer_price,
                        offer_images,
                        offer_status,
                        start_date,
                        end_date
                     FROM offers
                     WHERE offer_id = ?
                     FOR UPDATE`,
                    [item.offer_id]
                );
                if (offers.length === 0) {
                    throw new Error(
                        `Offer ${item.offer_id} not found`
                    );
                }
                const offer = offers[0];
                const now = new Date();
                if (
                    !offer.offer_status ||
                    now < new Date(offer.start_date) ||
                    now > new Date(offer.end_date)
                ) {
                    throw new Error(
                        `${offer.offer_title} is no longer available`
                    );
                }
                const total =
                    Number(item.unit_price) * Number(item.quantity);
                subtotal += total;
                orderItems.push({
                    item_type: "offer",
                    item_id: offer.offer_id,
                    name: offer.offer_title,
                    quantity: item.quantity,
                    unit_price: Number(item.unit_price),
                    total,
                    selected_offer_items: item.selected_offer_items,
                    shiprocket_required: true
                });
            }
        }
        // 4. Calculate order totals
        const discount = 0;
        const shippingCharge = 0;
        const totalAmount =
            subtotal - discount + shippingCharge;
        // 5. Generate order ID
        const orderId =
            `ORD${Date.now()}`;
        // 6. Create order
        await connection.query(
            `INSERT INTO orders (
                order_id,
                customer_id,
                order_status,
                shipping_address,
                payment_mode,
                payment_type,
                payment_status,
                order_items,
                subtotal,
                discount,
                shipping_charge,
                total_amount
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderId,
                customerId,
                "Pending",
                JSON.stringify(customer.customer_shippingaddress),
                "Pending",
                "Online",
                "Pending",
                JSON.stringify(orderItems),
                subtotal,
                discount,
                shippingCharge,
                totalAmount
            ]
        );
        // 7. Reduce product stock
        for (const item of cartItems) {
            if (item.item_type === "product") {
                await connection.query(
                    `UPDATE products
                     SET product_stock = product_stock - ?
                     WHERE product_id = ?`,
                    [
                        item.quantity,
                        item.product_id
                    ]
                );
            }
        }
        // 8. Clear cart
        await connection.query(
            `DELETE FROM cart
             WHERE customer_id = ?`,
            [customerId]
        );
        // 9. Commit transaction
        await connection.commit();
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order_id: orderId,
            subtotal,
            discount,
            shipping_charge: shippingCharge,
            total_amount: totalAmount,
            order_items: orderItems
        });
    } catch (error) {
        await connection.rollback();
        console.error("Create Order Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create order"
        });
    } finally {
        connection.release();
    }
};
export const getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const [orders] = await pool.query(
            `SELECT
                order_id,
                order_date,
                order_status,
                payment_mode,
                payment_type,
                payment_status,
                subtotal,
                discount,
                shipping_charge,
                total_amount,
                order_items
             FROM orders
             WHERE customer_id = ?
             ORDER BY order_date DESC`,
            [customerId]
        );
        const formattedOrders = orders.map(order => ({
            order_id: order.order_id,
            order_date: order.order_date,
            order_status: order.order_status,
            payment_mode: order.payment_mode,
            payment_type: order.payment_type,
            payment_status: order.payment_status,
            subtotal: Number(order.subtotal),
            discount: Number(order.discount),
            shipping_charge: Number(order.shipping_charge),
            total_amount: Number(order.total_amount),
            items: order.order_items
        }));
        res.status(200).json({
            success: true,
            count: formattedOrders.length,
            orders: formattedOrders
        });
    } catch (error) {
        console.error("Get Customer Orders Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
};
export const getOrderById = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const { orderId } = req.params;
        const [orders] = await pool.query(
            `SELECT
                order_id,
                customer_id,
                order_date,
                order_status,
                shipping_address,
                payment_mode,
                payment_type,
                payment_status,
                order_items,
                subtotal,
                discount,
                shipping_charge,
                total_amount,
                created_at,
                updated_at
             FROM orders
             WHERE order_id = ?
             AND customer_id = ?`,
            [orderId, customerId]
        );
        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        const order = orders[0];
        res.status(200).json({
            success: true,
            order: {
                order_id: order.order_id,
                order_date: order.order_date,
                order_status: order.order_status,
                shipping_address: order.shipping_address,
                payment: {
                    mode: order.payment_mode,
                    type: order.payment_type,
                    status: order.payment_status
                },
                items: order.order_items,
                pricing: {
                    subtotal: Number(order.subtotal),
                    discount: Number(order.discount),
                    shipping_charge: Number(order.shipping_charge),
                    total_amount: Number(order.total_amount)
                },
                created_at: order.created_at,
                updated_at: order.updated_at
            }
        });
    } catch (error) {
        console.error("Get Order Details Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order details"
        });
    }
};