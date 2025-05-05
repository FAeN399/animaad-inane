Refined Iterative Implementation Blueprint (v1.1)
This blueprint breaks down the project into granular steps, prioritizing core functionality, shared systems, and iterative module development. Each step is designed to be small enough for safe implementation and testing.

Phase 0: Foundation (Corresponds to Sprint 0)

Step 0.1: Initialize Monorepo (Turborepo) & Vite React+TS App (forge-suite-app).
Step 0.2: Install Core Dependencies (React, Three.js, R3F, Drei, Redux Toolkit, UUID, idb-keyval, react-router-dom).
Step 0.3: Configure Tooling (ESLint, Prettier, TypeScript).
Step 0.4: Setup Unit Testing (Vitest, jsdom) & Basic CI (GitHub Actions - lint, type-check, test).
Step 0.5: Basic Redux Store: Configure store, create empty slices (settings, geometry, mandala, map, hub), typed hooks (useAppDispatch, useAppSelector).
Step 0.6: Basic Routing: Setup react-router-dom with placeholder page components for each module (HomePage, GeometryPage, etc.).
Step 0.7: Basic R3F Canvas: Create MainCanvas component with <Canvas>, basic lights, OrbitControls, and a placeholder mesh. Integrate into HomePage. Enable THREE.ColorManagement.
Phase 1: Geometry Module MVP (Corresponds to Sprint 1)

Step 1.1 (File I/O - Import):
Define MeshAsset interface.
Update geometrySlice state for assets, add addMeshAsset reducer (TDD).
Implement GltfImporter component using react-dropzone to read .gltf/.glb as ArrayBuffer and dispatch addMeshAsset.
Implement SceneViewer component to load and display the latest added MeshAsset's glTF buffer using GLTFLoader (basic, no suspense yet). Integrate into GeometryPage.
Step 1.2 (Transform Gizmos - Basic):
Update geometrySlice: Add selectedAssetId, matrix per asset, setSelectedAssetId, updateMeshTransform reducers (TDD).
Modify SceneViewer: Add click handler to select mesh (setSelectedAssetId). Render Drei's TransformControls attached to the selected mesh's object.
Implement basic gizmo event handling (onChange/onObjectChange + dragging-changed) to dispatch updateMeshTransform with the new matrix elements. Ensure mesh transform updates from Redux state.
Step 1.3 (Undo/Redo - Core):
Implement undoableSlice (state: past, future action representations) and reducers (undo, redo) (TDD).
Implement undoableMiddleware to intercept actions marked meta: { undoable: true }, manage past/future stacks, and dispatch inverse/original actions on undo/redo.
Integrate middleware and slice into the main store. Add global Undo/Redo UI buttons.
Step 1.4 (Undo/Redo - Geometry Transform):
Refactor updateMeshTransform into a Thunk that gets the previous matrix and dispatches an internal, undoable action (_internalUpdateMeshTransform) containing both previous and new matrices (TDD for Thunk).
Update undoableMiddleware to correctly handle undoing/redoing the_internalUpdateMeshTransform action using the matrices in its payload.
Manual Test: Verify gizmo transforms are undoable/redoable.
Step 1.5 (File I/O - Export):
Implement basic glTF export using GLTFExporter for the currently selected mesh object. Add a simple "Export Selected" button.
Step 1.6 (Boolean Union - MVP):
Integrate a CSG library (e.g., three-bvh-csg).
Add UI to select exactly two meshes.
Implement a "Merge Selected" button that performs a boolean union on the two selected meshes using the CSG library.
Replace the two source meshes with the single result mesh in Redux state (geometrySlice) and the Three.js scene.
Add basic error handling (console log or alert on union failure).
Step 1.7 (Undo/Redo - Boolean Union):
Make the boolean union operation undoable. The "undo" should restore the two original meshes and remove the merged one. The "redo" should perform the merge again. This likely requires storing references to the original meshes and the merged result within the undoable action payload.
Phase 2: Geometry Module Polish (Corresponds to Sprint 2)

