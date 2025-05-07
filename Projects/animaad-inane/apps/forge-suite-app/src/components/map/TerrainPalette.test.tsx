import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TerrainPalette from './TerrainPalette';

describe('TerrainPalette', () => {
  it('renders all terrain buttons and highlights active', () => {
    const onSelect = vi.fn();
    render(<TerrainPalette activeTerrain="water" onSelect={onSelect} />);

    const grassBtn = screen.getByText('Grass');
    const waterBtn = screen.getByText('Water');
    const sandBtn = screen.getByText('Sand');

    expect(grassBtn).toBeInTheDocument();
    expect(waterBtn).toBeInTheDocument();
    expect(sandBtn).toBeInTheDocument();

    // Active terrain gets thicker border
    expect(waterBtn).toHaveStyle('border: 2px solid #000');
    expect(grassBtn).toHaveStyle('border: 1px solid #ccc');

    // Clicking calls onSelect with correct value
    fireEvent.click(grassBtn);
    expect(onSelect).toHaveBeenCalledWith('grass');
    fireEvent.click(sandBtn);
    expect(onSelect).toHaveBeenCalledWith('sand');
  });
});