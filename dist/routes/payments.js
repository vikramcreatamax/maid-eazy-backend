import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { processPayment, getPaymentByBooking, getPaymentByUser, addAmountInWallet, verifyPaymentProcess } from '../controllers/paymentController.js';
const router = express.Router();
router.use(authenticateToken);
router.post('/process', processPayment);
router.get('/booking/:bookingId', getPaymentByBooking);
router.get('/', getPaymentByUser);
router.post("/add-amount", addAmountInWallet);
router.post("/verify-amount", verifyPaymentProcess);
export default router;
//# sourceMappingURL=payments.js.map