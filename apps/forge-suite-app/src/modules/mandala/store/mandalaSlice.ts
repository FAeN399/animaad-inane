import { createSlice } from '@reduxjs/toolkit';

// Define the state type
export interface MandalaState {
  // Will be expanded in Phase 4
}

// Define the initial state
const initialState: MandalaState = {
  // Empty initial state
};

// Create the slice
export const mandalaSlice = createSlice({
  name: 'mandala',
  initialState,
  reducers: {
    // Will be expanded in future steps
  },
});

// Export actions
export const {} = mandalaSlice.actions;

// Export reducer
export default mandalaSlice.reducer;