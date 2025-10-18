import mongoose, { Document } from 'mongoose';
export interface IReview extends Document {
    booking_id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    maid_id: mongoose.Types.ObjectId;
    rating: number;
    review_message?: string;
    images?: String[];
    is_anonymous: boolean;
}
declare const _default: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Review.d.ts.map