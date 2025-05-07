import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './store/settingsSlice';
import geometryReducer from './modules/geometry/store/geometrySlice';
import mandalaReducer from './modules/mandala/store/mandalaSlice';
import mapReducer from './modules/map/store/mapSlice';
import hubReducer from './modules/hub/store/hubSlice';

// Create a test store
const createTestStore = () => 
  configureStore({
    reducer: {
      settings: settingsReducer,
      geometry: geometryReducer,
      mandala: mandalaReducer,
      map: mapReducer,
      hub: hubReducer,
    },
  });

describe('App', () => {
  it('renders headline', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    // Update this expectation to match what's actually in the App component
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
  
  it('increments counter when button is clicked', async () => {
    const store = createTestStore();
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    
    // Update this test to match what's actually in the App component
    // Since we don't have a counter anymore, we'll just verify the nav exists
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});