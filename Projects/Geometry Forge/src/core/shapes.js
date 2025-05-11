import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Creates a material with the specified properties
 * @param {Object} props Material properties
 * @returns {THREE.Material} The created material
 */
export function createMaterial(props = {}) {
  const {
    color = getRandomColor(),
    wireframe = false,
    transparent = false,
    opacity = 1.0,
    metalness = 0.2,
    roughness = 0.7,
    emissive = 0x000000
  } = props;

  const material = new THREE.MeshStandardMaterial({
    color,
    wireframe,
    transparent,
    opacity,
    metalness,
    roughness,
    emissive,
    side: THREE.DoubleSide
  });

  return material;
}

/**
 * Returns a random color for new shapes
 * @returns {Number} Hexadecimal color value
 */
function getRandomColor() {
  const colors = [
    0x4285F4, // Blue
    0xEA4335, // Red
    0xFBBC05, // Yellow
    0x34A853, // Green
    0xFF9900, // Orange
    0x9C27B0, // Purple
    0x00ACC1  // Teal
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Creates a mandala shape with the specified options
 * @param {Object} options The options for the mandala
 * @returns {THREE.Group} The created mandala group
 */
function createMandala(options = {}) {
  const segments = options.segments || 16;
  const radius = options.radius || 2;
  const color = options.color || '#4299e1';
  const shapeType = options.shapeType || 'petal';
  const patternSize = options.patternSize || 0.4;

  // Create a circular base
  const baseGeometry = new THREE.CircleGeometry(radius, segments);

  // Create pattern points for a mandala
  const pattern = [];
  const patternCount = options.patternCount || segments;

  // Generate symmetric pattern points
  for (let i = 0; i < patternCount; i++) {
    const angle = (i / patternCount) * Math.PI * 2;
    const dist = radius * 0.7;
    pattern.push(
      new THREE.Vector3(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist,
        0
      )
    );
  }

  // Create extrusion path shapes
  const shapes = [];
  for (let i = 0; i < patternCount; i++) {
    const shape = new THREE.Shape();
    const center = pattern[i];
    const angle = (i / patternCount) * Math.PI * 2;

    // Create different shapes based on shapeType
    switch (shapeType) {
      case 'petal':
        // Create a curved petal
        shape.moveTo(center.x, center.y);
        const controlPoint1 = new THREE.Vector2(
          center.x + patternSize * Math.cos(angle + Math.PI/4),
          center.y + patternSize * Math.sin(angle + Math.PI/4)
        );
        const controlPoint2 = new THREE.Vector2(
          center.x + patternSize * Math.cos(angle - Math.PI/4),
          center.y + patternSize * Math.sin(angle - Math.PI/4)
        );
        shape.bezierCurveTo(
          controlPoint1.x, controlPoint1.y,
          controlPoint2.x, controlPoint2.y,
          center.x, center.y
        );
        break;

      case 'triangle':
        // Create a triangle pointing outward
        shape.moveTo(center.x, center.y);
        shape.lineTo(
          center.x + patternSize * Math.cos(angle),
          center.y + patternSize * Math.sin(angle)
        );
        shape.lineTo(
          center.x + patternSize * 0.7 * Math.cos(angle + Math.PI/6),
          center.y + patternSize * 0.7 * Math.sin(angle + Math.PI/6)
        );
        shape.lineTo(center.x, center.y);
        break;

      case 'square':
        // Create a square
        const halfSize = patternSize * 0.4;
        const squareCenter = {
          x: center.x + patternSize * 0.5 * Math.cos(angle),
          y: center.y + patternSize * 0.5 * Math.sin(angle)
        };
        shape.moveTo(
          squareCenter.x + halfSize * Math.cos(angle + Math.PI/4),
          squareCenter.y + halfSize * Math.sin(angle + Math.PI/4)
        );
        shape.lineTo(
          squareCenter.x + halfSize * Math.cos(angle + 3*Math.PI/4),
          squareCenter.y + halfSize * Math.sin(angle + 3*Math.PI/4)
        );
        shape.lineTo(
          squareCenter.x + halfSize * Math.cos(angle + 5*Math.PI/4),
          squareCenter.y + halfSize * Math.sin(angle + 5*Math.PI/4)
        );
        shape.lineTo(
          squareCenter.x + halfSize * Math.cos(angle + 7*Math.PI/4),
          squareCenter.y + halfSize * Math.sin(angle + 7*Math.PI/4)
        );
        shape.lineTo(
          squareCenter.x + halfSize * Math.cos(angle + Math.PI/4),
          squareCenter.y + halfSize * Math.sin(angle + Math.PI/4)
        );
        break;

      case 'circle':
        // Create a small circle
        const circleRadius = patternSize * 0.3;
        const circleCenter = {
          x: center.x + patternSize * 0.5 * Math.cos(angle),
          y: center.y + patternSize * 0.5 * Math.sin(angle)
        };
        const circleSegments = 16;
        for (let j = 0; j <= circleSegments; j++) {
          const circleAngle = (j / circleSegments) * Math.PI * 2;
          const x = circleCenter.x + circleRadius * Math.cos(circleAngle);
          const y = circleCenter.y + circleRadius * Math.sin(circleAngle);
          if (j === 0) {
            shape.moveTo(x, y);
          } else {
            shape.lineTo(x, y);
          }
        }
        break;

      case 'star':
        // Create a star shape
        shape.moveTo(center.x, center.y);
        const outerRadius = patternSize;
        const innerRadius = patternSize * 0.4;
        const starPoints = 5;

        for (let j = 0; j <= 2 * starPoints; j++) {
          const starAngle = angle + (j * Math.PI) / starPoints;
          const radius = j % 2 === 0 ? outerRadius : innerRadius;
          const x = center.x + radius * Math.cos(starAngle);
          const y = center.y + radius * Math.sin(starAngle);

          j === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
        }
        break;

      default:
        // Default to petal shape if unknown type
        shape.moveTo(center.x, center.y);
        const cp1 = new THREE.Vector2(
          center.x + patternSize * Math.cos(angle + Math.PI/4),
          center.y + patternSize * Math.sin(angle + Math.PI/4)
        );
        const cp2 = new THREE.Vector2(
          center.x + patternSize * Math.cos(angle - Math.PI/4),
          center.y + patternSize * Math.sin(angle - Math.PI/4)
        );
        shape.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, center.x, center.y);
        break;
    }

    shapes.push(shape);
  }

  // Create the material
  const material = new THREE.MeshStandardMaterial({
    color: color,
    side: THREE.DoubleSide,
    flatShading: true
  });

  // Create ExtrudeGeometry settings
  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3
  };

  // Create a Group to hold all shapes
  const mandalaGroup = new THREE.Group();

  // Add base circle
  const baseMesh = new THREE.Mesh(baseGeometry, material);
  baseMesh.position.z = -0.05; // Position below the patterns
  mandalaGroup.add(baseMesh);

  // Add extruded pattern elements
  shapes.forEach(shape => {
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const patternMesh = new THREE.Mesh(geometry, material);
    mandalaGroup.add(patternMesh);
  });

  // Rotate to lay flat on XY plane
  mandalaGroup.rotation.x = -Math.PI / 2;

  // Give it a name
  mandalaGroup.name = "Mandala";

  return mandalaGroup;
}

