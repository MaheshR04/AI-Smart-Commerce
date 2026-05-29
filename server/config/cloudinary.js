import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Uploads a local file to Cloudinary and deletes the local temporary file afterwards.
 * @param {string} localFilePath - Path to the local file
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<object>} Cloudinary upload response object
 */
export const uploadToCloudinary = async (localFilePath, folder = 'ai_smart_commerce') => {
  try {
    if (!localFilePath) return null;

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud_name') {
      console.warn('Cloudinary not configured. Mocking image upload.');
      // Return a simulated mock response
      return {
        secure_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
        public_id: 'mock_public_id',
      };
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'auto',
    });

    // Delete local temp file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error('Cloudinary upload failure:', error);
    // Cleanup local file on failure
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * @param {string} publicId - Cloudinary resource public ID
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId || publicId === 'mock_public_id') return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete failure:', error);
  }
};

export default cloudinary;
