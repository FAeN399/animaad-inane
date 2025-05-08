import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectedAssetIdSelector, selectedAssetSelector } from '../../store/selectors/geometrySelectors';
import { updateMeshTransform } from '../../store/geometrySlice';
import { toggleSnapping, setSnapTranslation, setSnapRotation, setSnapScale } from '../../store/settingsSlice';
import type { SettingsState } from '../../store/settingsSlice';
import * as THREE from 'three';

// Define context for transform mode and snapping
interface ITransformModeContext {
  mode: 'translate' | 'rotate' | 'scale';
  setMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  isSnapEnabled: boolean; // Renamed from snapEnabled to isSnapEnabled for clarity
  toggleSnap: () => void;
}

export const TransformModeContext = createContext<ITransformModeContext>({
  mode: 'translate',
  setMode: () => {},
  isSnapEnabled: false,
  toggleSnap: () => {},
});

const TransformPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector(selectedAssetIdSelector);
  const selectedAsset = useAppSelector(selectedAssetSelector);
  const { 
    isSnappingEnabled, 
    snapTranslation, 
    snapRotation, 
    snapScale 
  } = useAppSelector((state: { settings: SettingsState }) => state.settings);

  const [currentMode, setCurrentMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 }); // Euler angles in degrees
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });

  useEffect(() => {
    if (selectedAsset) {
      const matrix = new THREE.Matrix4().fromArray(selectedAsset.matrix);
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scl = new THREE.Vector3();
      matrix.decompose(pos, quat, scl);

      const euler = new THREE.Euler().setFromQuaternion(quat, 'XYZ');

      setPosition({ x: pos.x, y: pos.y, z: pos.z });
      setRotation({
        x: THREE.MathUtils.radToDeg(euler.x),
        y: THREE.MathUtils.radToDeg(euler.y),
        z: THREE.MathUtils.radToDeg(euler.z),
      });
      setScale({ x: scl.x, y: scl.y, z: scl.z });
    } else {
      // Reset to defaults if no asset is selected
      setPosition({ x: 0, y: 0, z: 0 });
      setRotation({ x: 0, y: 0, z: 0 });
      setScale({ x: 1, y: 1, z: 1 });
    }
  }, [selectedAsset]);

  const handleInputChange = (
    axis: 'x' | 'y' | 'z',
    type: 'position' | 'rotation' | 'scale',
    value: string
  ) => {
    const numericValue = parseFloat(value); // Allow NaN for empty input
    
    // Update local state for immediate feedback
    switch (type) {
      case 'position':
        setPosition(prev => ({ ...prev, [axis]: numericValue }));
        break;
      case 'rotation':
        setRotation(prev => ({ ...prev, [axis]: numericValue }));
        break;
      case 'scale':
        setScale(prev => ({ ...prev, [axis]: numericValue }));
        break;
    }

    // Defer Redux update until blur or if value is valid
    if (selectedId && !isNaN(numericValue)) {
        // Construct the new matrix based on the *updated local state*
        const newPos = type === 'position' ? { ...position, [axis]: numericValue } : position;
        const newRotDeg = type === 'rotation' ? { ...rotation, [axis]: numericValue } : rotation;
        const newScl = type === 'scale' ? { ...scale, [axis]: numericValue } : scale;

        const finalMatrix = new THREE.Matrix4().compose(
            new THREE.Vector3(newPos.x, newPos.y, newPos.z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(
                THREE.MathUtils.degToRad(newRotDeg.x),
                THREE.MathUtils.degToRad(newRotDeg.y),
                THREE.MathUtils.degToRad(newRotDeg.z),
                'XYZ'
            )),
            new THREE.Vector3(newScl.x, newScl.y, newScl.z)
        );
        dispatch(updateMeshTransform(selectedId, Array.from(finalMatrix.elements)));
    }
  };
  
  const handleInputBlur = (
    axis: 'x' | 'y' | 'z',
    type: 'position' | 'rotation' | 'scale'
  ) => {
    let stateValue: number;
    let defaultValue: number;

    switch (type) {
        case 'position': stateValue = position[axis]; defaultValue = 0; break;
        case 'rotation': stateValue = rotation[axis]; defaultValue = 0; break;
        case 'scale': stateValue = scale[axis]; defaultValue = 1; break;
        default: return;
    }

    if (isNaN(stateValue)) { // If input was cleared or invalid
        handleInputChange(axis, type, defaultValue.toString());
    } else if (selectedId) { // Ensure Redux is updated with the current valid local state on blur
        const finalMatrix = new THREE.Matrix4().compose(
            new THREE.Vector3(position.x, position.y, position.z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(
                THREE.MathUtils.degToRad(rotation.x),
                THREE.MathUtils.degToRad(rotation.y),
                THREE.MathUtils.degToRad(rotation.z),
                'XYZ'
            )),
            new THREE.Vector3(scale.x, scale.y, scale.z)
        );
        dispatch(updateMeshTransform(selectedId, Array.from(finalMatrix.elements)));
    }
  };


  const renderInputGroup = (label: string, type: 'position' | 'rotation' | 'scale', values: { x: number; y: number; z: number }) => (
    <div style={{ marginBottom: '10px' }}>
      <strong>{label}</strong>
      {['x', 'y', 'z'].map((axis) => (
        <div key={axis} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <label htmlFor={`${type}-${axis}`} style={{ marginRight: '5px', width: '10px' }}>{axis.toUpperCase()}:</label>
          <input
            id={`${type}-${axis}`}
            type="number"
            step={type === 'rotation' ? 1 : (type === 'position' ? snapTranslation : snapScale)}
            value={isNaN(values[axis as 'x' | 'y' | 'z']) ? '' : values[axis as 'x' | 'y' | 'z'].toFixed(type === 'rotation' ? 0 : (type === 'position' ? 3 : 2))}
            onChange={(e) => handleInputChange(axis as 'x' | 'y' | 'z', type, e.target.value)}
            onBlur={() => handleInputBlur(axis as 'x' | 'y' | 'z', type)}
            disabled={!selectedId}
            style={{ width: '80px' }}
          />
        </div>
      ))}
    </div>
  );
  
  const contextValue = {
    mode: currentMode,
    setMode: setCurrentMode,
    isSnapEnabled: isSnappingEnabled,
    toggleSnap: () => dispatch(toggleSnapping()),
  };

  return (
    <TransformModeContext.Provider value={contextValue}>
      <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '220px' }}>
        <h4>Transform</h4>
        <div style={{ marginBottom: '10px' }}>
          <strong>Mode:</strong>
          {['translate', 'rotate', 'scale'].map((m) => (
            <button 
              key={m}
              onClick={() => setCurrentMode(m as 'translate' | 'rotate' | 'scale')}
              disabled={!selectedId}
              style={{ 
                marginLeft: '5px', 
                backgroundColor: currentMode === m ? '#007bff' : undefined,
                color: currentMode === m ? 'white' : undefined,
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {renderInputGroup('Position', 'position', position)}
        {renderInputGroup('Rotation', 'rotation', rotation)}
        {renderInputGroup('Scale', 'scale', scale)}

        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <strong>Snapping:</strong>
          <div>
            <label>
              <input 
                type="checkbox" 
                checked={isSnappingEnabled} 
                onChange={() => dispatch(toggleSnapping())}
                disabled={!selectedId} 
              />
              Enable Snapping
            </label>
          </div>
          {isSnappingEnabled && (
            <>
              <div style={{ marginTop: '5px' }}>
                <label htmlFor="snap-translate" style={{ marginRight: '5px' }}>Move:</label>
                <input 
                  id="snap-translate" 
                  type="number" 
                  step="0.01" 
                  value={snapTranslation} 
                  onChange={(e) => dispatch(setSnapTranslation(parseFloat(e.target.value) || 0.1))}
                  disabled={!selectedId} 
                  style={{ width: '60px' }}
                /> m
              </div>
              <div style={{ marginTop: '5px' }}>
                <label htmlFor="snap-rotate" style={{ marginRight: '5px' }}>Rotate:</label>
                <input 
                  id="snap-rotate" 
                  type="number" 
                  step="1" 
                  value={snapRotation} 
                  onChange={(e) => dispatch(setSnapRotation(parseInt(e.target.value, 10) || 15))}
                  disabled={!selectedId} 
                  style={{ width: '60px' }}
                /> °
              </div>
              <div style={{ marginTop: '5px' }}>
                <label htmlFor="snap-scale" style={{ marginRight: '5px' }}>Scale:</label>
                <input 
                  id="snap-scale" 
                  type="number" 
                  step="0.01" 
                  value={snapScale} 
                  onChange={(e) => dispatch(setSnapScale(parseFloat(e.target.value) || 0.1))}
                  disabled={!selectedId} 
                  style={{ width: '60px' }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </TransformModeContext.Provider>
  );
};

export default TransformPanel;