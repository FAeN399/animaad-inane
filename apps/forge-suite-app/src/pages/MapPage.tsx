import { useState, useRef } from 'react'; // Removed React import
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateHexData, updateHexElevation } from '../store/mapSlice'; // Removed setHexData import
import SceneCanvas from '../components/3d/SceneCanvas';
import HexGrid from '../components/map/HexGrid'; // Corrected import path
import TerrainPalette from '../components/map/TerrainPalette';
import ElevationPanel from '../components/map/ElevationPanel';
import { pixelToAxialPointyTop, axialRound, axialToPixelPointyTop } from '../utils/hexGrid';

export function MapPage() {
  const dispatch = useAppDispatch();
  const hexes = useAppSelector(state => state.map.hexes);
  const [selectedHex, setSelectedHex] = useState<{ q: number; r: number } | null>(null);
  const [activeTerrain, setActiveTerrain] = useState<string>('grass');
  const [painting, setPainting] = useState<boolean>(false);
  const lastHex = useRef<string | null>(null);

  const addHex = (q: number, r: number, terrain: string) => {
    dispatch(updateHexData(q, r, terrain));
  };

  const paintHex = (x: number, y: number) => {
    const frac = pixelToAxialPointyTop(x, y, 1);
    const { q, r } = axialRound(frac.q, frac.r);
    const key = `${q},${r}`;
    if (lastHex.current === key) return;
    lastHex.current = key;
    dispatch(updateHexData(q, r, activeTerrain));
    // select for elevation
    setSelectedHex({ q, r });
  };

  // Handle elevation change
  const handleElevationChange = (value: number) => {
    if (selectedHex) dispatch(updateHexElevation(selectedHex.q, selectedHex.r, value));
  };

  // Export map data as JSON
  const exportJSON = () => {
    const data = JSON.stringify(hexes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'map-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export map view as PNG
  const exportPNG = () => {
    // Create offscreen canvas
    const canvasSize = 500;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Determine bounds
    const coords = Object.values(hexes).map(h => h ? axialToPixelPointyTop(h.q, h.r, 20) : { x: 0, y: 0 }); // Added null check for h
    const xs = coords.map(p => p.x);
    const ys = coords.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const scale = Math.min((canvasSize - 20) / (maxX - minX || 1), (canvasSize - 20) / (maxY - minY || 1));
    // Draw hexes
    coords.forEach((p, idx) => {
      const hex = Object.values(hexes)[idx];
      if (!hex) return; // Added null check for hex
      const cx = (p.x - minX) * scale + 10;
      const cy = (p.y - minY) * scale + 10;
      const size = 20 * scale;
      // Draw hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i - 30);
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      // Fill color based on terrain
      const colorMap: Record<string, string> = { grass: '#4caf50', water: '#2196f3', sand: '#ffeb3b' };
      ctx.fillStyle = colorMap[hex.terrain] || '#ccc';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
    });
    // Download PNG
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'map-view.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="map-page" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1>Map Editor</h1>
      {/* Elevation panel for selected hex */}
      {selectedHex && (
        <ElevationPanel
          value={hexes[`${selectedHex.q},${selectedHex.r}`]?.elevation || 0}
          onChange={handleElevationChange}
        />
      )}
      <div style={{ marginBottom: '12px' }}>
        <button onClick={exportJSON} style={{ marginRight: '8px' }}>Export JSON</button>
        <button onClick={exportPNG}>Export PNG</button>
      </div>
      <TerrainPalette activeTerrain={activeTerrain} onSelect={setActiveTerrain} />
      <div style={{ padding: '8px', border: '1px solid #ddd', marginBottom: '8px' }}>
        <h2>Test Controls</h2>
        <button onClick={() => addHex(0, 0, 'grass')} style={{ marginRight: '8px' }}>
          Add Grass at (0,0)
        </button>
        <button onClick={() => addHex(1, -1, 'water')} style={{ marginRight: '8px' }}>
          Add Water at (1,-1)
        </button>
        <button onClick={() => addHex(-1, 1, 'sand')}>
          Add Sand at (-1,1)
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <SceneCanvas>
          {/* Interactive ground plane for painting */}
          <mesh
            rotation-x={-Math.PI / 2}
            position={[0, 0, 0]}
            visible={false}
            onPointerDown={(e) => { e.stopPropagation(); setPainting(true); lastHex.current = null; paintHex(e.point.x, e.point.z); }}
            onPointerMove={(e) => painting && (e.stopPropagation(), paintHex(e.point.x, e.point.z))}
            onPointerUp={(e) => { e.stopPropagation(); setPainting(false); lastHex.current = null; }}
          >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial visible={false} />
          </mesh>
          <HexGrid /> 
        </SceneCanvas>
      </div>
    </div>
  );
}

export default MapPage;