// Demiurge: cosmic sun construct integration
export function createDemiurge() {
  const group = new THREE.Group();
  // Simple cosmic sun placeholder; replace with full Demiurge scene setup
  const sunMat = createMaterial({ color: 0xffdd88, emissive: 0xfff0b0, opacity:1 });
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), sunMat);
  group.add(sunMesh);
  return group;
}

/**
 * Creates a mesh with the specified geometry type and options
 * @param {String} type The type of geometry to create
 * @param {Object} options The options for the geometry
 * @returns {THREE.Mesh} The created mesh
 */
export function addShape(type, options = {}) {
  // Check for library items
  if (type.startsWith('library:')) {
    const itemId = type.split(':')[1];
    // The App instance will handle creating library items through itemManager
    // This is just a placeholder - the actual creation happens in itemManager.js
    console.log(`Creating library item: ${itemId}`);
    return null; // Let the App.addItemFromLibrary handle it
  }

  // Check for custom shapes
  if (type.startsWith('custom:')) {
    const id = type.split(':')[1];
    const stored = getCustomShapes();
    const entry = stored.find(item => item.id === id);
    if (entry && entry.data) {
      const loader = new THREE.ObjectLoader();
      const obj = loader.parse(entry.data);
      obj.name = entry.name;
      return obj;
    }
    console.warn(`Custom shape ${id} not found`);
    return null;
  }

  let geometry;
  const defaultMaterial = createMaterial(options.material);

  switch (type.toLowerCase()) {
    case 'box':
    case 'cube': {
      const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1 } = options;
      geometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
      break;
    }

    case 'sphere': {
      const { radius = 1, widthSegments = 32, heightSegments = 16 } = options;
      geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
      break;
    }

    case 'cone': {
      const { radius = 1, height = 2, radialSegments = 32, heightSegments = 1 } = options;
      geometry = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments);
      break;
    }

    case 'cylinder': {
      const {
        radiusTop = 1,
        radiusBottom = 1,
        height = 2,
        radialSegments = 32,
        heightSegments = 1
      } = options;
      geometry = new THREE.CylinderGeometry(
        radiusTop, radiusBottom, height, radialSegments, heightSegments
      );
      break;
    }

    case 'torus': {
      const { radius = 1, tube = 0.4, radialSegments = 16, tubularSegments = 32 } = options;
      geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
      break;
    }

    case 'torusknot': {
      const {
        radius = 1,
        tube = 0.4,
        tubularSegments = 64,
        radialSegments = 8,
        p = 2,
        q = 3
      } = options;
      geometry = new THREE.TorusKnotGeometry(
        radius, tube, tubularSegments, radialSegments, p, q
      );
      break;
    }

    case 'dodecahedron': {
      const { radius = 1, detail = 0 } = options;
      geometry = new THREE.DodecahedronGeometry(radius, detail);
      break;
    }

    case 'icosahedron': {
      const { radius = 1, detail = 0 } = options;
      geometry = new THREE.IcosahedronGeometry(radius, detail);
      break;
    }

    case 'lathe': {
      const { segments = 12 } = options;
      // Default points for a vase-like shape if none provided
      const points = options.points || [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.4, 0),
        new THREE.Vector2(0.4, 0.5),
        new THREE.Vector2(0.5, 0.8),
        new THREE.Vector2(0.4, 1),
        new THREE.Vector2(0.3, 1.2),
        new THREE.Vector2(0.2, 1.4),
        new THREE.Vector2(0, 1.5)
      ];
      geometry = new THREE.LatheGeometry(points, segments);
      break;
    }

    case 'parametric': {
      const { slices = 16, stacks = 16 } = options;
      const parametricFunc = options.func || ((u, v, target) => {
        // Default function: Simple wave pattern surface
        const x = u * 2 - 1;
        const y = v * 2 - 1;
        const z = Math.sin(Math.PI * u) * Math.sin(Math.PI * v) * 0.5;
        target.set(x, y, z);
      });

      geometry = new THREE.ParametricGeometry(parametricFunc, slices, stacks);
      break;
    }

    case 'merkaba': {
      const { radius = 1, detail = 0 } = options;

      // Create two tetrahedra
      const tetra1 = new THREE.TetrahedronGeometry(radius, detail);
      const tetra2 = new THREE.TetrahedronGeometry(radius, detail);

      // Create meshes to manipulate the geometries
      const mesh1 = new THREE.Mesh(tetra1);
      const mesh2 = new THREE.Mesh(tetra2);

      // Rotate the second tetrahedron 180 degrees on the Y axis
      mesh2.rotation.y = Math.PI;
      mesh2.rotation.x = Math.PI / 2; // Add some rotation on X to create the star shape
      mesh2.updateMatrix();
      tetra2.applyMatrix4(mesh2.matrix);

      // Combine the geometries
      geometry = BufferGeometryUtils.mergeBufferGeometries([tetra1, tetra2]);
      break;
    }

    case 'vectorequilibrium':
    case 'cuboctahedron': {
      // Cuboctahedron: 12 vertices at coordinates (±1, 0, 0), (0, ±1, 0), (0, 0, ±1)
      const vertices = [
        // (±1, 0, ±1)
        new THREE.Vector3(1, 0, 1), new THREE.Vector3(1, 0, -1),
        new THREE.Vector3(-1, 0, 1), new THREE.Vector3(-1, 0, -1),
        // (±1, ±1, 0)
        new THREE.Vector3(1, 1, 0), new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(-1, 1, 0), new THREE.Vector3(-1, -1, 0),
        // (0, ±1, ±1)
        new THREE.Vector3(0, 1, 1), new THREE.Vector3(0, 1, -1),
        new THREE.Vector3(0, -1, 1), new THREE.Vector3(0, -1, -1)
      ];

      const { radius = 1 } = options;
      // Scale the vertices to the desired radius
      vertices.forEach(v => v.multiplyScalar(radius / Math.sqrt(2)));

      geometry = new ConvexGeometry(vertices);
      break;
    }

    case 'text': {
      // Text geometry requires a font loader and is more complex
      // This is just a placeholder - we'd implement proper text loading with FontLoader
      console.warn('Text geometry requires FontLoader. Using a box as placeholder.');
      geometry = new THREE.BoxGeometry(2, 1, 0.2);
      // The actual implementation would load a font and create a TextGeometry
      break;
    }

    case 'mandala': {
      return createMandala(options);
    }

    case 'wallsegment': {
      const width = options.width || 5;
      const height = options.height || 3;
      const thickness = options.thickness || 0.2;
      geometry = new THREE.BoxGeometry(width, height, thickness);
      break;
    }

    case 'demiurge': {
      return createDemiurge();
    }

    default:
      console.error(`Unknown shape type: ${type}`);
      return null;
  }

  const mesh = new THREE.Mesh(geometry, defaultMaterial);
  mesh.name = `${type.charAt(0).toUpperCase() + type.slice(1)}`;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (type === 'mandala') mesh.rotation.x = -Math.PI / 2; // Flat on floor

  return mesh;
}

