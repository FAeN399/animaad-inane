import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import mandalaReducer, {
  addRing,
  removeRing,
  setRingSymmetry,
  addElement,
  removeElement,
  updateRingStyle,
  updateElementStyle,
  _internalUpdateRingStyle,
  updateRingStyleUndoable,
  defaultRingStyle
} from './mandalaSlice';
import { RingSpec, ElementSpec } from '../interfaces/Mandala';

describe('mandala slice', () => {
  it('should handle initial state', () => {
    expect(mandalaReducer(undefined, { type: 'unknown' })).toEqual({
      rings: [],
      elements: []
    });
  });

  it('should handle addRing', () => {
    const state = mandalaReducer(undefined, addRing({ id: '123' }));
    expect(state.rings).toHaveLength(1);
    expect(state.rings[0]).toEqual({
      id: '123',
      symmetry: 6,
      style: defaultRingStyle
    });
  });

  it('should handle removeRing', () => {
    const initialState = {
      rings: [{ id: '123', symmetry: 6, style: { ...defaultRingStyle } }],
      elements: [{ id: 'elem1', ringId: '123', angle: 0, type: 'circle' as const }]
    };
    const state = mandalaReducer(initialState, removeRing({ id: '123' }));
    expect(state.rings).toHaveLength(0);
    expect(state.elements).toHaveLength(0);
  });

  it('should handle setRingSymmetry', () => {
    const initialState = {
      rings: [{ id: '123', symmetry: 6, style: { ...defaultRingStyle } }],
      elements: []
    };
    const state = mandalaReducer(initialState, setRingSymmetry({ id: '123', symmetry: 8 }));
    expect(state.rings[0].symmetry).toBe(8);
  });

  it('should handle addElement', () => {
    const initialState = {
      rings: [{ id: '123', symmetry: 6, style: { ...defaultRingStyle } }],
      elements: []
    };
    const element: ElementSpec = { id: 'elem1', ringId: '123', angle: 0, type: 'circle' };
    const state = mandalaReducer(initialState, addElement(element));
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0]).toEqual(element);
  });

  it('should handle removeElement', () => {
    const initialState = {
      rings: [{ id: '123', symmetry: 6, style: { ...defaultRingStyle } }],
      elements: [{ id: 'elem1', ringId: '123', angle: 0, type: 'circle' as const }]
    };
    const state = mandalaReducer(initialState, removeElement({ id: 'elem1' }));
    expect(state.elements).toHaveLength(0);
  });

  it('should handle updateRingStyle', () => {
    const initialState = {
      rings: [{ id: '123', symmetry: 6, style: { ...defaultRingStyle } }],
      elements: []
    };
    const state = mandalaReducer(initialState, updateRingStyle({ id: '123', style: { color: '#ff0000' } }));
    expect(state.rings[0].style.color).toBe('#ff0000');
    expect(state.rings[0].style.strokeWidth).toBe(defaultRingStyle.strokeWidth);
    expect(state.rings[0].style.opacity).toBe(defaultRingStyle.opacity);
  });

  it('should handle updateElementStyle to add override', () => {
    const initialState = {
      rings: [{ id: '123', symmetry: 6, style: { ...defaultRingStyle } }],
      elements: [{ id: 'elem1', ringId: '123', angle: 0, type: 'circle' as const }]
    };
    const state = mandalaReducer(initialState, updateElementStyle({ id: 'elem1', style: { color: '#00ff00' } }));
    expect(state.elements[0].styleOverride).toBeDefined();
    expect(state.elements[0].styleOverride?.color).toBe('#00ff00');
  });

  it('should handle updateElementStyle to remove override', () => {
    const initialState = {
      rings: [{ id: '123', symmetry: 6, style: { ...defaultRingStyle } }],
      elements: [{ 
        id: 'elem1', 
        ringId: '123', 
        angle: 0, 
        type: 'circle' as const,
        styleOverride: { color: '#00ff00', strokeWidth: 2, opacity: 1 }
      }]
    };
    const state = mandalaReducer(initialState, updateElementStyle({ id: 'elem1', style: null }));
    expect(state.elements[0].styleOverride).toBeUndefined();
  });

  it('should handle _internalUpdateRingStyle', () => {
    const initialState = {
      rings: [{ id: '123', symmetry: 6, style: { ...defaultRingStyle } }],
      elements: []
    };
    const newStyle = { color: '#0000ff', strokeWidth: 3, opacity: 0.8 };
    const state = mandalaReducer(
      initialState, 
      _internalUpdateRingStyle({ 
        id: '123', 
        newStyle, 
        previousStyle: defaultRingStyle 
      })
    );
    expect(state.rings[0].style).toEqual(newStyle);
  });

  it('should create undoable action for updateRingStyleUndoable', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      mandala: {
        rings: [{ id: '123', symmetry: 6, style: { ...defaultRingStyle } }],
        elements: []
      }
    });

    updateRingStyleUndoable('123', { color: '#0000ff' })(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: '_internalUpdateRingStyle',
      payload: expect.objectContaining({
        id: '123',
        newStyle: expect.objectContaining({ color: '#0000ff' }),
        previousStyle: expect.objectContaining(defaultRingStyle)
      }),
      meta: expect.objectContaining({
        undoable: expect.objectContaining({
          undo: expect.objectContaining({
            type: '_internalUpdateRingStyle'
          })
        })
      })
    }));
  });
});
