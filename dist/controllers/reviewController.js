import { validationResult } from 'express-validator';
import Review from '../models/Review';
import Maid from '../models/Maid';
import mongoose from 'mongoose';
export const addReview = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { bookingId, maidId, rating, reviewMessage, isAnonymous } = req.body;
    const userId = req.user._id;
    try {
        const existingReview = await Review.findOne({ booking_id: bookingId, maid_id: maidId, user_id: userId });
        if (existingReview)
            return res.status(400).json({
                success: false,
                message: "You have already submitted a review for this booking and maid."
            });
        await Review.create({
            booking_id: bookingId,
            user_id: userId,
            maid_id: maidId,
            rating,
            review_message: reviewMessage || null,
            is_anonymous: !!isAnonymous
        });
        const stats = await Review.aggregate([
            { $match: { maid_id: new mongoose.Types.ObjectId(maidId) } },
            {
                $group: {
                    _id: null,
                    avg_rating: { $avg: "$rating" },
                    total_reviews: { $sum: 1 }
                }
            }
        ]);
        if (stats.length > 0) {
            const { avg_rating, total_reviews } = stats[0];
            await Maid.findByIdAndUpdate(maidId, {
                rating: Number(avg_rating.toFixed(2)), total_reviews
            });
        }
        return res.status(201).json({ success: true, message: "Review submitted successfully." });
    }
    catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
export const getReviewsByMaid = async (req, res) => {
    try {
        const maidId = req.params.maidId;
        const reviews = await Review.find({ maid_id: maidId })
            .populate('user_id', 'fullName')
            .select('rating review_message created_at is_anonymous')
            .sort({ created_at: -1 });
        const transformedReviews = reviews.map(review => ({
            rating: review.rating,
            review_message: review.review_message,
            created_at: review.created_at,
            user_name: review.is_anonymous ? 'Anonymous' : (review.user?.name),
            is_anonymous: review.is_anonymous
        }));
        res.json({ success: true, data: transformedReviews });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
//# sourceMappingURL=reviewController.js.map