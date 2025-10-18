import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { addReview, getReviewsByMaid } from '../controllers/reviewController';
const router = express.Router();
router.use(authenticateToken);
const reviewValidation = [
    body('bookingId').isString().withMessage('bookingId required'),
    body('maidId').isString().withMessage('maidId required'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('rating between 1 and 5 required'),
    body('reviewMessage').optional().isString(),
];
router.post('/', reviewValidation, addReview);
router.get('/maid/:maidId', getReviewsByMaid);
export default router;
//# sourceMappingURL=reviews.js.map