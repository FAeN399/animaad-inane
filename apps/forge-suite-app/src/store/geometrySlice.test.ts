import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import geometryReducer, { 
  addMeshAsset, 
  setSelectedAssetId, 
  _internalUpdateMeshTransform,
  updateMeshTransform,
  mergeMeshAssets,
  mergeMeshAssetsUndoable,
  undoMergeMeshAssets,
  _internalUpdateMaterialProperties,
  updateMaterialProperties,
  GeometryState,
  MeshAsset
} from './geometrySlice';
import { undoableMiddleware } from './undoableMiddleware';
import undoableReducer, { undo, redo } from './undoableSlice';

describe('geometry slice', () => {
  const initialState: GeometryState = { assets: {}, selectedAssetId: null };

  it('should handle initial state', () => {
    expect(geometryReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should add mesh asset with identity matrix and select it', () => {
    const buffer = new ArrayBuffer(16);
    const action = addMeshAsset({ id: 'mesh1', name: 'Test Mesh', buffer });
    const state = geometryReducer(initialState, action);
    const asset = state.assets['mesh1'];
    expect(asset).toBeDefined();
    expect(asset.id).toBe('mesh1');
    expect(asset.name).toBe('Test Mesh');
    expect(asset.buffer).toBe(buffer);
    expect(asset.matrix).toEqual([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
    expect(state.selectedAssetId).toBe('mesh1');
  });

  it('should handle setSelectedAssetId', () => {
    // First add an asset to have something to select
    const buffer = new ArrayBuffer(16);
    const addAction = addMeshAsset({ id: 'mesh1', name: 'Test Mesh', buffer });
    let state = geometryReducer(initialState, addAction);
    
    // Then set selection to null (deselect)
    const deselectAction = setSelectedAssetId(null);
    state = geometryReducer(state, deselectAction);
    expect(state.selectedAssetId).toBeNull();
    
    // Then select it again
    const selectAction = setSelectedAssetId('mesh1');
    state = geometryReducer(state, selectAction);
    expect(state.selectedAssetId).toBe('mesh1');
  });

  it('should handle updateMeshTransform', () => {
    // First add an asset to have something to update
    const buffer = new ArrayBuffer(16);
    const addAction = addMeshAsset({ id: 'mesh1', name: 'Test Mesh', buffer });
    let state = geometryReducer(initialState, addAction);
    
    // Define a new transform matrix
    const newMatrix = [
      2, 0, 0, 0,
      0, 2, 0, 0, 
      0, 0, 2, 0,
      1, 1, 1, 1
    ];
    
    // Update the transform
    const updateAction = _internalUpdateMeshTransform({ id: 'mesh1', matrix: newMatrix });
    state = geometryReducer(state, updateAction);
    
    // Verify the asset exists and the matrix was updated
    expect(state.assets['mesh1']).toBeDefined();
    expect(state.assets['mesh1'].matrix).toEqual(newMatrix);
  });

  it('should handle updateMeshTransform without undoable metadata', () => {
    // First add an asset to have something to update
    const buffer = new ArrayBuffer(16);
    const addAction = addMeshAsset({ id: 'mesh1', name: 'Test Mesh', buffer });
    let state = geometryReducer(initialState, addAction);
    
    // Define a new transform matrix
    const newMatrix = [
      2, 0, 0, 0,
      0, 2, 0, 0, 
      0, 0, 2, 0,
      1, 1, 1, 1
    ];
    
    // Update the transform using the internal action directly
    const updateAction = _internalUpdateMeshTransform({ id: 'mesh1', matrix: newMatrix });
    state = geometryReducer(state, updateAction);
    
    // Verify the matrix was updated
    expect(state.assets['mesh1'].matrix).toEqual(newMatrix);
  });

  it('should not crash when updating non-existent asset transform', () => {
    // Try to update an asset that doesn't exist
    const updateAction = _internalUpdateMeshTransform({ 
      id: 'nonexistent', 
      matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] 
    });
    const state = geometryReducer(initialState, updateAction);
    
    // Should leave state unchanged
    expect(state).toEqual(initialState);
  });

  it('should handle mergeMeshAssetsUndoable and undoMergeMeshAssets reducers', () => {
    // Prepare initial state with two assets
    const assetA: MeshAsset = { id: 'A', name: 'A.glb', buffer: new ArrayBuffer(8), matrix: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] };
    const assetB: MeshAsset = { id: 'B', name: 'B.glb', buffer: new ArrayBuffer(8), matrix: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] };
    const merged: MeshAsset = { id: 'AB', name: 'AB-union.glb', buffer: new ArrayBuffer(8), matrix: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] };
    let state: GeometryState = { assets: { A: assetA, B: assetB }, selectedAssetId: null };
    // Perform merge
    state = geometryReducer(state, mergeMeshAssetsUndoable({ assetA, assetB, mergedAsset: merged }));
    // Only merged asset remains selected
    expect(Object.keys(state.assets)).toEqual(['AB']);
    expect(state.assets['AB']).toEqual(merged);
    expect(state.selectedAssetId).toBe('AB');
    // Undo merge
    state = geometryReducer(state, undoMergeMeshAssets({ assetA, assetB, mergedId: 'AB' }));
    expect(Object.keys(state.assets).sort()).toEqual(['A','B']);
    expect(state.assets['A']).toEqual(assetA);
    expect(state.assets['B']).toEqual(assetB);
    expect(state.selectedAssetId).toBe('A');
  });

  describe('updateMeshTransform thunk', () => {
    const store = configureStore({
      reducer: {
        geometry: geometryReducer,
        undoable: undoableReducer
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(undoableMiddleware)
    });

    beforeEach(() => {
      // Reset store and add a test mesh
      store.dispatch({ type: 'RESET_STATE' });
      const buffer = new ArrayBuffer(16);
      store.dispatch(addMeshAsset({ id: 'mesh1', name: 'Test Mesh', buffer }));
    });

    it('should update mesh transform with undo/redo metadata', () => {
      const newMatrix = [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 1, 1, 1];
      
      // Get initial state before update
      const initialMatrix = [...store.getState().geometry.assets['mesh1'].matrix];
      
      // Update transform
      store.dispatch(updateMeshTransform('mesh1', newMatrix));
      
      // Check main state updated
      expect(store.getState().geometry.assets['mesh1'].matrix).toEqual(newMatrix);
      
      // Check undoable entry was recorded
      expect(store.getState().undoable.past).toHaveLength(1);
      
      // Undo should restore original matrix
      store.dispatch(undo());
      expect(store.getState().geometry.assets['mesh1'].matrix).toEqual(initialMatrix);
      
      // Redo should reapply new matrix
      store.dispatch(redo());
      expect(store.getState().geometry.assets['mesh1'].matrix).toEqual(newMatrix);
    });

    it('should handle non-existent mesh gracefully', () => {
      const newMatrix = [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 1, 1, 1];
      const prevPastLength = store.getState().undoable.past.length;
      
      // Attempt to update non-existent mesh
      store.dispatch(updateMeshTransform('nonexistent', newMatrix));
      
      // State should remain unchanged
      expect(store.getState().geometry.assets['nonexistent']).toBeUndefined();
      expect(store.getState().undoable.past).toHaveLength(prevPastLength); // No new entries added
    });
  });

  describe('mergeMeshAssets thunk with undo/redo', () => {
    // Mock dependencies
    vi.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
      GLTFLoader: class {
        parse(buffer, path, onLoad) {
          onLoad({
            scene: {
              children: [
                { isMesh: true, name: 'TestMesh' }
              ]
            }
          });
        }
      }
    }));

    vi.mock('three-bvh-csg', () => ({
      default: {
        union: (meshA, meshB) => ({ name: 'UnionResult' })
      }
    }));

    vi.mock('three/examples/jsm/exporters/GLTFExporter', () => ({
      GLTFExporter: class {
        parse(_object: unknown, onDone: (result: ArrayBuffer) => void) {
          onDone(new ArrayBuffer(16));
        }
      }
    }));

    vi.mock('uuid', () => ({
      v4: () => 'merged-id'
    }));

    const store = configureStore({
      reducer: {
        geometry: geometryReducer,
        undoable: undoableReducer
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ 
          serializableCheck: false,
          thunk: true
        }).concat(undoableMiddleware)
    });

    beforeEach(() => {
      // Reset store and add two test meshes
      store.dispatch({ type: 'RESET_STATE' });
      const bufferA = new ArrayBuffer(16);
      const bufferB = new ArrayBuffer(16);
      store.dispatch(addMeshAsset({ id: 'meshA', name: 'Test Mesh A', buffer: bufferA }));
      store.dispatch(addMeshAsset({ id: 'meshB', name: 'Test Mesh B', buffer: bufferB }));
    });

    it('should merge meshes with undoable operations', async () => {
      // Store initial state of meshes
      const initialAssets = { ...store.getState().geometry.assets };
      expect(Object.keys(initialAssets)).toHaveLength(2);
      
      // Merge meshes A and B
      await store.dispatch(mergeMeshAssets('meshA', 'meshB'));
      
      // Verify state after merge
      const afterMergeState = store.getState().geometry;
      expect(Object.keys(afterMergeState.assets)).toHaveLength(1);
      expect(afterMergeState.assets['merged-id']).toBeDefined();
      expect(afterMergeState.selectedAssetId).toBe('merged-id');
      
      // Verify undoable state
      expect(store.getState().undoable.past).toHaveLength(1);
      
      // Undo the merge
      store.dispatch(undo());
      
      // Verify original meshes are restored
      const undoState = store.getState().geometry;
      expect(Object.keys(undoState.assets)).toHaveLength(2);
      expect(undoState.assets['meshA']).toBeDefined();
      expect(undoState.assets['meshB']).toBeDefined();
      
      // Redo the merge
      store.dispatch(redo());
      
      // Verify merged state is restored
      const redoState = store.getState().geometry;
      expect(Object.keys(redoState.assets)).toHaveLength(1);
      expect(redoState.assets['merged-id']).toBeDefined();
      expect(redoState.selectedAssetId).toBe('merged-id');
    });
  });

  describe('material properties', () => {
    it('should handle _internalUpdateMaterialProperties', () => {
      // Add a test mesh
      const buffer = new ArrayBuffer(16);
      const addAction = addMeshAsset({ id: 'mesh1', name: 'Test Mesh', buffer });
      const state = geometryReducer(initialState, addAction);
      
      // Update material properties
      const updateAction = _internalUpdateMaterialProperties({ 
        id: 'mesh1', 
        properties: { baseColor: '#ff0000', metallic: 0.8 } 
      });
      const updatedState = geometryReducer(state, updateAction);
      
      // Check that material was initialized with defaults and updated properties
      expect(updatedState.assets['mesh1'].material).toBeDefined();
      expect(updatedState.assets['mesh1'].material?.baseColor).toBe('#ff0000');
      expect(updatedState.assets['mesh1'].material?.metallic).toBe(0.8);
      expect(updatedState.assets['mesh1'].material?.roughness).toBe(0.7); // Default value
    });
    
    it('should handle updating non-existent mesh gracefully', () => {
      // Try to update material on non-existent mesh
      const updateAction = _internalUpdateMaterialProperties({
        id: 'nonexistent',
        properties: { baseColor: '#ff0000' }
      });
      const state = geometryReducer(initialState, updateAction);
      
      // State should remain unchanged
      expect(state).toEqual(initialState);
    });
    
    describe('updateMaterialProperties thunk with undo/redo', () => {
      const store = configureStore({
        reducer: {
          geometry: geometryReducer,
          undoable: undoableReducer
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({ serializableCheck: false }).concat(undoableMiddleware)
      });
      
      beforeEach(() => {
        // Reset store and add a test mesh
        store.dispatch({ type: 'RESET_STATE' });
        const buffer = new ArrayBuffer(16);
        store.dispatch(addMeshAsset({ id: 'mesh1', name: 'Test Mesh', buffer }));
      });
      
      it('should update material properties with undo/redo metadata', () => {
        // Update material properties
        store.dispatch(updateMaterialProperties('mesh1', { 
          baseColor: '#ff0000', 
          metallic: 0.8 
        }));
        
        // Check material was updated
        const stateAfterUpdate = store.getState().geometry;
        expect(stateAfterUpdate.assets['mesh1'].material?.baseColor).toBe('#ff0000');
        expect(stateAfterUpdate.assets['mesh1'].material!.metallic).toBe(0.8);
        
        // Check undoable entry was recorded
        expect(store.getState().undoable.past).toHaveLength(1);
        
        // Undo the change
        store.dispatch(undo());
        const stateAfterUndo = store.getState().geometry;
        
        // Material should revert to default values
        expect(stateAfterUndo.assets['mesh1'].material?.baseColor).not.toBe('#ff0000');
        expect(stateAfterUndo.assets['mesh1'].material?.metallic).not.toBe(0.8);
        
        // Redo the change
        store.dispatch(redo());
        const stateAfterRedo = store.getState().geometry;
        
        // Material should update again
        expect(stateAfterRedo.assets['mesh1'].material?.baseColor).toBe('#ff0000');
        expect(stateAfterRedo.assets['mesh1'].material?.metallic).toBe(0.8);
      });
    });
  });
});
