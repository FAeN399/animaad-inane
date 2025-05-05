Okay, here is a detailed `todo.md` checklist based on the refined iterative implementation blueprint. You can copy and paste this into a `todo.md` file in your project root.

# Forge Suite - Implementation Checklist (v1.1)

## Phase 0: Foundation (Sprint 0)

- [x] **Step 0.1:** Initialize Monorepo (Turborepo) & Vite React+TS App (`forge-suite-app`).
- [x] **Step 0.2:** Install Core Dependencies (React, Three.js, R3F, Drei, Redux Toolkit, UUID, idb-keyval, react-router-dom).
- [x] **Step 0.3:** Configure Tooling (ESLint, Prettier, TypeScript).
- [x] **Step 0.4:** Setup Unit Testing (Vitest, jsdom) & Basic CI (GitHub Actions - lint, type-check, test).
- [x] **Step 0.5:** Basic Redux Store:
  - [x] Configure store (`store.ts`).
  - [x] Create empty slices (`settings`, `geometry`, `mandala`, `map`, `hub`).
  - [x] Define `RootState`, `AppDispatch`.
  - [x] Create typed hooks (`useAppDispatch`, `useAppSelector`).
  - [x] Wrap `<App>` in `<Provider>`.
  - [x] Write basic slice test (e.g., `settingsSlice.test.ts`).
- [x] **Step 0.6:** Basic Routing:
  - [x] Setup `react-router-dom` (`BrowserRouter`, `Routes`, `Route`).
  - [x] Create placeholder page components (`HomePage`, `GeometryPage`, etc.).
  - [x] Add basic navigation links (`NavBar`).
- [x] **Step 0.7:** Basic R3F Canvas:
  - [x] Create `SceneCanvas` component.
  - [x] Render `<Canvas>` with `frameloop="demand"`.
  - [x] Add basic lights and shadows setup.
  - [x] Add placeholder mesh and ground plane.
  - [x] Add `<OrbitControls>`.
  - [x] Enable `THREE.ColorManagement` globally (`main.tsx`).
  - [x] Integrate `<SceneCanvas>` into a page (e.g., `HomePage`).
  - [x] Update relevant page test.

## Phase 1: Geometry Module MVP (Sprint 1)

- [ ] **Step 1.1 (File I/O - Import):**
  - [x] Define `MeshAsset` interface (`src/interfaces/Asset.ts`).
  - [x] Update `geometrySlice` state for assets dictionary.
  - [x] Add `addMeshAsset` reducer (TDD: adds asset, initializes matrix, sets selectedId).
  - [x] Implement `GltfImporter` component (`react-dropzone`, read `ArrayBuffer`, dispatch `addMeshAsset`) (TDD: renders, calls dispatch mock).
  - [ ] Implement `SceneViewer` component (select state, parse buffer with `GLTFLoader` or `useGLTF`, render `<primitive>`, apply matrix from state).
  - [ ] Integrate `GltfImporter` and `SceneViewer` into `GeometryPage` within `<SceneCanvas>`.
- [ ] **Step 1.2 (Transform Gizmos - Basic):**
  - [ ] Update `geometrySlice`: Add `selectedAssetId`, `matrix` per asset, `setSelectedAssetId`, `updateMeshTransform` reducers (TDD).
  - [ ] Modify `SceneViewer`: Add click handler (`setSelectedAssetId`). Render Drei's `<TransformControls>` attached to selected mesh object.
  - [ ] Implement gizmo event handling (`onChange`/`onObjectChange` + `dragging-changed`) to dispatch `updateMeshTransform`.
  - [ ] Ensure mesh transform updates *from* Redux state visually.
- [ ] **Step 1.3 (Undo/Redo - Core):**
  - [ ] Implement `undoableSlice` (state: `past`, `future` action representations) and reducers (`undo`, `redo`) (TDD).
  - [ ] Implement `undoableMiddleware` (intercept marked actions, manage stacks, dispatch inverse/original actions).
  - [ ] Integrate middleware and slice into the main store (`store.ts`).
  - [ ] Add global Undo/Redo UI buttons (connect to dispatch `undo`/`redo` actions, disable based on stack state).
- [ ] **Step 1.4 (Undo/Redo - Geometry Transform):**
  - [ ] Refactor `updateMeshTransform` into a Thunk.
  - [ ] Thunk gets previous matrix (`getState`).
  - [ ] Thunk dispatches internal action (`_internalUpdateMeshTransform`) with `meta: { undoable: true }` and payload `{ id, newMatrix, previousMatrix }`.
  - [ ] Create internal reducer `_internalUpdateMeshTransformReducer`.
  - [ ] Update `undoableMiddleware` to handle undoing/redoing `_internalUpdateMeshTransform` using payload matrices.
  - [ ] TDD: Test the `updateMeshTransform` Thunk logic.
  - [ ] *Manual Test:* Verify gizmo transforms are undoable/redoable via UI buttons.
- [ ] **Step 1.5 (File I/O - Export):**
  - [ ] Implement basic glTF export using `GLTFExporter` for the currently selected mesh object.
  - [ ] Add a simple "Export Selected" button to trigger the export.
