import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { getMaidAvailability, createAvailability, updateAvailability, deleteAvailability, getAllAvailability } from '../controllers/maidAvailabilityController.js';
const router = express.Router();
router.use(authenticateToken);
router.get('/maid/:maidId', getMaidAvailability);
router.post('/maid/:maidId', requireAdmin, createAvailability);
router.patch('/:availabilityId', requireAdmin, updateAvailability);
router.delete('/:availabilityId', requireAdmin, deleteAvailability);
router.get('/', requireAdmin, getAllAvailability);
export default router;
//# sourceMappingURL=maidAvailability.js.map