import undoableReducer, { push, undo, redo, UndoableState } from './undoableSlice';

describe('undoableSlice', () => {
  const initialState: UndoableState = { past: [], future: [] };

  it('should return the initial state', () => {
    expect(undoableReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle push', () => {
    const entry = { undoAction: { type: 'ACTION_UNDO' }, redoAction: { type: 'ACTION_REDO' } };
    const state = undoableReducer(initialState, push(entry));
    expect(state.past).toHaveLength(1);
    expect(state.past[0]).toEqual(entry);
    expect(state.future).toHaveLength(0);
  });

  it('should handle undo', () => {
    const entry = { undoAction: { type: 'ACTION_UNDO' }, redoAction: { type: 'ACTION_REDO' } };
    const pushed = undoableReducer(initialState, push(entry));
    const state = undoableReducer(pushed, undo());
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(1);
    expect(state.future[0]).toEqual(entry);
  });

  it('should handle redo', () => {
    const entry = { undoAction: { type: 'ACTION_UNDO' }, redoAction: { type: 'ACTION_REDO' } };
    let state = undoableReducer(initialState, push(entry));
    state = undoableReducer(state, undo());
    const redone = undoableReducer(state, redo());
    expect(redone.past).toHaveLength(1);
    expect(redone.future).toHaveLength(0);
    expect(redone.past[0]).toEqual(entry);
  });
});