/**
 * Returns an array of available shape types
 * @returns {Array<String>} The available shape types
 */
export function getAvailableShapes() {
  // Built-in shapes
  const builtin = [
    { id: 'box', name: 'Box' },
    { id: 'sphere', name: 'Sphere' },
    { id: 'cone', name: 'Cone' },
    { id: 'cylinder', name: 'Cylinder' },
    { id: 'torus', name: 'Torus' },
    { id: 'torusknot', name: 'Torus Knot' },
    { id: 'dodecahedron', name: 'Dodecahedron' },
    { id: 'icosahedron', name: 'Icosahedron' },
    { id: 'merkaba', name: 'Star-Tetrahedron' },
    { id: 'vectorequilibrium', name: 'Cuboctahedron' },
    { id: 'lathe', name: 'Lathe' },
    { id: 'parametric', name: 'Parametric Surface' },
    { id: 'mandala', name: 'Mandala' },
    { id: 'wallsegment', name: 'Wall Segment' },
    { id: 'demiurge', name: 'Demiurge' }
  ];

  // Custom shapes from localStorage
  const customList = getCustomShapes().map(({ id, name }) => ({ id: `custom:${id}`, name }));

  // Note: Library items are handled separately through the itemLibraryPanel
  // They don't appear in the dropdown but in their own panel

  return [...builtin, ...customList];
}

