import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TerrainPalette, { TERRAIN_TYPES } from './TerrainPalette';

describe('TerrainPalette', () => {
  it('renders all terrain types', () => {
    const mockSelectTerrain = vi.fn();
    render(
      <TerrainPalette
        selectedTerrain="grass"
        onSelectTerrain={mockSelectTerrain}
      />
    );
    
    // Check that all terrain types are rendered
    TERRAIN_TYPES.forEach(terrain => {
      expect(screen.getByText(terrain.name)).toBeInTheDocument();
    });
  });
  
  it('calls onSelectTerrain when a terrain is clicked', () => {
    const mockSelectTerrain = vi.fn();
    render(
      <TerrainPalette
        selectedTerrain="grass"
        onSelectTerrain={mockSelectTerrain}
      />
    );
    
    // Click on 'Water' terrain
    fireEvent.click(screen.getByText('Water'));
    
    // Check that the handler was called with the correct terrain ID
    expect(mockSelectTerrain).toHaveBeenCalledWith('water');
  });
  
  it('highlights the currently selected terrain', () => {
    const mockSelectTerrain = vi.fn();
    const { rerender } = render(
      <TerrainPalette
        selectedTerrain="grass"
        onSelectTerrain={mockSelectTerrain}
      />
    );
    
    // Get all terrain elements
    const terrainElements = TERRAIN_TYPES.map(terrain => 
      screen.getByText(terrain.name)
    );
    
    // Find the element with a white border (the selected one)
    const selectedTerrainEl = terrainElements.find(el => 
      window.getComputedStyle(el).border.includes('white') ||
      window.getComputedStyle(el).borderColor.includes('white')
    );
    
    // Check if the grass element is selected
    expect(selectedTerrainEl?.textContent).toBe('Grass');
    
    // Change selected terrain to water
    rerender(
      <TerrainPalette
        selectedTerrain="water"
        onSelectTerrain={mockSelectTerrain}
      />
    );
    
    // Get all terrain elements again
    const updatedTerrainElements = TERRAIN_TYPES.map(terrain => 
      screen.getByText(terrain.name)
    );
    
    // Find the newly selected element
    const newSelectedTerrainEl = updatedTerrainElements.find(el => 
      window.getComputedStyle(el).border.includes('white') ||
      window.getComputedStyle(el).borderColor.includes('white')
    );
    
    // Check if the water element is now selected
    expect(newSelectedTerrainEl?.textContent).toBe('Water');
  });
});