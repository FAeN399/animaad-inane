Okay, here is a detailed `todo.md` checklist based on the refined iterative implementation blueprint. You can copy and paste this into a `todo.md` file in your project root.
#check techconcerns
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
  - [x] Implement `SceneViewer` component (select state, parse buffer with `GLTFLoader` or `useGLTF`, render `<primitive>`, apply matrix from state).
  - [x] Integrate `GltfImporter` and `SceneViewer` into `GeometryPage` within `<SceneCanvas>`.
- [x] **Step 1.2 (Transform Gizmos - Basic):**
  - [x] Update `geometrySlice`: Add `selectedAssetId`, `matrix` per asset, `setSelectedAssetId`, `updateMeshTransform` reducers (TDD).
  - [x] Modify `SceneViewer`: Add click handler (`setSelectedAssetId`). Render Drei's `<TransformControls>` attached to selected mesh object.
  - [x] Implement gizmo event handling (`onChange`/`onObjectChange` + `dragging-changed`) to dispatch `updateMeshTransform`.
  - [x] Ensure mesh transform updates *from* Redux state visually.
- [x] **Step 1.3 (Undo/Redo - Core):**
  - [x] Implement `undoableSlice` (state: `past`, `future` action representations) and reducers (`undo`, `redo`) (TDD).
  - [x] Implement `undoableMiddleware` (intercept marked actions, manage stacks, dispatch inverse/original actions).
  - [x] Integrate middleware and slice into the main store (`store.ts`).
  - [x] Add global Undo/Redo UI buttons (connect to dispatch `undo`/`redo` actions, disable based on stack state).
- [x] **Step 1.4 (Undo/Redo - Geometry Transform):**
  - [x] Refactor `updateMeshTransform` into a Thunk.
  - [x] Thunk gets previous matrix (`getState`).
  - [x] Thunk dispatches internal action (`_internalUpdateMeshTransform`) with `meta: { undoable: true }` and payload `{ id, newMatrix, previousMatrix }`.
  - [x] Create internal reducer `_internalUpdateMeshTransformReducer`.
  - [x] Update `undoableMiddleware` to handle undoing/redoing `_internalUpdateMeshTransform` using payload matrices.
  - [x] TDD: Test the `updateMeshTransform` Thunk logic.
  - [x] *Manual Test:* Verify gizmo transforms are undoable/redoable via UI buttons.
- [x] **Step 1.5 (File I/O - Export):**
  - [x] Implement basic glTF export using `GLTFExporter` for the currently selected mesh object.
  - [x] Add a simple "Export Selected" button to trigger the export.
- [x] **Step 1.6 (Boolean Union - MVP):**
  - [x] Integrate a CSG library (e.g., `three-bvh-csg`).
  - [x] Add UI to select exactly *two* meshes (update `selectedAssetId` logic or add temporary multi-select state).
  - [x] Implement a "Merge Selected" button.
  - [x] Button logic: Perform boolean union on the two selected meshes' geometries.
  - [x] Update Redux: Remove original assets, add new merged asset.
  - [x] Update Scene: Reflect Redux state changes visually.
  - [x] Add basic error handling (console log/alert on failure).
- [x] **Step 1.7 (Undo/Redo - Boolean Union):**
  - [x] Refactor the merge operation into an undoable Thunk/action.
  - [x] Payload needs references to original assets and the merged asset.
  - [x] Update `undoableMiddleware` to handle undo (restore originals, remove merged) and redo (re-run merge logic).
  - [x] *Manual Test:* Verify merge operations are undoable/redoable.

## Phase 2: Geometry Module Polish (Sprint 2)

- [x] **Step 2.1 (Material Panel - Basic):**
  - [x] Create `MaterialPanel` component.
  - [x] Add UI controls (color picker, sliders) for BaseColor, Metallic, Roughness.
  - [x] Connect controls to view/edit selected mesh's material properties.
  - [x] Add relevant state/reducers to `geometrySlice` for material properties.
  - [x] Dispatch undoable actions to update material properties in Redux.
  - [x] Ensure material updates visually in the scene.
- [x] **Step 2.2 (Effects - Basic):**
  - [x] Integrate `@react-three/postprocessing`.
  - [x] Add `EffectComposer` and `Bloom` effect to `<SceneCanvas>`.
  - [x] Add Emissive control to `MaterialPanel` and state.
  - [x] Link bloom intensity to the selected mesh's Emissive property.
  - [x] Add Drei's `<Environment>` component with a default HDRI.
  - [x] Configure lights (`castShadow`) and meshes (`castShadow`, `receiveShadow`) for dynamic shadows.
