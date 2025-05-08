// Utility functions for exporting data

import { HexData } from '../interfaces/MapData';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import HexGrid from '../components/map/HexGrid';

/**
 * Export map data as JSON
 * @param hexes The map data to export
 * @returns A JSON string representation of the map data
 */
export function exportMapAsJSON(hexes: Record<string, HexData>): string {
  // Create a clean export format
  const exportData = {
    version: '1.0',
    type: 'forge-suite-map',
    data: {
      hexes: Object.values(hexes).map(hex => ({
        q: hex.q,
        r: hex.r,
        terrain: hex.terrain,
        elevation: hex.elevation || 0,
        overlays: hex.overlays || []
      }))
    }
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export the current map view as a PNG image
 * @param canvasElement The canvas element to capture
 * @param fileName The name of the file to download
 */
export function exportMapAsPNG(canvasElement: HTMLCanvasElement, fileName: string = 'map.png'): void {
  // Create a temporary canvas to render the image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasElement.width;
  tempCanvas.height = canvasElement.height;
  const ctx = tempCanvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get 2D context for canvas');
    return;
  }
  
  // Draw the WebGL canvas to the temporary canvas
  ctx.drawImage(canvasElement, 0, 0);
  
  // Convert to blob and download
  tempCanvas.toBlob((blob) => {
    if (!blob) {
      console.error('Could not create blob from canvas');
      return;
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

/**
 * Helper function to download a string as a file
 * @param content The string content to download
 * @param fileName The name of the file to download
 * @param contentType The MIME type of the file
 */
export function downloadStringAsFile(content: string, fileName: string, contentType: string = 'application/json'): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
