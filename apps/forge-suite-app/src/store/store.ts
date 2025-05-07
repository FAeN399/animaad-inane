import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import geometryReducer from './geometrySlice';
import mandalaReducer from '../modules/mandala/store/mandalaSlice';
import mapReducer from './mapSlice';
import hubReducer from '../modules/hub/store/hubSlice';
import undoableReducer from './undoableSlice';
import { undoableMiddleware } from './undoableMiddleware';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    geometry: geometryReducer,
    mandala: mandalaReducer,
    map: mapReducer,
    hub: hubReducer,
    undoable: undoableReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(undoableMiddleware),
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;