import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import {
  getAllMaids,
  getMaidById,
  getAvailability,
  createMaid,
  updateMaid,
  deleteMaid,
  getBookingsByMaid
} from '../controllers/maidController.js';

const router = express.Router();

// All maid routes require authentication
router.use(authenticateToken);

// Public routes (authenticated users can view maids)
router.get('/', getAllMaids);
router.get('/:maidId', getMaidById);
router.get('/:maidId/availability', getAvailability);

// Admin only routes
router.post('/', requireAdmin, createMaid);
router.patch('/:maidId', requireAdmin, updateMaid);
router.delete('/:maidId', requireAdmin, deleteMaid);

// Get Booking by Maid
router.get("/bookings/:maidId",getBookingsByMaid)

export default router;
