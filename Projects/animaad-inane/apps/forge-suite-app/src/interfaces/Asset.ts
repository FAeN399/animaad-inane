export interface MaterialProperties {
  baseColor: string; // Hex color
  metallic: number;  // 0-1
  roughness: number; // 0-1
  emissive: string;  // Hex color
  emissiveIntensity: number; // 0+
}

export interface MeshAsset {
  id: string;
  name: string;
  buffer: ArrayBuffer;
  matrix: number[];
  material?: MaterialProperties;
}