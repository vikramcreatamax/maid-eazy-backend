// import { User } from '../models/index.js';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
import User from '../models/User';
import cloudinary from '../middleware/cloudinary';

interface MulterFile extends Express.Multer.File {
  buffer: Buffer;
}

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId).select('_id name email phone profile_image');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const file = req.file as MulterFile;
  if (file) {
    // ✅ Upload single image to Cloudinary
    const imageUrl: string = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "maideazy" },
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result.secure_url);
          reject(new Error("Upload failed"));
        }
      );
      uploadStream.end(file.buffer);
    });
    req.body.profile_image = imageUrl;
    // return res.status(400).json({ success: false, message: "No image uploaded" });
  }
  const userId = (req as any).user._id;
  const data = req.body;
  try {
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No data to update' });
    }
    const updatedProfile = await User.findByIdAndUpdate(userId, req.body, { new: true });
    return res.json({ success: true, message: 'Profile updated', User: updatedProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Add address
export const addAddress = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  const userId = (req as any).user._id;
  const { house, apartment, city, state, pincode, landmark, latitude, longitude, is_default } = req.body;

  try {
    if (is_default) {
      // Update other addresses to false
      await User.updateMany(
        { _id: userId, 'addresses.is_default': true }, { $set: { 'addresses.$[].is_default': false } })
    }

    const addressData = {
      house,
      apartment: apartment,
      city,
      state,
      pincode,
      landmark: landmark,
      latitude: latitude,
      longitude: longitude,
      is_default: !!is_default
    };

    const user = await User.findByIdAndUpdate(userId, { $push: { addresses: addressData } }, { new: true });

    const newAddress = user?.addresses[user.addresses.length - 1];
    return res.status(201).json({ success: true, message: "Address Save Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get addresses
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId).select('addresses');
    res.json({ success: true, data: user?.addresses || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update address
export const updateAddress = async (req: Request, res: Response): Promise<any> => {
  const userId = (req as any).user._id;
  const { addressId } = req.params;
  const data = req.body;

  try {
    // If new address is set as default → reset other defaults
    if (data.is_default) {
      await User.updateMany(
        { _id: userId, 'addresses.is_default': true },
        { $set: { 'addresses.$[].is_default': false } }
      );
    }
    // Build $set object dynamically
    const updateFields: any = {};
    for (const key in data) {
      updateFields[`addresses.$.${key}`] = data[key];
    }
    await User.updateOne({ _id: userId, 'addresses._id': addressId }, { $set: updateFields });
    return res.json({ success: true, message: 'Address updated' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete address
export const deleteAddress = async (req: Request, res: Response): Promise<any> => {
  const userId = (req as any).user._id;
  const { addressId } = req.params;
  try {
    await User.updateOne({ _id: userId }, { $pull: { addresses: { _id: addressId } } });
    return res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
