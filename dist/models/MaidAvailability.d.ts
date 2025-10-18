import mongoose, { Document } from 'mongoose';
export interface IMaidAvailability extends Document {
    maid_id: mongoose.Types.ObjectId;
    available_date: Date;
    start_time: string;
    end_time: string;
    is_booked: boolean;
}
declare const _default: mongoose.Model<IMaidAvailability, {}, {}, {}, mongoose.Document<unknown, {}, IMaidAvailability, {}, {}> & IMaidAvailability & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=MaidAvailability.d.ts.map