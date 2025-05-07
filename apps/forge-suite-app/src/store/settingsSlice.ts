import { createSlice } from '@reduxjs/toolkit';

// Define the state type
export interface SettingsState {
  theme: 'light' | 'dark';
}

// Define the initial state
const initialState: SettingsState = {
  theme: 'light',
};

// Create the slice
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

// Export actions
export const { toggleTheme } = settingsSlice.actions;

// Export reducer
export default settingsSlice.reducer;