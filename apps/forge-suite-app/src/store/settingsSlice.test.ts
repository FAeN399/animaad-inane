import { describe, it, expect } from 'vitest';
import settingsReducer, { toggleTheme, SettingsState } from './settingsSlice';

describe('settings slice', () => {
  const initialState: SettingsState = {
    theme: 'light',
    isSnappingEnabled: false,
    snapTranslation: 0.1,
    snapRotation: 15,
    snapScale: 0.1,
  };

  it('should handle initial state', () => {
    expect(settingsReducer(undefined, { type: 'unknown' })).toEqual({
      theme: 'light',
      isSnappingEnabled: false,
      snapTranslation: 0.1,
      snapRotation: 15,
      snapScale: 0.1,
    });
  });

  it('should handle toggleTheme', () => {
    const lightState: SettingsState = {
      ...initialState,
      theme: 'light'
    };
    const result = settingsReducer(lightState, toggleTheme());
    expect(result.theme).toBe('dark');

    const darkState: SettingsState = {
      ...initialState,
      theme: 'dark'
    };
    const result2 = settingsReducer(darkState, toggleTheme());
    expect(result2.theme).toBe('light');
  });
});