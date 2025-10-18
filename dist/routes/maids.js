import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { getAllMaids, getMaidById, getAvailability, createMaid, updateMaid, deleteMaid, getBookingsByMaid } from '../controllers/maidController.js';
const router = express.Router();
router.use(authenticateToken);
router.get('/', getAllMaids);
router.get('/:maidId', getMaidById);
router.get('/:maidId/availability', getAvailability);
router.post('/', requireAdmin, createMaid);
router.patch('/:maidId', requireAdmin, updateMaid);
router.delete('/:maidId', requireAdmin, deleteMaid);
router.get("/bookings/:maidId", getBookingsByMaid);
export default router;
//# sourceMappingURL=maids.js.map