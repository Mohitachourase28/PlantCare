import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { jwt as _jwt } from '../config/index.js';

const generateAccessToken = (userId) => {
  return sign(
    { userId },
    _jwt.secret,
    { expiresIn: _jwt.accessTokenExpiry }
  );
};

const generateRefreshToken = (userId) => {
  return sign(
    { userId },
    _jwt.refreshSecret,
    { expiresIn: _jwt.refreshTokenExpiry }
  );
};

const verifyAccessToken = (token) => {
  return verify(token, _jwt.secret);
};

const verifyRefreshToken = (token) => {
  return verify(token, _jwt.refreshSecret);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};  