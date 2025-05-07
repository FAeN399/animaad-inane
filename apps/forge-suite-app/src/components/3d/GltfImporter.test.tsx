import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import GltfImporter from './GltfImporter';
import { addMeshAsset } from '../../store/geometrySlice';
import { vi } from 'vitest';

const mockStore = configureStore([]);

describe('GltfImporter', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = vi.fn();
    global.FileReader = vi.fn(() => ({
      readAsArrayBuffer(file: File) {
        setTimeout(() => this.onload({ target: { result: new ArrayBuffer(8) } }), 0);
      },
      onload: (_event: any) => {},
    } as any));
  });

  it('dispatches addMeshAsset on file drop', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <GltfImporter />
      </Provider>
    );

    const input = getByTestId('file-input') as HTMLInputElement;
    const file = new File([''], 'model.gltf', { type: 'model/gltf' });

    await fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      const action = store.dispatch.mock.calls[0][0];
      expect(action.type).toBe(addMeshAsset.type);
      expect(action.payload.name).toBe('model.gltf');
      expect(action.payload.buffer).toBeInstanceOf(ArrayBuffer);
      expect(action.payload.id).toBeDefined();
    });
  });
});

function beforeEach(arg0: () => void) {
    throw new Error('Function not implemented.');
}
