import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  _id?: string;
  house?: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  profile_image?: string;
  role: 'user' | 'maid' | 'admin';
  last_login?: Date;
  wallet_balance?: number;
  pin?: number
  login_otp?: number;
  login_otp_expire?: Date;
  addresses: IAddress[];
}

const addressSchema = new Schema<IAddress>({
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

const userSchema: Schema = new Schema({
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
      validator: function (v: string) {
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

export default mongoose.model<IUser>('User', userSchema);
