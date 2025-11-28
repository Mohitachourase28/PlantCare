import { uploader } from '../config/cloudinary.js';
const logger = require('pino')();

const uploadImage = async (buffer) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = uploader.upload_stream(
        {
          folder: 'plant-disease',
          resource_type: 'image',
          format: 'webp',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url
            });
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    logger.error('Cloudinary service error:', error);
    throw error;
  }
};

const deleteImage = async (publicId) => {
  try {
    const result = await uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};

export default {
  uploadImage,
  deleteImage
};