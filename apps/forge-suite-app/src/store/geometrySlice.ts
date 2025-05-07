import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MeshAsset, MaterialProperties } from '../interfaces/Asset';
import type { RootState, AppDispatch } from './store'; // for thunk
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore: missing type declarations for three examples
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-ignore: missing type declarations for three examples
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
// @ts-ignore: missing type declarations for three-bvh-csg
import CSG from 'three-bvh-csg';
import * as THREE from 'three';

// Define the state type
export interface GeometryState {
  assets: Record<string, MeshAsset>;
  selectedAssetId: string | null;
  library: Record<string, MeshAsset>; // Added library field
}

// Identity matrix for new assets
const identityMatrix: number[] = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
];

// Default material properties
export const defaultMaterial: MaterialProperties = {
  baseColor: '#cccccc',
  metallic: 0.0,
  roughness: 0.7,
  emissive: '#000000',
  emissiveIntensity: 0.0
};

// Define the initial state
const initialState: GeometryState = {
  assets: {},
  selectedAssetId: null,
  library: {}  // Initialize empty library
};

// Create the slice
export const geometrySlice = createSlice({
  name: 'geometry',
  initialState,
  reducers: {
    // Add a new mesh asset, initialize its matrix, and select it
    addMeshAsset: (state, action: PayloadAction<{ id: string; name: string; buffer: ArrayBuffer }>) => {
      const { id, name, buffer } = action.payload;
      state.assets[id] = { id, name, buffer, matrix: identityMatrix };
      state.selectedAssetId = id;
    },

    // Set the currently selected asset ID
    setSelectedAssetId: (state, action: PayloadAction<string | null>) => {
      state.selectedAssetId = action.payload;
    },

    // Internal reducer for mesh transform (used by thunk)
    _internalUpdateMeshTransform: (state, action: PayloadAction<{ id: string; matrix: number[] }>) => {
      const { id, matrix } = action.payload;
      if (state.assets[id]) {
        // Create a new matrix array to ensure proper update detection
        state.assets[id].matrix = Array.from(matrix);
      }
    },

    // Remove a mesh asset by ID
    removeMeshAsset: (state, action: PayloadAction<string>) => {
      delete state.assets[action.payload];
      if (state.selectedAssetId === action.payload) {
        state.selectedAssetId = null;
      }
    },

    // Composite reducer for undoable boolean union merge
    mergeMeshAssetsUndoable: (state, action: PayloadAction<{ assetA: MeshAsset; assetB: MeshAsset; mergedAsset: MeshAsset }>) => {
      const { assetA, assetB, mergedAsset } = action.payload;
      delete state.assets[assetA.id];
      delete state.assets[assetB.id];
      state.assets[mergedAsset.id] = mergedAsset;
      state.selectedAssetId = mergedAsset.id;
    },

    // Undo reducer to restore original meshes
    undoMergeMeshAssets: (state, action: PayloadAction<{ assetA: MeshAsset; assetB: MeshAsset; mergedId: string }>) => {
      const { assetA, assetB, mergedId } = action.payload;
      delete state.assets[mergedId];
      state.assets[assetA.id] = assetA;
      state.assets[assetB.id] = assetB;
      state.selectedAssetId = assetA.id;
    },

    // Internal reducer to update material properties
    _internalUpdateMaterialProperties: (
      state, 
      action: PayloadAction<{ 
        id: string; 
        properties: Partial<MaterialProperties>;
      }>
    ) => {
      const { id, properties } = action.payload;
      const asset = state.assets[id];
      
      if (asset) {
        // Initialize material if it doesn't exist
        if (!asset.material) {
          asset.material = { ...defaultMaterial };
        }
        
        // Apply the updated properties
        asset.material = {
          ...asset.material,
          ...properties
        };
      }
    },

    // Add an asset to the library
    saveToLibrary: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      const asset = state.assets[id];
      
      if (asset) {
        // Create a deep copy of the asset for the library
        state.library[id] = { 
          ...asset,
          // Create a new buffer with the same content
          buffer: asset.buffer.slice(0),
          // Create a new matrix array
          matrix: [...asset.matrix],
          // Copy material if it exists
          material: asset.material ? { ...asset.material } : undefined
        };
      }
    },
    
    // Remove an asset from the library
    removeFromLibrary: (state, action: PayloadAction<{ id: string }>) => {
      delete state.library[action.payload.id];
    },
    
    // Create a new asset from a library asset
    createFromLibrary: (state, action: PayloadAction<{ id: string, newId: string, newName: string }>) => {
      const { id, newId, newName } = action.payload;
      const libraryAsset = state.library[id];
      
      if (libraryAsset) {
        // Create a new asset based on the library asset
        state.assets[newId] = {
          id: newId,
          name: newName,
          // Create a new buffer with the same content
          buffer: libraryAsset.buffer.slice(0),
          // Create a new matrix array (use identity matrix for new instance)
          matrix: [...identityMatrix],
          // Copy material if it exists
          material: libraryAsset.material ? { ...libraryAsset.material } : undefined
        };
        
        // Select the newly created asset
        state.selectedAssetId = newId;
      }
    }
  },
});

