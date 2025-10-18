import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { processPayment, getPaymentByBooking, getPaymentByUser, addAmountInWallet, verifyPaymentProcess } from '../controllers/paymentController';

const router = express.Router();

router.use(authenticateToken);

// Process payment for booking
router.post('/process', processPayment);

// Get payment transaction by booking id
router.get('/booking/:bookingId', getPaymentByBooking);
router.get('/', getPaymentByUser);

// Add Amount In User Wallet
router.post("/add-amount",addAmountInWallet)
router.post("/verify-amount",verifyPaymentProcess)

export default router;
