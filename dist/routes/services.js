import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { getAllServices, getServiceById, createService, updateService, deleteService } from '../controllers/serviceController';
import { body } from 'express-validator';
const router = express.Router();
const serviceValidation = [
    body("service_name").notEmpty().withMessage("Service Name is Required"),
    body("description").notEmpty().withMessage("Description is Required"),
    body("duration").notEmpty().withMessage("Duration Name is Required"),
    body("base_price_per_hour").notEmpty().withMessage("base_price_per_hour Name is Required")
];
router.use(authenticateToken);
router.get('/', getAllServices);
router.get('/:serviceId', getServiceById);
router.post('/', requireAdmin, serviceValidation, createService);
router.patch('/:serviceId', requireAdmin, updateService);
router.delete('/:serviceId', requireAdmin, deleteService);
export default router;
//# sourceMappingURL=services.js.map