import Maid from '../models/Maid.js';
import MaidAvailability from '../models/MaidAvailability.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
export const getAllMaids = async (req, res) => {
    try {
        const maids = await Maid.find({ is_active: true })
            .select('_id name experience_years hourly_rate work_type address phone languages skill rating total_reviews profile_image');
        res.json({ success: true, data: maids });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const getMaidById = async (req, res) => {
    try {
        const maidId = req.params.maidId;
        const maid = await Maid.findById(maidId);
        if (!maid) {
            res.status(404).json({ success: false, message: 'Maid not found' });
            return;
        }
        res.json({ success: true, data: maid });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const getAvailability = async (req, res) => {
    try {
        const maidId = req.params.maidId;
        const availability = await MaidAvailability.find({ maid_id: maidId })
            .select('available_date start_time end_time is_booked')
            .sort({ available_date: 1 });
        res.json({ success: true, data: availability });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const createMaid = async (req, res, next) => {
    try {
        const maid = await Maid.create(req.body);
        if (!maid)
            return res.status(400).json({ success: true, message: "Bad Request" });
        return res.status(201).json({ success: true, data: maid });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error creating maid' });
    }
};
export const updateMaid = async (req, res) => {
    try {
        const maidId = req.params.maidId;
        const updates = req.body;
        const maid = await Maid.findByIdAndUpdate(maidId, updates, { new: true });
        if (!maid) {
            res.status(404).json({ success: false, message: 'Maid not found' });
            return;
        }
        res.json({ success: true, data: maid });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating maid' });
    }
};
export const deleteMaid = async (req, res) => {
    try {
        const maidId = req.params.maidId;
        const maid = await Maid.findByIdAndUpdate(maidId, { is_active: false }, { new: true });
        if (!maid) {
            res.status(404).json({ success: false, message: 'Maid not found' });
            return;
        }
        res.json({ success: true, message: 'Maid deactivated successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error deleting maid' });
    }
};
export const getBookingsByMaid = async (req, res) => {
    try {
        const bookings = await Booking.find({ maid_id: req.params.maidId })
            .populate('service_id', 'service_name description base_price_per_hour')
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
                service_name: booking.service_id?.service_name,
                service_description: booking.service_id?.description,
                service_price: booking.service_id?.base_price_per_hour,
                user_name: booking.user_id?.fullName,
                user_phone: booking.user_id?.phone,
                user_address: address || null
            };
        });
        res.json({ success: true, data: transformedBookings });
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching bookings' });
    }
};
//# sourceMappingURL=maidController.js.map