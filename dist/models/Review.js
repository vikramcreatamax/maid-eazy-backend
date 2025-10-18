import mongoose, { Schema } from 'mongoose';
const reviewSchema = new Schema({
    booking_id: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    maid_id: {
        type: Schema.Types.ObjectId,
        ref: 'Maid',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review_message: {
        type: String,
        default: null
    },
    images: [{
            type: String
        }],
    is_anonymous: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: 'reviews'
});
export default mongoose.model('Review', reviewSchema);
//# sourceMappingURL=Review.js.map