Step 2.1 (Material Panel - Basic):
Create MaterialPanel component.
Add UI controls (color picker, sliders) to view/edit BaseColor, Metallic, Roughness for the selected mesh's MeshStandardMaterial.
Dispatch undoable actions to update material properties in Redux state (add relevant state/reducers to geometrySlice). Ensure material updates visually.
Step 2.2 (Effects - Basic):
Integrate @react-three/postprocessing.
Add EffectComposer and Bloom effect. Link bloom intensity to the selected mesh's material Emissive property (add Emissive control to MaterialPanel and state).
Add Drei's <Environment> component with a default HDRI for Image-Based Lighting.
Configure lights and materials for basic dynamic shadows (e.g., enable castShadow on lights/meshes, receiveShadow on ground plane/other meshes).
Step 2.3 (Primitive Catalog - Add):
Add UI buttons to create basic Three.js primitives (Box, Sphere, Cylinder) and add them as new MeshAssets to the scene/Redux state. Reuse geometries where possible.
Step 2.4 (Primitive Catalog - Save):
Implement "Save to Library" functionality. Initially, this might just ensure the MeshAsset is correctly stored in Redux state. (Persistence via IndexedDB comes later).
Step 2.5 (Transform UI - Polish):
Add a sidebar panel for numeric input of position, rotation, scale, complementing the gizmos.
Implement grid snapping toggle and functionality for gizmo operations.
Step 2.6 (Error Handling - Import/Texture):
Implement user-friendly toast notifications (e.g., using react-toastify) for unsupported import file extensions.
Add validation for imported texture sizes (warn if > 2K, potentially offer downscaling later).
Phase 3: Map Editor Core (Corresponds to Sprint 5 - Prioritizing Hex Grid)

Step 3.1 (Hex Grid Utilities):
Create src/utils/hexGrid.ts.
Implement and thoroughly test (TDD) core pointy-top axial coordinate functions: axialToCube, cubeToAxial, cubeRound, axialRound, axialToPixelPointyTop, pixelToAxialPointyTop, axialDistance, getAxialNeighbors.
Step 3.2 (Map State & Instanced Rendering):
Define HexData interface.
Update mapSlice state (hexes: { [key: string]: HexData }), add setHexData reducer (TDD).
Create HexGrid component: Define base hex geometry. Render hexes using InstancedMesh, setting instance matrix based on axialToPixelPointyTop from Redux state.
Integrate HexGrid into MapPage with test buttons to add hex data.
Step 3.3 (Terrain Palette & Painting):
Create TerrainPalette component for selecting active terrain type.
Implement pointer event handling (onPointerDown/Move/Up) on the map canvas/ground plane.
Painting logic: Convert pointer coords to hex coords (pixelToAxialPointyTop -> axialRound), dispatch setHexData with selected terrain. Update instance color in HexGrid based on terrain. (TDD for palette and painting logic).
Step 3.4 (Undo/Redo - Map Painting):
Make the setHexData action undoable, storing previous hex state in the payload. Update middleware if necessary.
Step 3.5 (Basic Export - PNG/JSON):
Implement basic PNG export of the current 2D map view.
Implement JSON export serializing the hexes data from Redux.
Add simple UI buttons for export.
Phase 4: Mandala Module MVP (Corresponds to Sprint 3)

Step 4.1 (Canvas & Ring Setup):
Create MandalaPage component. Choose 2D rendering approach (SVG or Canvas library like Konva).
Setup mandalaSlice in Redux to store ring data (RingSpec: symmetry count, elements).
Implement UI to add new rings and set symmetry count per ring.
Step 4.2 (Radial Symmetry Drawing - Basic):
Implement core drawing logic: User draws/places one element, system replicates it based on ring's symmetry count. Start with simple shapes (lines/circles).
Step 4.3 (Element Types - Basic):
Allow adding built-in SVG motifs (store references).
Allow adding simple geometric primitives (similar to Geometry module step 2.3, but rendered 2D). Store element type, transform, etc., in Redux.
Step 4.4 (Styling - Ring-wide):
Implement UI to select a color/style for an entire ring. Apply this style to all elements within that ring. Store in Redux.
Step 4.5 (Undo/Redo - Mandala Basic):
Integrate Undo/Redo for adding rings, adding elements, changing ring symmetry, and applying ring-wide styles.
Step 4.6 (2D Export - PNG):
Implement PNG export of the 2D mandala canvas, including custom resolution/DPI options from spec. Add basic error handling for large dimensions.
Phase 5: Map Editor Polish (Corresponds to Sprints 6-7)

