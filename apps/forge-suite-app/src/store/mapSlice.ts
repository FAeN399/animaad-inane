import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HexData } from '../interfaces/MapData';
import type { RootState, AppDispatch } from './store';

// Define view mode type
export type ViewMode = '2d' | '3d';

// Define the state type
export interface MapState {
  hexes: Record<string, HexData>;
  viewMode: ViewMode;
}

// Define the initial state
const initialState: MapState = {
  hexes: {},
  viewMode: '2d'
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
    },
    // Add an overlay to a hex
    addHexOverlay: (state, action: PayloadAction<{ q: number; r: number; overlay: string }>) => {
      const { q, r, overlay } = action.payload;
      const key = `${q},${r}`;
      if (state.hexes[key]) {
        // Initialize overlays array if it doesn't exist
        if (!state.hexes[key].overlays) {
          state.hexes[key].overlays = [];
        }

        // Check if we've reached the stack limit (16)
        if (state.hexes[key].overlays!.length < 16) {
          // Only add if not already present
          if (!state.hexes[key].overlays!.includes(overlay)) {
            state.hexes[key].overlays!.push(overlay);
          }
        }
      }
    },
    // Remove an overlay from a hex
    removeHexOverlay: (state, action: PayloadAction<{ q: number; r: number; overlay: string }>) => {
      const { q, r, overlay } = action.payload;
      const key = `${q},${r}`;
      if (state.hexes[key] && state.hexes[key].overlays) {
        state.hexes[key].overlays = state.hexes[key].overlays!.filter(o => o !== overlay);

        // Clean up empty arrays
        if (state.hexes[key].overlays!.length === 0) {
          delete state.hexes[key].overlays;
        }
      }
    },
    // Clear all overlays from a hex
    clearHexOverlays: (state, action: PayloadAction<{ q: number; r: number }>) => {
      const { q, r } = action.payload;
      const key = `${q},${r}`;
      if (state.hexes[key]) {
        delete state.hexes[key].overlays;
      }
    },
    // Toggle or set the view mode
    setViewMode: (state, action: PayloadAction<ViewMode | undefined>) => {
      // If no mode is provided, toggle between 2d and 3d
      if (action.payload === undefined) {
        state.viewMode = state.viewMode === '2d' ? '3d' : '2d';
      } else {
        // Otherwise set to the specified mode
        state.viewMode = action.payload;
      }
    }
  },
  extraReducers: builder => {
    builder.addCase('RESET_STATE', () => initialState);
  }
});

// Export actions
export const {
  setHexData,
  removeHexData,
  setHexElevation,
  addHexOverlay,
  removeHexOverlay,
  clearHexOverlays,
  setViewMode
} = mapSlice.actions;

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

// Thunk for adding an overlay with undo/redo
export const updateHexOverlay = (q: number, r: number, overlay: string, add: boolean = true) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const key = `${q},${r}`;
    const hex = getState().map.hexes[key];

    // Skip if hex doesn't exist
    if (!hex) return;

    // Check if overlay already exists
    const hasOverlay = hex.overlays?.includes(overlay) || false;

    // Skip if trying to add an overlay that already exists or remove one that doesn't
    if ((add && hasOverlay) || (!add && !hasOverlay)) return;

    // Check stack limit when adding
    if (add && hex.overlays && hex.overlays.length >= 16) return;

    if (add) {
      dispatch({
        type: addHexOverlay.type,
        payload: { q, r, overlay },
        meta: {
          undoable: {
            undo: {
              type: removeHexOverlay.type,
              payload: { q, r, overlay }
            },
            redo: {
              type: addHexOverlay.type,
              payload: { q, r, overlay }
            }
          }
        }
      });
    } else {
      dispatch({
        type: removeHexOverlay.type,
        payload: { q, r, overlay },
        meta: {
          undoable: {
            undo: {
              type: addHexOverlay.type,
              payload: { q, r, overlay }
            },
            redo: {
              type: removeHexOverlay.type,
              payload: { q, r, overlay }
            }
          }
        }
      });
    }
  };

// Thunk for clearing all overlays with undo/redo
export const clearHexOverlaysUndoable = (q: number, r: number) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const key = `${q},${r}`;
    const hex = getState().map.hexes[key];

    // Skip if hex doesn't exist or has no overlays
    if (!hex || !hex.overlays || hex.overlays.length === 0) return;

    // Save current overlays for undo
    const currentOverlays = [...hex.overlays];

    dispatch({
      type: clearHexOverlays.type,
      payload: { q, r },
      meta: {
        undoable: {
          undo: {
            type: 'RESTORE_HEX_OVERLAYS',
            payload: { q, r, overlays: currentOverlays }
          },
          redo: {
            type: clearHexOverlays.type,
            payload: { q, r }
          }
        }
      }
    });
  };

// Helper function to restore overlays (used by undoableMiddleware)
export const restoreHexOverlays = (q: number, r: number, overlays: string[]) =>
  (dispatch: AppDispatch) => {
    // First clear any existing overlays
    dispatch(clearHexOverlays({ q, r }));

    // Then add each overlay
    overlays.forEach(overlay => {
      dispatch(addHexOverlay({ q, r, overlay }));
    });
  };

// Export reducer
export default mapSlice.reducer;