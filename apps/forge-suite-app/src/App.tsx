import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import GeometryPage from './pages/GeometryPage'
import MapPage from './pages/MapPage'
import MandalaPage from './pages/MandalaPage'
import { useAppSelector } from './store/hooks'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const theme = useAppSelector(state => state.settings.theme);

  return (
    <div className={`app ${theme}`}>
      <BrowserRouter>
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/geometry" element={<GeometryPage />} />
            <Route path="/geometry/:id" element={<GeometryPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/mandala" element={<MandalaPage />} />
          </Routes>
        </main>
      </BrowserRouter>
      <ToastContainer 
        position="bottom-right"
        theme={theme}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
