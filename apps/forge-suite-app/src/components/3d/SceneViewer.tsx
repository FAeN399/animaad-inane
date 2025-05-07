import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import * as THREE from 'three';
import { setSelectedAssetId, defaultMaterial } from '../../store/geometrySlice';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshAsset } from '../../interfaces/Asset'; // Ensure MeshAsset is imported
import { useNavigate } from 'react-router-dom';
import TransformControls from './TransformControls';

// Helper component to load a single model
interface ModelLoaderProps {
  asset: MeshAsset;
  onLoad: (id: string, object: THREE.Group) => void;
  onUnload: (id: string) => void;
  isSelected?: boolean;
}

const ModelLoader: React.FC<ModelLoaderProps> = ({ asset, onLoad, onUnload, isSelected }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const modelRef = useRef<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Effect for loading the model geometry/scene
  useEffect(() => {
    let blobUrl: string | null = null;
    let isMounted = true; // Track mount status for async operations
    const loader = new GLTFLoader();

    try {
      const blob = new Blob([asset.buffer], { type: 'model/gltf-binary' });
      blobUrl = URL.createObjectURL(blob);

      loader.load(
        blobUrl,
        (gltf: { scene: THREE.Group }) => {
          if (!isMounted) return; // Don't proceed if unmounted
          const loadedModel = gltf.scene.clone();
          modelRef.current = loadedModel;
          setError(null);
          onLoad(asset.id, loadedModel); // Report loaded model to parent
          if (blobUrl) URL.revokeObjectURL(blobUrl);
        },
        undefined,
        (error: Error) => {
          if (!isMounted) return;
          console.error(`Error loading GLTF model ${asset.id}:`, error);
          setError(`Failed to load model: ${asset.name}`);
          modelRef.current = null;
          if (blobUrl) URL.revokeObjectURL(blobUrl);
        }
      );
    } catch (error: unknown) {
      if (!isMounted) return;
      console.error(`Error creating blob or loading model ${asset.id}:`, error);
      setError(`Error processing model: ${asset.name}`);
      modelRef.current = null;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    }

    // Cleanup function for loading effect
    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      if (modelRef.current) {
         // Basic cleanup, more thorough disposal happens in the main cleanup
      }
      onUnload(asset.id); // Notify parent on unmount/asset change
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.id, asset.buffer]); // Reload only if ID or buffer changes

  // Effect for applying the matrix transform
  useEffect(() => {
    if (modelRef.current) {
      const matrix = new THREE.Matrix4().fromArray(asset.matrix);
      modelRef.current.matrix.copy(matrix); // Directly set the matrix
      modelRef.current.matrix.decompose( // Ensure position, quaternion, scale are updated
        modelRef.current.position,
        modelRef.current.quaternion,
        modelRef.current.scale
      );
      modelRef.current.matrixWorldNeedsUpdate = true; // Important for nested objects/rendering
    }
  }, [asset.matrix]); // Re-apply only if matrix changes

  // Effect for applying material properties
  useEffect(() => {
    if (modelRef.current) {
      const materialProps = asset.material || defaultMaterial;
      
      modelRef.current.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          
          // Create a material based on properties if none exists or to replace an existing one
          if (!mesh.material || mesh.userData.needsMaterialUpdate) {
            const newMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color(materialProps.baseColor),
              metalness: materialProps.metallic,
              roughness: materialProps.roughness,
              emissive: new THREE.Color(materialProps.emissive),
              emissiveIntensity: materialProps.emissiveIntensity
            });
            
            mesh.material = newMaterial;
            mesh.userData.needsMaterialUpdate = false;
          } else {
            // Update existing material properties
            const material = mesh.material as THREE.MeshStandardMaterial;
            
            // Only update if it's a MeshStandardMaterial
            if (material.type === 'MeshStandardMaterial') {
              material.color.set(materialProps.baseColor);
              material.metalness = materialProps.metallic;
              material.roughness = materialProps.roughness;
              material.emissive.set(materialProps.emissive);
              material.emissiveIntensity = materialProps.emissiveIntensity;
              material.needsUpdate = true;
            }
          }
        }
      });
    }
  }, [asset.material]); // Re-apply only if material changes

  // Effect for final cleanup on unmount
  useEffect(() => {
    return () => {
      if (modelRef.current) {
        modelRef.current.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            const mesh = object as THREE.Mesh;
            mesh.geometry?.dispose();
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach(material => material.dispose());
            }
          }
        });
        modelRef.current = null;
      }
    };
  }, []); // Run only on unmount


  if (error) {
    return <>{/* Optionally render an error indicator */}</>;
  }

  if (!modelRef.current) {
    return null; // Loading or error
  }

  // Render the loaded primitive and handle selection
  return (
    <primitive
      object={modelRef.current}
      userData={{ id: asset.id }}
      onClick={(e: THREE.Event) => {
        e.stopPropagation();
        console.log('Selected asset:', asset.id);
        dispatch(setSelectedAssetId(asset.id));
        navigate(`/geometry/${asset.id}`);
      }}
    />
  );
};

const SceneViewer: React.FC = () => {
  const { assets, selectedAssetId } = useAppSelector(state => state.geometry);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);

  // Function to find a loaded object by ID
  const findObjectById = (id: string): THREE.Object3D | null => {
    // This will be called after an object is loaded to set the selected object
    const objects = document.querySelectorAll(`[data-asset-id="${id}"]`);
    if (objects.length > 0) {
      // @ts-ignore - userData is available on the three.js object
      return (objects[0] as any).__r3f.root.getObjects().find(
        (obj: THREE.Object3D) => obj.userData?.id === id
      ) || null;
    }
    return null;
  };

  const handleLoad = (id: string, object: THREE.Group) => {
    console.log(`Model ${id} loaded`, object);
    
    // If this is the selected asset, set it as the selected object for transform controls
    if (id === selectedAssetId) {
      setSelectedObject(object);
    }
    
    // Add a data attribute to help find the object in the DOM
    const domElement = object as any;
    if (domElement) {
      object.userData.id = id;
      const element = domElement.__r3f?.root.getObjects()[0];
      if (element) {
        element.dataset.assetId = id;
      }
    }
  };

  const handleUnload = (id: string) => {
    console.log(`Model ${id} unloaded`);
    if (selectedObject?.userData?.id === id) {
      setSelectedObject(null);
    }
  };

  // Effect to update selected object when selected asset ID changes
  useEffect(() => {
    if (selectedAssetId) {
      const obj = findObjectById(selectedAssetId);
      if (obj) {
        setSelectedObject(obj);
      }
    } else {
      setSelectedObject(null);
    }
  }, [selectedAssetId]);

  return (
    <Suspense fallback={null}>
      {/* Add TransformControls component */}
      <TransformControls object={selectedObject} />
      
      {/* Render all models */}
      {Object.values(assets).map((asset) => (
        <ModelLoader
          key={asset.id}
          asset={asset}
          onLoad={handleLoad}
          onUnload={handleUnload}
          isSelected={asset.id === selectedAssetId}
        />
      ))}
    </Suspense>
  );
};

export default SceneViewer;