Step 5.1 (Elevation Editing):
Add elevation field to HexData.
Implement UI (brush tool, numeric input) to modify hex elevation tiers (0-9).
Dispatch undoable actions to update elevation in Redux.
Update HexGrid InstancedMesh instance Y-position based on elevation.
Step 5.2 (Overlays - Basic):
Add overlays array (stack) to HexData.
Implement UI to add/remove simple overlay types (e.g., 'tree', 'rock' icons/strings) to a hex's stack. Enforce stack limit (16).
Render basic visual representation of the top overlay on each hex (e.g., change instance color, apply a decal/texture - keep simple initially). Make overlay changes undoable.
Step 5.3 (3D Preview Mode - Basic):
Implement view toggle (2D overhead vs. 3D tilted).
In 3D mode: Adjust camera. Extrude hexes visually based on elevation (modify base geometry or add side meshes). Render overlays as simple 3D placeholders (e.g., small sprites or boxes).
Step 5.4 (Infinite Canvas - Culling):
Implement basic viewport culling: Determine visible hex coordinate range based on camera frustum.
Optimize InstancedMesh updates in HexGrid - only call setMatrixAt/setColorAt for potentially visible instances. (Manual culling needed for instances ).
Step 5.5 (Export Bounds UI):
Implement UI (e.g., draggable rectangle) to define export boundaries.
Modify PNG/JSON export to only include hexes within the defined bounds.
Step 5.6 (glTF Export - Basic):
Implement glTF export for the 3D map view. Include extruded terrain geometry and basic 3D representations of overlays as child nodes. Ensure Y-up, 1 hex edge = 1m scale.
Phase 6: Mandala Module Polish (Corresponds to Sprint 4)

Step 6.1 (Element Types - Geometry/Image):
Allow importing/using MeshAssets from the Geometry module library (render 2D projection or icon).
Allow importing/using image tiles (PNG/JPEG).
Step 6.2 (Free-draw Brush):
Implement free-draw brush tool with specified controls (width, opacity, softness). Store strokes as vector data. Replicate strokes based on symmetry. Clip strokes to ring bounds. Make drawing undoable.
Step 6.3 (Styling - Per-Element):
Implement UI/logic to override ring-wide style and apply specific colors/styles to individual elements.
Step 6.4 (3D Export - Grouped glTF):
Implement glTF export for mandalas containing Geometry assets. Create flat disc + positioned 3D child nodes for each MeshAsset as specified.
Phase 7: Hub Module & Integration (Corresponds to Sprint 8)

Step 7.1 (Hub UI & Project Tree):
Implement basic Hub layout (sidebar, main area).
Setup hubSlice for ProjectTree data model.
Implement UI to display the project tree (folders, assets) based on hubSlice state.
Step 7.2 (Asset "Import" Placeholder):
Implement mechanism (e.g., "Send to Hub" button in editors, or Hub watches other slices) to populate hubSlice with references to assets created in other modules.
Step 7.3 (Asset Interaction - Navigation):
Implement double-click on tree assets to navigate to the correct editor with the asset loaded (pass ID via route params).
Step 7.4 (Staging Area - Basic):
Implement basic R3F canvas in Hub main area.
Allow dragging MeshAssets from tree to staging area for simple viewing/arrangement.
Phase 8: Shared Subsystems & Hardening (Integrated throughout, focus in Sprint 9)

Step 8.1 (Import/Export Manager): Refine file I/O. Use Web Workers for heavy parsing/serialization. Add progress indicators.
Step 8.2 (Settings Persistence): Implement saving/loading of user settings (theme, tool defaults, effect toggles) to IndexedDB using idb-keyval.
Step 8.3 (Accessibility): Audit and remediate keyboard navigation, color contrast, ARIA attributes. Use Axe DevTools.
Step 8.4 (Error Handling - Polish): Implement global toast queue, try/catch guards around risky operations (union, complex exports), refine error messages, implement basic crash reporter (log Redux actions).
Step 8.5 (Testing - Integration/E2E): Write Playwright tests for key cross-module flows (import->modify->export, Hub interactions).
Step 8.6 (Testing - Performance/Regression): Profile application under load, optimize bottlenecks. Implement snapshot/hash comparison for exported files in CI.
Phase 9: Beta Prep (Corresponds to Sprint 10)

