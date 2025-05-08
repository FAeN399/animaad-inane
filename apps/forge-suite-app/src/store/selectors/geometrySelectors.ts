import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { GeometryState } from '../geometrySlice';

const selectGeometry = (state: RootState) => state.geometry;

export const selectedAssetIdSelector = createSelector(
  [selectGeometry],
  (geometry: GeometryState) => geometry.selectedAssetId
);

export const assetsSelector = createSelector(
  [selectGeometry],
  (geometry: GeometryState) => geometry.assets
);

export const selectedAssetSelector = createSelector(
  [assetsSelector, selectedAssetIdSelector],
  (assets, selectedId) => (selectedId ? assets[selectedId] : null)
);

export const librarySelector = createSelector(
  [selectGeometry],
  (geometry: GeometryState) => geometry.library
);
