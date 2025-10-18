import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment> & IPayment & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Payment.d.ts.map