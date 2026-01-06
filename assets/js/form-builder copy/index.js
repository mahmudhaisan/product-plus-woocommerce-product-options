import { initCore, state, formData } from './core.js';
import { initDnD } from './dnd.js';
import { initSettings } from './settings.js';
import { initFields } from './fields.js';
import { initContainers } from './containers.js';
import { initPreview } from './preview.js';
import { initStorage } from './storage.js';

// Initialize all modules
export function initFormBuilder() {
    console.log('🚀 Initializing Form Builder...');
    
    try {
        // Wait for jQuery to be available
        if (typeof jQuery === 'undefined') {
            console.warn('jQuery not loaded yet, waiting...');
            setTimeout(initFormBuilder, 100);
            return;
        }

        jQuery(document).ready(function($) {
            // Initialize core first
            initCore();
            
            // Initialize other modules
            initDnD(state, formData);
            initSettings(state, formData);


            
            initFields(state, formData);
            initContainers(state, formData);
            initPreview(state, formData);
            initStorage(state, formData);
            
            console.log('✅ Form Builder initialized!');
        });
    } catch (error) {
        console.error('❌ Form Builder initialization failed:', error);
    }
}

// Auto-init when imported
initFormBuilder();