import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state type
export interface SettingsState {
  theme: 'light' | 'dark';
  isSnappingEnabled: boolean;
  snapTranslation: number;
  snapRotation: number; // in degrees
  snapScale: number;
}

// Define the initial state
const initialState: SettingsState = {
  theme: 'light',
  isSnappingEnabled: false,
  snapTranslation: 0.1, // Default to 10cm
  snapRotation: 15,     // Default to 15 degrees
  snapScale: 0.1,       // Default to 10%
};

// Create the slice
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSnapping: (state) => {
      state.isSnappingEnabled = !state.isSnappingEnabled;
    },
    setSnapTranslation: (state, action: PayloadAction<number>) => {
      state.snapTranslation = action.payload;
    },
    setSnapRotation: (state, action: PayloadAction<number>) => {
      state.snapRotation = action.payload;
    },
    setSnapScale: (state, action: PayloadAction<number>) => {
      state.snapScale = action.payload;
    },
  },
});

// Export actions
export const { 
  toggleTheme,
  toggleSnapping,
  setSnapTranslation,
  setSnapRotation,
  setSnapScale
} = settingsSlice.actions;

// Export reducer
export default settingsSlice.reducer;