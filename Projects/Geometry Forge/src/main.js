import './style.css'; // Keep CSS import

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { CSG } from 'three-csg-ts';
import loader from '@monaco-editor/loader';
import { on } from './core/events.js';

// Add imports for commands, interface, storage, shader editor
import { CommandHistory, Command } from './core/commands.js';
import { setupUI } from './ui/interface.js';
import { setupShaderEditor } from './ui/shaderEditor.js';
import { setupLocalStorage } from './core/storage.js';
import { addShape as createMesh } from './core/shapes.js';
import { initItemManager } from './core/itemManager.js';
import { setupItemLibraryPanel } from './ui/itemLibraryPanel.js';

const App = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  transformControls: null,
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),
  selectedObject: null,
  history: null,

  init() {
    console.log('App.init() called'); // Check if init is called
    // Explicitly bind methods that will be called as callbacks
    this.animate = this.animate.bind(this);
    this.addShape = this.addShape.bind(this);
    this.duplicate = this.duplicate.bind(this);
    this.exportGLTF = this.exportGLTF.bind(this);
    this.exportOBJ = this.exportOBJ.bind(this);
    this.exportImage = this.exportImage.bind(this);
    this.exportSceneJSON = this.exportSceneJSON.bind(this);
    this.importFile = this.importFile.bind(this);
    this.importOBJ = this.importOBJ.bind(this);
    this.importJSON = this.importJSON.bind(this);
    this.attachIfTouching = this.attachIfTouching.bind(this);
    this.notifySceneChanged = this.notifySceneChanged.bind(this);
    this.requestSave = this.requestSave.bind(this);

    // Initialize history with app context
    this.history = new CommandHistory(this);

    // Core THREE.js setup
    this.initScene();
    this.initRenderer();
    this.initControls();
    this.initLights();
    this.initHelpers();

    // UI, storage, and editor
    this.initUI();
    setupShaderEditor();
    setupLocalStorage();

    // Set up event listeners for mode-specific actions
    this.initModeHandlers();

    // Start render loop
    this.animate();
  },

  // Mode-specific handlers
  initModeHandlers() {
    // Mandala generator
    on('mandala.generate', (data) => {
      const mandalaOptions = {
        segments: data.mandalaSegments || 16,
        radius: data.mandalaRadius || 2,
        color: data.mandalaColor || '#4299e1',
        shapeType: data.mandalaShapeType || 'petal',
        patternSize: data.mandalaPatternSize || 0.4,
        patternCount: data.mandalaSegments || 16
      };

      const mandala = this.addShape('mandala', mandalaOptions);
      if (mandala) {
        mandala.position.y = 0.05; // Slightly raised above ground
        this.selectObject(mandala);
      }
    });

    // Update mandala preview (if we implement live preview in the future)
    on('mandala.update', (data) => {
      // This could be used to update a preview in real-time
      // For now, we just store the parameters in uiState
    });

    // City builder wall generator
    on('city.addWall', (data) => {
      const wallOptions = {
        width: data.wallLength || 5,
        height: data.wallHeight || 3,
        thickness: 0.2
      };

      const wall = this.addShape('wallsegment', wallOptions);
      if (wall) {
        wall.position.y = wallOptions.height / 2; // Position base on ground
        this.selectObject(wall);
      }
    });
  },

  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 10);
  },

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // Get the container element
    const container = document.getElementById('viewport-container');
    if (!container) {
        console.error("Viewport container not found!");
        return;
    }
    // Set initial size based on container
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    document.getElementById('viewport').appendChild(this.renderer.domElement);

    // Handle window resizing - update based on container size
    window.addEventListener('resize', () => {
      // Recalculate based on container's current size
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  },

  initControls() {
    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;

    // Transform controls - ensure we create it after camera and renderer initialization
    try {
      this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
      this.transformControls.addEventListener('dragging-changed', (event) => {
        this.controls.enabled = !event.value;
      });

      // Set initial transform mode
      this.transformControls.setMode('translate');

      // Only add to scene after we're sure scene is initialized
      if (this.scene) {
        this.scene.add(this.transformControls);
      } else {
        console.warn("Scene not initialized yet, TransformControls will be added later");
      }
    } catch (error) {
      console.error('Failed to initialize TransformControls:', error);
    }
  },

  initLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    this.scene.add(directionalLight);
  },

  initHelpers() {
    const gridHelper = new THREE.GridHelper(20, 20);
    this.scene.add(gridHelper);
  },

  initUI() {
    // Set up all UI panels and event listeners
    setupUI(this);

    // Initialize the item library
    initItemManager(this);
    setupItemLibraryPanel(this);

    // Initial scene/outliner population (handled by setupUI via scene-changed event)

    // Initial undo/redo button state
    document.dispatchEvent(new CustomEvent('history-changed'));

    // Load Demo Scene
    const demoBtn = document.getElementById('load-demo-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        const loader = new GLTFLoader();
        loader.load(
          'scenes/scene.gltf',
          (gltf) => {
            const demoGroup = gltf.scene;
            demoGroup.name = 'Cosmic Demo';
            this.history.execute(new Command('addObject', { object: demoGroup, parent: this.scene }));
            document.dispatchEvent(new CustomEvent('scene-changed'));
          },
          undefined,
          (error) => console.error('Failed to load demo scene:', error)
        );
      });
    }
  },

  /** Create and add a shape via dropdown */
  addShape(type, options) {
    const mesh = createMesh(type, options);
    if (!mesh) return null;
    this.history.execute(new Command('addObject', { object: mesh, parent: this.scene }));
    return mesh;
  },

  /** Duplicate selected object */
  duplicate(object) {
    if (!object) return null;
    const dup = object.clone();
    dup.position.x += 1;
    dup.name = `${object.name} Copy`;
    this.history.execute(new Command('addObject', { object: dup, parent: this.scene }));
    return dup;
  },

  /** Export scene to GLTF */
  exportGLTF() {
    const exporter = new GLTFExporter();
    exporter.parse(this.scene, (result) => {
      const output = JSON.stringify(result, null, 2);
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url;
      link.download = 'scene.gltf'; link.click(); URL.revokeObjectURL(url);
    });
  },

  /** Export scene to OBJ */
  exportOBJ() {
    const exporter = new OBJExporter();
    const result = exporter.parse(this.scene);
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scene.obj';
    link.click();
    URL.revokeObjectURL(url);
  },

  /** Export scene as PNG image */
  exportImage() {
    // Temporarily hide helpers for cleaner image
    const transformVisible = this.transformControls.visible;
    this.transformControls.visible = false;

    // Find grid helper and hide it
    let gridHelper;
    this.scene.traverse(obj => {
      if (obj.isGridHelper) {
        gridHelper = obj;
        obj.visible = false;
      }
    });

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    // Take screenshot
    const canvas = this.renderer.domElement;
    const imageData = canvas.toDataURL('image/png');

    // Restore helpers
    this.transformControls.visible = transformVisible;
    if (gridHelper) gridHelper.visible = true;

    // Create download link
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'geometry_forge_scene.png';
    link.click();
  },

  /** Export as scene JSON */
  exportSceneJSON() {
    const sceneData = {
      objects: this.scene.children
        .filter(obj => obj.isMesh || obj.isGroup)
        .filter(obj => obj !== this.transformControls)
        .map(obj => ({
          id: obj.uuid,
          name: obj.name || `Unnamed ${obj.type}`,
          type: obj.geometry ? obj.geometry.type : obj.type,
          position: [obj.position.x, obj.position.y, obj.position.z],
          rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
          scale: [obj.scale.x, obj.scale.y, obj.scale.z],
          material: obj.material ? {
            color: '#' + obj.material.color.getHexString(),
            wireframe: obj.material.wireframe,
            effects: obj.userData.effect || 'none'
          } : null
        }))
    };

    const json = JSON.stringify(sceneData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'geometry_forge_scene.json';
    link.click();
    URL.revokeObjectURL(url);
  },

  /** Import GLTF/GLB file */
  importFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const loader = new GLTFLoader();
      loader.parse(e.target.result, '', (gltf) => {
        const model = gltf.scene;
        this.history.execute(new Command('importModel', { model, parent: this.scene }));
        this.notifySceneChanged();
      }, (error) => {
        console.error('Error parsing GLTF file:', error);
      });
    };
    reader.readAsArrayBuffer(file);
  },

  /** Import OBJ file */
  importOBJ(file) {
    // We need to use a different approach for OBJ files since Three.js doesn't have a direct parse method
    // Create a temporary URL for the file
    const objUrl = URL.createObjectURL(file);

    // Use the OBJLoader to load the file
    const loader = new OBJLoader();
    loader.load(objUrl, (obj) => {
      // Set default material if needed
      obj.traverse((child) => {
        if (child.isMesh) {
          if (!child.material) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
          }
        }
      });

      // Add to scene
      this.history.execute(new Command('importModel', { model: obj, parent: this.scene }));
      this.notifySceneChanged();

      // Clean up
      URL.revokeObjectURL(objUrl);
    }, undefined, (error) => {
      console.error('Error loading OBJ file:', error);
      URL.revokeObjectURL(objUrl);
    });
  },

  /** Import Scene JSON file */
  importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const sceneData = JSON.parse(e.target.result);

        // Validate the JSON structure
        if (!sceneData.objects || !Array.isArray(sceneData.objects)) {
          console.error('Invalid scene JSON format');
          return;
        }

        // Create objects from the JSON data
        sceneData.objects.forEach(objData => {
          // Create a basic mesh or group based on the type
          let object;

          if (objData.type && objData.type.includes('Geometry')) {
            // Create a mesh with basic geometry
            const geometryType = objData.type.replace('Geometry', '').toLowerCase();
            object = this.addShape(geometryType);
          } else if (objData.type === 'Group') {
            // Create an empty group
            object = new THREE.Group();
            this.history.execute(new Command('addObject', { object, parent: this.scene }));
          }

          if (object) {
            // Set properties
            object.name = objData.name || 'Imported Object';

            // Set position, rotation, and scale
            if (objData.position && objData.position.length === 3) {
              object.position.set(objData.position[0], objData.position[1], objData.position[2]);
            }

            if (objData.rotation && objData.rotation.length === 3) {
              object.rotation.set(objData.rotation[0], objData.rotation[1], objData.rotation[2]);
            }

            if (objData.scale && objData.scale.length === 3) {
              object.scale.set(objData.scale[0], objData.scale[1], objData.scale[2]);
            }

            // Set material properties if available
            if (objData.material && object.material) {
              if (objData.material.color) {
                object.material.color.set(objData.material.color);
              }

              if (objData.material.wireframe !== undefined) {
                object.material.wireframe = objData.material.wireframe;
              }

              if (objData.material.effects) {
                object.userData.effect = objData.material.effects;
                this.setEffect(object, objData.material.effects);
              }

              object.material.needsUpdate = true;
            }
          }
        });

        this.notifySceneChanged();
      } catch (error) {
        console.error('Error parsing scene JSON:', error);
      }
    };
    reader.readAsText(file);
  },

  /** Notify scene change for UI updates */
  notifySceneChanged() {
    document.dispatchEvent(new Event('scene-changed'));
  },

  /** Select an object and attach transform controls */
  selectObject(object) {
    if (this.selectedObject === object) return; // Already selected

    this.selectedObject = object;

    if (object) {
      this.transformControls.attach(object);
      if (!this.scene.children.includes(this.transformControls)) {
        this.scene.add(this.transformControls);
      }
    } else {
      this.transformControls.detach();
    }

    // Dispatch selection-changed event for UI updates
    document.dispatchEvent(new CustomEvent('selection-changed', {
      detail: { selectedObject: object }
    }));
  },

  /** Delete the selected object */
  deleteObject(object) {
    if (!object) return;

    this.history.execute(new Command('removeObject', {
      object,
      parent: object.parent || this.scene
    }));

    if (this.selectedObject === object) {
      this.selectObject(null);
    }
  },

  /** Reset transform of an object */
  resetTransform(object) {
    if (!object) return;

    this.history.execute(new Command('resetTransform', {
      object,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    }));
  },

  /** Apply visual effects like glow, shine, dull, pulse */
  setEffect(object, effect) {
    if (!object || !object.material) return;
    const mat = object.material;
    // Reset to defaults
    mat.emissive = new THREE.Color(0x000000);
    mat.emissiveIntensity = 0;
    mat.roughness = 0.5;
    mat.metalness = 0;
    object.userData._pulse = 0;
    switch (effect) {
      case 'glow':
        mat.emissive = new THREE.Color(0x4299e1);
        mat.emissiveIntensity = 0.8;
        break;
      case 'shine':
        mat.roughness = 0;
        mat.metalness = 1;
        break;
      case 'dull':
        mat.roughness = 1;
        mat.metalness = 0;
        break;
      case 'pulse':
        mat.emissive = new THREE.Color(0x4299e1);
        mat.emissiveIntensity = 0;
        object.userData._pulse = 0.0;
        break;
      default:
        // 'none' - defaults already applied
        break;
    }
    mat.needsUpdate = true;
  },

  /** Attach object to another if they're touching */
  attachIfTouching(object) {
    if (!object || !object.isMesh) return;

    // Find collisions with other objects
    const collidableMeshes = this.scene.children.filter(obj =>
      obj.isMesh && obj !== object && obj !== this.transformControls
    );

    if (collidableMeshes.length === 0) return null;

    // Find closest object
    let closestObj = null;
    let closestDistance = Infinity;

    // Get the object's bounding box
    const box1 = new THREE.Box3().setFromObject(object);

    // Check each object for collision
    for (const other of collidableMeshes) {
      const box2 = new THREE.Box3().setFromObject(other);

      // Check if bounding boxes intersect
      if (box1.intersectsBox(box2)) {
        // Calculate center-to-center distance
        const center1 = box1.getCenter(new THREE.Vector3());
        const center2 = box2.getCenter(new THREE.Vector3());
        const distance = center1.distanceTo(center2);

        // Keep track of closest
        if (distance < closestDistance) {
          closestDistance = distance;
          closestObj = other;
        }
      }
    }

    // If we found a touching object, perform CSG union
    if (closestObj) {
      try {
        // Create CSG objects
        const objectCSG = CSG.fromMesh(object);
        const targetCSG = CSG.fromMesh(closestObj);

        // Perform union
        const resultCSG = objectCSG.union(targetCSG);

        // Convert back to mesh
        const resultMesh = CSG.toMesh(
          resultCSG,
          object.matrix.clone(),
          object.material.clone()
        );

        // Copy over name and user data
        resultMesh.name = `${object.name}-${closestObj.name}-union`;
        resultMesh.userData = {
          ...object.userData,
          merged: [object.uuid, closestObj.uuid]
        };

        // Add result to scene and remove originals
        this.history.execute(new Command('mergeObjects', {
          objects: [object, closestObj],
          result: resultMesh,
          parent: this.scene
        }));

        // Return the new mesh
        return resultMesh;
      } catch (error) {
        console.warn('CSG union failed, falling back to grouping:', error);
      }
    }

    // Fallback: group the touching objects instead of union
    if (closestObj) {
      // Create a new group
      const group = new THREE.Group();
      group.name = `${object.name}-${closestObj.name}-group`;
      // Preserve world transforms
      const parent = this.scene;
      // Compute offsets: convert objects to group local
      parent.add(group);
      [object, closestObj].forEach(obj => {
        // Compute world matrix
        obj.updateMatrixWorld();
        // Attach to group
        THREE.SceneUtils.detach(obj, parent, group);
      });
      this.history.execute(new Command('groupObjects', { objects: [object, closestObj], group, parent }));
      return group;
    }

    return null;
  },

  /** Request autosave with debounce */
  requestSave() {
    console.log("Autosave requested");
    // Implement actual save logic or call to storage module
  },

  animate() {
    requestAnimationFrame(() => this.animate());

    // Ensure controls and renderer exist before updating/rendering
    if (this.controls) {
        this.controls.update();
    }
    if (this.renderer && this.scene && this.camera) {
        // Optional: Check if container size changed if resize events are unreliable
        const container = document.getElementById('viewport-container');
        const canvas = this.renderer.domElement;
        if (container && (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight)) {
             this.camera.aspect = container.clientWidth / container.clientHeight;
             this.camera.updateProjectionMatrix();
             this.renderer.setSize(container.clientWidth, container.clientHeight);
        }

        // Handle pulsing effect
        this.scene.traverse((obj) => {
          if (obj.userData._pulse !== undefined) {
            const mat = obj.material;
            if (mat && obj.userData.effect === 'pulse') {
              obj.userData._pulse += 0.05;
              mat.emissiveIntensity = 0.5 + 0.5 * Math.sin(obj.userData._pulse);
              mat.needsUpdate = true;
            }
          }
        });

        this.renderer.render(this.scene, this.camera);
    }
  }
};

window.addEventListener('load', App.init.bind(App)); // <-- Use bind here

// Expose App so UI modules can access it
window.App = App;

console.log('main.js script executed'); // Check if the script file itself runs
