// Hex data for map editor
export interface HexData {
  q: number;
  r: number;
  terrain: string;
  elevation?: number;
  overlays?: string[];
}