import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import geometryReducer from '../modules/geometry/store/geometrySlice';
import mandalaReducer from '../modules/mandala/store/mandalaSlice';
import mapReducer from '../modules/map/store/mapSlice';
import hubReducer from '../modules/hub/store/hubSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    geometry: geometryReducer,
    mandala: mandalaReducer,
    map: mapReducer,
    hub: hubReducer,
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;