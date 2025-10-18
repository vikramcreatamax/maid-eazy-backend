import MaidAvailability from '../models/MaidAvailability';
export const getMaidAvailability = async (req, res) => {
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
export const createAvailability = async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error creating availability' });
    }
};
export const updateAvailability = async (req, res) => {
    try {
        const { availabilityId } = req.params;
        const updates = req.body;
        const availability = await MaidAvailability.findByIdAndUpdate(availabilityId, updates, { new: true });
        if (!availability) {
            res.status(404).json({ success: false, message: 'Availability not found' });
            return;
        }
        res.json({ success: true, data: availability });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating availability' });
    }
};
export const deleteAvailability = async (req, res) => {
    try {
        const { availabilityId } = req.params;
        const availability = await MaidAvailability.findByIdAndDelete(availabilityId);
        if (!availability) {
            res.status(404).json({ success: false, message: 'Availability not found' });
            return;
        }
        res.json({ success: true, message: 'Availability deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error deleting availability' });
    }
};
export const getAllAvailability = async (req, res) => {
    try {
        const availability = await MaidAvailability.find()
            .populate('maid_id', 'name email phone age skill languages work_type experience_years')
            .select('available_date start_time end_time is_booked maid_id')
            .sort({ available_date: 1 });
        res.json({ success: true, data: availability });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
//# sourceMappingURL=maidAvailabilityController.js.map