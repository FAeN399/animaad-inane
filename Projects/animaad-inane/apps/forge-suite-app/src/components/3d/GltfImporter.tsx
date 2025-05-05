import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { addMeshAsset } from '../../store/geometrySlice';
import { v4 as uuidv4 } from 'uuid';

const GltfImporter: React.FC = () => {
  const dispatch = useDispatch();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        const id = uuidv4();
        dispatch(addMeshAsset({ id, name: file.name, buffer }));
      };
      reader.readAsArrayBuffer(file);
    });
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: '.gltf,.glb' });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} data-testid="file-input" />
      {isDragActive ? <p>Drop the GLTF file here...</p> : <p>Drag & drop a GLTF file here, or click to select</p>}
    </div>
  );
};

export default GltfImporter;