Step 9.1: Final Testing & Bug Fixing.
Step 9.2: Documentation (User & Developer).
Step 9.3: Prepare Beta Build & UAT Materials (scripts, survey).
LLM Prompts (Based on Refined Blueprint)
Here are the initial prompts corresponding to Phase 0 and the start of Phase 1.

Prompt 0.1: Initialize Monorepo & Vite React+TS App

Goal: Set up the basic project structure.

Task:

Create a new directory for the project.
Inside this directory, initialize a Turborepo monorepo.
Within the apps directory of the monorepo, create a new React application named forge-suite-app using Vite and the TypeScript template (npm create vite@latest forge-suite-app -- --template react-ts).
Configure the Turborepo root package.json and turbo.json for basic build/dev tasks targeting forge-suite-app.
Commit the initial structure.
Integration: This is the first step.

Prompt 0.2: Install Core Dependencies

Goal: Add necessary libraries to the React app.

Task:

Navigate into the apps/forge-suite-app directory.
Install the following production dependencies: npm install react-router-dom three @react-three/fiber @react-three/drei @reduxjs/toolkit react-redux uuid idb-keyval
Install the following development dependencies: npm install -D @types/three @types/uuid @types/react-router-dom vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
Commit the updated package.json and lock file.
Integration: Builds on Prompt 0.1. Assumes you are in the apps/forge-suite-app directory.

Prompt 0.3: Configure Tooling (ESLint, Prettier)

Goal: Enforce code style and quality.

Task:

In apps/forge-suite-app, ensure ESLint and Prettier are configured. Vite's template likely includes a basic ESLint setup; enhance it if necessary.
Install necessary ESLint plugins/configs (e.g., for React hooks, TypeScript, accessibility).
Install Prettier and its ESLint integration (eslint-config-prettier, eslint-plugin-prettier).
Create .prettierrc.json and configure basic rules (e.g., semi: true, singleQuote: false, tabWidth: 2).
Update the ESLint configuration (.eslintrc.cjs or similar) to extend recommended rulesets and integrate Prettier.
Add scripts to package.json for running lint ("lint") and format ("format") checks.
Run the format script to apply initial formatting.
Commit the configuration files and formatted code.
Integration: Builds on Prompt 0.2. Modifies/adds config files in apps/forge-suite-app.

Prompt 0.4: Setup Unit Testing (Vitest) & Basic CI

Goal: Configure the testing framework and initial CI pipeline.

Task:

In apps/forge-suite-app, create vitest.config.ts. Configure it to use jsdom environment and setup files for React Testing Library (setupTests.ts).
Create setupTests.ts and import @testing-library/jest-dom/vitest.
Add test scripts to package.json: "test": "vitest", "test:ui": "vitest --ui".
Create a placeholder test file src/App.test.tsx that renders the default <App> component and checks if it renders without errors using @testing-library/react.
Run npm test to verify the setup.
Create a basic GitHub Actions workflow file (.github/workflows/ci.yml at the monorepo root) that triggers on push/pull_request to the main branch. The workflow should:
Check out the code.
Set up Node.js.
Install dependencies (npm install at root).
Run lint checks (npm run lint -w forge-suite-app).
Run tests (npm test -w forge-suite-app).
Commit the Vitest config, setup file, test file, and GitHub Actions workflow.
Integration: Builds on Prompt 0.3. Adds config/test files in apps/forge-suite-app and workflow file at root.

Prompt 0.5: Basic Redux Store

Goal: Configure the initial Redux Toolkit store with empty slices.

Task:

