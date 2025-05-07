import React from 'react';
import { useAppDispatch } from '../../store/hooks';
import { addMeshAsset } from '../../store/geometrySlice';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';
// @ts-ignore
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

const PrimitiveCatalog: React.FC = () => {
  const dispatch = useAppDispatch();

  const exportPrimitive = (geometry: THREE.BufferGeometry, name: string) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
    const exporter = new GLTFExporter();
    exporter.parse(
      mesh,
      (result: ArrayBuffer | { scene: THREE.Scene }) => {
        const buffer = result as ArrayBuffer;
        const id = uuidv4();
        dispatch(addMeshAsset({ id, name, buffer }));
      },
      { binary: true }
    );
  };

  return (
    <div className="primitive-catalog" style={{ marginTop: '16px' }}>
      <h3>Primitive Catalog</h3>
      <button onClick={() => exportPrimitive(new THREE.BoxGeometry(1, 1, 1), 'Box.glb')} style={{ marginRight: '8px' }}>
        Add Box
      </button>
      <button onClick={() => exportPrimitive(new THREE.SphereGeometry(0.5, 32, 32), 'Sphere.glb')} style={{ marginRight: '8px' }}>
        Add Sphere
      </button>
      <button onClick={() => exportPrimitive(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), 'Cylinder.glb')}>
        Add Cylinder
      </button>
    </div>
  );
};

export default PrimitiveCatalog;