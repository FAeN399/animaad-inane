import { describe, it, expect, vi } from 'vitest';
import mapReducer, { 
  addHexOverlay, 
  removeHexOverlay, 
  clearHexOverlays,
  updateHexOverlay,
  clearHexOverlaysUndoable,
  MapState 
} from './mapSlice';
import { configureStore } from '@reduxjs/toolkit';
import undoableReducer from './undoableSlice';
import { undoableMiddleware } from './undoableMiddleware';

describe('mapSlice overlay features', () => {
  const initialState: MapState = { 
    hexes: {
      '0,0': { q: 0, r: 0, terrain: 'grass' },
      '1,0': { q: 1, r: 0, terrain: 'water', overlays: ['tree'] }
    } 
  };

  it('should handle addHexOverlay', () => {
    const action = addHexOverlay({ q: 0, r: 0, overlay: 'tree' });
    const state = mapReducer(initialState, action);
    
    expect(state.hexes['0,0'].overlays).toEqual(['tree']);
    expect(state.hexes['1,0'].overlays).toEqual(['tree']); // Unchanged
  });

  it('should not add duplicate overlays', () => {
    const action = addHexOverlay({ q: 1, r: 0, overlay: 'tree' });
    const state = mapReducer(initialState, action);
    
    expect(state.hexes['1,0'].overlays).toEqual(['tree']); // Still just one tree
  });

  it('should enforce the stack limit of 16 overlays', () => {
    let state = { ...initialState };
    
    // Add 16 different overlays
    for (let i = 0; i < 16; i++) {
      const action = addHexOverlay({ q: 0, r: 0, overlay: `overlay${i}` });
      state = mapReducer(state, action);
    }
    
    expect(state.hexes['0,0'].overlays?.length).toBe(16);
    
    // Try to add one more
    const action = addHexOverlay({ q: 0, r: 0, overlay: 'one_too_many' });
    state = mapReducer(state, action);
    
    // Should still be 16
    expect(state.hexes['0,0'].overlays?.length).toBe(16);
    expect(state.hexes['0,0'].overlays).not.toContain('one_too_many');
  });

  it('should handle removeHexOverlay', () => {
    const action = removeHexOverlay({ q: 1, r: 0, overlay: 'tree' });
    const state = mapReducer(initialState, action);
    
    expect(state.hexes['1,0'].overlays).toBeUndefined();
  });

  it('should handle clearHexOverlays', () => {
    // First add multiple overlays
    let state = mapReducer(
      initialState, 
      addHexOverlay({ q: 0, r: 0, overlay: 'tree' })
    );
    state = mapReducer(
      state, 
      addHexOverlay({ q: 0, r: 0, overlay: 'rock' })
    );
    
    // Then clear them
    state = mapReducer(
      state, 
      clearHexOverlays({ q: 0, r: 0 })
    );
    
    expect(state.hexes['0,0'].overlays).toBeUndefined();
  });

  it('should handle updateHexOverlay thunk with add=true', () => {
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

    // Call the thunk directly to add an overlay
    updateHexOverlay(0, 0, 'house', true)(dispatch, getState);

    // Check that dispatch was called with the correct action
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: addHexOverlay.type,
      payload: { q: 0, r: 0, overlay: 'house' },
      meta: expect.objectContaining({
        undoable: expect.objectContaining({
          undo: expect.objectContaining({
            type: removeHexOverlay.type,
            payload: { q: 0, r: 0, overlay: 'house' }
          }),
          redo: expect.objectContaining({
            type: addHexOverlay.type,
            payload: { q: 0, r: 0, overlay: 'house' }
          })
        })
      })
    }));
  });

  it('should handle updateHexOverlay thunk with add=false', () => {
    // Mock dispatch and getState
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      map: initialState
    });

    // Call the thunk directly to remove an overlay
    updateHexOverlay(1, 0, 'tree', false)(dispatch, getState);

    // Check that dispatch was called with the correct action
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: removeHexOverlay.type,
      payload: { q: 1, r: 0, overlay: 'tree' },
      meta: expect.objectContaining({
        undoable: expect.objectContaining({
          undo: expect.objectContaining({
            type: addHexOverlay.type,
            payload: { q: 1, r: 0, overlay: 'tree' }
          }),
          redo: expect.objectContaining({
            type: removeHexOverlay.type,
            payload: { q: 1, r: 0, overlay: 'tree' }
          })
        })
      })
    }));
  });

  it('should handle clearHexOverlaysUndoable thunk', () => {
    // Mock dispatch and getState with multiple overlays
    const stateWithOverlays = {
      map: {
        hexes: {
          '0,0': { 
            q: 0, 
            r: 0, 
            terrain: 'grass', 
            overlays: ['tree', 'rock', 'house'] 
          }
        }
      }
    };
    
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue(stateWithOverlays);

    // Call the thunk directly
    clearHexOverlaysUndoable(0, 0)(dispatch, getState);

    // Check that dispatch was called with the correct action
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: clearHexOverlays.type,
      payload: { q: 0, r: 0 },
      meta: expect.objectContaining({
        undoable: expect.objectContaining({
          undo: expect.objectContaining({
            type: 'RESTORE_HEX_OVERLAYS',
            payload: expect.objectContaining({ 
              q: 0, 
              r: 0, 
              overlays: ['tree', 'rock', 'house'] 
            })
          }),
          redo: expect.objectContaining({
            type: clearHexOverlays.type,
            payload: { q: 0, r: 0 }
          })
        })
      })
    }));
  });
});
