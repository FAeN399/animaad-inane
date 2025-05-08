import { Middleware } from '@reduxjs/toolkit';
import { push, undo, redo } from './undoableSlice';
import { restoreRingAndElements } from './mandalaSlice';

export const undoableMiddleware: Middleware = storeAPI => next => action => {
  // Handle special case for RESTORE_RING_AND_ELEMENTS
  if (action.type === 'RESTORE_RING_AND_ELEMENTS') {
    const { ring, elements } = action.payload;
    storeAPI.dispatch(restoreRingAndElements(ring, elements));
    return;
  }

  // Handle special case for RECORD_UNDOABLE (just record, don't execute)
  if (action.type === 'RECORD_UNDOABLE' && action.meta?.undoable) {
    next(push({ undoAction: action.meta.undoable.undo, redoAction: action.meta.undoable.redo }));
    return;
  }

  if (action.type === undo.type) {
    // Apply the recorded undo action first
    const stateBefore = storeAPI.getState() as any;
    const { past } = stateBefore.undoable;
    if (past.length > 0) {
      const entry = past[past.length - 1];
      next({ ...entry.undoAction, meta: undefined });
    }
    // Then update the undoable slice
    return next(action);
  }
  if (action.type === redo.type) {
    // Apply the recorded redo action first
    const stateBefore = storeAPI.getState() as any;
    const { future } = stateBefore.undoable;
    if (future.length > 0) {
      const entry = future[future.length - 1];
      next({ ...entry.redoAction, meta: undefined });
    }
    // Then update the undoable slice
    return next(action);
  }

  // Process normal actions
  const result = next(action);

  // Record undoable actions after processing
  if (action.meta?.undoable) {
    next(push({ undoAction: action.meta.undoable.undo, redoAction: action }));
  }

  return result;
};