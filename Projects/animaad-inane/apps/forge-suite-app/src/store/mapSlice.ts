import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HexData } from '../interfaces/MapData';
import type { RootState, AppDispatch } from './store';

// Define the state type
export interface MapState {
  hexes: Record<string, HexData>;
}

// Define the initial state
const initialState: MapState = {
  hexes: {}
};

// Create the slice
export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setHexData: (state, action: PayloadAction<HexData>) => {
      const { q, r } = action.payload;
      const key = `${q},${r}`;
      state.hexes[key] = action.payload;
    },
    // Remove a hex by coordinates
    removeHexData: (state, action: PayloadAction<{ q: number; r: number }>) => {
      const { q, r } = action.payload;
      const key = `${q},${r}`;
      delete state.hexes[key];
    },
    // Update elevation of a hex
    setHexElevation: (state, action: PayloadAction<{ q: number; r: number; elevation: number }>) => {
      const { q, r, elevation } = action.payload;
      const key = `${q},${r}`;
      if (state.hexes[key]) {
        state.hexes[key].elevation = elevation;
      }
    }
  },
});

// Export actions
export const { setHexData, removeHexData, setHexElevation } = mapSlice.actions;

// Thunk for painting hex with undo/redo
export const updateHexData = (q: number, r: number, terrain: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const key = `${q},${r}`;
    const prev = getState().map.hexes[key];
    dispatch({
      type: setHexData.type,
      payload: { q, r, terrain },
      meta: {
        undoable: {
          undo: prev
            ? { type: setHexData.type, payload: prev }
            : { type: removeHexData.type, payload: { q, r } },
          redo: { type: setHexData.type, payload: { q, r, terrain } }
        }
      }
    });
  };

// Thunk for elevation editing with undo/redo
export const updateHexElevation = (q: number, r: number, elevation: number) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const key = `${q},${r}`;
    const prev = getState().map.hexes[key]?.elevation;
    dispatch({
      type: setHexElevation.type,
      payload: { q, r, elevation },
      meta: {
        undoable: {
          undo: prev !== undefined
            ? { type: setHexElevation.type, payload: { q, r, elevation: prev } }
            : { type: setHexElevation.type, payload: { q, r, elevation: 0 } },
          redo: { type: setHexElevation.type, payload: { q, r, elevation } }
        }
      }
    });
  };

// Export reducer
export default mapSlice.reducer;