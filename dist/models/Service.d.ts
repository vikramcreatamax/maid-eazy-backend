import mongoose, { Document } from 'mongoose';
export interface IService extends Document {
    service_name: string;
    description?: string;
    duration?: number;
    base_price_per_hour: number;
    total_amount: number;
    is_active: boolean;
}
declare const _default: mongoose.Model<IService, {}, {}, {}, mongoose.Document<unknown, {}, IService> & IService & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Service.d.ts.map