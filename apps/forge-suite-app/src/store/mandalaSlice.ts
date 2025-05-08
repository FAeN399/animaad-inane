import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RingSpec, ElementSpec, MandalaState, RingStyle } from '../interfaces/Mandala';
import { AppDispatch, RootState } from './store';

// Default ring style
export const defaultRingStyle: RingStyle = {
  color: '#ff5500',
  strokeWidth: 2,
  opacity: 1.0
};

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
      state.rings.push({
        id,
        symmetry: 6,
        style: { ...defaultRingStyle }
      });
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
    },
    // Update ring style
    updateRingStyle: (state, action: PayloadAction<{ id: string; style: Partial<RingStyle> }>) => {
      const ring = state.rings.find(r => r.id === action.payload.id);
      if (ring) {
        ring.style = { ...ring.style, ...action.payload.style };
      }
    },
    // Update element style override
    updateElementStyle: (state, action: PayloadAction<{ id: string; style: Partial<RingStyle> | null }>) => {
      const element = state.elements.find(e => e.id === action.payload.id);
      if (element) {
        if (action.payload.style === null) {
          // Remove style override
          delete element.styleOverride;
        } else {
          // Apply style override
          element.styleOverride = {
            ...(element.styleOverride || state.rings.find(r => r.id === element.ringId)?.style || defaultRingStyle),
            ...action.payload.style
          };
        }
      }
    },
    // Internal action for undoable operations
    _internalUpdateRingStyle: (state, action: PayloadAction<{
      id: string;
      newStyle: RingStyle;
      previousStyle: RingStyle;
    }>) => {
      const ring = state.rings.find(r => r.id === action.payload.id);
      if (ring) {
        ring.style = action.payload.newStyle;
      }
    }
  },
});

// Thunk for undoable ring style updates
export const updateRingStyleUndoable = (id: string, style: Partial<RingStyle>) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const ring = state.mandala.rings.find(r => r.id === id);

    if (ring) {
      const previousStyle = { ...ring.style };
      const newStyle = { ...previousStyle, ...style };

      dispatch({
        type: '_internalUpdateRingStyle',
        payload: { id, newStyle, previousStyle },
        meta: {
          undoable: {
            undo: {
              type: '_internalUpdateRingStyle',
              payload: { id, newStyle: previousStyle, previousStyle: newStyle }
            }
          }
        }
      });
    }
  };

// Make addRing undoable
export const addRingUndoable = (id: string) =>
  (dispatch: AppDispatch) => {
    dispatch(addRing({ id }));

    dispatch({
      type: 'RECORD_UNDOABLE',
      meta: {
        undoable: {
          undo: {
            type: 'removeRing',
            payload: { id }
          },
          redo: {
            type: 'addRing',
            payload: { id }
          }
        }
      }
    });
  };

// Make removeRing undoable
export const removeRingUndoable = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const ring = state.mandala.rings.find(r => r.id === id);
    const elementsToRemove = state.mandala.elements.filter(e => e.ringId === id);

    if (ring) {
      dispatch(removeRing({ id }));

      dispatch({
        type: 'RECORD_UNDOABLE',
        meta: {
          undoable: {
            undo: {
              type: 'RESTORE_RING_AND_ELEMENTS',
              payload: { ring, elements: elementsToRemove }
            },
            redo: {
              type: 'removeRing',
              payload: { id }
            }
          }
        }
      });
    }
  };

// Make setRingSymmetry undoable
export const setRingSymmetryUndoable = (id: string, symmetry: number) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const ring = state.mandala.rings.find(r => r.id === id);

    if (ring) {
      const previousSymmetry = ring.symmetry;

      dispatch(setRingSymmetry({ id, symmetry }));

      dispatch({
        type: 'RECORD_UNDOABLE',
        meta: {
          undoable: {
            undo: {
              type: 'setRingSymmetry',
              payload: { id, symmetry: previousSymmetry }
            },
            redo: {
              type: 'setRingSymmetry',
              payload: { id, symmetry }
            }
          }
        }
      });
    }
  };

// Make addElement undoable
export const addElementUndoable = (element: ElementSpec) =>
  (dispatch: AppDispatch) => {
    dispatch(addElement(element));

    dispatch({
      type: 'RECORD_UNDOABLE',
      meta: {
        undoable: {
          undo: {
            type: 'removeElement',
            payload: { id: element.id }
          },
          redo: {
            type: 'addElement',
            payload: element
          }
        }
      }
    });
  };

// Make removeElement undoable
export const removeElementUndoable = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const element = state.mandala.elements.find(e => e.id === id);

    if (element) {
      dispatch(removeElement({ id }));

      dispatch({
        type: 'RECORD_UNDOABLE',
        meta: {
          undoable: {
            undo: {
              type: 'addElement',
              payload: element
            },
            redo: {
              type: 'removeElement',
              payload: { id }
            }
          }
        }
      });
    }
  };

// Add a special reducer for restoring a ring and its elements
export const restoreRingAndElements = (ring: RingSpec, elements: ElementSpec[]) =>
  (dispatch: AppDispatch) => {
    // First add the ring
    dispatch(addRing({ id: ring.id }));

    // Then update its properties
    dispatch(setRingSymmetry({ id: ring.id, symmetry: ring.symmetry }));
    dispatch(updateRingStyle({ id: ring.id, style: ring.style }));

    // Finally add all elements
    elements.forEach(element => {
      dispatch(addElement(element));
    });
  };

// Export actions
export const {
  addRing,
  removeRing,
  setRingSymmetry,
  addElement,
  removeElement,
  updateRingStyle,
  updateElementStyle,
  _internalUpdateRingStyle
} = mandalaSlice.actions;

// Export reducer
export default mandalaSlice.reducer;