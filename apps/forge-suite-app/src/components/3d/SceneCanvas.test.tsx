import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SceneCanvas from './SceneCanvas';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../../store/settingsSlice';

// Mock modules that can't be directly tested in jsdom environment
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="mock-orbit-controls" />,
  Grid: () => <div data-testid="mock-grid" />,
  Stage: () => <div data-testid="mock-stage" />,
  Environment: () => <div data-testid="mock-environment" />,
}));

describe('SceneCanvas', () => {
  const renderWithRedux = () => {
    const store = configureStore({
      reducer: {
        settings: settingsReducer,
      },
    });
    return render(
      <Provider store={store}>
        <SceneCanvas />
      </Provider>
    );
  };

  it('renders the Canvas component', () => {
    renderWithRedux();
    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument();
  });

  it('renders OrbitControls', () => {
    renderWithRedux();
    expect(screen.getByTestId('mock-orbit-controls')).toBeInTheDocument();
  });

  // Simple tests for other R3F components
  it('renders Grid', () => {
    renderWithRedux();
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
  });

  it('renders Environment', () => {
    renderWithRedux();
    expect(screen.getByTestId('mock-environment')).toBeInTheDocument();
  });
});