// src/core/itemManager.js
import { registerItems } from './itemIntegration.js';
import { getAllItems } from './itemLibrary.js';
import * as THREE from 'three';

/**
 * Manages the creation and integration of items from the library
 */

// Reference to the main App instance
let App = null;

/**
 * Initializes the item manager
 * @param {Object} appInstance - The main application instance
 */
export function initItemManager(appInstance) {
    App = appInstance;
    
    // Register all items with the application
    registerItems(App);
    
    // Add method to App for adding items from the library
    App.addItemFromLibrary = addItemFromLibrary;
    
    console.log('Item Manager initialized');
}

/**
 * Adds an item from the library to the scene
 * @param {string} itemId - The ID of the item to add
 * @param {Object} params - Optional parameters for item generation
 * @returns {THREE.Object3D} - The added object
 */
function addItemFromLibrary(itemId, params = {}) {
    // Find the item in the library
    const items = getAllItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
        console.error(`Item with ID "${itemId}" not found in the library`);
        return null;
    }
    
    try {
        // Generate the item
        const object = item.generator(params);
        
        // Set a default name based on the item name
        object.name = item.name;
        
        // Add to scene
        App.scene.add(object);
        
        // Position at the center of the scene
        object.position.set(0, 0, 0);
        
        // Select the new object
        App.selectObject(object);
        
        // Notify that the scene has changed
        App.notifySceneChanged();
        
        console.log(`Added ${item.name} to scene`);
        
        return object;
    } catch (error) {
        console.error(`Error creating item "${itemId}":`, error);
        return null;
    }
}

/**
 * Gets an item definition by ID
 * @param {string} itemId - The ID of the item
 * @returns {Object|null} - The item definition or null if not found
 */
export function getItemById(itemId) {
    const items = getAllItems();
    return items.find(i => i.id === itemId) || null;
}

/**
 * Generates a preview of an item
 * @param {string} itemId - The ID of the item to preview
 * @param {HTMLElement} container - The container to add the preview to
 * @param {Object} params - Optional parameters for item generation
 */
export function generateItemPreview(itemId, container, params = {}) {
    // Clear the container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Find the item
    const item = getItemById(itemId);
    if (!item) return;
    
    // Create a small Three.js scene for the preview
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2d3748);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Generate the item
    const object = item.generator(params);
    scene.add(object);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Add orbit controls if available
    let controls = null;
    if (THREE.OrbitControls) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
    }
    
    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate the object if no controls
        if (!controls) {
            object.rotation.y += 0.01;
        } else {
            controls.update();
        }
        
        renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Return a cleanup function
    return () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        if (controls) controls.dispose();
    };
}
