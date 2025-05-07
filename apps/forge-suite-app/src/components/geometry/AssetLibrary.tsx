import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveToLibrary, removeFromLibrary, createFromLibrary } from '../../store/geometrySlice';
import { v4 as uuidv4 } from 'uuid';

const AssetLibrary: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assets, library } = useAppSelector(state => state.geometry);

  return (
    <div className="asset-library" style={{ marginTop: '16px', border: '1px solid #ddd', padding: '8px' }}>
      <h3>Asset Library</h3>
      {/* Save current assets to library */}
      <div style={{ marginBottom: '12px' }}>
        <strong>Assets:</strong>
        {Object.values(assets).map(asset => (
          <div key={asset.id} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ flex: 1 }}>{asset.name}</span>
            {library[asset.id] ? (
              <em style={{ fontSize: '0.9em', color: '#666' }}>Saved</em>
            ) : (
              <button onClick={() => dispatch(saveToLibrary({ id: asset.id }))} style={{ marginLeft: '8px' }}>
                Save
              </button>
            )}
          </div>
        ))}
      </div>
      {/* Instantiate or remove library entries */}
      <div>
        <strong>Library:</strong>
        {Object.values(library).length === 0 && <div>No saved assets.</div>}
        {Object.values(library).map(lib => (
          <div key={lib.id} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ flex: 1 }}>{lib.name}</span>
            <button
              onClick={() => {
                const newId = uuidv4();
                const newName = lib.name.replace(/\.glb?$/i, '') + '-copy.glb';
                dispatch(createFromLibrary({ id: lib.id, newId, newName }));
              }}
              style={{ marginLeft: '8px' }}
            >
              Instantiate
            </button>
            <button
              onClick={() => dispatch(removeFromLibrary({ id: lib.id }))}
              style={{ marginLeft: '4px' }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetLibrary;