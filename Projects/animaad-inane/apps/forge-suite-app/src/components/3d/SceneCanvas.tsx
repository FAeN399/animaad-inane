import { Grid } from '@react-three/drei';
import { useAppSelector } from '../../store/hooks';
import SceneCanvasBase from '../../ui/core/SceneCanvasBase';

interface SceneCanvasProps {
  children?: React.ReactNode;
}

export const SceneCanvas = ({ children }: SceneCanvasProps) => {
  const theme = useAppSelector(state => state.settings.theme);
  const backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f0f0f0';
  
  return (
    <SceneCanvasBase backgroundColor={backgroundColor}>
      {/* Default placeholder objects */}
      {!children && (
        <>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#8866ff" />
          </mesh>
          <Grid 
            renderOrder={-1}
            position={[0, -0.5, 0]} 
            args={[10, 10]} 
            cellSize={1} 
            cellThickness={0.6}
            cellColor={theme === 'dark' ? '#6f6f6f' : '#c2c2c2'} 
            sectionSize={5}
            sectionThickness={1.2}
            sectionColor={theme === 'dark' ? '#9d9d9d' : '#888888'}
            fadeDistance={25}
          />
        </>
      )}
      
      {/* Render children if provided */}
      {children}
    </SceneCanvasBase>
  );
};

export default SceneCanvas;