import express from 'express';
import multer from "multer"
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { getProfile, updateProfile, addAddress, getAddresses, updateAddress, deleteAddress } from '../controllers/userController.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authenticateToken);

const profileValidation = [
  body('fullName').optional().isLength({ min: 2 }).withMessage('Full Name min 2 chars'),
  body('phone').optional().notEmpty().withMessage('Valid phone required'),
  body('email').optional().notEmpty().withMessage('Valid email required'),
]
const addressValidation = [
  body('house').notEmpty().withMessage('House required'),
  body('apartment').notEmpty().withMessage('Apartment required'),
  body('landmark').notEmpty().withMessage('Landmark required'),
  body('city').notEmpty().withMessage('City required'),
  // body('state').notEmpty().withMessage('State required'),
  body('pincode').notEmpty().withMessage('Pincode required'),
]

// Get user profile
router.get('/profile', getProfile);
// Update user profile
// router.patch('/profile', profileValidation, updateProfile);
router.patch('/profile', profileValidation, upload.single("file"), updateProfile);


// Add new address
router.post('/addresses', addressValidation,addAddress);
// Get all addresses
router.get('/addresses', getAddresses);
// Update address
router.patch('/addresses/:addressId', updateAddress);
// Delete address
router.delete('/addresses/:addressId', deleteAddress);

export default router;
