import React, { useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateHexData, updateHexElevation } from '../store/mapSlice';
import SceneCanvas from '../components/3d/SceneCanvas';
import HexGrid from '../components/map/HexGrid';
import TerrainPalette from '../components/map/TerrainPalette';
import { PointerEventObject, ThreeEvent, useThree } from '@react-three/fiber';
import { pixelToAxialPointyTop } from '../utils/hexGrid';
import { exportMapAsJSON, exportMapAsPNG, downloadStringAsFile } from '../utils/exportUtils';

// Size of each hex in world units (must match HexGrid.tsx)
const HEX_SIZE = 0.5;

// Editing modes for the map editor
type EditMode = 'terrain' | 'elevation';

const MapPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const hexes = useAppSelector(state => state.map.hexes);
  const [selectedTerrain, setSelectedTerrain] = useState('grass');
  const [selectedElevation, setSelectedElevation] = useState(0);
  const [editMode, setEditMode] = useState<EditMode>('terrain');
  const [highlightHex, setHighlightHex] = useState<{ q: number, r: number } | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [lastPaintedHex, setLastPaintedHex] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Function to add a hex with coordinates and the selected terrain
  const addHex = (q: number, r: number, terrain = selectedTerrain) => {
    dispatch(updateHexData(q, r, terrain));
    setHighlightHex({ q, r }); // Highlight the last added hex
    setLastPaintedHex(`${q},${r}`);
  };

  // Function to update the elevation of a hex
  const updateElevation = (q: number, r: number, elevation = selectedElevation) => {
    // Make sure the hex exists before updating elevation
    const key = `${q},${r}`;
    if (hexes[key]) {
      dispatch(updateHexElevation(q, r, elevation));
      setHighlightHex({ q, r }); // Highlight the last edited hex
      setLastPaintedHex(key);
    } else {
      // If hex doesn't exist, create it with the selected terrain and elevation
      dispatch(updateHexData(q, r, selectedTerrain));
      dispatch(updateHexElevation(q, r, elevation));
      setHighlightHex({ q, r });
      setLastPaintedHex(key);
    }
  };

  // Add predefined map patterns for testing
  const addTestPattern = (pattern: string) => {
    switch (pattern) {
      case 'ring':
        // Add a ring of hexes
        addHex(0, 0, 'water'); // Center
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const q = Math.round(Math.cos(angle));
          const r = Math.round(Math.sin(angle));
          addHex(q, r, 'grass');
        }
        break;

      case 'river':
        // Create a winding river pattern
        for (let i = -3; i <= 3; i++) {
          addHex(i, Math.sin(i) > 0 ? 1 : 0, 'water');
        }
        break;

      case 'field':
        // Create a small field
        for (let q = -2; q <= 2; q++) {
          for (let r = -2; r <= 2; r++) {
            // Skip if the sum is too large (keeps a hexagonal shape)
            if (Math.abs(q + r) <= 2) {
              addHex(q, r, 'grass');
            }
          }
        }
        break;

      case 'hill':
        // Create a hill with varying elevations
        // First create a flat base of grass
        for (let q = -3; q <= 3; q++) {
          for (let r = -3; r <= 3; r++) {
            // Skip if the sum is too large (keeps a hexagonal shape)
            if (Math.abs(q + r) <= 3) {
              addHex(q, r, 'grass');
            }
          }
        }

        // Now add elevation - higher in the center, lower at edges
        for (let q = -3; q <= 3; q++) {
          for (let r = -3; r <= 3; r++) {
            if (Math.abs(q + r) <= 3) {
              // Calculate distance from center (0,0)
              const distance = Math.sqrt(q*q + r*r);
              // Elevation decreases with distance from center
              const elevation = Math.max(0, Math.floor(3 - distance));
              if (elevation > 0) {
                updateElevation(q, r, elevation);
              }
            }
          }
        }
        break;

      case 'clear':
        setHighlightHex(null); // Clear highlight without dispatching any action
        break;

      default:
        break;
    }
  };

  // Handle painting with pointer events
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsPainting(true);

    // Get the intersection point in world space
    const { point } = e;

    // Convert to hex coordinates
    const hex = pixelToAxialPointyTop(point.x, point.z, HEX_SIZE);

    // Apply the appropriate action based on edit mode
    if (editMode === 'terrain') {
      addHex(hex.q, hex.r);
    } else if (editMode === 'elevation') {
      updateElevation(hex.q, hex.r);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isPainting) return;
    e.stopPropagation();

    // Get the intersection point in world space
    const { point } = e;

    // Convert to hex coordinates
    const hex = pixelToAxialPointyTop(point.x, point.z, HEX_SIZE);
    const hexKey = `${hex.q},${hex.r}`;

    // Only paint if we've moved to a new hex (avoids spamming the same action)
    if (hexKey !== lastPaintedHex) {
      // Apply the appropriate action based on edit mode
      if (editMode === 'terrain') {
        addHex(hex.q, hex.r);
      } else if (editMode === 'elevation') {
        updateElevation(hex.q, hex.r);
      }
    }
  };

  const handlePointerUp = () => {
    setIsPainting(false);
    setLastPaintedHex(null);
  };

  // Export the map as a PNG image
  const handleExportPNG = () => {
    if (!canvasRef.current) return;

    // Find the canvas element within the SceneCanvas component
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    // Export the canvas as a PNG
    exportMapAsPNG(canvas, 'map.png');
  };

  // Export the map data as JSON
  const handleExportJSON = () => {
    // Convert the map data to JSON
    const jsonData = exportMapAsJSON(hexes);

    // Download the JSON file
    downloadStringAsFile(jsonData, 'map.json', 'application/json');
  };

  return (
    <div className="map-page">
      <h1>Map Editor</h1>

      <div className="control-panel" style={{ marginBottom: '20px' }}>
        {/* Edit Mode Selector */}
        <div className="edit-mode-selector" style={{ marginBottom: '20px' }}>
          <h3>Edit Mode</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setEditMode('terrain')}
              style={{
                padding: '8px 16px',
                backgroundColor: editMode === 'terrain' ? '#4CAF50' : '#e0e0e0',
                color: editMode === 'terrain' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Terrain
            </button>
            <button
              onClick={() => setEditMode('elevation')}
              style={{
                padding: '8px 16px',
                backgroundColor: editMode === 'elevation' ? '#2196F3' : '#e0e0e0',
                color: editMode === 'elevation' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Elevation
            </button>
          </div>
        </div>

        {/* Terrain Palette (shown when in terrain mode) */}
        {editMode === 'terrain' && (
          <TerrainPalette
            selectedTerrain={selectedTerrain}
            onSelectTerrain={setSelectedTerrain}
          />
        )}

        {/* Elevation Controls (shown when in elevation mode) */}
        {editMode === 'elevation' && (
          <div className="elevation-controls">
            <h3>Elevation</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <input
                type="range"
                min="0"
                max="10"
                value={selectedElevation}
                onChange={(e) => setSelectedElevation(parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: '30px', textAlign: 'center' }}>{selectedElevation}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              {[0, 1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedElevation(level)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedElevation === level ? '#2196F3' : '#e0e0e0',
                    color: selectedElevation === level ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '15px' }}>
              Click and drag to paint elevation. Higher values create taller hexes.
            </p>
          </div>
        )}

        <div className="hex-controls" style={{ marginTop: '20px' }}>
          <h3>Test Patterns</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <button onClick={() => addTestPattern('ring')}>Add Ring</button>
            <button onClick={() => addTestPattern('river')}>Add River</button>
            <button onClick={() => addTestPattern('field')}>Add Field</button>
            <button onClick={() => addTestPattern('hill')}>Add Hill</button>
            <button onClick={() => addTestPattern('clear')}>Clear Highlight</button>
          </div>
        </div>

        <div className="export-controls" style={{ marginTop: '20px' }}>
          <h3>Export</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <button onClick={handleExportPNG}>Export PNG</button>
            <button onClick={handleExportJSON}>Export JSON</button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>
            PNG exports the current view as an image. JSON exports the map data for later import.
          </p>
        </div>
      </div>

      <div ref={canvasRef} style={{ width: '100%', height: '600px', border: '1px solid #333' }}>
        <SceneCanvas>
          <HexGrid highlightHex={highlightHex} />

          {/* Invisible ground plane for painting */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            receiveShadow
          >
            <planeGeometry args={[50, 50]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        </SceneCanvas>
      </div>
    </div>
  );
};

export default MapPage;