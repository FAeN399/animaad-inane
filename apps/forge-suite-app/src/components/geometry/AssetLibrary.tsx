import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { librarySelector, selectedAssetIdSelector } from '../../store/selectors/geometrySelectors';
import { saveToLibrary, createFromLibrary } from '../../store/geometrySlice';
import { v4 as uuidv4 } from 'uuid';

const AssetLibrary: React.FC = () => {
  const dispatch = useAppDispatch();
  const libraryAssets = useAppSelector(librarySelector);
  const selectedId = useAppSelector(selectedAssetIdSelector);

  const handleSaveSelected = () => {
    if (selectedId) {
      dispatch(saveToLibrary({ id: selectedId }));
    }
  };

  const handleCreateInstance = (libraryAssetId: string) => {
    const newId = uuidv4();
    const libraryAsset = libraryAssets[libraryAssetId];
    if (libraryAsset) {
      // Attempt to find a unique name for the instance
      let instanceNumber = 1;
      let newName = `${libraryAsset.name} (Instance ${instanceNumber})`;
      const allAssetNames = Object.values(useAppSelector.getState().geometry.assets).map(asset => asset.name);
      while (allAssetNames.includes(newName)) {
        instanceNumber++;
        newName = `${libraryAsset.name} (Instance ${instanceNumber})`;
      }
      dispatch(createFromLibrary({ id: libraryAssetId, newId, newName }));
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '10px' }}>
      <h4>Asset Library</h4>
      <button onClick={handleSaveSelected} disabled={!selectedId} style={{ marginBottom: '10px' }}>
        Save Selected to Library
      </button>
      {Object.keys(libraryAssets).length === 0 && <p>No assets in library.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {Object.values(libraryAssets).map((asset) => (
          <li key={asset.id} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{asset.name}</span>
            <button onClick={() => handleCreateInstance(asset.id)}>
              Create Instance
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssetLibrary;