import express from "express";
import { sendOTP, verifyOTP, getOtpStatus, cancelOtp, getCustomerProfile, updateCustomerProfile } from "../controllers/authController.js";
import { getCategories, getSubcategoriesByCategory, getProducts, getProductsByCategory, getFeaturedProducts, getTestimonials } from "../controllers/productController.js";
import { addVehicle, getCustomerVehicles, updateVehicle, deleteVehicle } from "../controllers/vehicleController.js";
import { getServices } from "../controllers/serviceController.js";
import { getOffers } from "../controllers/offerController.js";
import { addToCart, getCart, updateCartQuantity, removeCartItem, clearCart, mergeCart, getCheckoutSummary } from "../controllers/cartController.js";
import { createOrder, getCustomerOrders, getOrderById } from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { logoutCustomer } from "../controllers/authController.js";

const router = express.Router();

// OTP Authentication
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/logout", authMiddleware, logoutCustomer);

// OTP Management
router.get("/otp/status", getOtpStatus);
router.delete("/otp", cancelOtp);

// Customer Profile
router.get("/profile", authMiddleware, getCustomerProfile);
router.put("/profile", authMiddleware, updateCustomerProfile);

router.post("/vehicle", authMiddleware, addVehicle);//Add Vehicle for logged in user
router.get("/vehicles", authMiddleware, getCustomerVehicles);//Get All Vehicles for logged in user
router.put("/vehicle/:licensePlate", authMiddleware, updateVehicle);//Update Vehicle for logged in user
router.delete("/vehicle/:licensePlate", authMiddleware, deleteVehicle);//Delete Vehicle for logged in user

router.get("/categories", getCategories);//Get All Categories
router.get("/categories/:categoryId/subcategories", getSubcategoriesByCategory);//Get Subcategories by Category ID
router.get("/products", getProducts);//Get All Products
router.get("/products/:categoryName", getProductsByCategory);// Get Products by Category Name
router.get("/services", getServices);//Get All Services
router.get("/offers", getOffers);//Get All Offers
router.get("/featuredproducts", getFeaturedProducts)//Get Featured Products

router.post("/cart", authMiddleware, addToCart);//Add to Cart for logged in user
router.get("/cart", authMiddleware, getCart);//Get Cart for logged in user
router.put("/cart/:cartItemId", authMiddleware, updateCartQuantity);//Update Cart Item Quantity
router.delete("/cart/:cartItemId", authMiddleware, removeCartItem);//Remove Cart Item
router.delete("/cart", authMiddleware, clearCart);//Clear Cart
router.post("/cart/merge",authMiddleware, mergeCart);//Merge Guest Cart with Logged-in User Cart
router.get("/checkout", authMiddleware, getCheckoutSummary);//Get Checkout Summary for logged in user

router.post("/order", authMiddleware, createOrder);//Create Order for logged in user
router.get("/orders", authMiddleware, getCustomerOrders);//Get All Orders for logged in user
router.get("/orders/:orderId", authMiddleware, getOrderById);//Get Order Details by Order ID for logged in user

router.get("/customer_reviews", getTestimonials);

export default router;