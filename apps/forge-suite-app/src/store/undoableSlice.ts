import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';

export interface UndoableEntry {
  undoAction: AnyAction;
  redoAction: AnyAction;
}

export interface UndoableState {
  past: UndoableEntry[];
  future: UndoableEntry[];
}

const initialState: UndoableState = {
  past: [],
  future: [],
};

const undoableSlice = createSlice({
  name: 'undoable',
  initialState,
  reducers: {
    push: (state, action: PayloadAction<UndoableEntry>) => {
      state.past.push(action.payload);
      state.future = [];
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const entry = state.past.pop()!;
        state.future.push(entry);
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const entry = state.future.pop()!;
        state.past.push(entry);
      }
    },
  },
});

export const { push, undo, redo } = undoableSlice.actions;
export default undoableSlice.reducer;
