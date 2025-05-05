import { useAppSelector } from '../store/hooks';
import SceneCanvas from '../components/3d/SceneCanvas';

export function HomePage() {
  const theme = useAppSelector(state => state.settings.theme);
  
  return (
    <div className="home-page">
      <h1>Forge Suite</h1>
      <p>Welcome to the Forge Suite application.</p>
      <p>Current theme: {theme}</p>
      
      <div style={{ marginTop: '2rem', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <SceneCanvas />
      </div>
      
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        A basic Three.js scene is rendered above. Use mouse to orbit, zoom, and pan.
      </p>
    </div>
  );
}

export default HomePage;