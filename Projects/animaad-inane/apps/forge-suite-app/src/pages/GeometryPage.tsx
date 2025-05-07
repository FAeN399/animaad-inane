import { useState, useEffect } from 'react';
import SceneCanvas from '../components/3d/SceneCanvas';
import GltfImporter from '../components/3d/GltfImporter';
import SceneViewer from '../components/3d/SceneViewer';
import MaterialPanel from '../components/panels/MaterialPanel';
import TransformPanel from '../components/panels/TransformPanel';
import PrimitiveCatalog from '../components/geometry/PrimitiveCatalog';
import AssetLibrary from '../components/geometry/AssetLibrary';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { mergeMeshAssets, setSelectedAssetId } from '../store/geometrySlice';
import { useParams } from 'react-router-dom';

export function GeometryPage() {
  const dispatch = useAppDispatch();
  const { assets, selectedAssetId } = useAppSelector(state => state.geometry);
  const { id: idParam } = useParams<{ id?: string }>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (idParam && assets[idParam]) {
      dispatch(setSelectedAssetId(idParam));
    }
  }, [idParam, assets, dispatch]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return prev; // only two allowed
      return [...prev, id];
    });
  };

  const handleMerge = () => {
    if (selectedIds.length !== 2) return;
    dispatch(mergeMeshAssets(selectedIds[0]!, selectedIds[1]!));
    setSelectedIds([]);
  };

  const handleExport = () => {
    if (!selectedAssetId) return;
    const asset = assets[selectedAssetId]!;
    const blob = new Blob([asset.buffer], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="geometry-page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' /* Adjust based on NavBar height */ }}>
      <h1>Geometry Editor</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', marginRight: '20px' }}>
          <GltfImporter />
          <div style={{ margin: '10px 0' }}>
            <button onClick={handleExport} disabled={!selectedAssetId}>
              Export Selected
            </button>
          </div>
          <PrimitiveCatalog />
          <AssetLibrary />
          <div style={{ padding: '10px', border: '1px solid #ddd', marginTop: '10px' }}>
            <h2>Select Two Meshes to Merge</h2>
            {Object.values(assets).map(asset => (
              <label key={asset.id} style={{ marginRight: '10px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(asset.id)}
                  onChange={() => toggleSelect(asset.id)}
                /> {asset.name}
              </label>
            ))}
            <button
              onClick={handleMerge}
              disabled={selectedIds.length !== 2}
              style={{ marginLeft: '10px' }}
            >Merge Selected</button>
          </div>
          <TransformPanel />
          <MaterialPanel />
        </div>
        <div style={{ flex: '3 1 600px', border: '1px solid #ccc', marginTop: '10px', minHeight: '500px' }}>
          <SceneCanvas>
            <SceneViewer />
          </SceneCanvas>
        </div>
      </div>
    </div>
  );
}

export default GeometryPage;