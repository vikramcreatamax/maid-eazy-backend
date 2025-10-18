import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { getProfile, updateProfile, addAddress, getAddresses, updateAddress, deleteAddress } from '../controllers/userController';
const router = express.Router();
router.use(authenticateToken);
const profileValidation = [
    body('fullName').optional().isLength({ min: 2 }).withMessage('Full Name min 2 chars'),
    body('phone').optional().notEmpty().withMessage('Valid phone required'),
    body('email').optional().notEmpty().withMessage('Valid email required'),
];
const addressValidation = [
    body('house').notEmpty().withMessage('House required'),
    body('apartment').notEmpty().withMessage('Apartment required'),
    body('landmark').notEmpty().withMessage('Landmark required'),
    body('city').notEmpty().withMessage('City required'),
    body('pincode').notEmpty().withMessage('Pincode required'),
];
router.get('/profile', getProfile);
router.patch('/profile', profileValidation, updateProfile);
router.post('/addresses', addressValidation, addAddress);
router.get('/addresses', getAddresses);
router.patch('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
export default router;
//# sourceMappingURL=users.js.map