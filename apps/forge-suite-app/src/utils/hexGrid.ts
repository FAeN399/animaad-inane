// filepath: src/utils/hexGrid.ts

// Hex grid utilities (pointy-top axial coordinates)

/** Cube coordinates */
export interface CubeCoord { x: number; y: number; z: number; }
/** Axial coordinates */
export interface AxialCoord { q: number; r: number; }

/** Convert axial to cube coordinates */
export function axialToCube(q: number, r: number): CubeCoord {
  return { x: q, y: -q - r, z: r };
}

/** Convert cube to axial coordinates */
export function cubeToAxial(x: number, y: number, z: number): AxialCoord {
  return { q: x, r: z };
}

/** Round fractional cube coordinates to nearest integer cube coordinates */
export function cubeRound(x: number, y: number, z: number): CubeCoord {
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);
  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);
  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }
  return { x: rx, y: ry, z: rz };
}

/** Round fractional axial coordinates to nearest axial coordinates */
export function axialRound(fractQ: number, fractR: number): AxialCoord {
  const { x, z } = cubeRound(fractQ, -fractQ - fractR, fractR);
  return { q: x, r: z };
}

/** Convert axial coordinates to pixel coordinates (pointy-top) */
export function axialToPixelPointyTop(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * (3 / 2) * r;
  return { x, y };
}

/** Convert pixel coordinates to axial coordinates (pointy-top) */
export function pixelToAxialPointyTop(x: number, y: number, size: number): AxialCoord {
  const q = (x * Math.sqrt(3) / 3 - y / 3) / size;
  const r = (2 / 3 * y) / size;
  return axialRound(q, r);
}

/** Compute distance between two hexes in axial coordinates */
export function axialDistance(q1: number, r1: number, q2: number, r2: number): number {
  const a = axialToCube(q1, r1);
  const b = axialToCube(q2, r2);
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
}

/** Get the six neighboring axial coordinates */
export function getAxialNeighbors(q: number, r: number): AxialCoord[] {
  const directions: [number, number][] = [
    [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]
  ];
  return directions.map(([dq, dr]) => ({ q: q + dq, r: r + dr }));
}