- [ ] **Step 1.6 (Boolean Union - MVP):**
  - [ ] Integrate a CSG library (e.g., `three-bvh-csg`).
  - [ ] Add UI to select exactly *two* meshes (update `selectedAssetId` logic or add temporary multi-select state).
  - [ ] Implement a "Merge Selected" button.
  - [ ] Button logic: Perform boolean union on the two selected meshes' geometries.
  - [ ] Update Redux: Remove original assets, add new merged asset.
  - [ ] Update Scene: Reflect Redux state changes visually.
  - [ ] Add basic error handling (console log/alert on failure).
- [ ] **Step 1.7 (Undo/Redo - Boolean Union):**
  - [ ] Refactor the merge operation into an undoable Thunk/action.
  - [ ] Payload needs references to original assets and the merged asset.
  - [ ] Update `undoableMiddleware` to handle undo (restore originals, remove merged) and redo (re-run merge logic).
  - [ ] *Manual Test:* Verify merge operations are undoable/redoable.

## Phase 2: Geometry Module Polish (Sprint 2)

- [ ] **Step 2.1 (Material Panel - Basic):**
  - [ ] Create `MaterialPanel` component.
  - [ ] Add UI controls (color picker, sliders) for BaseColor, Metallic, Roughness.
  - [ ] Connect controls to view/edit selected mesh's material properties.
  - [ ] Add relevant state/reducers to `geometrySlice` for material properties.
  - [ ] Dispatch undoable actions to update material properties in Redux.
  - [ ] Ensure material updates visually in the scene.
- [ ] **Step 2.2 (Effects - Basic):**
  - [ ] Integrate `@react-three/postprocessing`.
  - [ ] Add `EffectComposer` and `Bloom` effect to `<SceneCanvas>`.
  - [ ] Add Emissive control to `MaterialPanel` and state.
  - [ ] Link bloom intensity to the selected mesh's Emissive property.
  - [ ] Add Drei's `<Environment>` component with a default HDRI.
  - [ ] Configure lights (`castShadow`) and meshes (`castShadow`, `receiveShadow`) for dynamic shadows.
- [ ] **Step 2.3 (Primitive Catalog - Add):**
  - [ ] Add UI buttons (e.g., in a sidebar) to create Box, Sphere, Cylinder.
  - [ ] Button click logic: Create corresponding `THREE.BufferGeometry`, create `MeshAsset` data, dispatch `addMeshAsset`.
  - [ ] Reuse primitive geometries where possible.
- [ ] **Step 2.4 (Primitive Catalog - Save):**
  - [ ] Implement "Save to Library" functionality (ensure `MeshAsset` is correctly persisted in Redux state for now).
- [ ] **Step 2.5 (Transform UI - Polish):**
  - [ ] Add a sidebar panel for numeric input of position, rotation (Euler/Quaternion), scale.
  - [ ] Connect numeric inputs to view/update selected mesh transform state (dispatch undoable actions).
  - [ ] Implement grid snapping toggle UI.
  - [ ] Add grid snapping logic to `TransformControls` event handling.
- [ ] **Step 2.6 (Error Handling - Import/Texture):**
  - [ ] Install and configure `react-toastify` (or similar).
  - [ ] Show toast notification in `GltfImporter` for unsupported file extensions.
  - [ ] Add validation for imported texture sizes (console warn if > 2K).

## Phase 3: Map Editor Core (Sprint 5)

- [ ] **Step 3.1 (Hex Grid Utilities):**
  - [ ] Create `src/utils/hexGrid.ts`.
  - [ ] Implement **pointy-top axial coordinate** functions:
    - [ ] `axialToCube(q, r)`
    - [ ] `cubeToAxial(x, y, z)`
    - [ ] `cubeRound(x, y, z)`
    - [ ] `axialRound(fractQ, fractR)`
    - [ ] `axialToPixelPointyTop(q, r, size)`
    - [ ] `pixelToAxialPointyTop(x, y, size)`
    - [ ] `axialDistance(q1, r1, q2, r2)`
    - [ ] `getAxialNeighbors(q, r)`
  - [ ] TDD: Write comprehensive unit tests for *all* hex grid utility functions (`hexGrid.test.ts`).
- [ ] **Step 3.2 (Map State & Instanced Rendering):**
  - [ ] Define `HexData` interface (`src/interfaces/MapData.ts`).
  - [ ] Update `mapSlice` state (`hexes: { [key: string]: HexData }`).
  - [ ] Add `setHexData` reducer (TDD: adds/updates hex using "q,r" key).
  - [ ] Create `HexGrid` component:
    - [ ] Define base pointy-top hexagon `BufferGeometry`.
    - [ ] Render `<InstancedMesh>`.
    - [ ] Select `hexes` from Redux.
    - [ ] Use `useEffect`/`useMemo` to update instance count and matrices based on `hexes` data and `axialToPixelPointyTop`.
  - [ ] Integrate `HexGrid` into `MapPage` within `<SceneCanvas>`.
  - [ ] Add temporary buttons in `MapPage` to dispatch `setHexData` for testing.