// Export actions
export const { 
  addMeshAsset, 
  setSelectedAssetId, 
  _internalUpdateMeshTransform, 
  removeMeshAsset, 
  mergeMeshAssetsUndoable, 
  undoMergeMeshAssets,
  _internalUpdateMaterialProperties,
  saveToLibrary,
  removeFromLibrary,
  createFromLibrary
} = geometrySlice.actions;

// Thunk to update mesh transform with undo/redo metadata
export const updateMeshTransform = (id: string, newMatrix: number[]) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const asset = state.geometry.assets[id];
  if (!asset) return; // Don't create undoable action for non-existent assets

  const prevMatrix = Array.from(asset.matrix);
  const matrix = Array.from(newMatrix);

  dispatch({
    type: _internalUpdateMeshTransform.type,
    payload: { id, matrix },
    meta: {
      undoable: {
        undo: {
          type: _internalUpdateMeshTransform.type,
          payload: { id, matrix: prevMatrix }
        },
        redo: {
          type: _internalUpdateMeshTransform.type,
          payload: { id, matrix }
        }
      }
    }
  });
};

// Thunk to merge two mesh assets using CSG union (now undoable)
export const mergeMeshAssets = (idA: string, idB: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const { assets } = getState().geometry;
  if (!assets[idA] || !assets[idB]) return;

  const assetA = assets[idA];
  const assetB = assets[idB];
  const loader = new GLTFLoader();

  // Parse both buffers into GLTF scenes
  const gltfA = await new Promise<any>((res, rej) => loader.parse(assetA.buffer, '', res, rej));
  const gltfB = await new Promise<any>((res, rej) => loader.parse(assetB.buffer, '', res, rej));

  // Find the first mesh in each scene
  const meshA = gltfA.scene.children.find((o: THREE.Object3D) => (o as THREE.Mesh).isMesh) as THREE.Mesh;
  const meshB = gltfB.scene.children.find((o: THREE.Object3D) => (o as THREE.Mesh).isMesh) as THREE.Mesh;
  if (!meshA || !meshB) return;

  // Perform CSG union
  const resultMesh = CSG.union(meshA, meshB);

  // Export result to ArrayBuffer (.glb)
  const exporter = new GLTFExporter();
  const glbBuffer: ArrayBuffer = await new Promise(resolve => {
    exporter.parse(
      resultMesh,
      (data: ArrayBuffer) => resolve(data),
      { binary: true }
    );
  });

  // Prepare merged asset
  const newId = uuidv4();
  const mergedAsset: MeshAsset = { id: newId, name: `${assetA.name}-${assetB.name}-union.glb`, buffer: glbBuffer, matrix: Array.from(identityMatrix) };

  // Dispatch a single undoable merge action
  dispatch({
    type: mergeMeshAssetsUndoable.type,
    payload: { assetA, assetB, mergedAsset },
    meta: {
      undoable: {
        undo: { type: undoMergeMeshAssets.type, payload: { assetA, assetB, mergedId: newId } },
        redo: { type: mergeMeshAssetsUndoable.type, payload: { assetA, assetB, mergedAsset } },
      }
    }
  });
};

// Thunk to update material properties with undo/redo metadata
export const updateMaterialProperties = (
  id: string, 
  properties: Partial<MaterialProperties>
) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const asset = state.geometry.assets[id];
  
  if (!asset) return; // Don't create undoable action for non-existent assets
  
  // Get the current material properties or use defaults
  const currentMaterial = asset.material || defaultMaterial;
  
  // Create an undo action with previous values only for properties being changed
  const undoProperties: Partial<MaterialProperties> = {};
  
  Object.keys(properties).forEach((key) => {
    const typedKey = key as keyof MaterialProperties;
    undoProperties[typedKey] = currentMaterial[typedKey];
  });
  
  // Dispatch with undoable metadata
  dispatch({
    type: _internalUpdateMaterialProperties.type,
    payload: { id, properties },
    meta: {
      undoable: {
        undo: {
          type: _internalUpdateMaterialProperties.type,
          payload: { id, properties: undoProperties }
        },
        redo: {
          type: _internalUpdateMaterialProperties.type,
          payload: { id, properties }
        }
      }
    }
  });
};

// Export reducer
export default geometrySlice.reducer;