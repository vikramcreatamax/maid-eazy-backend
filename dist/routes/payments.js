import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { processPayment, getPaymentByBooking } from '../controllers/paymentController';
const router = express.Router();
router.use(authenticateToken);
router.post('/process', processPayment);
router.get('/booking/:bookingId', getPaymentByBooking);
export default router;
//# sourceMappingURL=payments.js.map