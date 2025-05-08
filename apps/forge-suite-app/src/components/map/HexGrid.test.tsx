import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import mapReducer from '../../store/mapSlice';
import HexGrid from './HexGrid';
import * as THREE from 'three';

// Create a mock for Three.js InstancedMesh since it's not available in jsdom
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useFrame: vi.fn().mockImplementation((callback) => {}),
    // Add other R3F mocks as needed
  };
});

// Mock the THREE BufferGeometry and related classes
vi.mock('three', async () => {
  const actualThree = await vi.importActual('three');
  return {
    ...actualThree,
    InstancedMesh: vi.fn().mockImplementation(() => ({
      count: 0,
      setMatrixAt: vi.fn(),
      setColorAt: vi.fn(),
      instanceMatrix: { needsUpdate: false },
      instanceColor: { needsUpdate: false },
    })),
    BufferGeometry: vi.fn().mockImplementation(() => ({
      setIndex: vi.fn(),
      setAttribute: vi.fn(),
      computeVertexNormals: vi.fn(),
    })),
    Float32BufferAttribute: vi.fn(),
    InstancedBufferAttribute: vi.fn(),
    Matrix4: vi.fn().mockImplementation(() => ({
      makeTranslation: vi.fn().mockReturnThis(),
    })),
    Color: vi.fn().mockImplementation(() => ({
      setHSL: vi.fn().mockReturnThis(),
    })),
  };
});

describe('HexGrid', () => {
  let mockStore;

  beforeEach(() => {
    // Reset and create a new mock store for each test
    mockStore = configureStore({
      reducer: {
        map: mapReducer
      },
      preloadedState: {
        map: {
          hexes: {
            '0,0': { q: 0, r: 0, terrain: 'grass' },
            '1,0': { q: 1, r: 0, terrain: 'water' },
          }
        }
      }
    });
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <HexGrid />
      </Provider>
    );
    expect(container).toBeDefined();
  });

  it('renders with optional props', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <HexGrid showGrid={false} highlightHex={{ q: 0, r: 0 }} />
      </Provider>
    );
    expect(container).toBeDefined();
  });
});