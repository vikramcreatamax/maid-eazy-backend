// import { Service } from '../models/index';
import { Request, Response } from 'express';
import Service from '../models/Service.js';
import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';

// Get all active services
export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({ is_active: true })
      .select('_id service_name description base_price_per_hour');
    res.json({ success: true, data: services });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get service by ID
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const serviceId = req.params.serviceId;
    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    res.json({ success: true, data: service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new service (Admin only - would need admin middleware)
export const createService = async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { service_name, description, base_price_per_hour, duration } = req.body;
    const total_amount = await (base_price_per_hour * duration)
    const service = await Service.create({
      service_name,
      duration,
      total_amount,
      description: description || null,
      base_price_per_hour,
      is_active: true
    });

    return res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error creating service' });
  }
};

// Update service (Admin only)
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const serviceId = req.params.serviceId;
    const updates = req.body;

    const service = await Service.findByIdAndUpdate(serviceId, updates, { new: true });
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.json({ success: true, data: service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating service' });
  }
};

// Delete service (Admin only - soft delete by setting is_active to false)
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const serviceId = req.params.serviceId;

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { is_active: false },
      { new: true }
    );

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.json({ success: true, message: 'Service deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting service' });
  }
};

export const viewAllServices = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("calleddd.d")
    const services = await Service.find()
      .select('_id service_name description base_price_per_hour total_amount is_active');
console.log("calledd..",services)
    if (services.length === 0) {
      return res.status(404).json({ success: false, message: "Services Not Found" });
    }

    // ✅ Count bookings for each service
    const servicesWithCount = await Promise.all(
      services.map(async (service) => {
        const bookingCount = await Booking.countDocuments({ service_id: service._id });
        return {
          ...service.toObject(),
          bookingCount
        };
      })
    );
    return res.status(200).json({ success: true, data: servicesWithCount});
  } catch (error) {
    console.error("Error in viewAllServices:", error);
    return res.status(500).json({ success: false, message: 'Internal Server error' });
  }
};