- [x] **Step 2.3 (Primitive Catalog - Add):**
  - [x] Add UI buttons (e.g., in a sidebar) to create Box, Sphere, Cylinder.
  - [x] Button click logic: Create corresponding `THREE.BufferGeometry`, create `MeshAsset` data, dispatch `addMeshAsset`.
  - [x] Reuse primitive geometries where possible.
- [x] **Step 2.4 (Primitive Catalog - Save):**
- [x] **Step 2.5 (Transform UI - Polish):**
- [x] **Step 2.6 (Error Handling - Import/Texture):**

## Phase 3: Map Editor Core (Sprint 5)

- [x] **Step 3.1 (Hex Grid Utilities):**
  - [x] Create `src/utils/hexGrid.ts`.
  - [x] Implement **pointy-top axial coordinate** functions:
    - [x] `axialToCube(q, r)`
    - [x] `cubeToAxial(x, y, z)`
    - [x] `cubeRound(x, y, z)`
    - [x] `axialRound(fractQ, fractR)`
    - [x] `axialToPixelPointyTop(q, r, size)`
    - [x] `pixelToAxialPointyTop(x, y, size)`
    - [x] `axialDistance(q1, r1, q2, r2)`
    - [x] `getAxialNeighbors(q, r)`
  - [x] TDD: Write comprehensive unit tests for *all* hex grid utility functions (`hexGrid.test.ts`).
- [x] **Step 3.2 (Map State & Instanced Rendering):**
  - [x] Define `HexData` interface (`src/interfaces/MapData.ts`).
  - [x] Update `mapSlice` state (`hexes: { [key: string]: HexData }`).
  - [x] Add `setHexData` reducer (TDD: adds/updates hex using "q,r" key).
  - [x] Create `HexGrid` component:
    - [x] Define base pointy-top hexagon `BufferGeometry`.
    - [x] Render `<InstancedMesh>`.
    - [x] Select `hexes` from Redux.
    - [x] Use `useEffect`/`useMemo` to update instance count and matrices based on `hexes` data and `axialToPixelPointyTop`.
  - [x] Integrate `HexGrid` into `MapPage` within `<SceneCanvas>`.
  - [x] Add temporary buttons in `MapPage` to dispatch `setHexData` for testing.
- [x] **Step 3.3 (Terrain Palette & Painting):**
  - [x] Create `TerrainPalette` component (select active terrain type, store in local/UI state).
  - [x] Implement pointer event handling (`onPointerDown/Move/Up/Leave`) on map canvas/ground plane.
  - [x] Implement painting logic (`handlePaint`):
    - [x] Get intersection point (`event.point`).
    - [x] Convert point to hex coords (`pixelToAxialPointyTop` -> `axialRound`).
    - [x] Get active terrain type.
    - [x] Dispatch `setHexData` with coords, terrain, defaults.
    - [x] Optimize to avoid dispatching for same hex during drag.
  - [x] Update `HexGrid` to set instance color based on `HexData.terrain`.
  - [x] Render `TerrainPalette` in `MapPage`.
  - [x] TDD: Test `TerrainPalette` and painting logic component (mock utils, dispatch).
- [x] **Step 3.4 (Undo/Redo - Map Painting):**
  - [x] Refactor `setHexData` into an undoable action/Thunk.
  - [x] Payload must include previous state of the hex being modified.
  - [x] Update `undoableMiddleware` to handle map hex data changes.
  - [x] *Manual Test:* Verify terrain painting is undoable/redoable.
- [ ] **Step 3.5 (Basic Export - PNG/JSON):**
  - [ ] Implement PNG export function (render 2D map view to image).
  - [ ] Implement JSON export function (serialize `hexes` data).
  - [ ] Add basic UI buttons in `MapPage` for these exports.

## Phase 4: Mandala Module MVP (Sprint 3)

- [x] **Step 4.1 (Canvas & Ring Setup):**
- [x] **Step 4.2 (Radial Symmetry Drawing - Basic):**
- [x] **Step 4.3 (Element Types - Basic):**
- [x] **Step 4.4 (Styling - Ring-wide):**
  - [x] Implement UI to select a color/style for an entire ring.
  - [x] Apply this style to all elements within that ring.
  - [x] Store in Redux.
- [x] **Step 4.5 (Undo/Redo - Mandala Basic):**
  - [x] Integrate Undo/Redo for adding rings, adding elements, changing ring symmetry, and applying ring-wide styles.
  - [x] Make all mandala operations undoable.
