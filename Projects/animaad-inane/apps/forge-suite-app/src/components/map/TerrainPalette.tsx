import React from 'react';

interface TerrainPaletteProps {
  activeTerrain: string;
  onSelect: (terrain: string) => void;
}

const TERRAIN_TYPES = [
  { name: 'Grass', value: 'grass', color: '#4caf50' },
  { name: 'Water', value: 'water', color: '#2196f3' },
  { name: 'Sand', value: 'sand', color: '#ffeb3b' },
];

const TerrainPalette: React.FC<TerrainPaletteProps> = ({ activeTerrain, onSelect }) => (
  <div className="terrain-palette" style={{ marginBottom: '16px', padding: '8px', border: '1px solid #ddd' }}>
    <h3>Terrain Palette</h3>
    <div style={{ display: 'flex', gap: '8px' }}>
      {TERRAIN_TYPES.map(type => (
        <button
          key={type.value}
          onClick={() => onSelect(type.value)}
          style={{
            backgroundColor: type.color,
            padding: '8px',
            border: activeTerrain === type.value ? '2px solid #000' : '1px solid #ccc',
            cursor: 'pointer'
          }}
        >
          {type.name}
        </button>
      ))}
    </div>
  </div>
);

export default TerrainPalette;