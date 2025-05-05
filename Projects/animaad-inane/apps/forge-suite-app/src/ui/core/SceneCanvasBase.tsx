import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { Suspense } from 'react';

interface SceneCanvasBaseProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  height?: string | number;
}

export const SceneCanvasBase = ({
  children,
  backgroundColor = '#1a1a1a',
  height = '400px',
}: SceneCanvasBaseProps) => {
  return (
    <div style={{ width: '100%', height }}>
      <Canvas
        frameloop="demand"
        shadows
        camera={{ position: [5, 5, 5], fov: 50 }}
        style={{
          background: backgroundColor,
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Render children if provided */}
          {children}
          
          <OrbitControls makeDefault />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SceneCanvasBase;