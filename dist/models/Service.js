import mongoose, { Schema } from 'mongoose';
const serviceSchema = new Schema({
    service_name: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        default: null
    },
    duration: {
        type: Number
    },
    base_price_per_hour: {
        type: Number,
        required: true,
        min: 0
    },
    total_amount: {
        type: Number,
        min: 0
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'services'
});
export default mongoose.model('Service', serviceSchema);
//# sourceMappingURL=Service.js.map