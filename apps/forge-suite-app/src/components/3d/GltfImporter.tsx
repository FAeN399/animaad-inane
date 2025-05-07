import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch } from '../../store/hooks';
import { addMeshAsset } from '../../store/geometrySlice';
import { v4 as uuidv4 } from 'uuid';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { toast } from 'react-toastify';
import * as THREE from 'three';

interface FileWithPath extends File {
  path?: string;
}

const GltfImporter: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const validateFileExtension = (file: FileWithPath): boolean => {
    const validExtensions = ['.glb', '.gltf'];
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    return validExtensions.includes(extension);
  };

  const checkTextureSizes = (gltf: any): void => {
    const textureWarnings: { name: string, size: number }[] = [];
    let hasLargeTexture = false;

    if (gltf.scene) {
      gltf.scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          
          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            
            materials.forEach((material: any) => {
              // Check for texture maps in the material
              const maps = [
                material.map,
                material.normalMap,
                material.roughnessMap,
                material.metalnessMap,
                material.emissiveMap,
                material.aoMap,
              ].filter(map => map);
              
              maps.forEach(map => {
                if (map && map.image) {
                  const width = map.image.width;
                  const height = map.image.height;
                  
                  // Check if texture is larger than 2K (2048x2048)
                  if (width > 2048 || height > 2048) {
                    hasLargeTexture = true;
                    textureWarnings.push({
                      name: map.name || 'Unnamed texture',
                      size: Math.max(width, height)
                    });
                  }
                }
              });
            });
          }
        }
      });
    }
    
    if (hasLargeTexture) {
      console.warn('Large textures detected:', textureWarnings);
      toast.warning(
        `Model contains ${textureWarnings.length} texture(s) larger than 2K resolution. This may impact performance.`,
        { autoClose: 6000 }
      );
    }
  };

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate file extension
    if (!validateFileExtension(file)) {
      toast.error(`Unsupported file format: ${file.name}. Please use .gltf or .glb files.`);
      return;
    }
    
    setIsLoading(true);
    
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        
        // Create a temporary loader to check the model and textures
        const loader = new GLTFLoader();
        loader.parse(
          arrayBuffer,
          '',
          (gltf: any) => {
            // Check for large textures
            checkTextureSizes(gltf);
            
            // Add to Redux store
            const id = uuidv4();
            dispatch(addMeshAsset({ 
              id, 
              name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
              buffer: arrayBuffer
            }));
            
            toast.success(`Successfully imported ${file.name}`);
            setIsLoading(false);
          },
          (error: Error) => {
            console.error('Error loading GLTF:', error);
            toast.error(`Failed to load ${file.name}: ${error.message}`);
            setIsLoading(false);
          }
        );
      } catch (error: unknown) {
        console.error('Error processing file:', error);
        toast.error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      toast.error(`Failed to read ${file.name}`);
      setIsLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  }, [dispatch]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'model/gltf+json': ['.gltf'],
      'model/gltf-binary': ['.glb']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? '#4a90e2' : '#cccccc'}`,
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
        transition: 'all 0.2s ease',
        marginBottom: '20px'
      }}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <p>Processing file...</p>
      ) : isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <div>
          <p>Drag and drop a glTF/GLB file here, or click to select</p>
          <p style={{ fontSize: '0.8em', color: '#666666' }}>
            Supported formats: .gltf, .glb
          </p>
        </div>
      )}
    </div>
  );
};

export default GltfImporter;
