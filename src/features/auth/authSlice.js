import { createSlice } from '@reduxjs/toolkit';

// Mock user data for demonstration
const mockUser = { id: '1', name: 'Sarah', email: 'sarah@example.com' };

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { email, password } = action.payload;
      // In a real app, you'd validate credentials with an API
      if (email === 'user@test.com' && password === 'password') {
        state.user = mockUser;
        state.token = 'fake-jwt-token';
        state.isAuthenticated = true;
        state.status = 'succeeded';
      } else {
        state.status = 'failed';
        state.error = 'Invalid credentials';
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { login, logout, clearError } = authSlice.actions;
export default authSlice.reducer;