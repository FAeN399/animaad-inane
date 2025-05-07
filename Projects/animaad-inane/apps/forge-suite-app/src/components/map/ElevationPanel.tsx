import React from 'react';

interface ElevationPanelProps {
  value: number;
  onChange: (value: number) => void;
}

const ElevationPanel: React.FC<ElevationPanelProps> = ({ value, onChange }) => (
  <div className="elevation-panel" style={{ marginBottom: '16px', padding: '8px', border: '1px solid #ddd' }}>
    <h3>Elevation</h3>
    <input
      type="range"
      min={0}
      max={10}
      step={0.5}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ width: '100%' }}
    />
    <input
      type="number"
      min={0}
      max={10}
      step={0.5}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      style={{ width: '60px', marginTop: '8px' }}
    />
  </div>
);

export default ElevationPanel;