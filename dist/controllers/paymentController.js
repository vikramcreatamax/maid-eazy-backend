import Payment from '../models/Payment';
export const processPayment = async (req, res) => {
    const { bookingId, amount, paymentMethod, transactionId, paymentGateway } = req.body;
    try {
        await Payment.create({
            booking_id: bookingId,
            amount,
            payment_method: paymentMethod,
            transaction_id: transactionId,
            payment_gateway: paymentGateway,
            payment_status: 'completed'
        });
        res.json({ success: true, message: 'Payment recorded' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Payment processing error' });
    }
};
export const getPaymentByBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const payment = await Payment.findOne({ booking_id: bookingId });
        if (!payment) {
            res.status(404).json({ success: false, message: 'Payment not found' });
            return;
        }
        res.json({ success: true, data: payment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
//# sourceMappingURL=paymentController.js.map