Forge Suite — Developer-Ready Specification (v 0.9)
Compiled May 4 2025

1 Project Overview
The Forge Suite is a browser-based creation toolkit that empowers players, GMs, and designers to craft reusable game assets—geometry kits, mandalas, and hex maps—and funnel them into a central Hub.
Primary use-cases: board-game prototyping, pen-and-paper RPG content, and general creative experimentation.

2 Tech Stack & Architecture
Layer Choice Rationale
Client TypeScript + React SPA Component reuse across modules; strong typing for geometry math.
3-D Engine Three.js r160+ Mature, WebGL2, proven glTF pipeline.
State Redux Toolkit Time-travel debugging → unlimited undo/redo.
Data Local filesystem & IndexedDB Offline-first; no server required.
File I/O glTF 2.0, PNG, SVG, JSON Open standards; round-trip with DCC and game engines.
Post-FX postprocessing.js Bloom, HDRI environment, dynamic shadows (deferred toggle).

Note: The spec is front-end only; add a thin Node/Express layer later if cloud sync or multiplayer editing is desired.

3 Cross-Module Core Data Model
ts
Copy
Edit
interface MeshAsset { id: UUID; name: string; gltf: ArrayBuffer; }
interface MandalaAsset { id: UUID; name: string; rings: RingSpec[]; export?: MeshAsset|RasterAsset; }
interface MapAsset { id: UUID; name: string; hexData: HexGridJSON; export?: MeshAsset|RasterAsset; }
interface ProjectTree { folders: FolderNode[]; assets: (MeshAsset|MandalaAsset|MapAsset)[]; }
All exports target Y-up, 1 unit = 1 m.

4 Module Specifications
4.1 Geometry Module
Aspect Requirement
Imports glTF 2.0 (primary), OBJ, STL, FBX via drag-drop dialog.
Exports glTF 2.0; dropdown to re-encode as OBJ/STL/FBX.
Primitive Catalog 20 sacred/platonic starters. Users can (a) import new meshes or (b) generate parametric primitives and Save to Library.
Transform UI Simple on-canvas gizmos (move, rotate, scale) + numeric sidebar. Toggle grid-snap (0.1 m).
Merging Boolean union only when 2 + selected meshes overlap (live bbox test). Result: one watertight mesh, single PBR material. Subsequent color edits affect the entire union.
Materials BaseColor, Metallic, Roughness, Emissive; optional 1 albedo texture (2 K cap).
Effects (v1) Emissive Bloom, HDRI-based IBL, Dynamic Shadows. (Lens flare & SSAO slated for v1.1.)
Undo/Redo Unlimited stack persisted per session (Redux).
Error Handling • Import validation (unsupported extensions → toast).
• Union failure (non-manifold result) → rollback + alert.
• Texture >2 K → downscale + warn.

4.2 Mandala Module
Aspect Requirement
Canvas Modes • Radial-symmetry (<ins>default</ins>)
• Free-form Layered (toggle). User starts at center.
Ring Logic Each ring stores its own symmetry count; “Add Ring” button or edge-drag to grow.
Element Types • Geometry-module meshes
• Built-in SVG motifs (lotus, petals, runes)
• Image tiles (PNG/JPEG)
• Free-draw brush (width, opacity, softness).
Styling Ring-wide palette by default; per-element override on demand.
3-D Behaviour Mandala extrudes only if Geometry shapes are present. Flat disc + child meshes exported as grouped glTF scene.
2-D Export PNG with custom width × height + optional DPI.
3-D Export Grouped glTF scene (disc + child nodes).
Error Handling • Symmetry count ≤ 128 enforced.
• Brush strokes clipped to ring bounds.
• Raster export > 8 K px → prompt to reduce.

4.3 Map Editor
Aspect Requirement
Grid Pointy-top hex axial (q,r); edge length = 1 unit.
Elevation Discrete integer tiers (0-9). Edit via Brush and Lasso + Numeric.
Terrain Palette Customizable list; CRUD in sidebar.
Overlays Per-hex ordered stack (roads, town, quest markers, characters).
Canvas Size Infinite; auto-expand. “Export Bounds” rectangle defines output.
View Modes Default 2-D overhead; 3-D tilt preview button to inspect extrusions and edit heights/overlays in a simple Valheim-style mode.
Export • PNG + JSON (hex, terrain, height, overlays).
• glTF scene (extruded tiers, overlay child nodes).
World Scale 1 hex-edge = 1 m, Y-up.
Error Handling • Overlays exceeding stack limit (16) → warn.
• Export bounds > 10 000 × 10 000 hexes → require confirmation.

4.4 Hub Module (Draft—details TBD)
Placeholder spec

On import, create Asset Container nodes (Option A) in a left-hand project tree.

Double-click opens the correct sub-editor or places the asset in a staging scene for kit-bashing.

Later questions will define collision rules, scripting hooks, and play-test launchers.

5 Shared Subsystems
System Key Points
Undo / Redo Central action-log middleware. Each module dispatches atomic UndoableActions with forward & backward reducers.
Import / Export Manager Async workers; progress bar; promises feed Redux.
Render & Post-FX Common Three.js scene in each module; FX toggles stored in user prefs.
Settings Persistence IndexedDB via idb-keyval.
Accessibility All controls keyboard-navigable; color-blind-safe palettes by default.

6 Error Handling Strategy
Validation Layer at import/export (file size, polygon budget, texture resolution).

Try/Catch Guards around destructive ops (boolean union, brush flood-fill).

Global Toast Queue for non-blocking alerts; modal only for data-loss risks.

Crash Reporter logs last 20 Redux actions + stack trace to local JSON for user to attach to bug report.

7 Testing Plan
Level Focus Tooling
Unit Math utils (hex axial ↔ world XYZ, boolean mesh ops), Redux reducers. Vitest + ts-jest
Integration Import → modify → export round-trip for each module. Playwright headless
UI / E2E Recordable flows (create mandala, merge shapes, export map). Playwright + Axe (a11y)
Performance FPS under 5 000 mid-poly meshes; memory leak watch. Chrome Profiler
Regression Snapshots of exported glTF, PNG, JSON compared via hash. Custom CI script
User Acceptance 10-person beta (RPG players) follow scripted tasks; capture feedback. Notion survey

8 Milestones & Deliverables
Sprint (2 wks) Goal Key Deliverables
0 Project bootstrap Repo, ESLint, CI, basic Three.js canvas.
1 Geometry MVP Import/export glTF, transform gizmos, merge union, undo stack.
2 Geometry polish Material panel, bloom/HDRI, catalog save.
3 Mandala MVP Ring system, symmetry editing, PNG export.
4 Mandala 3-D & brush glTF grouped export, mid-tier brush.
5 Map Editor MVP Pointy-top painting, terrain palette, PNG+JSON export.
6 Map 3-D & overlays Elevation tiers, overlay stack, glTF export.
7 Infinite canvas & 3-D preview Bound selection, tilt camera, perf pass.
8 Cross-module export/import Asset Manager, Hub shell.
9 Test & harden Full test suite, error UX, docs.
10 Beta & feedback Installer, changelog, UAT survey.
