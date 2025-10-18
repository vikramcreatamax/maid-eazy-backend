import mongoose, { Document, Schema } from 'mongoose';

export interface IMaidAvailability extends Document {
  maid_id: mongoose.Types.ObjectId;
  available_date: Date;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

const maidAvailabilitySchema: Schema = new Schema({
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
    // validate: {
    //   validator: function(v: string) {
    //     return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
    //   },
    //   message: 'Invalid time format'
    // }
  },
  end_time: {
    type: String,
    required: true,
    // validate: {
    //   validator: function(v: string) {
    //     return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
    //   },
    //   message: 'Invalid time format'
    // }
  },
  is_booked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'maid_availability'
});

export default mongoose.model<IMaidAvailability>('MaidAvailability', maidAvailabilitySchema);
