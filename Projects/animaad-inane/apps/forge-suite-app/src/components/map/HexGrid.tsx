import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppSelector } from '../../store/hooks';
import { axialToPixelPointyTop } from '../../utils/hexGrid';
import { HexData } from '../../interfaces/MapData'; // Added import

const HEX_SIZE = 1; // Default hex size, can be made configurable

const createHexagonGeometry = (size: number): THREE.BufferGeometry => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30); // -30 to start with pointy top
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
};

const HexGrid: React.FC = () => {
  const hexes = useAppSelector((state) => state.map.hexes);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const baseHexGeometry = useMemo(() => createHexagonGeometry(HEX_SIZE), []);

  // Explicitly type hexArray
  const hexArray = useMemo(() => Object.values(hexes) as HexData[], [hexes]);

  useEffect(() => {
    if (!instancedMeshRef.current) return; // Guard against null ref early

    const mesh = instancedMeshRef.current;
    
    if (!hexArray.length) { // If no hexes, set count to 0 and return
      mesh.count = 0;
      if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
      return;
    }

    mesh.count = hexArray.length;

    const dummy = new THREE.Object3D();
    hexArray.forEach((hex, i) => {
      const { x: pixelX, y: pixelY } = axialToPixelPointyTop(hex.q, hex.r, HEX_SIZE);
      dummy.position.set(pixelX, 0, pixelY); // Assuming Y is up, hexes are on XZ plane
      // TODO: Set Z to pixelY and Y to hex.elevation when elevation is implemented
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;

  }, [hexArray, baseHexGeometry]);

  if (!hexArray.length) {
    return null;
  }

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[baseHexGeometry, undefined, hexArray.length]}
    >
      <meshStandardMaterial color="#cccccc" />
    </instancedMesh>
  );
};

export default HexGrid;
