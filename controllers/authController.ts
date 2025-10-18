import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { RequestHandler } from 'express';

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '24h' });
};

export const register: RequestHandler = async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { fullName, email, phone, house, apartment, landmark, city, pincode } = req.body;

    // Check user existence
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ success: false, message: 'User exists' });
    const address = { house, apartment, landmark, city, pincode,is_default:true }
    req.body.addresses = await address;
    const user = await User.create(req.body);

    const token = generateToken((user._id as string).toString());
    res.status(201).json({ success: true, message: "Register Successful", token, user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login: RequestHandler = async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // const valid = await bcrypt.compare(password, user.password);
    // if (!valid) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const loginOTP = Math.floor(1000 + Math.random() * 9000);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    // save otp 
    user.login_otp = loginOTP
    user.login_otp_expire = otpExpiry
    user.save()
    const token = generateToken((user._id as string).toString());
    res.json({ success: true, message: "otp sent successful", loginOTP, token, user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyOtp: RequestHandler = async (req: any, res: any, next) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone: phone })
    if (!user) return res.status(400).josn({ success: true, message: "Invalid Phone Number" })

    if (String(user.login_otp) !== String(otp) || new Date() > new Date(user.login_otp_expire!)) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    user.login_otp = undefined as any;
    user.login_otp_expire = undefined as any
    user.last_login = new Date();
    await user.save()
    const token = generateToken((user._id as string).toString());
    res.json({ success: true, message: "login successful", user: user, token });

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Internal Server Error", success: false })
  }
}