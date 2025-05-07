import React, { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addRing, removeRing, setRingSymmetry, addElement, removeElement } from '../store/mandalaSlice';
import { v4 as uuidv4 } from 'uuid';

export function MandalaPage() {
  const dispatch = useAppDispatch();
  const rings = useAppSelector(state => state.mandala.rings);
  const elements = useAppSelector(state => state.mandala.elements);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleAddRing = () => {
    const id = uuidv4();
    dispatch(addRing({ id }));
  };

  const handleRemoveRing = (id: string) => {
    dispatch(removeRing({ id }));
  };

  const handleSymmetryChange = (id: string, symmetry: number) => {
    dispatch(setRingSymmetry({ id, symmetry }));
  };

  const handleAddElement = (ringId: string) => {
    const id = uuidv4();
    dispatch(addElement({ id, ringId, angle: 0, type: 'circle' }));
  };

  const handleRemoveElement = (id: string) => {
    dispatch(removeElement({ id }));
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

  // Simple SVG mandala placeholder
  const center = 250;
  const radiusStep = 50;

  return (
    <div className="mandala-page" style={{ padding: '16px' }}>
      <h1>Mandala Generator</h1>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={exportPNG} style={{ marginRight: '8px' }}>Export PNG</button>
        <button onClick={handleAddRing}>Add Ring</button>
      </div>
      <div style={{ marginBottom: '16px' }}>
        {rings.map((ring, index) => (
          <div key={ring.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>Ring {index + 1}:</span>
            <input
              type="number"
              min={1}
              value={ring.symmetry}
              onChange={(e) => handleSymmetryChange(ring.id, parseInt(e.target.value) || 1)}
              style={{ width: '60px', marginRight: '8px' }}
            />
            <button onClick={() => handleRemoveRing(ring.id)}>Remove</button>
            <button onClick={() => handleAddElement(ring.id)} style={{ marginLeft: '8px' }}>Add Element</button>
          </div>
        ))}
      </div>
      {/* List of elements */}
      <div style={{ marginBottom: '16px' }}>
        <h3>Elements</h3>
        {elements.map(el => (
          <div key={el.id} style={{ marginBottom: '4px' }}>
            <span>Element {el.id} on Ring {rings.findIndex(r => r.id === el.ringId) + 1}</span>
            <button onClick={() => handleRemoveElement(el.id)} style={{ marginLeft: '8px' }}>Remove</button>
          </div>
        ))}
      </div>
      <svg ref={svgRef} width={500} height={500} style={{ border: '1px solid #ccc' }}>
        {rings.map((ring, index) => (
          <circle
            key={ring.id}
            cx={center}
            cy={center}
            r={radiusStep * (index + 1)}
            stroke="#333"
            fill="none"
          />
        ))}
        {/* Render elements with symmetry replication */}
        {elements.map(el => {
          const ringIndex = rings.findIndex(r => r.id === el.ringId);
          const radius = radiusStep * (ringIndex + 1);
          const symmetry = rings[ringIndex]?.symmetry || 1;
          return Array.from({ length: symmetry }).map((_, i) => {
            const angle = el.angle + (2 * Math.PI * i) / symmetry;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <circle key={`${el.id}-${i}`} cx={x} cy={y} r={5} fill="red" />
            );
          });
        })}
      </svg>
    </div>
  );
}

export default MandalaPage;