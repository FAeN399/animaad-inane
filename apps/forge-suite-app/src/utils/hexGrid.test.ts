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
  it('axialToCube and cubeToAxial are inverses', () => {
    const q = 2, r = -1;
    const cube = axialToCube(q, r);
    const axial = cubeToAxial(cube.x, cube.y, cube.z);
    expect(axial).toEqual({ q, r });
  });

  it('cubeRound rounds fractional coordinates correctly', () => {
    const frac = { x: 0.2, y: -0.8, z: 0.6 };
    const rounded = cubeRound(frac.x, frac.y, frac.z);
    // total must sum to zero
    expect(rounded.x + rounded.y + rounded.z).toBe(0);
  });

  it('axialRound rounds fractional axial coordinates', () => {
    const fractQ = 1.2, fractR = 2.8;
    const rounded = axialRound(fractQ, fractR);
    expect(Number.isInteger(rounded.q)).toBe(true);
    expect(Number.isInteger(rounded.r)).toBe(true);
  });

  it('axialToPixelPointyTop and pixelToAxialPointyTop are inverses', () => {
    const size = 5;
    const q = 3, r = -2;
    const { x, y } = axialToPixelPointyTop(q, r, size);
    const axial = pixelToAxialPointyTop(x, y, size);
    expect(axial).toEqual({ q, r });
  });

  it('axialDistance computes correct distances', () => {
    expect(axialDistance(0, 0, 1, 0)).toBe(1);
    expect(axialDistance(0, 0, 2, -1)).toBe(2);
    expect(axialDistance(1, -1, -1, 1)).toBe(2);
  });

  it('getAxialNeighbors returns six distinct neighbors', () => {
    const neighbors = getAxialNeighbors(0, 0);
    const expected = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];
    expect(neighbors).toHaveLength(6);
    expect(neighbors).toEqual(expected);
  });
});