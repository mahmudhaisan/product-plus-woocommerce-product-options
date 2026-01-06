// Shared state
export let state = {};
export let formData = {};

export function initCore() {
    // Initialize state
    state = {
        currentFieldId: null,
        currentSettings: {},
        isEditMode: false,
        currentContainerId: null,
        currentColumnId: null,
        dropPosition: null
    };

    // Initialize form data
    formData = {
        fields: []
    };

    // Initialize tooltips
    initTooltips();

    // Bind core events
    bindCoreEvents();

    return { state, formData };
}

function initTooltips() {
    if (typeof jQuery !== 'undefined') {
        jQuery('[data-bs-toggle="tooltip"]').tooltip();
    }
}

function bindCoreEvents() {
    // Search functionality
    jQuery('#wfb-searchComponents').on('keyup', function() {
        const searchText = jQuery(this).val().toLowerCase();
        jQuery('.wfb-component').each(function() {
            const componentText = jQuery(this).text().toLowerCase();
            jQuery(this).toggle(componentText.includes(searchText));
        });
    });
}

// Add CSS for tooltip hints
function addTooltipStyles() {
    const css = `
        .wfb-tooltip-hint {
            color: #6c757d;
            margin-left: 5px;
            cursor: help;
        }
        .wfb-tooltip-hint:hover {
            color: #495057;
        }
        .wfb-form-control-modern:focus {
            border-color: #007cba;
            box-shadow: 0 0 0 1px #007cba;
        }
        .form-text {
            font-size: 0.875em;
            color: #6c757d;
            margin-top: 0.25rem;
        }
    `;
    jQuery('head').append(`<style>${css}</style>`);
}

// Initialize when document is ready
jQuery(document).ready(function() {
    addTooltipStyles();
});

// State helpers
export function updateState(newState) {
    Object.assign(state, newState);
}

export function updateFormData(newData) {
    Object.assign(formData, newData);
}