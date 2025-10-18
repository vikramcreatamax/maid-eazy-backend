import express from 'express';
import { body } from 'express-validator';
import { assignMaidToBooking, createBooking, getBookingsForAdmin, getUserBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

router.use(authenticateToken);

const bookingValidation = [
  // body('maidId').isString().withMessage('Valid maidId required'),
  body('serviceId').isString().withMessage('Valid serviceId required'),
  // body('addressId').isString().withMessage('Valid addressId required'),
  body('bookingDate').notEmpty().isISO8601().toDate().withMessage('Valid date required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time required'),
  // body('durationHours').isFloat({ min: 0.5, max: 12 }).withMessage('Duration valid between 0.5 and 12 hrs')
]

router.post('/', bookingValidation, createBooking);
router.get('/', getUserBookings);
router.patch('/:bookingId/status', updateBookingStatus);
// router.post('/:bookingId/submit-pin', submitPinAndStartTimer);
// router.post('/:bookingId/extend-time', extendBookingTime);
// Admin only routes
router.get('/all-booking', requireAdmin, getBookingsForAdmin);
router.put("/:bookingId", requireAdmin, assignMaidToBooking)

export default router;