In apps/forge-suite-app/src, create a store directory.
Inside store, create store.ts. Configure the Redux store using configureStore from @reduxjs/toolkit. Include basic middleware (like thunk, which is default).
Create a features subdirectory within store.
Inside features, create initial empty slice files using createSlice:
settingsSlice.ts (Initial state: { theme: 'dark' })
geometrySlice.ts (Initial state: { assets: {}, selectedAssetId: null })
mandalaSlice.ts (Initial state: { currentMandala: null })
mapSlice.ts (Initial state: { hexes: {}, viewMode: '2D' })
hubSlice.ts (Initial state: { projectTree: { folders:, assets: } }) Ensure each slice has a unique name.
Combine these slices in the root reducer within store.ts.
Define and export RootState and AppDispatch types in store.ts.
Create hooks.ts in the store directory. Export pre-typed useAppDispatch and useAppSelector hooks using the types defined in store.ts.
Wrap the main <App> component in src/main.tsx with the Redux <Provider> component, passing the configured store.
TDD: Write a basic test in src/store/features/settingsSlice.test.ts to verify the initial state and potentially a simple placeholder action/reducer.
Integration: Builds on Prompt 0.4. Modifies main.tsx, App.test.tsx (may need Provider). Adds files under src/store.

Prompt 0.6: Basic Routing

Goal: Set up placeholder routes for application modules.

Task:

Modify src/App.tsx. Remove default Vite content.
Use BrowserRouter, Routes, and Route from react-router-dom to define routes:
/: HomePage component
/geometry: GeometryPage component
/mandala: MandalaPage component
/map: MapPage component
/hub: HubPage component
Create simple placeholder functional components for HomePage, GeometryPage, MandalaPage, MapPage, HubPage in a new src/pages directory. Each should render minimal identifying text (e.g., <h1>Geometry Editor</h1>).
Add basic navigation links (e.g., in a simple NavBar component rendered within App.tsx) to switch between these routes.
Commit the changes.
Integration: Builds on Prompt 0.5. Modifies App.tsx. Adds components in src/pages.

Prompt 0.7: Basic R3F Canvas

Goal: Integrate a basic React Three Fiber canvas into the application.

Task:

