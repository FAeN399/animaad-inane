import { useEffect, useRef, useContext } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls as ThreeTransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAppDispatch } from '../../store/hooks';
import { updateMeshTransform } from '../../store/geometrySlice';
import { TransformModeContext } from '../panels/TransformPanel';

interface TransformControlsProps {
  object: THREE.Object3D | null;
}

const TransformControls: React.FC<TransformControlsProps> = ({ object }) => {
  const dispatch = useAppDispatch();
  const { mode, snapEnabled, setMode } = useContext(TransformModeContext);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Keyboard shortcuts for transform modes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only when object is selected
      if (!object) return;
      
      switch (event.key.toLowerCase()) {
        case 'g': // Move (grab)
          setMode('translate');
          break;
        case 'r': // Rotate
          setMode('rotate');
          break;
        case 's': // Scale
          setMode('scale');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [object, setMode]);

  // Apply snapping settings when enabled/disabled or mode changes
  useEffect(() => {
    if (!controlsRef.current) return;
    // Set snapping values: translate 1 unit, rotate 15°, scale 0.1 units
    if (snapEnabled) {
      controlsRef.current.setTranslationSnap([1, 1, 1]);
      controlsRef.current.setRotationSnap(THREE.MathUtils.degToRad(15));
      controlsRef.current.setScaleSnap([0.1, 0.1, 0.1]);
    } else {
      controlsRef.current.setTranslationSnap(null);
      controlsRef.current.setRotationSnap(null);
      controlsRef.current.setScaleSnap(null);
    }
    // Ensure mode is applied
    if (controlsRef.current.setMode) {
      controlsRef.current.setMode(mode);
    }
  }, [snapEnabled, mode]);

  // Save the transform to Redux store when transform finishes
  useEffect(() => {
    if (!controlsRef.current) return;

    const handleObjectChange = (event: any) => {
      if (!object) return;
      
      // When dragging ends, save transform to store
      if (event.value === false && object.userData.id) {
        const matrix = new THREE.Matrix4().copy(object.matrix);
        dispatch(updateMeshTransform(object.userData.id, Array.from(matrix.elements)));
      }
    };

    controlsRef.current.addEventListener('dragging-changed', handleObjectChange);
    return () => {
      if (controlsRef.current) {
        controlsRef.current.removeEventListener('dragging-changed', handleObjectChange);
      }
    };
  }, [object, dispatch]);

  if (!object) return null;

  return (
    <ThreeTransformControls
      ref={controlsRef}
      object={object}
      mode={mode}
      size={1}
      enabled={!!object}
    />
  );
};

export default TransformControls;