import pool from "../config/db.js";
export const addToCart = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const {
            item_type,
            product_id,
            service_id,
            offer_id,
            quantity = 1,
            selected_offer_items
        } = req.body;
        // Basic validation
        if (!item_type) {
            return res.status(400).json({
                success: false,
                message: "Item type is required"
            });
        }
        if (!["product", "service", "offer"].includes(item_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid item type"
            });
        }
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }
        let itemId;
        let unitPrice;
        // PRODUCT
        if (item_type === "product") {
            if (!product_id) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required"
                });
            }
            const [products] = await pool.query(
                `SELECT
                    product_id,
                    product_selling_price,
                    product_stock
                 FROM products
                 WHERE product_id = ?`,
                [product_id]
            );
            if (products.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }
            const product = products[0];
            if (product.product_stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient product stock"
                });
            }
            itemId = product.product_id;
            unitPrice = product.product_selling_price;
        }
        // SERVICE
        if (item_type === "service") {
            if (!service_id) {
                return res.status(400).json({
                    success: false,
                    message: "Service ID is required"
                });
            }
            const [services] = await pool.query(
                `SELECT
                    service_id,
                    service_selling_price
                 FROM services
                 WHERE service_id = ?`,
                [service_id]
            );
            if (services.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found"
                });
            }
            const service = services[0];
            itemId = service.service_id;
            unitPrice = service.service_selling_price;
        }
        // OFFER
        if (item_type === "offer") {
            if (!offer_id) {
                return res.status(400).json({
                    success: false,
                    message: "Offer ID is required"
                });
            }
            const [offers] = await pool.query(
                `SELECT
                    offer_id,
                    offer_price,
                    offer_stock,
                    offer_status,
                    start_date,
                    end_date,
                    offer_items
                 FROM offers
                 WHERE offer_id = ?`,
                [offer_id]
            );
            if (offers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Offer not found"
                });
            }
            const offer = offers[0];
            if (!offer.offer_status) {
                return res.status(400).json({
                    success: false,
                    message: "Offer is not active"
                });
            }
            const currentDate = new Date();
            if (
                currentDate < new Date(offer.start_date) ||
                currentDate > new Date(offer.end_date)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Offer is not currently available"
                });
            }
            if (offer.offer_stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient offer stock"
                });
            }
            itemId = offer.offer_id;
            unitPrice = offer.offer_price;
            // If customer didn't modify the offer,
            // use the complete offer bundle
            if (!selected_offer_items) {
                req.body.selected_offer_items = offer.offer_items;
            }
        }
        // Check whether this item already exists in customer's cart
        let existingQuery;
        let existingParams;
        if (item_type === "product") {
            existingQuery = `
                SELECT cart_item_id, quantity
                FROM cart
                WHERE customer_id = ?
                AND item_type = 'product'
                AND product_id = ?
            `;
            existingParams = [customerId, itemId];
        } else if (item_type === "service") {
            existingQuery = `
                SELECT cart_item_id, quantity
                FROM cart
                WHERE customer_id = ?
                AND item_type = 'service'
                AND service_id = ?
            `;
            existingParams = [customerId, itemId];
        } else {
            existingQuery = `
                SELECT cart_item_id, quantity
                FROM cart
                WHERE customer_id = ?
                AND item_type = 'offer'
                AND offer_id = ?
            `;
            existingParams = [customerId, itemId];
        }
        const [existingItems] = await pool.query(
            existingQuery,
            existingParams
        );
        if (existingItems.length > 0) {
            const existingItem = existingItems[0];
            await pool.query(
                `UPDATE cart
                 SET quantity = quantity + ?,
                     unit_price = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE cart_item_id = ?`,
                [
                    quantity,
                    unitPrice,
                    existingItem.cart_item_id
                ]
            );
            return res.status(200).json({
                success: true,
                message: "Cart item quantity updated",
                cart_item_id: existingItem.cart_item_id
            });
        }
        // Insert new cart item
        const [result] = await pool.query(
            `INSERT INTO cart
            (
                customer_id,
                item_type,
                product_id,
                service_id,
                offer_id,
                quantity,
                unit_price,
                selected_offer_items
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customerId,
                item_type,
                item_type === "product" ? product_id : null,
                item_type === "service" ? service_id : null,
                item_type === "offer" ? offer_id : null,
                quantity,
                unitPrice,
                item_type === "offer"
                    ? JSON.stringify(
                        selected_offer_items ||
                        req.body.selected_offer_items ||
                        null
                    )
                    : null
            ]
        );
        res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            cart_item_id: result.insertId
        });
    } catch (error) {
        console.error("Add To Cart Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add item to cart"
        });
    }
};
export const getCart = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const [cartItems] = await pool.query(
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
             ORDER BY created_at DESC`,
            [customerId]
        );
        const cart = [];
        for (const item of cartItems) {
            // PRODUCT
            if (item.item_type === "product") {
                const [products] = await pool.query(
                    `SELECT
                        product_id,
                        product_name,
                        product_selling_price,
                        product_images,
                        product_stock
                     FROM products
                     WHERE product_id = ?`,
                    [item.product_id]
                );
                if (products.length > 0) {
                    const product = products[0];
                    cart.push({
                        cart_item_id: item.cart_item_id,
                        item_type: "product",
                        item_id: product.product_id,
                        name: product.product_name,
                        images: product.product_images,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        current_price: product.product_selling_price,
                        stock: product.product_stock
                    });
                }
            }
            // SERVICE
            else if (item.item_type === "service") {
                const [services] = await pool.query(
                    `SELECT
                        service_id,
                        service_title,
                        service_selling_price,
                        service_media
                     FROM services
                     WHERE service_id = ?`,
                    [item.service_id]
                );
                if (services.length > 0) {
                    const service = services[0];
                    cart.push({
                        cart_item_id: item.cart_item_id,
                        item_type: "service",
                        item_id: service.service_id,
                        name: service.service_title,
                        media: service.service_media,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        current_price: service.service_selling_price
                    });
                }
            }
            // OFFER
            else if (item.item_type === "offer") {
                const [offers] = await pool.query(
                    `SELECT
                        offer_id,
                        offer_title,
                        offer_price,
                        offer_images,
                        offer_status,
                        start_date,
                        end_date
                     FROM offers
                     WHERE offer_id = ?`,
                    [item.offer_id]
                );
                if (offers.length > 0) {
                    const offer = offers[0];
                    cart.push({
                        cart_item_id: item.cart_item_id,
                        item_type: "offer",
                        item_id: offer.offer_id,
                        name: offer.offer_title,
                        images: offer.offer_images,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        current_price: offer.offer_price,
                        offer_status: offer.offer_status,
                        start_date: offer.start_date,
                        end_date: offer.end_date,
                        selected_offer_items: item.selected_offer_items
                    });
                }
            }
        }
        res.status(200).json({
            success: true,
            count: cart.length,
            cart
        });
    } catch (error) {
        console.error("Get Cart Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cart"
        });
    }
};
export const updateCartQuantity = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const { cartItemId } = req.params;
        const { quantity } = req.body;
        // Validate quantity
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }
        // Get cart item
        const [cartItems] = await pool.query(
            `SELECT
                cart_item_id,
                item_type,
                product_id,
                service_id,
                offer_id
             FROM cart
             WHERE cart_item_id = ?
             AND customer_id = ?`,
            [cartItemId, customerId]
        );
        if (cartItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }
        const cartItem = cartItems[0];
        // Check product stock
        if (cartItem.item_type === "product") {
            const [products] = await pool.query(
                `SELECT product_stock
                 FROM products
                 WHERE product_id = ?`,
                [cartItem.product_id]
            );
            if (products.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }
            const stock = products[0].product_stock;
            if (quantity > stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${stock} items available in stock`
                });
            }
        }
        // Update quantity
        await pool.query(
            `UPDATE cart
             SET quantity = ?
             WHERE cart_item_id = ?
             AND customer_id = ?`,
            [quantity, cartItemId, customerId]
        );
        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart_item_id: Number(cartItemId),
            quantity
        });
    } catch (error) {
        console.error("Update Cart Quantity Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update cart quantity"
        });
    }
};
export const removeCartItem = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const { cartItemId } = req.params;
        const [result] = await pool.query(
            `DELETE FROM cart
             WHERE cart_item_id = ?
             AND customer_id = ?`,
            [cartItemId, customerId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Cart item removed successfully"
        });
    } catch (error) {
        console.error("Remove Cart Item Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove cart item"
        });
    }
};
export const clearCart = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const [result] = await pool.query(
            `DELETE FROM cart
             WHERE customer_id = ?`,
            [customerId]
        );
        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            removed_items: result.affectedRows
        });
    } catch (error) {
        console.error("Clear Cart Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to clear cart"
        });
    }
};
export const mergeCart = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        const { cart } = req.body;
        if (!Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart must be a non-empty array"
            });
        }
        for (const item of cart) {
            const {
                item_type,
                item_id,
                quantity,
                selected_offer_items
            } = item;
            if (!["product", "service", "offer"].includes(item_type)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid item type"
                });
            }
            if (!Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid quantity"
                });
            }
            let existingItem;
            // PRODUCT
            if (item_type === "product") {
                const [rows] = await pool.query(
                    `SELECT
                        cart_item_id,
                        quantity
                     FROM cart
                     WHERE customer_id = ?
                     AND item_type = 'product'
                     AND product_id = ?`,
                    [customerId, item_id]
                );
                existingItem = rows[0];
            }
            // SERVICE
            else if (item_type === "service") {
                const [rows] = await pool.query(
                    `SELECT
                        cart_item_id,
                        quantity
                     FROM cart
                     WHERE customer_id = ?
                     AND item_type = 'service'
                     AND service_id = ?`,
                    [customerId, item_id]
                );
                existingItem = rows[0];
            }
            // OFFER
            else if (item_type === "offer") {
                const [rows] = await pool.query(
                    `SELECT
                        cart_item_id,
                        quantity
                     FROM cart
                     WHERE customer_id = ?
                     AND item_type = 'offer'
                     AND offer_id = ?`,
                    [customerId, item_id]
                );
                existingItem = rows[0];
            }
            // Already exists → increase quantity
            if (existingItem) {
                const newQuantity =
                    existingItem.quantity + quantity;
                await pool.query(
                    `UPDATE cart
                     SET quantity = ?
                     WHERE cart_item_id = ?
                     AND customer_id = ?`,
                    [
                        newQuantity,
                        existingItem.cart_item_id,
                        customerId
                    ]
                );
            }
            // New item → get current price and insert
            else {
                let unitPrice = 0;
                if (item_type === "product") {
                    const [products] = await pool.query(
                        `SELECT product_selling_price
                         FROM products
                         WHERE product_id = ?`,
                        [item_id]
                    );
                    if (products.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: `Product ${item_id} not found`
                        });
                    }
                    unitPrice = products[0].product_selling_price;
                }
                else if (item_type === "service") {
                    const [services] = await pool.query(
                        `SELECT service_selling_price
                         FROM services
                         WHERE service_id = ?`,
                        [item_id]
                    );
                    if (services.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: `Service ${item_id} not found`
                        });
                    }
                    unitPrice = services[0].service_selling_price;
                }
                else if (item_type === "offer") {
                    const [offers] = await pool.query(
                        `SELECT offer_price
                         FROM offers
                         WHERE offer_id = ?`,
                        [item_id]
                    );
                    if (offers.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: `Offer ${item_id} not found`
                        });
                    }
                    unitPrice = offers[0].offer_price;
                }
                // Insert new cart item
                await pool.query(
                    `INSERT INTO cart (
                        customer_id,
                        item_type,
                        product_id,
                        service_id,
                        offer_id,
                        quantity,
                        unit_price,
                        selected_offer_items
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        customerId,
                        item_type,
                        item_type === "product" ? item_id : null,
                        item_type === "service" ? item_id : null,
                        item_type === "offer" ? item_id : null,
                        quantity,
                        unitPrice,
                        selected_offer_items
                            ? JSON.stringify(selected_offer_items)
                            : null
                    ]
                );
            }
        }
        res.status(200).json({
            success: true,
            message: "Guest cart merged successfully"
        });
    } catch (error) {
        console.error("Merge Cart Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to merge cart"
        });
    }
};
export const getCheckoutSummary = async (req, res) => {
    try {
        const customerId = req.customer.customer_id;
        // Get customer's shipping address
        const [customers] = await pool.query(
            `SELECT customer_shippingaddress
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
        // Get cart
        const [cartItems] = await pool.query(
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
             ORDER BY created_at DESC`,
            [customerId]
        );
        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }
        const items = [];
        let subtotal = 0;
        for (const item of cartItems) {
            let itemId;
            let name;
            let image = null;
            // PRODUCT
            if (item.item_type === "product") {
                const [products] = await pool.query(
                    `SELECT
                        product_id,
                        product_name,
                        product_images,
                        product_stock
                     FROM products
                     WHERE product_id = ?`,
                    [item.product_id]
                );
                if (products.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `Product ${item.product_id} not found`
                    });
                }
                const product = products[0];
                if (item.quantity > product.product_stock) {
                    return res.status(400).json({
                        success: false,
                        message: `${product.product_name} has only ${product.product_stock} items available`
                    });
                }
                itemId = product.product_id;
                name = product.product_name;
                image = product.product_images;
            }
            // SERVICE
            else if (item.item_type === "service") {
                const [services] = await pool.query(
                    `SELECT
                        service_id,
                        service_title,
                        service_media
                     FROM services
                     WHERE service_id = ?`,
                    [item.service_id]
                );
                if (services.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `Service ${item.service_id} not found`
                    });
                }
                const service = services[0];
                itemId = service.service_id;
                name = service.service_title;
                image = service.service_media;
            }
            // OFFER
            else if (item.item_type === "offer") {
                const [offers] = await pool.query(
                    `SELECT
                        offer_id,
                        offer_title,
                        offer_images,
                        offer_status,
                        start_date,
                        end_date
                     FROM offers
                     WHERE offer_id = ?`,
                    [item.offer_id]
                );
                if (offers.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `Offer ${item.offer_id} not found`
                    });
                }
                const offer = offers[0];
                const now = new Date();
                if (
                    !offer.offer_status ||
                    now < new Date(offer.start_date) ||
                    now > new Date(offer.end_date)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `${offer.offer_title} is no longer available`
                    });
                }
                itemId = offer.offer_id;
                name = offer.offer_title;
                image = offer.offer_images;
            }
            const itemTotal =
                Number(item.unit_price) * Number(item.quantity);
            subtotal += itemTotal;
            items.push({
                cart_item_id: item.cart_item_id,
                item_type: item.item_type,
                item_id: itemId,
                name,
                image,
                quantity: item.quantity,
                unit_price: Number(item.unit_price),
                total: itemTotal,
                selected_offer_items:
                    item.item_type === "offer"
                        ? item.selected_offer_items
                        : null
            });
        }
        // For now
        const discount = 0;
        const shippingCharge = 0;
        const totalAmount =
            subtotal - discount + shippingCharge;
        res.status(200).json({
            success: true,
            items,
            subtotal,
            discount,
            shipping_charge: shippingCharge,
            total_amount: totalAmount,
            shipping_address: customers[0].customer_shippingaddress
        });
    } catch (error) {
        console.error("Get Checkout Summary Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate checkout summary"
        });
    }
};