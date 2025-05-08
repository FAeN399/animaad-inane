import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { useAppSelector } from '../../store/hooks';
import { Suspense } from 'react';

interface MapSceneCanvasProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  height?: string | number;
}

export const MapSceneCanvas: React.FC<MapSceneCanvasProps> = ({
  children,
  backgroundColor = '#1a1a1a',
  height = '400px',
}) => {
  // Get the current view mode from the store
  const viewMode = useAppSelector(state => state.map.viewMode);
  
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas
        frameloop="demand"
        shadows
        style={{
          background: backgroundColor,
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            intensity={1}
            position={[5, 10, 7.5]}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          
          {/* Camera based on view mode */}
          {viewMode === '2d' ? (
            <OrthographicCamera
              makeDefault
              position={[0, 10, 0]}
              zoom={50}
              near={0.1}
              far={1000}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          ) : (
            <PerspectiveCamera
              makeDefault
              position={[5, 5, 5]}
              fov={50}
              near={0.1}
              far={1000}
            />
          )}
          
          {/* Controls based on view mode */}
          {viewMode === '2d' ? (
            <OrbitControls
              makeDefault
              enableRotate={false}
              enableZoom={true}
              enablePan={true}
              minZoom={10}
              maxZoom={100}
            />
          ) : (
            <OrbitControls
              makeDefault
              enableRotate={true}
              enableZoom={true}
              enablePan={true}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2 - 0.1} // Prevent camera from going below the ground
            />
          )}
          
          {/* Render children */}
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default MapSceneCanvas;
