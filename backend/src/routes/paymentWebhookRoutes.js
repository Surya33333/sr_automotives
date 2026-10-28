import {Router} from 'express';
import {paymentWebhook} from '../controllers/paymentController.js';
const router=Router();
router.post('/',paymentWebhook);
export default router;