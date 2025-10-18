import mongoose, { Schema } from 'mongoose';
const bookingSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    maid_id: {
        type: Schema.Types.ObjectId,
        ref: 'Maid',
    },
    service_id: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    address_id: {
        type: String,
        required: true
    },
    booking_date: {
        type: Date,
        required: true
    },
    start_time: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Invalid time format'
        }
    },
    extend_time: {
        type: Number,
        default: 0
    },
    duration_hours: {
        type: Number,
        min: 0.5,
        max: 12
    },
    total_amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
        default: 'pending'
    },
    booking_reference: {
        type: String,
        required: true,
        unique: true,
        maxlength: 50
    },
    pin: {
        type: String,
        maxlength: 6
    },
    actual_start_time: {
        type: Date
    },
    timer_end_time: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'bookings'
});
export default mongoose.model('Booking', bookingSchema);
//# sourceMappingURL=Booking.js.map