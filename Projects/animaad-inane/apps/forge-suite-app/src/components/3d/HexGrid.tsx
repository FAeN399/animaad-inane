import React, { useRef, useEffect, useMemo } from 'react';
import { InstancedMesh, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';
import { useAppSelector } from '../../store/hooks';
import { axialToPixelPointyTop } from '../../utils/hexGrid';

interface HexGridProps {
  size?: number;
}

const HexGrid: React.FC<HexGridProps> = ({ size = 1 }) => {
  const hexes = useAppSelector(state => state.map.hexes);
  // Read user-selected 3D preview mode if implemented; for now, always 3D
  const meshRef = useRef<InstancedMesh>(null!);
  const hexList = useMemo(() => Object.values(hexes), [hexes]);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new Object3D();
    hexList.forEach((hex, i) => {
      const { x, y } = axialToPixelPointyTop(hex.q, hex.r, size);
      // Elevation offset: use hex.elevation or 0
      const elev = hex.elevation || 0;
      dummy.position.set(x, elev, y);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      // Optionally set color based on overlays
      if (hex.overlays && hex.overlays.length > 0) {
        // For now, change instance color to red if any overlay
        meshRef.current.setColorAt(i, new THREE.Color('red'));
      } else {
        meshRef.current.setColorAt(i, new THREE.Color('green'));
      }
    });
    meshRef.current.count = hexList.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [hexList, size]);

  if (hexList.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, hexList.length]}>
      <circleGeometry args={[size, 6]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
};

export default HexGrid;