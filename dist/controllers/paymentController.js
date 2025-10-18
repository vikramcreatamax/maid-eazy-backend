import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from "crypto";
export const processPayment = async (req, res) => {
    const userId = req.user?._id;
    const { bookingId, amount, paymentMethod, transactionId, paymentGateway } = req.body;
    try {
        console.log(userId);
        const user = await User.findById(userId);
        if (!user)
            return res.status(400).json({ success: false, message: "Unauthorized User" });
        const payment = await Payment.create({
            booking_id: bookingId || undefined,
            user_id: userId,
            amount,
            payment_method: paymentMethod,
            transaction_id: transactionId,
            payment_gateway: paymentGateway,
            payment_status: 'completed'
        });
        if (!payment)
            return res.status(400).json({ success: false, message: "something went wrong" });
        user.wallet_balance = amount;
        await user.save();
        return res.status(200).json({ success: true, message: 'Payment recorded' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Payment processing error' });
    }
};
export const getPaymentByUser = async (req, res) => {
    try {
        const userId = req.user?._id;
        const payment = await Payment.findOne({ user_id: userId });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        return res.status(200).json({ success: true, data: payment });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const getPaymentByBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const payment = await Payment.findOne({ booking_id: bookingId });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        return res.status(200).json({ success: true, data: payment });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const addAmountInWallet = async (req, res) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });
        const options = req.body;
        const order = await razorpay.orders.create(options);
        if (!order)
            return res.status(500).json({ error: "Failed to create order" });
        return res.status(200).json({ success: true, order });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
export const verifyPaymentProcess = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id && !razorpay_payment_id && !razorpay_signature) {
            return res.status(400).json({ success: false, message: "payment,order id and signature required" });
        }
        const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = sha.digest("hex");
        if (digest !== razorpay_signature) {
            return res.status(400).json({ msg: "Transaction is not legit!" });
        }
        console.log(req.body);
        return res.status(200).json({ msg: "success", orderId: razorpay_order_id, paymentId: razorpay_payment_id, });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
//# sourceMappingURL=paymentController.js.map