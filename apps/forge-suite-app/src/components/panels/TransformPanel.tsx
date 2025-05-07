import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateMeshTransform } from '../../store/geometrySlice';
import * as THREE from 'three';

// Create a new context for sharing transform mode state
export const TransformModeContext = React.createContext<{
  mode: 'translate' | 'rotate' | 'scale';
  setMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;
}>({
  mode: 'translate',
  setMode: () => {},
  snapEnabled: false,
  setSnapEnabled: () => {}
});

interface Vector3InputProps {
  label: string;
  value: { x: number; y: number; z: number };
  onChange: (axis: 'x' | 'y' | 'z', value: number) => void;
}

const Vector3Input: React.FC<Vector3InputProps> = ({ label, value, onChange }) => {
  return (
    <div className="vector3-input" style={{ margin: '8px 0' }}>
      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{label}</label>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        {['x', 'y', 'z'].map((axis) => (
          <div key={axis} style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '4px' }}>{axis.toUpperCase()}:</label>
            <input
              type="number"
              value={value[axis as 'x' | 'y' | 'z']}
              onChange={(e) => onChange(axis as 'x' | 'y' | 'z', parseFloat(e.target.value) || 0)}
              style={{ width: '60px' }}
              step={label === 'Scale' ? 0.1 : label === 'Rotation' ? 15 : 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const TransformPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assets, selectedAssetId } = useAppSelector(state => state.geometry);
  
  // Local state for transform values
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  
  // State for transform mode - now exposed through context
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  
  // State for grid snapping
  const [snapEnabled, setSnapEnabled] = useState(false);
  
  // Timer for debouncing updates
  const [updateTimer, setUpdateTimer] = useState<NodeJS.Timeout | null>(null);

  // Load transform values from the selected asset
  useEffect(() => {
    if (selectedAssetId && assets[selectedAssetId]) {
      const asset = assets[selectedAssetId];
      const matrix = new THREE.Matrix4().fromArray(asset.matrix);
      
      // Extract position, rotation, scale from matrix
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      
      matrix.decompose(position, quaternion, scale);
      
      // Convert quaternion to Euler angles (degrees)
      const euler = new THREE.Euler().setFromQuaternion(quaternion);
      const rotationDegrees = {
        x: THREE.MathUtils.radToDeg(euler.x),
        y: THREE.MathUtils.radToDeg(euler.y),
        z: THREE.MathUtils.radToDeg(euler.z)
      };
      
      // Update local state
      setPosition({ x: position.x, y: position.y, z: position.z });
      setRotation(rotationDegrees);
      setScale({ x: scale.x, y: scale.y, z: scale.z });
    }
  }, [selectedAssetId, assets]);

  // Update transform matrix and dispatch to store
  const updateTransform = () => {
    if (!selectedAssetId) return;
    
    // Create matrix from components
    const matrix = new THREE.Matrix4();
    
    // Create objects for transform composition
    const positionVector = new THREE.Vector3(position.x, position.y, position.z);
    
    // Convert rotation from degrees to radians
    const rotationRadians = {
      x: THREE.MathUtils.degToRad(rotation.x),
      y: THREE.MathUtils.degToRad(rotation.y),
      z: THREE.MathUtils.degToRad(rotation.z)
    };
    const quaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(rotationRadians.x, rotationRadians.y, rotationRadians.z)
    );
    
    const scaleVector = new THREE.Vector3(scale.x, scale.y, scale.z);
    
    // Compose the matrix
    matrix.compose(positionVector, quaternion, scaleVector);
    
    // Dispatch update to store
    dispatch(updateMeshTransform(selectedAssetId, Array.from(matrix.elements)));
  };

  // Handle position change
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    setPosition(prev => ({ ...prev, [axis]: value }));
    scheduleUpdate();
  };

  // Handle rotation change
  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    setRotation(prev => ({ ...prev, [axis]: value }));
    scheduleUpdate();
  };

  // Handle scale change
  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    setScale(prev => ({ ...prev, [axis]: value }));
    scheduleUpdate();
  };

  // Debounced update scheduler
  const scheduleUpdate = () => {
    if (updateTimer) {
      clearTimeout(updateTimer);
    }
    setUpdateTimer(setTimeout(() => {
      updateTransform();
      setUpdateTimer(null);
    }, 300)); // Wait 300ms before dispatching
  };

  // Reset transform to identity
  const handleReset = () => {
    setPosition({ x: 0, y: 0, z: 0 });
    setRotation({ x: 0, y: 0, z: 0 });
    setScale({ x: 1, y: 1, z: 1 });
    
    // Create identity matrix
    const identityMatrix = Array.from(new THREE.Matrix4().elements);
    
    if (selectedAssetId) {
      dispatch(updateMeshTransform(selectedAssetId, identityMatrix));
    }
  };

  // Handle transform mode change
  const handleModeChange = (mode: 'translate' | 'rotate' | 'scale') => {
    setTransformMode(mode);
  };

  // Disable if no asset is selected
  const isDisabled = !selectedAssetId;

  return (
    <TransformModeContext.Provider value={{ mode: transformMode, setMode: handleModeChange, snapEnabled, setSnapEnabled }}>
      <div className="transform-panel" style={{ 
        padding: '16px', 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        marginTop: '16px',
        width: '100%',
        opacity: isDisabled ? 0.5 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto'
      }}>
        {/* Grid snapping toggle */}
        <div style={{ marginBottom: '12px' }}>
          <label>
            <input
              type="checkbox"
              checked={snapEnabled}
              onChange={() => setSnapEnabled(prev => !prev)}
              style={{ marginRight: '8px' }}
            />
            Snap to Grid
          </label>
        </div>
        <h3 style={{ marginTop: 0 }}>Transform</h3>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '16px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => handleModeChange('translate')}
            style={{ 
              flex: 1, 
              padding: '8px', 
              background: transformMode === 'translate' ? '#4a90e2' : 'transparent',
              color: transformMode === 'translate' ? 'white' : 'inherit',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Move (G)
          </button>
          <button
            onClick={() => handleModeChange('rotate')}
            style={{ 
              flex: 1, 
              padding: '8px', 
              background: transformMode === 'rotate' ? '#4a90e2' : 'transparent',
              color: transformMode === 'rotate' ? 'white' : 'inherit',
              border: 'none',
              borderLeft: '1px solid #ddd',
              borderRight: '1px solid #ddd',
              cursor: 'pointer'
            }}
          >
            Rotate (R)
          </button>
          <button
            onClick={() => handleModeChange('scale')}
            style={{ 
              flex: 1, 
              padding: '8px', 
              background: transformMode === 'scale' ? '#4a90e2' : 'transparent',
              color: transformMode === 'scale' ? 'white' : 'inherit',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Scale (S)
          </button>
        </div>
        
        <Vector3Input 
          label="Position"
          value={position}
          onChange={handlePositionChange}
        />
        
        <Vector3Input 
          label="Rotation"
          value={rotation}
          onChange={handleRotationChange}
        />
        
        <Vector3Input 
          label="Scale"
          value={scale}
          onChange={handleScaleChange}
        />
        
        <button 
          onClick={handleReset} 
          style={{ marginTop: '12px' }}
        >
          Reset Transform
        </button>
      </div>
    </TransformModeContext.Provider>
  );
};

export default TransformPanel;