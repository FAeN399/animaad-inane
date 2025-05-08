import React, { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addRingUndoable,
  removeRingUndoable,
  setRingSymmetryUndoable,
  addElementUndoable,
  removeElementUndoable,
  updateRingStyleUndoable,
  updateElementStyle,
  defaultRingStyle
} from '../store/mandalaSlice';
import { undo, redo } from '../store/undoableSlice';
import { v4 as uuidv4 } from 'uuid';
import { RingStyle } from '../interfaces/Mandala';

export function MandalaPage() {
  const dispatch = useAppDispatch();
  const rings = useAppSelector(state => state.mandala.rings);
  const elements = useAppSelector(state => state.mandala.elements);
  const undoable = useAppSelector(state => state.undoable);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedRingId, setSelectedRingId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleAddRing = () => {
    const id = uuidv4();
    dispatch(addRingUndoable(id));
  };

  const handleRemoveRing = (id: string) => {
    dispatch(removeRingUndoable(id));
    if (selectedRingId === id) {
      setSelectedRingId(null);
    }
  };

  const handleSymmetryChange = (id: string, symmetry: number) => {
    dispatch(setRingSymmetryUndoable(id, symmetry));
  };

  const handleAddElement = (ringId: string) => {
    const id = uuidv4();
    dispatch(addElementUndoable({ id, ringId, angle: 0, type: 'circle' }));
  };

  const handleRemoveElement = (id: string) => {
    dispatch(removeElementUndoable(id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleRingStyleChange = (id: string, style: Partial<RingStyle>) => {
    dispatch(updateRingStyleUndoable(id, style));
  };

  const handleElementStyleChange = (id: string, style: Partial<RingStyle> | null) => {
    dispatch(updateElementStyle({ id, style }));
  };

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  // Export mandala SVG to PNG
  const exportPNG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgRef.current!.clientWidth;
      canvas.height = svgRef.current!.clientHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          if (!blob) return;
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'mandala.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Get the style for an element (either its override or its ring's style)
  const getElementStyle = (elementId: string) => {
    const element = elements.find(e => e.id === elementId);
    if (!element) return defaultRingStyle;

    if (element.styleOverride) return element.styleOverride;

    const ring = rings.find(r => r.id === element.ringId);
    return ring?.style || defaultRingStyle;
  };

  // Simple SVG mandala placeholder
  const center = 250;
  const radiusStep = 50;

  // Get the selected ring
  const selectedRing = selectedRingId ? rings.find(r => r.id === selectedRingId) : null;
  const selectedElement = selectedElementId ? elements.find(e => e.id === selectedElementId) : null;

  return (
    <div className="mandala-page" style={{ padding: '16px' }}>
      <h1>Mandala Generator</h1>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={exportPNG} style={{ marginRight: '8px' }}>Export PNG</button>
        <button onClick={handleAddRing} style={{ marginRight: '8px' }}>Add Ring</button>
        <button onClick={handleUndo} disabled={undoable.past.length === 0} style={{ marginRight: '8px' }}>Undo</button>
        <button onClick={handleRedo} disabled={undoable.future.length === 0}>Redo</button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: '1', maxWidth: '300px' }}>
          <h3>Rings</h3>
          <div style={{ marginBottom: '16px' }}>
            {rings.map((ring, index) => (
              <div
                key={ring.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  padding: '4px',
                  backgroundColor: selectedRingId === ring.id ? '#f0f0f0' : 'transparent',
                  borderRadius: '4px'
                }}
                onClick={() => setSelectedRingId(ring.id)}
              >
                <span style={{ marginRight: '8px' }}>Ring {index + 1}:</span>
                <input
                  type="number"
                  min={1}
                  max={128}
                  value={ring.symmetry}
                  onChange={(e) => handleSymmetryChange(ring.id, parseInt(e.target.value) || 1)}
                  style={{ width: '60px', marginRight: '8px' }}
                />
                <button onClick={(e) => { e.stopPropagation(); handleRemoveRing(ring.id); }}>Remove</button>
                <button onClick={(e) => { e.stopPropagation(); handleAddElement(ring.id); }} style={{ marginLeft: '8px' }}>Add Element</button>
              </div>
            ))}
          </div>

          {/* List of elements */}
          <h3>Elements</h3>
          <div style={{ marginBottom: '16px' }}>
            {elements.map(el => {
              const ringIndex = rings.findIndex(r => r.id === el.ringId);
              return (
                <div
                  key={el.id}
                  style={{
                    marginBottom: '4px',
                    padding: '4px',
                    backgroundColor: selectedElementId === el.id ? '#f0f0f0' : 'transparent',
                    borderRadius: '4px'
                  }}
                  onClick={() => setSelectedElementId(el.id)}
                >
                  <span>Element on Ring {ringIndex + 1}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveElement(el.id); }}
                    style={{ marginLeft: '8px' }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: '1', maxWidth: '300px' }}>
          {/* Ring Style Panel */}
          {selectedRing && (
            <div style={{ marginBottom: '16px' }}>
              <h3>Ring Style</h3>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Color:</label>
                <input
                  type="color"
                  value={selectedRing.style.color}
                  onChange={(e) => handleRingStyleChange(selectedRing.id, { color: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Stroke Width:</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selectedRing.style.strokeWidth}
                  onChange={(e) => handleRingStyleChange(selectedRing.id, { strokeWidth: parseInt(e.target.value) })}
                />
                <span style={{ marginLeft: '8px' }}>{selectedRing.style.strokeWidth}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Opacity:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedRing.style.opacity}
                  onChange={(e) => handleRingStyleChange(selectedRing.id, { opacity: parseFloat(e.target.value) })}
                />
                <span style={{ marginLeft: '8px' }}>{selectedRing.style.opacity}</span>
              </div>
            </div>
          )}

          {/* Element Style Override Panel */}
          {selectedElement && (
            <div>
              <h3>Element Style</h3>
              <div style={{ marginBottom: '8px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!selectedElement.styleOverride}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Create override with current ring style
                        const ringStyle = rings.find(r => r.id === selectedElement.ringId)?.style || defaultRingStyle;
                        handleElementStyleChange(selectedElement.id, { ...ringStyle });
                      } else {
                        // Remove override
                        handleElementStyleChange(selectedElement.id, null);
                      }
                    }}
                  />
                  Override Ring Style
                </label>
              </div>

              {selectedElement.styleOverride && (
                <>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Color:</label>
                    <input
                      type="color"
                      value={selectedElement.styleOverride.color}
                      onChange={(e) => handleElementStyleChange(selectedElement.id, { color: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Stroke Width:</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={selectedElement.styleOverride.strokeWidth}
                      onChange={(e) => handleElementStyleChange(selectedElement.id, { strokeWidth: parseInt(e.target.value) })}
                    />
                    <span style={{ marginLeft: '8px' }}>{selectedElement.styleOverride.strokeWidth}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Opacity:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedElement.styleOverride.opacity}
                      onChange={(e) => handleElementStyleChange(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                    />
                    <span style={{ marginLeft: '8px' }}>{selectedElement.styleOverride.opacity}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ flex: '2' }}>
          <svg ref={svgRef} width={500} height={500} style={{ border: '1px solid #ccc' }}>
            {rings.map((ring, index) => (
              <circle
                key={ring.id}
                cx={center}
                cy={center}
                r={radiusStep * (index + 1)}
                stroke={ring.style.color}
                strokeWidth={ring.style.strokeWidth}
                opacity={ring.style.opacity}
                fill="none"
                onClick={() => setSelectedRingId(ring.id)}
                style={{ cursor: 'pointer' }}
              />
            ))}
            {/* Render elements with symmetry replication */}
            {elements.map(el => {
              const ringIndex = rings.findIndex(r => r.id === el.ringId);
              if (ringIndex === -1) return null; // Skip if ring doesn't exist

              const radius = radiusStep * (ringIndex + 1);
              const symmetry = rings[ringIndex]?.symmetry || 1;
              const style = el.styleOverride || rings[ringIndex]?.style || defaultRingStyle;

              return Array.from({ length: symmetry }).map((_, i) => {
                const angle = el.angle + (2 * Math.PI * i) / symmetry;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return (
                  <circle
                    key={`${el.id}-${i}`}
                    cx={x}
                    cy={y}
                    r={5}
                    fill={style.color}
                    opacity={style.opacity}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(el.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                );
              });
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default MandalaPage;