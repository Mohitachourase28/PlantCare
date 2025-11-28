import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  totalScans: 124,
  plantsMonitored: 45,
  activeTreatments: 3,
  treatmentSuccessRate: 92,
  diseaseDistribution: [
    { name: 'Leaf Spot', value: 45, color: '#8884d8' },
    { name: 'Pest Damage', value: 30, color: '#82ca9d' },
    { name: 'Nutrient Deficiency', value: 25, color: '#ffc658' },
  ],
  recentScans: [
    { id: 1, date: '2023-11-25', plant: 'Monstera Deliciosa', disease: 'Leaf Spot', status: 'Treatment Needed' },
    { id: 2, date: '2023-11-24', plant: 'Snake Plant', disease: 'Healthy', status: 'No Action' },
    { id: 3, date: '2023-11-22', plant: 'Pothos', disease: 'Root Rot', status: 'Treatment in Progress' },
  ],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // You can add actions to update this data later
    // e.g., addNewScan: (state, action) => { ... }
  },
});

export default userSlice.reducer;