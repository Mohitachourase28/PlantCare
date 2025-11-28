import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import User, { findById, findOne, findByIdAndUpdate } from '../models/User.js';
import Admin, { findOne as _findOne } from '../models/Admin.js';
const logger = require('pino')();

const generateTokens = async (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  
  return { accessToken, refreshToken };
};

const refreshTokens = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user from database
    const user = await findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate new tokens
    const tokens = await generateTokens(user._id);
    
    return { user, tokens };
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw new Error('Invalid refresh token');
  }
};

const createUser = async (userData) => {
  const { name, email, password } = userData;
  
  // Check if user already exists
  const existingUser = await findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Create new user
  const user = new User({
    name,
    email,
    passwordHash: password // Will be hashed by the pre-save hook
  });
  
  await user.save();
  
  // Generate tokens
  const tokens = await generateTokens(user._id);
  
  return { user, tokens };
};

const authenticateUser = async (email, password) => {
  // Find user by email
  const user = await findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }
  
  // Generate tokens
  const tokens = await generateTokens(user._id);
  
  return { user, tokens };
};

const getUserById = async (userId) => {
  const user = await findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

const createAdmin = async (userId, isSuperAdmin = false) => {
  // Check if admin already exists
  const existingAdmin = await _findOne({ userId });
  if (existingAdmin) {
    throw new Error('Admin already exists for this user');
  }
  
  // Create admin
  const admin = new Admin({
    userId,
    is_super_admin: isSuperAdmin
  });
  
  await admin.save();
  
  // Update user role
  await findByIdAndUpdate(userId, { role: 'admin' });
  
  return admin;
};

export default {
  generateTokens,
  refreshTokens,
  createUser,
  authenticateUser,
  getUserById,
  createAdmin
};