import mongoose, { Schema } from 'mongoose';
const maidAvailabilitySchema = new Schema({
    maid_id: {
        type: Schema.Types.ObjectId,
        ref: 'Maid',
        required: true
    },
    available_date: {
        type: Date,
        required: true
    },
    start_time: {
        type: String,
        required: true,
    },
    end_time: {
        type: String,
        required: true,
    },
    is_booked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: 'maid_availability'
});
export default mongoose.model('MaidAvailability', maidAvailabilitySchema);
//# sourceMappingURL=MaidAvailability.js.map