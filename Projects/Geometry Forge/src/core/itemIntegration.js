// src/core/itemIntegration.js
import { getAllItems } from './itemLibrary.js';
import * as THREE from 'three';

/**
 * Integrates the item library with the Geometry Forge application
 */

// Cache for generated items
const itemCache = new Map();

/**
 * Registers all items from the library with the application
 * @param {Object} App - The main application instance
 */
export function registerItems(App) {
    const items = getAllItems();
    
    // Register each item with the application
    items.forEach(item => {
        // Add to the application's shape registry
        if (App.registerShape) {
            App.registerShape({
                id: item.id,
                name: item.name,
                category: item.category,
                description: item.description,
                generator: (params) => generateItem(item, params)
            });
        }
    });
    
    console.log(`Registered ${items.length} items from the item library`);
}

/**
 * Generates an item using its generator function
 * @param {Object} item - The item definition
 * @param {Object} params - Parameters for generation
 * @returns {THREE.Object3D} - The generated 3D object
 */
function generateItem(item, params = {}) {
    // Generate a cache key based on the item and parameters
    const cacheKey = getCacheKey(item.id, params);
    
    // Check if we have a cached version
    if (itemCache.has(cacheKey)) {
        // Clone the cached item
        return itemCache.get(cacheKey).clone();
    }
    
    // Generate a new item
    const generatedItem = item.generator(params);
    
    // Cache the item for future use
    itemCache.set(cacheKey, generatedItem.clone());
    
    return generatedItem;
}

/**
 * Creates a cache key for an item with specific parameters
 * @param {string} itemId - The item ID
 * @param {Object} params - The generation parameters
 * @returns {string} - A cache key
 */
function getCacheKey(itemId, params) {
    return `${itemId}_${JSON.stringify(params)}`;
}

/**
 * Gets all available item categories
 * @returns {Array} - Array of category names
 */
export function getItemCategories() {
    const items = getAllItems();
    const categories = new Set();
    
    items.forEach(item => {
        if (item.category) {
            categories.add(item.category);
        }
    });
    
    return Array.from(categories);
}

/**
 * Gets items filtered by category
 * @param {string} category - Category to filter by (optional)
 * @returns {Array} - Filtered items
 */
export function getItemsByCategory(category) {
    const items = getAllItems();
    
    if (!category) {
        return items;
    }
    
    return items.filter(item => item.category === category);
}

/**
 * Creates a categorized menu structure for the items
 * @returns {Object} - Menu structure with categories and items
 */
export function getCategorizedItemMenu() {
    const categories = getItemCategories();
    const menu = {};
    
    categories.forEach(category => {
        menu[category] = getItemsByCategory(category);
    });
    
    return menu;
}
