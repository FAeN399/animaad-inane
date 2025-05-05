import settingsReducer, { toggleTheme, SettingsState } from './settingsSlice';

describe('settings slice', () => {
  const initialState: SettingsState = {
    theme: 'light',
  };

  it('should handle initial state', () => {
    expect(settingsReducer(undefined, { type: 'unknown' })).toEqual({
      theme: 'light',
    });
  });

  it('should handle toggleTheme', () => {
    const lightState = { theme: 'light' };
    expect(settingsReducer(lightState, toggleTheme())).toEqual({
      theme: 'dark',
    });

    const darkState = { theme: 'dark' };
    expect(settingsReducer(darkState, toggleTheme())).toEqual({
      theme: 'light',
    });
  });
});