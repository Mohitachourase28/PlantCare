import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import userReducer from '../features/user/userSlice';
// import diseaseReducer from '../features/disease/diseaseSlice.js';
import detectionReducer from '../features/detection/detectionSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    // disease: diseaseReducer,
    detection: detectionReducer,
  },
});