import { createSlice } from '@reduxjs/toolkit';

// Define the state type
export interface MapState {
  // Will be expanded in Phase 3
}

// Define the initial state
const initialState: MapState = {
  // Empty initial state
};

// Create the slice
export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    // Will be expanded in future steps
  },
});

// Export actions
export const {} = mapSlice.actions;

// Export reducer
export default mapSlice.reducer;