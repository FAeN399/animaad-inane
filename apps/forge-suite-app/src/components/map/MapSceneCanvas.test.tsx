import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import mapReducer, { setViewMode } from '../../store/mapSlice';
import MapSceneCanvas from './MapSceneCanvas';

// Mock the Canvas component from @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
}));

// Mock the camera components from @react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: ({ makeDefault, enableRotate }: { makeDefault: boolean, enableRotate: boolean }) => (
    <div data-testid="orbit-controls" data-enable-rotate={enableRotate} data-make-default={makeDefault} />
  ),
  PerspectiveCamera: ({ makeDefault, position }: { makeDefault: boolean, position: number[] }) => (
    <div data-testid="perspective-camera" data-position={position.join(',')} data-make-default={makeDefault} />
  ),
  OrthographicCamera: ({ makeDefault, position }: { makeDefault: boolean, position: number[] }) => (
    <div data-testid="orthographic-camera" data-position={position.join(',')} data-make-default={makeDefault} />
  ),
}));

describe('MapSceneCanvas', () => {
  let store: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        map: mapReducer,
      },
    });
  });
  
  it('renders with 2D view mode by default', () => {
    const { getByTestId, queryByTestId } = render(
      <Provider store={store}>
        <MapSceneCanvas>
          <div data-testid="test-child" />
        </MapSceneCanvas>
      </Provider>
    );
    
    // Should render the canvas
    expect(getByTestId('canvas')).toBeDefined();
    
    // Should render the orthographic camera for 2D mode
    expect(getByTestId('orthographic-camera')).toBeDefined();
    
    // Should not render the perspective camera
    expect(queryByTestId('perspective-camera')).toBeNull();
    
    // Should render orbit controls with rotation disabled
    const orbitControls = getByTestId('orbit-controls');
    expect(orbitControls.getAttribute('data-enable-rotate')).toBe('false');
    
    // Should render children
    expect(getByTestId('test-child')).toBeDefined();
  });
  
  it('renders with 3D view mode when set in the store', () => {
    // Set the view mode to 3D
    store.dispatch(setViewMode('3d'));
    
    const { getByTestId, queryByTestId } = render(
      <Provider store={store}>
        <MapSceneCanvas>
          <div data-testid="test-child" />
        </MapSceneCanvas>
      </Provider>
    );
    
    // Should render the canvas
    expect(getByTestId('canvas')).toBeDefined();
    
    // Should render the perspective camera for 3D mode
    expect(getByTestId('perspective-camera')).toBeDefined();
    
    // Should not render the orthographic camera
    expect(queryByTestId('orthographic-camera')).toBeNull();
    
    // Should render orbit controls with rotation enabled
    const orbitControls = getByTestId('orbit-controls');
    expect(orbitControls.getAttribute('data-enable-rotate')).toBe('true');
    
    // Should render children
    expect(getByTestId('test-child')).toBeDefined();
  });
});
