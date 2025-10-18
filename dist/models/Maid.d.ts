import mongoose, { Document } from 'mongoose';
export interface IMaid extends Document {
    name: string;
    email: string;
    phone: string;
    address: string;
    age: number;
    work_type: string;
    languages: string;
    skill: string;
    marital_status: string;
    experience_years: number;
    hourly_rate: number;
    rating: number;
    total_reviews: number;
    profile_image?: string;
    bio?: string;
    is_active: boolean;
}
declare const _default: mongoose.Model<IMaid, {}, {}, {}, mongoose.Document<unknown, {}, IMaid, {}, {}> & IMaid & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Maid.d.ts.map