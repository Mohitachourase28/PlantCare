import dotenv from 'dotenv';
import { corsOptions } from './cors.js';

dotenv.config();

export const port = process.env.PORT || 4000;
export const mongodb = {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/plant-disease-api'
};
export const jwt = {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
};
export const cloudinary = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
};
export const gemini = {
    apiKey: process.env.GEMINI_API_KEY
};
export const cors = corsOptions;