- [ ] **Step 3.3 (Terrain Palette & Painting):**
  - [ ] Create `TerrainPalette` component (select active terrain type, store in local/UI state).
  - [ ] Implement pointer event handling (`onPointerDown/Move/Up/Leave`) on map canvas/ground plane.
  - [ ] Implement painting logic (`handlePaint` function):
    - [ ] Get intersection point (`event.point`).
    - [ ] Convert point to hex coords (`pixelToAxialPointyTop` -> `axialRound`).
    - [ ] Get active terrain type.
    - [ ] Dispatch `setHexData` with coords, terrain, defaults.
    - [ ] Optimize to avoid dispatching for same hex during drag.
  - [ ] Update `HexGrid` to set instance color based on `HexData.terrain`.
  - [ ] Render `TerrainPalette` in `MapPage`.
  - [ ] TDD: Test `TerrainPalette` and painting logic component (mock utils, dispatch).
- [ ] **Step 3.4 (Undo/Redo - Map Painting):**
  - [ ] Refactor `setHexData` into an undoable action/Thunk.
  - [ ] Payload must include previous state of the hex being modified.
  - [ ] Update `undoableMiddleware` to handle map hex data changes.
  - [ ] *Manual Test:* Verify terrain painting is undoable/redoable.
- [ ] **Step 3.5 (Basic Export - PNG/JSON):**
  - [ ] Implement PNG export function (render 2D map view to image).
  - [ ] Implement JSON export function (serialize `hexes` data).
  - [ ] Add basic UI buttons in `MapPage` for these exports.

## Phase 4: Mandala Module MVP (Sprint 3)

- [ ] **Step 4.1 (Canvas & Ring Setup):**
  - [ ] Create `MandalaPage` component.
  - [ ] Choose and setup 2D rendering approach (SVG or Canvas lib like Konva).
  - [ ] Setup `mandalaSlice` (state for rings, elements, etc.). Define `RingSpec`.
  - [ ] Implement UI to add new rings.
  - [ ] Implement UI to set symmetry count per ring (store in Redux).
- [ ] **Step 4.2 (Radial Symmetry Drawing - Basic):**
  - [ ] Implement core drawing logic: Replicate single drawn/placed element based on ring symmetry.
  - [ ] Start with simple shapes (lines, circles).
- [ ] **Step 4.3 (Element Types - Basic):**
  - [ ] Allow adding built-in SVG motifs (define library, store references in Redux).
  - [ ] Allow adding simple geometric primitives (render 2D, store type/transform in Redux).
- [ ] **Step 4.4 (Styling - Ring-wide):**
  - [ ] Implement UI to select color/style per ring.
  - [ ] Apply selected style to all elements in the ring visually.
  - [ ] Store ring style in Redux.
- [ ] **Step 4.5 (Undo/Redo - Mandala Basic):**
  - [ ] Make adding rings undoable.
  - [ ] Make adding elements undoable.
  - [ ] Make changing ring symmetry undoable.
  - [ ] Make applying ring-wide styles undoable.
- [ ] **Step 4.6 (2D Export - PNG):**
  - [ ] Implement PNG export of the 2D mandala canvas.
  - [ ] Include UI options for custom width, height, and DPI.
  - [ ] Add basic error handling/warning for very large dimensions (>8K).

## Phase 5: Map Editor Polish (Sprints 6-7)

- [ ] **Step 5.1 (Elevation Editing):**
  - [ ] Add `elevation: number` field to `HexData` interface.
  - [ ] Implement UI for elevation editing (brush tool, numeric input).
  - [ ] Connect UI to dispatch undoable actions updating `HexData.elevation`.
  - [ ] Update `HexGrid` `useEffect` to modify instance Y-position based on `elevation`.
- [ ] **Step 5.2 (Overlays - Basic):**
  - [ ] Add `overlays: string` field to `HexData` interface.
  - [ ] Implement UI to add/remove simple overlay identifiers (e.g., 'tree', 'rock') to the stack.
  - [ ] Enforce stack limit (16) in UI/dispatch logic.
  - [ ] Render basic visual representation of the *top* overlay (e.g., modify instance color, simple decal).
  - [ ] Make overlay changes undoable.
- [ ] **Step 5.3 (3D Preview Mode - Basic):**
  - [ ] Implement UI toggle button (2D/3D).
  - [ ] Store view mode state (e.g., in `mapSlice`).
  - [ ] Conditionally adjust camera type/position based on view mode.
  - [ ] In 3D mode, modify `HexGrid` rendering:
    - [ ] Extrude hex geometry based on elevation.
    - [ ] Render overlays as simple 3D placeholders (sprites/boxes).
- [ ] **Step 5.4 (Infinite Canvas - Culling):**
  - [ ] Implement viewport culling logic:
    - [ ] Calculate visible hex coordinate range based on camera frustum.
    - [ ] Optimize `HexGrid` `useEffect` to only update attributes for visible instances.
- [ ] **Step 5.5 (Export Bounds UI):**
  - [ ] Implement UI for defining export boundaries (e.g., draggable rectangle overlay).
  - [ ] Store bounds state.
