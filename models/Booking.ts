import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  user_id: mongoose.Types.ObjectId;
  maid_id: mongoose.Types.ObjectId;
  service_id: mongoose.Types.ObjectId;
  address_id: string;
  booking_date: Date;
  start_time: string;
  extend_time: number;
  duration_hours: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  booking_reference: string;
  pin: string;
  actual_start_time: Date;
  timer_end_time: Date;
}

const bookingSchema: Schema = new Schema({
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
      validator: function (v: string) {
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

export default mongoose.model<IBooking>('Booking', bookingSchema);
