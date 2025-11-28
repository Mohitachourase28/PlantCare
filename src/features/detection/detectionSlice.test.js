// import reducer, { detectDisease } from './detectionSlice';
// import { configureStore } from '@reduxjs/toolkit';
// import api from '../../api';

// jest.mock('../../api');

// test('detectDisease success flow', async () => {
//   const fakeResponse = { data: { diagnosis: 'Leaf Spot', confidence: 0.92 } };
//   api.post.mockResolvedValueOnce(fakeResponse);

//   const store = configureStore({ reducer: { detection: reducer } });
//   await store.dispatch(detectDisease(new FormData()));
//   const state = store.getState().detection;
//   expect(state.loading).toBe(false);
//   expect(state.result.diagnosis).toBe('Leaf Spot');
// });