- [x] **Step 4.6 (2D Export - PNG):**

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
[ ] Modify PNG/JSON export logic to filter hexes based on bounds.
[ ] Step 5.6 (glTF Export - Basic):
[ ] Implement glTF export function for the 3D map view.
[ ] Export should include extruded terrain geometry.
[ ] Export should include basic 3D overlay representations as child nodes.
[ ] Ensure export adheres to Y-up, 1 hex edge = 1m scale.
Phase 6: Mandala Module Polish (Sprint 4)
[ ] Step 6.1 (Element Types - Geometry/Image):
[ ] Allow selecting/placing MeshAssets from Geometry library (render 2D icon/projection). Store asset ID reference.
[ ] Implement image import (e.g., via dropzone) and placement as elements. Store image data/URL.
[ ] Step 6.2 (Free-draw Brush):
[ ] Implement free-draw brush tool.
[ ] Add UI controls for width, opacity, softness.
[ ] Store strokes as vector data points in Redux.
[ ] Replicate strokes according to ring symmetry during drawing.
[ ] Clip strokes visually to ring boundaries.
[ ] Make brush strokes undoable.
[ ] Step 6.3 (Styling - Per-Element):
[ ] Implement UI/logic to select individual elements.
[ ] Allow overriding ring-wide style and applying specific styles (color, etc.) to selected elements. Store overrides in Redux.
[ ] Step 6.4 (3D Export - Grouped glTF):
[ ] Implement glTF export for mandalas containing Geometry MeshAssets.
[ ] Export structure: Flat disc mesh + child nodes for each placed 3D MeshAsset at correct position/orientation.
Phase 7: Hub Module & Integration (Sprint 8)
[ ] Step 7.1 (Hub UI & Project Tree):
[ ] Create HubPage layout (sidebar, main area).
[ ] Setup hubSlice state for ProjectTree data model (folders, assets array/dict).
[ ] Implement ProjectTree UI component to display folders and assets from hubSlice.
[ ] Step 7.2 (Asset "Import" Placeholder):
[ ] Implement mechanism to populate hubSlice.projectTree.assets with references (IDs, names, types) from other module slices. (e.g., "Send to Hub" button dispatches action to hubSlice).
[ ] Step 7.3 (Asset Interaction - Navigation):
[ ] Implement double-click handler on assets in ProjectTree UI.
[ ] Handler uses react-router-dom's useNavigate to go to the correct editor route (/geometry/:id, /mandala/:id, etc.).
[ ] Editor pages (GeometryPage, etc.) need to read the :id param and load the corresponding asset from their slice on mount.
[ ] Step 7.4 (Staging Area - Basic):
[ ] Add <SceneCanvas> to the Hub's main area.
[ ] Implement drag-and-drop from ProjectTree UI (for MeshAssets) onto the Hub's <SceneCanvas>.
[ ] On drop, load and display the dragged MeshAsset in the Hub's canvas.
Phase 8: Shared Subsystems & Hardening (Sprint 9)
[ ] Step 8.1 (Import/Export Manager):
[ ] Refactor heavy file I/O (glTF parsing, complex JSON serialization, large PNG generation) to use Web Workers.
[ ] Implement progress indicators for long I/O operations.
[ ] Step 8.2 (Settings Persistence):
[ ] Identify user settings (theme, tool defaults, effect toggles).
[ ] Implement logic (e.g., Redux middleware) to save relevant slices/settings to IndexedDB using idb-keyval on change.
[ ] Implement logic to load settings from IndexedDB on application startup and hydrate the Redux store.
[ ] Step 8.3 (Accessibility):
[ ] Perform accessibility audit using Axe DevTools or similar.
[ ] Ensure all interactive elements are keyboard navigable and operable.
[ ] Check color contrast for default themes/palettes.
[ ] Add necessary ARIA attributes for custom controls.
[ ] Step 8.4 (Error Handling - Polish):
[ ] Implement global toast queue using react-toastify for non-blocking notifications.
[ ] Add try/catch guards around potentially failing operations (boolean union, complex exports).
[ ] Review and refine user-facing error messages for clarity.
[ ] Implement basic crash reporter (e.g., log last N Redux actions to local storage on unhandled error).
[ ] Step 8.5 (Testing - Integration/E2E):
[ ] Write Playwright integration tests for import -> modify -> export cycles for each module.
[ ] Write Playwright E2E tests for key user flows (creating mandala, merging shapes, painting map, Hub interaction).
[ ] Step 8.6 (Testing - Performance/Regression):
[ ] Profile application using browser dev tools under load (large map, complex geometry). Identify and optimize bottlenecks.
[ ] Implement automated regression tests for exported files (snapshot JSON, hash comparison for PNG/glTF) in CI pipeline.
Phase 9: Beta Prep (Sprint 10)
[ ] Step 9.1: Final Manual Testing & Bug Fixing based on automated tests and manual exploration.
[ ] Step 9.2: Write User Documentation (basic guides for each module).
[ ] Step 9.3: Write Developer Documentation (setup, architecture overview).
[ ] Step 9.4: Prepare Beta Build (e.g., using Vite build command).
[ ] Step 9.5: Prepare UAT Materials (scripted tasks for testers, feedback survey link - e.g., Notion).