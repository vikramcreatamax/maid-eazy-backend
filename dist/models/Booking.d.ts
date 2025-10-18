import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking> & IBooking & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Booking.d.ts.map