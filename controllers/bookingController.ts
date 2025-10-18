import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
// import { startBookingTimer, extendBookingTimer } from '../socket/socketHandler';
// import { io } from '../server';

function generateBookingReference(): string {
  return 'ME-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
}

export const createBooking = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    // checked the booking date
    const currentDate = new Date();
    const selectedDate = new Date(req.body.bookingDate);

    // Remove time part from dates for comparison
    const today = new Date(currentDate.toDateString());
    const bookingDay = new Date(selectedDate.toDateString());

    if (bookingDay < today) {
      return res.status(400).json({
        success: false,
        message: "Booking date must be today or a future date"
      });
    }
    const { serviceId, addressId, bookingDate, startTime } = req.body;
    const userId = (req as any).user._id;
    let address = "";
    const user = await User.findById(userId).select("wallet_balance addresses")
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!addressId) {
      address = user?.addresses[0]?._id?.toString() ?? ""
    }
    // Check service price
    const service = await Service.findById(serviceId).select('duration total_amount base_price_per_hour');
    if (!service) {
      res.status(400).json({ success: false, message: 'Invalid service' });
      return;
    }
    // const totalAmount = service.base_price_per_hour * durationHours;
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
    if (!booking) return res.status(400).json({ success: false, message: "Something Went Wrong" })
    if ((user?.wallet_balance ?? 0) > (service?.total_amount ?? 0)) {
      user.wallet_balance = (user?.wallet_balance ?? 0) - (service?.total_amount ?? 0);
      await user.save();
    } else {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance", });
    }
    return res.status(201).json({ success: true, message: "Booking Created Successful", bookingId: booking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error creating booking' });
  }
};
export const getUserBookings = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user._id;

    // Fetch bookings for the logged-in user
    const bookings = await Booking.find({ user_id: userId })
      .populate('maid_id', 'name') // Populate maid_id with name field
      .populate('service_id', 'service_name') // Populate service_id with service_name field
      .select('_id booking_date pin start_time duration_hours total_amount status booking_reference address_id maid_id service_id')
      .sort({ booking_date: -1 });

    // Get user addresses once
    const user = await User.findById(userId).select('addresses');

    // Transform response
    const transformedBookings = bookings.map(booking => {
      const address = user?.addresses?.find(
        (addr: any) => addr._id.toString() === booking.address_id?.toString()
      );

      return {
        booking_id: booking._id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        duration_hours: booking.duration_hours,
        total_amount: booking.total_amount,
        status: booking.status,
        booking_reference: booking.booking_reference,
        maid_name: (booking as any).maid_id?.name || null,
        service_name: (booking as any).service_id?.service_name || null,
        address: address || null
      };
    });


    return res.status(200).json({ success: true, data: transformedBookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};
export const updateBookingStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user._id;

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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};
export const submitPinAndStartTimer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bookingId } = req.params;
    const { pin } = req.body;
    const maidId = (req as any).user._id;
    // const maidId = "68ef8c30db02de5211e63359";

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }
    const booking = await Booking.findOne({ _id: bookingId, maid_id: maidId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not assigned to this maid' });
    }
    if (booking.pin !== String(pin)) {
      return res.status(400).json({ success: false, message: 'Invalid PIN' });
    }
    const actualStartTime = new Date();
    const timerEndTime = new Date(actualStartTime.getTime() + (booking.duration_hours + booking.extend_time) * 60 * 60 * 1000);

    await Booking.findByIdAndUpdate(bookingId, {
      actual_start_time: actualStartTime,
      timer_end_time: timerEndTime,
      status: 'ongoing'
    });

    // Start the real-time timer
    // startBookingTimer(io, bookingId, timerEndTime);

    return res.json({ success: true, message: 'Timer started successfully', timerEndTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error starting timer' });
  }
};
export const extendBookingTime = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bookingId } = req.params;
    const { extendHours } = req.body;
    const userId = (req as any).user._id;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }
    const booking = await Booking.findOne({ _id: bookingId, user_id: userId, status: 'ongoing' });
    console.log(booking)
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

    // Extend the real-time timer
    // extendBookingTimer(io, bookingId, newTimerEndTime);

    return res.json({ success: true, message: 'Time extended successfully', newTimerEndTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error extending time' });
  }
};

// admin access api
export const getBookingsForAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    // Get all bookings with service and user basic info populated
    const bookings = await Booking.find({})
      .populate('service_id', 'service_name description base_price_per_hour')
      .populate('maid_id', 'name address phone skill')  // This is okay now
      .populate('user_id', 'fullName phone')  // This is okay now
      .select('_id user_id address_id booking_date start_time duration_hours total_amount status booking_reference')
      .sort({ booking_date: -1 });

    // Extract all unique user_ids from populated objects
    const userIds = [...new Set(
      bookings.map(b => {
        const uid = (b.user_id as any)?._id || b.user_id;
        return uid.toString();
      })
    )];

    // Fetch all users (with addresses)
    const users = await User.find({ _id: { $in: userIds } }).select('_id addresses');
    const userMap = new Map(users.map(u => [(u._id as mongoose.Types.ObjectId).toString(), u]));

    // Transform the bookings
    const transformedBookings = bookings.map(booking => {
      const userIdStr = ((booking.user_id as any)?._id || booking.user_id).toString();
      const user = userMap.get(userIdStr);

      const address = user?.addresses?.find(
        (addr: any) => addr._id.toString() === booking.address_id.toString()
      );

      return {
        booking_id: booking._id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        duration_hours: booking.duration_hours,
        total_amount: booking.total_amount,
        status: booking.status,
        booking_reference: booking.booking_reference,
        maid_name: (booking as any).maid_id?.name,
        maid_phone: (booking as any).maid_id?.phone,
        maid_skill: (booking as any).maid_id?.skill,
        maid_address: (booking as any).maid_id?.address,
        service_name: (booking as any).service_id?.service_name,
        service_description: (booking as any).service_id?.description,
        service_price: (booking as any).service_id?.base_price_per_hour,
        user_name: (booking as any).user_id?.fullName,
        user_phone: (booking as any).user_id?.phone,
        user_address: address || null
      };
    });

    return res.status(200).json({ success: true, data: transformedBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};
export const assignMaidToBooking = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bookingId } = req.params;
    const { status, maid_id } = req.body;
    if (!maid_id) return res.status(400).json({ success: false, message: "Maid is Required" })
    const validStatuses = ['confirmed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const booking = await Booking.findById({ _id: bookingId, });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Generate a 4-digit PIN for the booking
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const updateBooking = await Booking.findByIdAndUpdate(bookingId, { status, maid_id, pin }, { new: true });

    return res.json({ success: true, message: 'Booking status updated', updateBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};





