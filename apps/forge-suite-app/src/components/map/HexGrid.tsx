import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useAppSelector } from '../../store/hooks';
import { axialToPixelPointyTop } from '../../utils/hexGrid';

// Default colors
const DEFAULT_TERRAIN_COLOR = new THREE.Color('#9E9E9E'); // gray
const DEFAULT_OVERLAY_COLOR = new THREE.Color('#FF00FF'); // magenta

// Helper function to safely get a terrain color
function getTerrainColor(terrain: string): THREE.Color {
  switch (terrain) {
    case 'grass': return new THREE.Color('#4CAF50');  // green
    case 'water': return new THREE.Color('#2196F3');  // blue
    case 'sand': return new THREE.Color('#FFC107');   // yellow
    case 'rock': return new THREE.Color('#795548');   // brown
    case 'snow': return new THREE.Color('#ECEFF1');   // off-white
    case 'forest': return new THREE.Color('#388E3C'); // dark green
    default: return DEFAULT_TERRAIN_COLOR;
  }
}

// Helper function to safely get an overlay color
function getOverlayColor(overlay: string | undefined): THREE.Color {
  if (!overlay) return DEFAULT_OVERLAY_COLOR;

  switch (overlay) {
    case 'tree': return new THREE.Color('#00AA00');    // dark green
    case 'rock': return new THREE.Color('#777777');    // gray
    case 'house': return new THREE.Color('#AA5500');   // brown
    case 'tower': return new THREE.Color('#AAAAAA');   // light gray
    case 'castle': return new THREE.Color('#880000');  // dark red
    case 'mountain': return new THREE.Color('#555555'); // dark gray
    default: return DEFAULT_OVERLAY_COLOR;
  }
}

// Size of each hex in world units (1 unit = 1m per spec)
const HEX_SIZE = 0.5;

export interface HexGridProps {
  // Optional props for future features
  showGrid?: boolean;
  highlightHex?: { q: number, r: number } | null;
}

/**
 * Renders a grid of hexagons using instanced meshes for performance
 */
const HexGrid: React.FC<HexGridProps> = ({
  showGrid = true,
  highlightHex = null
}) => {
  // Get hex data from the Redux store
  const hexes = useAppSelector(state => state.map.hexes);

  // Create refs for our InstancedMesh and color attribute
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorAttribRef = useRef<THREE.BufferAttribute | null>(null);

  // Create a pointy-top hexagon geometry with center at origin
  const hexGeometry = useMemo(() => {
    // Create vertices for a flat-topped hexagon
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      vertices.push(
        HEX_SIZE * Math.cos(angle), 0, HEX_SIZE * Math.sin(angle)
      );
    }

    // Add center vertex
    vertices.push(0, 0, 0);

    // Create faces (triangles)
    const indices = [];
    for (let i = 0; i < 6; i++) {
      indices.push(i, (i + 1) % 6, 6); // Connect each edge to the center
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  // Convert hexes object to array for easier processing
  const hexArray = useMemo(() => {
    return Object.values(hexes);
  }, [hexes]);

  // Update instances when hexes change
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const count = hexArray.length;

    // Resize the instance count if needed
    if (mesh.count !== count) {
      mesh.count = count;
    }

    // Skip if no hexes to render
    if (count === 0) return;

    // Setup color attribute if not already done
    if (!colorAttribRef.current) {
      const colorArray = new Float32Array(count * 3);
      const colorAttrib = new THREE.InstancedBufferAttribute(colorArray, 3);
      mesh.instanceColor = colorAttrib;
      colorAttribRef.current = colorAttrib;
    }

    // Update each instance matrix and color
    for (let i = 0; i < count; i++) {
      const hex = hexArray[i];

      if (!hex) continue; // Skip if hex is undefined

      // Calculate hex position in world space
      const position = axialToPixelPointyTop(hex.q, hex.r, HEX_SIZE);

      // Create transform matrix (position only for now)
      const matrix = new THREE.Matrix4().makeTranslation(
        position.x,
        hex.elevation ? hex.elevation * 0.1 : 0, // Y offset based on elevation
        position.y // Z coordinate in R3F is the Y in our 2D grid
      );

      // Apply the matrix to this instance
      mesh.setMatrixAt(i, matrix);

      // Determine color based on terrain and overlays
      let color: THREE.Color;

      // If hex has overlays, use the top overlay's color
      if (hex.overlays && hex.overlays.length > 0) {
        const topOverlay = hex.overlays[hex.overlays.length - 1];
        // Use a safe approach to get the color
        color = getOverlayColor(topOverlay);
      } else if (hex.terrain) {
        // Otherwise use terrain color
        color = getTerrainColor(hex.terrain);
      } else {
        // Fallback
        color = DEFAULT_TERRAIN_COLOR;
      }

      mesh.setColorAt(i, color);
    }

    // Update the GPU buffers
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  }, [hexArray]);

  // Optional constant animation for highlighting
  useFrame((state) => {
    if (highlightHex && meshRef.current && colorAttribRef.current) {
      const key = `${highlightHex.q},${highlightHex.r}`;
      const hexIndex = hexArray.findIndex(h => `${h.q},${h.r}` === key);

      if (hexIndex >= 0) {
        // Pulse the highlighted hex
        const time = state.clock.getElapsedTime();
        const color = new THREE.Color().setHSL(
          (Math.sin(time * 2) * 0.1) + 0.5, // Shift hue
          0.8,
          0.6
        );

        meshRef.current.setColorAt(hexIndex, color);
        if (meshRef.current.instanceColor)
          meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  // Render the instanced hexes
  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[hexGeometry, undefined, Math.max(1, hexArray.length)]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          vertexColors
          flatShading={true}
        />
      </instancedMesh>

      {/* Optional grid plane for reference */}
      {showGrid && (
        <gridHelper
          args={[20, 20, '#888888', '#444444']}
          position={[0, -0.01, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      )}
    </>
  );
};

export default HexGrid;
