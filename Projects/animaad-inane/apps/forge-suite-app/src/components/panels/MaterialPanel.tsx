import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateMaterialProperties, defaultMaterial } from '../../store/geometrySlice';
import { MaterialProperties } from '../../interfaces/Asset';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="color-input" style={{ margin: '8px 0' }}>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginLeft: '8px' }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '80px', marginLeft: '8px' }}
          />
        </div>
      </label>
    </div>
  );
};

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, value, min, max, step, onChange }) => {
  return (
    <div className="slider-input" style={{ margin: '8px 0' }}>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ width: '120px', marginRight: '8px' }}
          />
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ width: '60px' }}
          />
        </div>
      </label>
    </div>
  );
};

export const MaterialPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assets, selectedAssetId } = useAppSelector(state => state.geometry);
  const [localMaterial, setLocalMaterial] = useState<MaterialProperties>({ ...defaultMaterial });
  const [updateTimer, setUpdateTimer] = useState<NodeJS.Timeout | null>(null);

  // Load material properties from the selected asset
  useEffect(() => {
    if (selectedAssetId && assets[selectedAssetId]) {
      const asset = assets[selectedAssetId];
      setLocalMaterial(asset.material || { ...defaultMaterial });
    } else {
      setLocalMaterial({ ...defaultMaterial });
    }
  }, [selectedAssetId, assets]);

  // Update material properties with debouncing
  const updateProperty = (property: keyof MaterialProperties, value: any) => {
    // Update local state immediately for responsive UI
    setLocalMaterial(prev => ({ ...prev, [property]: value }));
    
    // Debounce the dispatch to Redux to avoid too many undoable actions
    if (updateTimer) {
      clearTimeout(updateTimer);
    }
    
    setUpdateTimer(setTimeout(() => {
      if (selectedAssetId) {
        dispatch(updateMaterialProperties(selectedAssetId, { [property]: value }));
      }
    }, 300)); // Wait 300ms before dispatching
  };

  // Disable if no asset is selected
  const isDisabled = !selectedAssetId;

  return (
    <div className="material-panel" style={{ 
      padding: '16px', 
      border: '1px solid #ccc', 
      borderRadius: '4px',
      marginTop: '16px',
      width: '100%',
      opacity: isDisabled ? 0.5 : 1,
      pointerEvents: isDisabled ? 'none' : 'auto'
    }}>
      <h3 style={{ marginTop: 0 }}>Material Properties</h3>
      
      <ColorInput 
        label="Base Color"
        value={localMaterial.baseColor}
        onChange={(value) => updateProperty('baseColor', value)}
      />
      
      <SliderInput
        label="Metallic"
        value={localMaterial.metallic}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updateProperty('metallic', value)}
      />
      
      <SliderInput
        label="Roughness"
        value={localMaterial.roughness}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updateProperty('roughness', value)}
      />
      
      <ColorInput 
        label="Emissive"
        value={localMaterial.emissive}
        onChange={(value) => updateProperty('emissive', value)}
      />
      
      <SliderInput
        label="Emissive Intensity"
        value={localMaterial.emissiveIntensity}
        min={0}
        max={5}
        step={0.1}
        onChange={(value) => updateProperty('emissiveIntensity', value)}
      />
    </div>
  );
};

export default MaterialPanel;