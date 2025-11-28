import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// Async thunk that uploads an image and gets detection result from backend:
export const detectDisease = createAsyncThunk(
  'detection/detectDisease',
  async (predictRoutes, { rejectWithValue }) => {
    try {
      // backend endpoint on port 5000
      const response = await api.post('/predict', predictRoutes, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data; // expected: { diagnosis: ..., confidence: ..., treatment: ... }
    } catch (err) {
      // normalize error
      const message = err.response?.data?.message || err.message || 'Server error';
      return rejectWithValue(message);
    }
  }
);

const detectionSlice = createSlice({
  name: 'detection',
  initialState: {
    result: null,
    loading: false,
    error: null,
    history: [], // saved scans
  },
  reducers: {
    clearDetection(state) {
      state.result = null;
      state.error = null;
      state.loading = false;
    },
    addToHistory(state, action) {
      state.history.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(detectDisease.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(detectDisease.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(detectDisease.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to detect';
      });
  }
});

export const { clearDetection, addToHistory } = detectionSlice.actions;
export default detectionSlice.reducer;
