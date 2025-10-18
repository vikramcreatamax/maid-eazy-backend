import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  viewAllServices
} from '../controllers/serviceController';
import { body } from 'express-validator';

const router = express.Router();

const serviceValidation = [
  body("service_name").notEmpty().withMessage("Service Name is Required"),
  body("description").notEmpty().withMessage("Description is Required"),
  body("duration").notEmpty().withMessage("Duration Name is Required"),
  body("base_price_per_hour").notEmpty().withMessage("base_price_per_hour Name is Required")
]

// All service routes require authentication
router.use(authenticateToken);

// Public routes (authenticated users can view services)
router.get('/', getAllServices);
router.get('/view-services', requireAdmin, viewAllServices);
router.get('/:serviceId', getServiceById);

// Admin only routes
router.post('/', requireAdmin, serviceValidation, createService);
router.patch('/:serviceId', requireAdmin, updateService);
router.delete('/:serviceId', requireAdmin, deleteService);

export default router;