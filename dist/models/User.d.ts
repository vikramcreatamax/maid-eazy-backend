import mongoose, { Document } from 'mongoose';
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
    pin?: number;
    login_otp?: number;
    login_otp_expire?: Date;
    addresses: IAddress[];
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map