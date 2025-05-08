import { describe, it, expect } from 'vitest';
import mapReducer, { setViewMode, MapState, ViewMode } from './mapSlice';

describe('mapSlice view mode features', () => {
  const initialState: MapState = { 
    hexes: {},
    viewMode: '2d'
  };

  it('should handle setViewMode with explicit mode', () => {
    // Test setting to 3D mode
    let action = setViewMode('3d');
    let state = mapReducer(initialState, action);
    expect(state.viewMode).toBe('3d');
    
    // Test setting to 2D mode
    action = setViewMode('2d');
    state = mapReducer(state, action);
    expect(state.viewMode).toBe('2d');
  });

  it('should handle setViewMode toggle (undefined payload)', () => {
    // Start with 2D mode
    let state = { ...initialState, viewMode: '2d' };
    
    // Toggle to 3D
    let action = setViewMode(undefined);
    state = mapReducer(state, action);
    expect(state.viewMode).toBe('3d');
    
    // Toggle back to 2D
    action = setViewMode(undefined);
    state = mapReducer(state, action);
    expect(state.viewMode).toBe('2d');
  });
});
