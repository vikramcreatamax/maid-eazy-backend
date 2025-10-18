import express from 'express';
import { body } from 'express-validator';
import { register, login, verifyOtp } from '../controllers/authController.js';
const router = express.Router();
const registerValidation = [
    body('fullName').isLength({ min: 2 }).withMessage('Full Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('phone').notEmpty().withMessage('Valid phone required')
];
const logiValidation = [
    body('phone').notEmpty().withMessage('Valid Phone required'),
];
router.post('/register', registerValidation, register);
router.post('/login', logiValidation, login);
router.post("/verify-otp", verifyOtp);
export default router;
//# sourceMappingURL=auth.js.map