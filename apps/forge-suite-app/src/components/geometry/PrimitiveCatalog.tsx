import React from 'react';
import { useAppDispatch } from '../../store/hooks';
import { addMeshAsset } from '../../store/geometrySlice';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';
// @ts-ignore: missing type declarations for three examples
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

// Reusable geometries
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const defaultMaterial = new THREE.MeshStandardMaterial({ color: 'orange' });

const PrimitiveCatalog: React.FC = () => {
  const dispatch = useAppDispatch();

  const addPrimitive = (type: 'Box' | 'Sphere' | 'Cylinder') => {
    const id = uuidv4();
    let geometry: THREE.BufferGeometry;
    let name: string;

    switch (type) {
      case 'Box':
        geometry = boxGeometry;
        name = 'Box';
        break;
      case 'Sphere':
        geometry = sphereGeometry;
        name = 'Sphere';
        break;
      case 'Cylinder':
        geometry = cylinderGeometry;
        name = 'Cylinder';
        break;
      default:
        console.error('Unknown primitive type');
        return;
    }

    const mesh = new THREE.Mesh(geometry, defaultMaterial);
    const exporter = new GLTFExporter();

    exporter.parse(
      mesh,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          dispatch(addMeshAsset({ id, name, buffer: gltf }));
        } else {
          // Handle GLTFExporter returning a JSON object (if binary: false)
          // This shouldn't happen with binary: true, but as a fallback:
          const output = JSON.stringify(gltf, null, 2);
          const buffer = new TextEncoder().encode(output).buffer;
          dispatch(addMeshAsset({ id, name, buffer }));
          console.warn('GLTFExporter did not return ArrayBuffer directly for primitive.');
        }
      },
      (error) => {
        console.error(`Error exporting ${name} primitive:`, error);
      },
      { binary: true } // Export as GLB
    );
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '10px' }}>
      <h4>Add Primitives</h4>
      <button onClick={() => addPrimitive('Box')} style={{ marginRight: '5px' }}>Add Box</button>
      <button onClick={() => addPrimitive('Sphere')} style={{ marginRight: '5px' }}>Add Sphere</button>
      <button onClick={() => addPrimitive('Cylinder')}>Add Cylinder</button>
    </div>
  );
};

export default PrimitiveCatalog;