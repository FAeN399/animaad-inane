import { describe, it, expect, vi } from 'vitest';
import mapReducer, { setHexElevation, updateHexElevation, MapState } from './mapSlice';
import { configureStore } from '@reduxjs/toolkit';
import undoableReducer from './undoableSlice';
import { undoableMiddleware } from './undoableMiddleware';

describe('mapSlice elevation features', () => {
  const initialState: MapState = { 
    hexes: {
      '0,0': { q: 0, r: 0, terrain: 'grass' },
      '1,0': { q: 1, r: 0, terrain: 'water' }
    } 
  };

  it('should handle setHexElevation', () => {
    const action = setHexElevation({ q: 0, r: 0, elevation: 3 });
    const state = mapReducer(initialState, action);
    
    expect(state.hexes['0,0'].elevation).toBe(3);
    expect(state.hexes['1,0'].elevation).toBeUndefined(); // Other hex unchanged
  });

  it('should ignore setHexElevation for non-existent hex', () => {
    const action = setHexElevation({ q: 99, r: 99, elevation: 3 });
    const state = mapReducer(initialState, action);
    
    // State should be unchanged
    expect(state).toEqual(initialState);
  });

  it('should handle updateHexElevation thunk with undo/redo', () => {
    // Create a mock store with the undoableMiddleware
    const store = configureStore({
      reducer: {
        map: mapReducer,
        undoable: undoableReducer
      },
      middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(undoableMiddleware),
      preloadedState: {
        map: initialState,
        undoable: { past: [], future: [] }
      }
    });

    // Mock dispatch and getState
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      map: initialState
    });

    // Call the thunk directly
    updateHexElevation(0, 0, 5)(dispatch, getState);

    // Check that dispatch was called with the correct action
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: setHexElevation.type,
      payload: { q: 0, r: 0, elevation: 5 },
      meta: expect.objectContaining({
        undoable: expect.objectContaining({
          undo: expect.objectContaining({
            type: setHexElevation.type,
            payload: expect.objectContaining({ 
              q: 0, 
              r: 0, 
              elevation: expect.any(Number) 
            })
          }),
          redo: expect.objectContaining({
            type: setHexElevation.type,
            payload: { q: 0, r: 0, elevation: 5 }
          })
        })
      })
    }));
  });

  it('should handle updateHexElevation for non-existent hex', () => {
    // Mock dispatch and getState
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      map: initialState
    });

    // Call the thunk for a non-existent hex
    updateHexElevation(99, 99, 5)(dispatch, getState);

    // Check that dispatch was called with the correct action
    // The undo action should set elevation to 0 since the hex doesn't exist
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      meta: expect.objectContaining({
        undoable: expect.objectContaining({
          undo: expect.objectContaining({
            payload: expect.objectContaining({ 
              elevation: 0 
            })
          })
        })
      })
    }));
  });
});
