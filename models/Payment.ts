import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  booking_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_gateway: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: Date;
}

const paymentSchema: Schema = new Schema({
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

export default mongoose.model<IPayment>('Payment', paymentSchema);
