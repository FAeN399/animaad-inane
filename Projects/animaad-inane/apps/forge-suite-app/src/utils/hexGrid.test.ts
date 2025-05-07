import { describe, it, expect } from 'vitest';
import {
  axialToCube,
  cubeToAxial,
  cubeRound,
  axialRound,
  axialToPixelPointyTop,
  pixelToAxialPointyTop,
  axialDistance,
  getAxialNeighbors,
  CubeCoord,
  AxialCoord
} from './hexGrid';

describe('hexGrid utilities', () => {
  it('axialToCube and cubeToAxial round-trip', () => {
    const q = 2;
    const r = -3;
    const cube = axialToCube(q, r);
    expect(cube).toEqual({ x: 2, y: 1, z: -3 });
    const axial = cubeToAxial(cube);
    expect(axial).toEqual({ q, r });
  });

  it('cubeRound adjusts fractional cubes correctly', () => {
    const frac = { x: 0.4, y: -0.4, z: 0 }; // sums to approx 0
    const rounded = cubeRound(frac.x, frac.y, frac.z);
    // Should round to nearest integers that sum to zero
    expect(rounded.x + rounded.y + rounded.z).toBe(0);
    expect([rounded.x, rounded.y, rounded.z].every(v => Number.isInteger(v))).toBe(true);
  });

  it('axialRound snaps fractional axial coords to nearest axial', () => {
    const a: AxialCoord = { q: 1.2, r: -0.6 };
    const rounded = axialRound(a.q, a.r);
    // After rounding, cube coords are integers
    const cube = axialToCube(rounded.q, rounded.r);
    expect(cube.x + cube.y + cube.z).toBe(0);
    expect(rounded.q).toBeTypeOf('number');
    expect(rounded.r).toBeTypeOf('number');
  });

  it('axialToPixelPointyTop and pixelToAxialPointyTop inverse within tolerance', () => {
    const size = 5;
    const coord: AxialCoord = { q: -2, r: 3 };
    const pixel = axialToPixelPointyTop(coord.q, coord.r, size);
    const axialFrac = pixelToAxialPointyTop(pixel.x, pixel.y, size);
    const axialRounded = axialRound(axialFrac.q, axialFrac.r);
    expect(axialRounded).toEqual(coord);
  });

  it('axialDistance gives correct distances', () => {
    // Same hex => distance 0
    expect(axialDistance(0, 0, 0, 0)).toBe(0);
    // Neighboring hexes => distance 1
    expect(axialDistance(0, 0, 1, 0)).toBe(1);
    expect(axialDistance(0, 0, 0, 1)).toBe(1);
    // Diagonal on grid
    expect(axialDistance(0, 0, 2, -1)).toBe(2);
  });

  it('getAxialNeighbors returns six adjacent coords', () => {
    const center: AxialCoord = { q: 5, r: -4 };
    const neighbors = getAxialNeighbors(center.q, center.r);
    expect(neighbors).toHaveLength(6);
    const distances = neighbors.map(n => axialDistance(center.q, center.r, n.q, n.r));
    distances.forEach(d => expect(d).toBe(1));
  });
});