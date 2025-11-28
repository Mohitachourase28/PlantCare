import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  diseases: [
    { id: 1, name: 'Powdery Mildew', plant: 'Various', description: 'A fungal disease...', severity: 'Moderate' },
    { id: 2, name: 'Black Spot', plant: 'Roses', description: 'A common fungal disease...', severity: 'High' },
    { id: 3, name: 'Root Rot', plant: 'Various', description: 'A condition caused by over watering...', severity: 'Severe' },
    { id: 4, name: 'Leaf Spot', plant: 'Monstera', description: 'Caused by fungi or bacteria...', severity: 'Moderate' },
    { id: 5, name: 'Rust', plant: 'Fuchsia', description: 'A fungal disease...', severity: 'Moderate' },
    { id: 6, name: 'Anthracnose', plant: 'Various', description: 'A group of diseases...', severity: 'High' },
  ],
};

const diseaseSlice = createSlice({
  name: 'disease',
  initialState,
  reducers: {
    // Actions to filter or search diseases can go here
  },
});

export default diseaseSlice.reducer;