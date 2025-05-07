import { configureStore } from '@reduxjs/toolkit';
import undoableReducer, { push, undo, redo } from './undoableSlice';
import { undoableMiddleware } from './undoableMiddleware';

describe('undoableMiddleware', () => {
  it('should record undoable actions and handle undo/redo', () => {
    const store = configureStore({
      reducer: {
        undoable: undoableReducer,
        test: (state = 0, action) => {
          switch (action.type) {
            case 'INCREMENT':
              return state + 1;
            case 'DECREMENT':
              return state - 1;
            default:
              return state;
          }
        }
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(undoableMiddleware),
    });

    // Dispatch an undoable action
    store.dispatch({
      type: 'INCREMENT',
      meta: {
        undoable: {
          undo: { type: 'DECREMENT' },
          redo: { type: 'INCREMENT' }
        }
      }
    });

    // Check that state was updated and action was recorded
    expect(store.getState().test).toBe(1);
    expect(store.getState().undoable.past).toHaveLength(1);
    expect(store.getState().undoable.future).toHaveLength(0);

    // Undo the action
    store.dispatch(undo());

    // Check that state was reverted
    expect(store.getState().test).toBe(0);
    expect(store.getState().undoable.past).toHaveLength(0);
    expect(store.getState().undoable.future).toHaveLength(1);

    // Redo the action
    store.dispatch(redo());

    // Check that state was restored
    expect(store.getState().test).toBe(1);
    expect(store.getState().undoable.past).toHaveLength(1);
    expect(store.getState().undoable.future).toHaveLength(0);
  });

  it('should handle non-undoable actions normally', () => {
    const store = configureStore({
      reducer: {
        undoable: undoableReducer,
        test: (state = 0, action) => {
          switch (action.type) {
            case 'INCREMENT':
              return state + 1;
            default:
              return state;
          }
        }
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(undoableMiddleware),
    });

    // Dispatch a regular action
    store.dispatch({ type: 'INCREMENT' });

    // Check that state was updated but no history was recorded
    expect(store.getState().test).toBe(1);
    expect(store.getState().undoable.past).toHaveLength(0);
    expect(store.getState().undoable.future).toHaveLength(0);
  });
});