import { Request, Response } from 'express';
import MaidAvailability from '../models/MaidAvailability';

// Get availability for a specific maid
export const getMaidAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const maidId = req.params.maidId;
    const availability = await MaidAvailability.find({ maid_id: maidId })
      .select('available_date start_time end_time is_booked')
      .sort({ available_date: 1 });
    res.json({ success: true, data: availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create availability slot for a maid (Maid/Admin only)
export const createAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { maidId } = req.params;
    const { available_date, start_time, end_time } = req.body;
    const availability = await MaidAvailability.create({
      maid_id: maidId,
      available_date,
      start_time,
      end_time,
      is_booked: false
    });

    res.status(201).json({ success: true, data: availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating availability' });
  }
};

// Update availability slot (Maid/Admin only)
export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { availabilityId } = req.params;
    const updates = req.body;

    const availability = await MaidAvailability.findByIdAndUpdate(availabilityId, updates, { new: true });
    if (!availability) {
      res.status(404).json({ success: false, message: 'Availability not found' });
      return;
    }

    res.json({ success: true, data: availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating availability' });
  }
};

// Delete availability slot (Maid/Admin only)
export const deleteAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { availabilityId } = req.params;

    const availability = await MaidAvailability.findByIdAndDelete(availabilityId);
    if (!availability) {
      res.status(404).json({ success: false, message: 'Availability not found' });
      return;
    }

    res.json({ success: true, message: 'Availability deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting availability' });
  }
};

// Get all availability slots (Admin only)
export const getAllAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const availability = await MaidAvailability.find()
      .populate('maid_id', 'name email phone age skill languages work_type experience_years')
      .select('available_date start_time end_time is_booked maid_id')
      .sort({ available_date: 1 });
    res.json({ success: true, data: availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};