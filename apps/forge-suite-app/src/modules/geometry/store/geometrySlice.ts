// New geometry slice under modules/geometry
import { createSlice } from '@reduxjs/toolkit';

export interface GeometryState {
  // expanded in Step 1.1
}

const initialState: GeometryState = {
  // empty initial state
};

export const geometrySlice = createSlice({
  name: 'geometry',
  initialState,
  reducers: {
    // reducers to be added
  },
});

export const {} = geometrySlice.actions;
export default geometrySlice.reducer;