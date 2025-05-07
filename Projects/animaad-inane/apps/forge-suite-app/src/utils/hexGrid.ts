// filepath: src/utils/hexGrid.ts
export interface CubeCoord { x: number; y: number; z: number; }
export interface AxialCoord { q: number; r: number; }

// Convert axial to cube coordinates
export function axialToCube(q: number, r: number): CubeCoord {
  const x = q;
  const z = r;
  const y = -x - z;
  return { x, y, z };
}

// Convert cube to axial coordinates
export function cubeToAxial({ x, z }: CubeCoord): AxialCoord {
  return { q: x, r: z };
}

// Round cube coordinates to nearest integer cube coordinate
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

// Round axial coordinates (fractional) to nearest axial coordinate using cube round
export function axialRound(q: number, r: number): AxialCoord {
  const cube = axialToCube(q, r);
  const rounded = cubeRound(cube.x, cube.y, cube.z);
  return cubeToAxial(rounded);
}

// Convert axial to pixel coordinates (pointy-top orientation)
export function axialToPixelPointyTop(q: number, r: number, size: number): { x: number; y: number } {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * (3 / 2) * r;
  return { x, y };
}

// Convert pixel to fractional axial coordinates (pointy-top orientation)
export function pixelToAxialPointyTop(x: number, y: number, size: number): AxialCoord {
  const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / size;
  const r = (2 / 3 * y) / size;
  return { q, r };
}

// Calculate distance between two axial coordinates
export function axialDistance(q1: number, r1: number, q2: number, r2: number): number {
  const c1 = axialToCube(q1, r1);
  const c2 = axialToCube(q2, r2);
  // Cube distance formula
  return (Math.abs(c1.x - c2.x) + Math.abs(c1.y - c2.y) + Math.abs(c1.z - c2.z)) / 2;
}

// Get axial neighbors for pointy-top axial coordinates
export function getAxialNeighbors(q: number, r: number): AxialCoord[] {
  const directions: AxialCoord[] = [
    { q: +1, r: 0 }, { q: +1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: +1 }, { q: 0, r: +1 }
  ];
  return directions.map(d => ({ q: q + d.q, r: r + d.r }));
}