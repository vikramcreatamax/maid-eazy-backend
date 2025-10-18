import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
import Review from '../models/Review';
import Maid from '../models/Maid';
import mongoose from 'mongoose';
import cloudinary from '../middleware/cloudinary';

interface MulterFile extends Express.Multer.File {
  buffer: Buffer;
}

export const addReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const files = req.files as MulterFile[] | undefined;

    if (files && files.length > 0) {
      // ✅ Upload images to Cloudinary
      const uploadedImages = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "maideazy" },
                (error, result) => {
                  if (error) return reject(error);
                  if (result) return resolve(result.secure_url);
                  reject(new Error("Upload failed"));
                }
              );
              uploadStream.end(file.buffer);
            })
        )
      );
      req.body.images = uploadedImages;
    }
    const { bookingId, maidId, rating, reviewMessage, isAnonymous } = req.body;
    const userId = (req as any).user._id;

    // Check if the user already submitted a review for this maid & booking
    const existingReview = await Review.findOne({ booking_id: bookingId, maid_id: maidId, user_id: userId });
    if (existingReview) return res.status(400).json({
      success: false,
      message: "You have already submitted a review for this booking and maid."
    });

    // Create the review
    await Review.create({
      booking_id: bookingId,
      user_id: userId,
      maid_id: maidId,
      rating,
      review_message: reviewMessage || null,
      images: req.body.images || [],
      is_anonymous: !!isAnonymous
    });
    // Recalculate maid overall rating & total_reviews
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
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getReviewsByMaid = async (req: Request, res: Response) => {
  try {
    const maidId = req.params.maidId;
    const reviews = await Review.find({ maid_id: maidId })
      .populate('user_id', 'fullName')
      .select('rating review_message created_at is_anonymous')
      .sort({ created_at: -1 });

    // Transform the data to match the expected format
    const transformedReviews = reviews.map(review => ({
      rating: review.rating,
      review_message: review.review_message,
      created_at: (review as any).created_at,
      user_name: review.is_anonymous ? 'Anonymous' : ((review as any).user?.name),
      is_anonymous: review.is_anonymous
    }));

    res.json({ success: true, data: transformedReviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
