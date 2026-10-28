import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {createPaymentOrder,verifyPayment,getPaymentStatus} from '../controllers/paymentController.js';
const router=Router();
router.post('/create-order',authMiddleware,createPaymentOrder);
router.post('/verify',authMiddleware,verifyPayment);
router.get('/order/:orderId',authMiddleware,getPaymentStatus);
export default router;
