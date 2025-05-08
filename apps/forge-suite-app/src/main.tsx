import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './index.css'
import App from './App.tsx'
import * as THREE from 'three'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Enable THREE.ColorManagement globally
THREE.ColorManagement.enabled = true

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ToastContainer position="top-right" autoClose={3000} />
      <App />
    </Provider>
  </StrictMode>,
)
