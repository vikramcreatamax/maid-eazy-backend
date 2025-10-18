import mongoose, { Schema } from 'mongoose';
const paymentSchema = new Schema({
    booking_id: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    payment_method: {
        type: String,
        required: true,
        maxlength: 50
    },
    transaction_id: {
        type: String,
        required: true,
        unique: true,
        maxlength: 100
    },
    payment_gateway: {
        type: String,
        required: true,
        maxlength: 50
    },
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    payment_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'payments'
});
export default mongoose.model('Payment', paymentSchema);
//# sourceMappingURL=Payment.js.map