Create a new component src/components/core/SceneCanvas.tsx.
Inside SceneCanvas.tsx, render the R3F <Canvas> component from @react-three/fiber.
Set frameloop="demand" as a starting point for performance.
Include basic shadows configuration on the Canvas if desired (shadows).
Inside the <Canvas>, add:
Basic lighting: <ambientLight intensity={0.6} />, <directionalLight position={[10, 10, 5]} intensity={1} castShadow />.
A simple placeholder mesh: <mesh castShadow><boxGeometry /><meshStandardMaterial color="orange" /></mesh>.
A ground plane to receive shadows: <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow><planeGeometry args={[10, 10]} /><meshStandardMaterial color="lightgray" /></mesh>.
Camera controls: <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} /> from @react-three/drei.
Globally enable Three.js color management in src/main.tsx before rendering the app: import * as THREE from 'three'; THREE.ColorManagement.enabled = true;.
Modify HomePage.tsx (or another relevant page like GeometryPage.tsx if preferred for initial testing) to render the <SceneCanvas /> component within its layout. Ensure it occupies a reasonable space.
TDD: Update the test for the page component rendering the canvas (e.g., HomePage.test.tsx) to ensure it renders without crashing (it won't render the actual canvas in jsdom, but checks component structure).
Integration: Builds on Prompt 0.6. Modifies main.tsx. Adds SceneCanvas.tsx. Modifies the chosen page component (e.g., HomePage.tsx) and its test.

Prompt 1.1.1: Geometry Slice - State & Reducer (TDD)

Goal: Define the state structure and reducer for adding mesh assets in the geometry module.

Task:

Define the MeshAsset interface in src/interfaces/Asset.ts: interface MeshAsset { id: string; name: string; gltfBuffer: ArrayBuffer; /*object3D will be handled transiently */ matrix: number; /* THREE.Matrix4().elements*/ } (Store the raw buffer for persistence/re-export, matrix for transform state).
In src/store/features/geometrySlice.ts:
Update the initial state shape: { assets: { [id: string]: MeshAsset }; selectedAssetId: string | null; }. Initialize assets as {}.
Create a reducer addMeshAsset(state, action: PayloadAction<Omit<MeshAsset, 'matrix'>>):
It should add the new asset to the assets dictionary using action.payload.id as the key.
Initialize the matrix property with new THREE.Matrix4().identity().elements.
Set selectedAssetId to the new asset's ID.
TDD: Write unit tests in src/store/features/geometrySlice.test.ts for the addMeshAsset reducer. Verify:
A new asset is added to the assets dictionary.
The asset has the correct id, name, gltfBuffer.
The asset has an initialized identity matrix (matrix array of 16 numbers, check key elements like 1s on diagonal).
selectedAssetId is updated to the new asset's ID.
Integration: Builds on Prompt 0.7. Adds Asset.ts. Modifies geometrySlice.ts and geometrySlice.test.ts.

Prompt 1.1.2: Geometry Module - glTF Importer Component

Goal: Implement the UI for importing glTF files via drag-and-drop.

Task:

Install react-dropzone: npm install react-dropzone in apps/forge-suite-app.
Create a component src/components/geometry/GltfImporter.tsx.
Use the useDropzone hook from react-dropzone to create a drop zone UI element (e.g., a styled div).
Implement the onDrop callback:
Iterate through accepted files.
Filter for .gltf or .glb extensions (using accept prop in useDropzone is better).
For each valid file:
Read the file content as an ArrayBuffer using FileReader.
Once the buffer is read:
Generate a unique ID using uuidv4 (install uuid if not already done via Prompt 0.2, and @types/uuid).
Get the file name.
Get the useAppDispatch hook from react-redux (using src/store/hooks.ts).
Dispatch the addMeshAsset action (created in Prompt 1.1.1) with the payload { id, name, gltfBuffer }.
Handle file reading errors.
Provide visual feedback during drop (e.g., change border style using isDragActive from useDropzone).
TDD: Write basic tests for GltfImporter.tsx using @testing-library/react.
Verify the dropzone element renders.
Simulate a file drop (this is tricky, may need to mock FileReader or focus on testing the callback logic structure). Verify that dispatch is called with the expected action type when a file is processed (mock useAppDispatch).
Integration: Builds on Prompt 1.1.1. Adds react-dropzone. Creates GltfImporter.tsx and its test file.

Prompt 1.1.3: Geometry Module - Scene Viewer Component

Goal: Load and display the imported glTF mesh within the R3F canvas.

Task:

Create a component src/components/geometry/SceneViewer.tsx.
Inside SceneViewer:
Use useAppSelector to get the assets and selectedAssetId from the geometrySlice.
Find the MeshAsset corresponding to selectedAssetId.
If a selected asset exists and has a gltfBuffer:
Use Drei's useGLTF hook: const { scene } = useGLTF(asset.gltfBuffer as unknown as string, true); (Note: useGLTF expects a URL, but can sometimes work with buffers/Blobs indirectly, might need conversion to Blob URL URL.createObjectURL(new Blob([buffer])) or use GLTFLoader directly within useMemo or useEffect if useGLTF fails with buffer). Let's try GLTFLoader directly first for clarity:
Use React.useMemo to parse the gltfBuffer using new THREE.GLTFLoader().parse(...). This should return the glTF structure containing the scene. Handle parsing errors. Memoize based on the gltfBuffer.
If the scene is loaded successfully:
Render <primitive object={loadedScene} />.
Apply the matrix transform stored in the Redux state (asset.matrix) to the primitive's parent or the primitive itself (e.g., <primitive object={loadedScene} matrix={new THREE.Matrix4().fromArray(asset.matrix)} matrixAutoUpdate={false} />).
Modify GeometryPage.tsx:
Render the <GltfImporter /> component.
Render the <SceneCanvas /> component (from Prompt 0.7).
Inside <SceneCanvas />, render the <SceneViewer /> component. This ensures SceneViewer has access to the R3F context.
TDD: Write tests for SceneViewer.tsx.
Mock useAppSelector to provide sample asset data.
Mock GLTFLoader.parse or useGLTF.
Verify that <primitive> is rendered when a selected asset with a buffer exists and loading succeeds.
Verify that the matrix prop is passed to <primitive> based on the mocked Redux state.
Integration: Builds on Prompt 1.1.2. Creates SceneViewer.tsx and its test. Modifies GeometryPage.tsx to integrate the importer and viewer within the canvas. Requires manual testing of importing and viewing a GLB/glTF file.
