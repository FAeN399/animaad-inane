// src/ui/itemLibraryPanel.js
import { getCategorizedItemMenu } from '../core/itemIntegration.js';

/**
 * Creates and manages the Item Library panel in the UI
 */

let App = null;
let panel = null;
let isVisible = false;

/**
 * Initializes the Item Library panel
 * @param {Object} appInstance - The main application instance
 */
export function setupItemLibraryPanel(appInstance) {
    App = appInstance;
    
    // Create the panel if it doesn't exist
    if (!panel) {
        createPanel();
    }
    
    // Populate the panel with items
    populatePanel();
}

/**
 * Creates the Item Library panel DOM structure
 */
function createPanel() {
    // Create the panel container
    panel = document.createElement('div');
    panel.id = 'item-library-panel';
    panel.className = 'fixed right-0 top-16 bottom-0 w-80 bg-forge-panel text-forge-text p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-full z-30';
    
    // Create the panel header
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-4';
    
    const title = document.createElement('h2');
    title.className = 'text-lg font-semibold';
    title.textContent = 'Sacred Geometry Library';
    header.appendChild(title);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'p-1 rounded hover:bg-forge-button-hover';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', togglePanel);
    header.appendChild(closeBtn);
    
    panel.appendChild(header);
    
    // Create the content container
    const content = document.createElement('div');
    content.id = 'item-library-content';
    content.className = 'space-y-4';
    panel.appendChild(content);
    
    // Add the panel to the document
    document.body.appendChild(panel);
    
    // Create a toggle button in the main toolbar
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggle-item-library-btn';
        toggleBtn.className = 'px-2 py-1 bg-forge-button hover:bg-forge-button-hover rounded text-forge-text';
        toggleBtn.textContent = 'Sacred Geometry';
        toggleBtn.addEventListener('click', togglePanel);
        
        // Add to toolbar
        const btnContainer = document.createElement('div');
        btnContainer.className = 'ml-4';
        btnContainer.appendChild(toggleBtn);
        toolbar.appendChild(btnContainer);
    }
}

/**
 * Toggles the visibility of the Item Library panel
 */
export function togglePanel() {
    isVisible = !isVisible;
    
    if (isVisible) {
        panel.classList.remove('translate-x-full');
    } else {
        panel.classList.add('translate-x-full');
    }
}

/**
 * Populates the panel with categorized items
 */
function populatePanel() {
    const content = document.getElementById('item-library-content');
    if (!content) return;
    
    // Clear existing content
    content.innerHTML = '';
    
    // Get categorized items
    const categorizedItems = getCategorizedItemMenu();
    
    // Create a section for each category
    Object.entries(categorizedItems).forEach(([category, items]) => {
        // Create category section
        const section = document.createElement('div');
        section.className = 'mb-6';
        
        // Category header
        const categoryHeader = document.createElement('h3');
        categoryHeader.className = 'text-md font-medium mb-2 bg-forge-button-hover px-2 py-1 rounded uppercase text-sm';
        categoryHeader.textContent = formatCategoryName(category);
        section.appendChild(categoryHeader);
        
        // Items grid
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'grid grid-cols-2 gap-2';
        
        // Add each item to the grid
        items.forEach(item => {
            const itemCard = createItemCard(item);
            itemsGrid.appendChild(itemCard);
        });
        
        section.appendChild(itemsGrid);
        content.appendChild(section);
    });
}

/**
 * Creates a card for an individual item
 * @param {Object} item - The item definition
 * @returns {HTMLElement} - The item card element
 */
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'bg-forge-button hover:bg-forge-button-hover rounded p-2 cursor-pointer transition-colors duration-200';
    card.dataset.itemId = item.id;
    
    // Item name
    const name = document.createElement('div');
    name.className = 'font-medium text-sm mb-1';
    name.textContent = item.name;
    card.appendChild(name);
    
    // Item description (truncated)
    if (item.description) {
        const description = document.createElement('div');
        description.className = 'text-xs text-forge-text-dim truncate';
        description.title = item.description;
        description.textContent = item.description;
        card.appendChild(description);
    }
    
    // Add click handler to add the item to the scene
    card.addEventListener('click', () => {
        if (App && App.addItemFromLibrary) {
            App.addItemFromLibrary(item.id);
            // Optional: close the panel after adding
            // togglePanel();
        } else {
            console.warn('App.addItemFromLibrary is not available');
        }
    });
    
    return card;
}

/**
 * Formats a category name for display
 * @param {string} category - The raw category name
 * @returns {string} - The formatted category name
 */
function formatCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}
