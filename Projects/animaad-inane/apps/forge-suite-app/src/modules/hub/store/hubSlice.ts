import { createSlice } from '@reduxjs/toolkit';

// Define the state type
export interface HubState {
  // Will be expanded in future phases
}

// Define the initial state
const initialState: HubState = {
  // Empty initial state
};

// Create the slice
export const hubSlice = createSlice({
  name: 'hub',
  initialState,
  reducers: {
    // Will be expanded in future steps
  },
});

// Export actions
export const {} = hubSlice.actions;

// Export reducer
export default hubSlice.reducer;