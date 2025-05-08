import mapReducer, { setHexData, MapState, updateHexData } from './mapSlice';
import { configureStore } from '@reduxjs/toolkit';
import undoableReducer, { undo, redo } from './undoableSlice';
import { undoableMiddleware } from './undoableMiddleware';

describe('mapSlice', () => {
  const initialState: MapState = { hexes: {} };

  it('should handle initial state', () => {
    expect(mapReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setHexData', () => {
    const action = setHexData({ q: 2, r: -1, terrain: 'grass' });
    const state = mapReducer(initialState, action);
    const key = '2,-1';
    expect(state.hexes[key]).toEqual({ q: 2, r: -1, terrain: 'grass' });
  });
});

describe('updateHexData thunk with undo/redo', () => {
  const store = configureStore({
    reducer: {
      map: mapReducer,
      undoable: undoableReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(undoableMiddleware)
  });

  beforeEach(() => {
    // Reset state before each test
    store.dispatch({ type: 'RESET_STATE' });
  });

  it('should update hex data with undo/redo metadata', () => {
    // initial state empty
    expect(Object.keys(store.getState().map.hexes)).toHaveLength(0);

    // paint hex (0,0) as grass
    store.dispatch(updateHexData(0, 0, 'grass'));
    const key = '0,0';
    expect(store.getState().map.hexes[key]?.terrain).toBe('grass');
    // undoable entry recorded
    expect(store.getState().undoable.past).toHaveLength(1);

    // undo
    store.dispatch(undo());
    expect(store.getState().map.hexes[key]).toBeUndefined();

    // redo
    store.dispatch(redo());
    expect(store.getState().map.hexes[key]?.terrain).toBe('grass');
  });

  it('should handle updating existing hex to new terrain and undo correctly', () => {
    // paint grass
    store.dispatch(updateHexData(1, -1, 'grass'));
    // paint water over same hex
    store.dispatch(updateHexData(1, -1, 'water'));
    const key = '1,-1';
    expect(store.getState().map.hexes[key]?.terrain).toBe('water');
    expect(store.getState().undoable.past).toHaveLength(2);

    // undo back to grass
    store.dispatch(undo());
    expect(store.getState().map.hexes[key]?.terrain).toBe('grass');

    // undo removing hex
    store.dispatch(undo());
    expect(store.getState().map.hexes[key]).toBeUndefined();
  });
});