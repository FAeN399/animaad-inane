import React from 'react';

// Define terrain types and their display properties
export const TERRAIN_TYPES = [
  { id: 'grass', name: 'Grass', color: '#4CAF50' },
  { id: 'water', name: 'Water', color: '#2196F3' },
  { id: 'sand', name: 'Sand', color: '#FFC107' },
  { id: 'rock', name: 'Rock', color: '#795548' },
  { id: 'snow', name: 'Snow', color: '#ECEFF1' },
  { id: 'forest', name: 'Forest', color: '#388E3C' }
];

export interface TerrainPaletteProps {
  selectedTerrain: string;
  onSelectTerrain: (terrain: string) => void;
}

/**
 * TerrainPalette component for selecting terrain types in the map editor
 */
const TerrainPalette: React.FC<TerrainPaletteProps> = ({ 
  selectedTerrain,
  onSelectTerrain
}) => {
  return (
    <div className="terrain-palette">
      <h3>Terrain</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {TERRAIN_TYPES.map(terrain => (
          <div 
            key={terrain.id}
            onClick={() => onSelectTerrain(terrain.id)}
            style={{
              background: terrain.color,
              color: ['snow', 'sand'].includes(terrain.id) ? '#333' : '#fff',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '80px',
              border: selectedTerrain === terrain.id ? '2px solid #fff' : '2px solid transparent',
              boxShadow: selectedTerrain === terrain.id ? '0 0 0 1px #000' : 'none'
            }}
          >
            {terrain.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TerrainPalette;