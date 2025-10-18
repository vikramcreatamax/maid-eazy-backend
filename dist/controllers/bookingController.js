import { validationResult } from 'express-validator';
import Service from '../models/Service';
import Booking from '../models/Booking';
import User from '../models/User';
import { startBookingTimer, extendBookingTimer } from '../server';
function generateBookingReference() {
    return 'ME-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
}
export const createBooking = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { serviceId, addressId, bookingDate, startTime } = req.body;
        const userId = req.user._id;
        let address = "";
        if (!addressId) {
            const user = await User.findById(userId).select("addresses");
            address = user?.addresses[0]?._id?.toString() ?? "";
        }
        const service = await Service.findById(serviceId).select('duration total_amount base_price_per_hour');
        if (!service) {
            res.status(400).json({ success: false, message: 'Invalid service' });
            return;
        }
        const bookingReference = generateBookingReference();
        const booking = await Booking.create({
            user_id: userId,
            service_id: serviceId,
            address_id: addressId || address,
            booking_date: bookingDate,
            start_time: startTime,
            duration_hours: service?.duration,
            total_amount: service?.total_amount,
            status: 'pending',
            booking_reference: bookingReference
        });
        return res.status(201).json({ success: true, message: "Booking Created Successful", bookingId: booking });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error creating booking' });
    }
};
export const getUserBookings = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookings = await Booking.find({ user_id: userId })
            .populate('maid_id', 'name')
            .populate('service_id', 'service_name')
            .select('_id booking_date start_time duration_hours total_amount status booking_reference address_id maid_id service_id')
            .sort({ booking_date: -1 });
        const user = await User.findById(userId).select('addresses');
        const transformedBookings = bookings.map(booking => {
            const address = user?.addresses?.find((addr) => addr._id.toString() === booking.address_id?.toString());
            return {
                booking_id: booking._id,
                booking_date: booking.booking_date,
                start_time: booking.start_time,
                duration_hours: booking.duration_hours,
                total_amount: booking.total_amount,
                status: booking.status,
                booking_reference: booking.booking_reference,
                maid_name: booking.maid_id?.name || null,
                service_name: booking.service_id?.service_name || null,
                address: address || null
            };
        });
        return res.status(200).json({ success: true, data: transformedBookings });
    }
    catch (error) {
        console.error("Error fetching user bookings:", error);
        return res.status(500).json({ success: false, message: 'Server error fetching bookings' });
    }
};
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const userId = req.user._id;
        const validStatuses = ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const booking = await Booking.findOne({ _id: bookingId, user_id: userId });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        await Booking.findByIdAndUpdate(bookingId, { status });
        return res.status(200).json({ success: true, message: 'Booking status updated' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error updating status' });
    }
};
export const getBookingsForAdmin = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('service_id', 'service_name description base_price_per_hour')
            .populate('maid_id', 'name address phone skill')
            .populate('user_id', 'fullName phone')
            .select('_id user_id address_id booking_date start_time duration_hours total_amount status booking_reference')
            .sort({ booking_date: -1 });
        const userIds = [...new Set(bookings.map(b => {
                const uid = b.user_id?._id || b.user_id;
                return uid.toString();
            }))];
        const users = await User.find({ _id: { $in: userIds } }).select('_id addresses');
        const userMap = new Map(users.map(u => [u._id.toString(), u]));
        const transformedBookings = bookings.map(booking => {
            const userIdStr = (booking.user_id?._id || booking.user_id).toString();
            const user = userMap.get(userIdStr);
            const address = user?.addresses?.find((addr) => addr._id.toString() === booking.address_id.toString());
            return {
                booking_id: booking._id,
                booking_date: booking.booking_date,
                start_time: booking.start_time,
                duration_hours: booking.duration_hours,
                total_amount: booking.total_amount,
                status: booking.status,
                booking_reference: booking.booking_reference,
                maid_name: booking.maid_id?.name,
                maid_phone: booking.maid_id?.phone,
                maid_skill: booking.maid_id?.skill,
                maid_address: booking.maid_id?.address,
                service_name: booking.service_id?.service_name,
                service_description: booking.service_id?.description,
                service_price: booking.service_id?.base_price_per_hour,
                user_name: booking.user_id?.fullName,
                user_phone: booking.user_id?.phone,
                user_address: address || null
            };
        });
        return res.status(200).json({ success: true, data: transformedBookings });
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching bookings' });
    }
};
export const assignMaidToBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, maid_id } = req.body;
        if (!maid_id)
            return res.status(400).json({ success: false, message: "Maid is Required" });
        const validStatuses = ['confirmed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const booking = await Booking.findById({ _id: bookingId, });
        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking not found' });
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const updateBooking = await Booking.findByIdAndUpdate(bookingId, { status, maid_id, pin }, { new: true });
        return res.json({ success: true, message: 'Booking status updated', updateBooking });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating status' });
    }
};
export const submitPinAndStartTimer = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { pin } = req.body;
        const maidId = req.user._id;
        if (!bookingId) {
            return res.status(400).json({ success: false, message: 'Booking ID is required' });
        }
        const booking = await Booking.findOne({ _id: bookingId, maid_id: maidId });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found or not assigned to this maid' });
        }
        if (booking.pin !== pin) {
            return res.status(400).json({ success: false, message: 'Invalid PIN' });
        }
        const actualStartTime = new Date();
        const timerEndTime = new Date(actualStartTime.getTime() + (booking.duration_hours + booking.extend_time) * 60 * 60 * 1000);
        await Booking.findByIdAndUpdate(bookingId, {
            actual_start_time: actualStartTime,
            timer_end_time: timerEndTime,
            status: 'ongoing'
        });
        startBookingTimer(bookingId, timerEndTime);
        return res.json({ success: true, message: 'Timer started successfully', timerEndTime });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error starting timer' });
    }
};
export const extendBookingTime = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { extendHours } = req.body;
        const userId = req.user._id;
        if (!bookingId) {
            return res.status(400).json({ success: false, message: 'Booking ID is required' });
        }
        const booking = await Booking.findOne({ _id: bookingId, user_id: userId, status: 'ongoing' });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found or not ongoing' });
        }
        if (!booking.timer_end_time) {
            return res.status(400).json({ success: false, message: 'Timer not started yet' });
        }
        const newExtendTime = booking.extend_time + extendHours;
        const newTimerEndTime = new Date(booking.timer_end_time.getTime() + extendHours * 60 * 60 * 1000);
        await Booking.findByIdAndUpdate(bookingId, {
            extend_time: newExtendTime,
            timer_end_time: newTimerEndTime
        });
        extendBookingTimer(bookingId, newTimerEndTime);
        return res.json({ success: true, message: 'Time extended successfully', newTimerEndTime });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error extending time' });
    }
};
//# sourceMappingURL=bookingController.js.map