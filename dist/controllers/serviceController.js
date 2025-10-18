import Service from '../models/Service';
import { validationResult } from 'express-validator';
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find({ is_active: true })
            .select('_id service_name description base_price_per_hour');
        res.json({ success: true, data: services });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const getServiceById = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await Service.findById(serviceId);
        if (!service) {
            res.status(404).json({ success: false, message: 'Service not found' });
            return;
        }
        res.json({ success: true, data: service });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const createService = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, errors: errors.array() });
        const { service_name, description, base_price_per_hour, duration } = req.body;
        const total_amount = await (base_price_per_hour * duration);
        const service = await Service.create({
            service_name,
            duration,
            total_amount,
            description: description || null,
            base_price_per_hour,
            is_active: true
        });
        return res.status(201).json({ success: true, data: service });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error creating service' });
    }
};
export const updateService = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const updates = req.body;
        const service = await Service.findByIdAndUpdate(serviceId, updates, { new: true });
        if (!service) {
            res.status(404).json({ success: false, message: 'Service not found' });
            return;
        }
        res.json({ success: true, data: service });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating service' });
    }
};
export const deleteService = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await Service.findByIdAndUpdate(serviceId, { is_active: false }, { new: true });
        if (!service) {
            res.status(404).json({ success: false, message: 'Service not found' });
            return;
        }
        res.json({ success: true, message: 'Service deactivated successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error deleting service' });
    }
};
//# sourceMappingURL=serviceController.js.map