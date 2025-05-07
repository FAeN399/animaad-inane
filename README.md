# Animaad Inane Monorepo

Animaad Inane is a modular creative toolkit built as a Turborepo monorepo. It includes multiple applications and packages for interactive 3D and 2D content creation and exploration.

## Workspace Structure

- **apps/forge-suite-app**: Main React + TypeScript Vite application (Forge Suite) for geometry, map, mandala modules.
- **apps/docs**: Next.js documentation site for the toolkit.
- **apps/web**: Next.js landing page and examples.
- **packages/api**: Shared API client utilities.
- **packages/core**: Common helpers and utilities for all apps.
- **packages/ui**: Shared React component library (buttons, cards, etc.).
- **packages/eslint-config**: ESLint configurations.
- **packages/typescript-config**: TypeScript project configurations.

## Getting Started

### Prerequisites

- Node.js >=16
- Yarn or npm
- Git

### Install Dependencies & Run

```bash
# From repo root
npm install
# Start development servers for all apps
npx turbo run dev
```

### Building

```bash
# Build all projects
npx turbo run build
```

### Testing

```bash
# Run unit tests across all apps and packages
npx turbo run test
```

## Forge Suite App (forge-suite-app)

The Forge Suite app provides a Geometry Module MVP that lets you:

- Import glTF meshes (drag-and-drop)
- View and transform meshes with interactive gizmos
- Undo/redo transformations
- Plan for boolean operations (CSG)

Find its code in `apps/forge-suite-app`.

## Contributing

- Follow the branch-per-feature approach (tiny PRs)
- Write unit tests first (Vitest)
- Keep CI green (lint, type-check, tests)

## License

MIT
