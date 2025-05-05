import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MeshAsset } from '../interfaces/Asset';

// Define the state type
export interface GeometryState {
  assets: Record<string, MeshAsset>;
  selectedAssetId: string | null;
}

// Identity matrix for new assets
const identityMatrix: number[] = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

// Define the initial state
const initialState: GeometryState = {
  assets: {},
  selectedAssetId: null,
};

// Create the slice
export const geometrySlice = createSlice({
  name: 'geometry',
  initialState,
  reducers: {
    // Add a new mesh asset, initialize its matrix, and select it
    addMeshAsset: (state, action: PayloadAction<{ id: string; name: string; buffer: ArrayBuffer }>) => {
      const { id, name, buffer } = action.payload;
      state.assets[id] = { id, name, buffer, matrix: identityMatrix };
      state.selectedAssetId = id;
    },
  },
});

// Export actions
export const { addMeshAsset } = geometrySlice.actions;

// Export reducer
export default geometrySlice.reducer;