/**
 * Updates geometry parameters for an existing mesh
 * @param {THREE.Mesh} mesh The mesh to update
 * @param {Object} params New geometry parameters
 */
export function updateGeometry(mesh, params) {
  if (!mesh) return;

  // Store original position, rotation, and scale
  const position = mesh.position.clone();
  const rotation = mesh.rotation.clone();
  const scale = mesh.scale.clone();
  const material = mesh.material;

  // Determine the type of geometry to create
  let newGeometry;
  if (mesh.geometry instanceof THREE.BoxGeometry) {
    const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1 } = params;
    newGeometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
  } else if (mesh.geometry instanceof THREE.SphereGeometry) {
    const { radius = 1, widthSegments = 32, heightSegments = 16 } = params;
    newGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  } else if (mesh.geometry instanceof THREE.ConeGeometry) {
    const { radius = 1, height = 2, radialSegments = 32, heightSegments = 1 } = params;
    newGeometry = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments);
  } else if (mesh.geometry instanceof THREE.CylinderGeometry) {
    const { radiusTop = 1, radiusBottom = 1, height = 2, radialSegments = 32, heightSegments = 1 } = params;
    newGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments);
  } else if (mesh.geometry instanceof THREE.TorusGeometry) {
    const { radius = 1, tube = 0.4, radialSegments = 16, tubularSegments = 32 } = params;
    newGeometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
  } else if (mesh.geometry instanceof THREE.TorusKnotGeometry) {
    const { radius = 1, tube = 0.4, tubularSegments = 64, radialSegments = 8, p = 2, q = 3 } = params;
    newGeometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
  } else if (mesh.geometry instanceof THREE.DodecahedronGeometry) {
    const { radius = 1, detail = 0 } = params;
    newGeometry = new THREE.DodecahedronGeometry(radius, detail);
  } else if (mesh.geometry instanceof THREE.IcosahedronGeometry) {
    const { radius = 1, detail = 0 } = params;
    newGeometry = new THREE.IcosahedronGeometry(radius, detail);
  } else if (mesh.geometry instanceof THREE.LatheGeometry) {
    const { segments = 12, points = null } = params;
    const lathePoints = points || mesh.geometry.parameters.points;
    newGeometry = new THREE.LatheGeometry(lathePoints, segments);
  } else if (mesh.geometry instanceof THREE.ParametricGeometry) {
    const { slices = 16, stacks = 16, func = null } = params;
    const paramFunc = func || mesh.geometry.parameters.func;
    newGeometry = new THREE.ParametricGeometry(paramFunc, slices, stacks);
  } else if (mesh.geometry instanceof THREE.BoxGeometry) {
    // Wall segments and default box
    const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1 } = params;
    newGeometry = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
  }

  if (newGeometry) {
    // Clean up old geometry to prevent memory leaks
    mesh.geometry.dispose();

    // Assign the new geometry
    mesh.geometry = newGeometry;

    // Restore position, rotation, and scale
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.scale.copy(scale);
  }
}

// --- Custom shape persistence ---
/**
 * Save a custom shape mesh to localStorage.
 * @param {THREE.Mesh} mesh
 */
export function saveCustomShape(mesh) {
  if (!mesh) return;
  const stored = JSON.parse(localStorage.getItem('customShapes') || '[]');
  // Use timestamp as unique id
  const id = Date.now().toString();
  const name = mesh.name || `Custom ${stored.length + 1}`;
  // Serialize mesh (geometry + material + userData)
  const json = mesh.toJSON();
  stored.push({ id, name, data: json });
  localStorage.setItem('customShapes', JSON.stringify(stored));
}

/**
 * Retrieve custom shapes metadata from localStorage.
 * @returns {Array<{id:string, name:string, data:Object}>}
 */
export function getCustomShapes() {
  return JSON.parse(localStorage.getItem('customShapes') || '[]');
}