import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RingSpec, ElementSpec, MandalaState } from '../interfaces/Mandala';

// Define the state type
export interface MandalaState {
  // Will be expanded in Phase 4
}

// Define the initial state
const initialState: MandalaState = {
  rings: [],
  elements: []
};

// Create the slice
export const mandalaSlice = createSlice({
  name: 'mandala',
  initialState,
  reducers: {
    addRing: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      state.rings.push({ id, symmetry: 6 });
      // When adding ring, ensure no stale elements
      // Elements will be added separately
    },
    removeRing: (state, action: PayloadAction<{ id: string }>) => {
      state.rings = state.rings.filter(r => r.id !== action.payload.id);
      // Remove any elements belonging to this ring
      state.elements = state.elements.filter(e => e.ringId !== action.payload.id);
    },
    setRingSymmetry: (state, action: PayloadAction<{ id: string; symmetry: number }>) => {
      const ring = state.rings.find(r => r.id === action.payload.id);
      if (ring) ring.symmetry = action.payload.symmetry;
    },
    // Add an element to a ring at given angle
    addElement: (state, action: PayloadAction<ElementSpec>) => {
      state.elements.push(action.payload);
    },
    // Remove an element
    removeElement: (state, action: PayloadAction<{ id: string }>) => {
      state.elements = state.elements.filter(e => e.id !== action.payload.id);
    }
  },
});

// Export actions
export const { addRing, removeRing, setRingSymmetry, addElement, removeElement } = mandalaSlice.actions;

// Export reducer
export default mandalaSlice.reducer;