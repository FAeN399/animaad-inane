import geometryReducer, { addMeshAsset, GeometryState } from './geometrySlice';

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
});