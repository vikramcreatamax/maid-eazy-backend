import mongoose, { Schema } from 'mongoose';
const maidSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        maxlength: 15
    },
    address: {
        type: String
    },
    age: {
        type: Number
    },
    work_type: {
        type: String
    },
    languages: {
        type: String
    },
    skill: {
        type: String
    },
    marital_status: {
        type: String
    },
    experience_years: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    hourly_rate: {
        type: Number,
        required: true,
        min: 0
    },
    rating: {
        type: Number,
        default: 0.00,
        min: 0,
        max: 5
    },
    total_reviews: {
        type: Number,
        default: 0,
        min: 0
    },
    profile_image: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'maids'
});
export default mongoose.model('Maid', maidSchema);
//# sourceMappingURL=Maid.js.map