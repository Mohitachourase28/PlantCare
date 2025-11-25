import { createUser, authenticateUser, refreshTokens, getUserById } from '../services/authService';
const logger = require('pino')();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const { user, tokens } = await createUser({ name, email, password });
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(201).json({
      user,
      accessToken: tokens.accessToken
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({
      error: {
        code: 'REGISTRATION_ERROR',
        message: error.message
      }
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { user, tokens } = await authenticateUser(email, password);
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({
      user,
      accessToken: tokens.accessToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({
      error: {
        code: 'LOGIN_ERROR',
        message: error.message
      }
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    // Try to get refresh token from cookie first
    let refreshToken = req.cookies.refreshToken;
    
    // Fallback to request body
    if (!refreshToken && req.body.refreshToken) {
      refreshToken = req.body.refreshToken;
    }
    
    if (!refreshToken) {
      return res.status(401).json({
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required'
        }
      });
    }
    
    const { user, tokens } = await refreshTokens(refreshToken);
    
    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({
      user,
      accessToken: tokens.accessToken
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      error: {
        code: 'REFRESH_ERROR',
        message: error.message
      }
    });
  }
};

const logout = (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');
  
  res.json({
    message: 'Logged out successfully'
  });
};

const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user._id);
    
    res.json({
      user
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(404).json({
      error: {
        code: 'USER_NOT_FOUND',
        message: error.message
      }
    });
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};