import mongoose, { Schema } from 'mongoose';
const addressSchema = new Schema({
    house: {
        type: String,
        required: true
    },
    apartment: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
        maxlength: 100
    },
    state: {
        type: String,
        maxlength: 100
    },
    pincode: {
        type: String,
        required: true,
        maxlength: 10
    },
    landmark: {
        type: String,
        maxlength: 255,
        default: null
    },
    latitude: {
        type: Number,
        min: -90,
        max: 90,
        default: null
    },
    longitude: {
        type: Number,
        min: -180,
        max: 180,
        default: null
    },
    is_default: {
        type: Boolean,
        default: false
    }
}, {
    _id: true,
    timestamps: true
});
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Invalid email format'
        }
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        maxlength: 15
    },
    profile_image: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'maid', 'admin'],
        default: 'user'
    },
    last_login: {
        type: Date
    },
    login_otp: {
        type: Number
    },
    login_otp_expire: {
        type: Date
    },
    wallet_balance: {
        type: Number,
        default: 0
    },
    pin: {
        type: Number
    },
    addresses: [addressSchema]
}, {
    timestamps: true,
    collection: 'users'
});
export default mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map