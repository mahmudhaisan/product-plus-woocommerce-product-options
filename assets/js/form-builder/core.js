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

    formData = {
        fields: [],
        products: [],
        hook: ''
    };
    // Initialize tooltips
    // initTooltips();

    // Bind core events
    bindCoreEvents();

    return { state, formData };
}


function bindCoreEvents() {
    // Search functionality
    jQuery('#wfb-searchComponents').on('keyup', function () {
        const searchText = jQuery(this).val().toLowerCase();
        jQuery('.ppxo-options-component').each(function () {
            const componentText = jQuery(this).text().toLowerCase();
            jQuery(this).toggle(componentText.includes(searchText));
        });
    });


    
}


// State helpers
export function updateState(newState) {
    Object.assign(state, newState);
}

export function updateFormData(newData) {
    Object.assign(formData, newData);
}



function ensureBuilderPlaceholder() {
    const $builder = jQuery('#ppxo-formBuilder');

    // builder not ready yet
    if (!$builder.length) return;

    const hasFields = $builder.find('.wfb-form-field').length > 0;

    console.log(hasFields);


    const hasPlaceholder = $builder.find('#ppxo-initialPlaceholder').length > 0;

    if (!hasFields && !hasPlaceholder) {
        console.log('Adding empty builder placeholder');

        $builder.append(`
            <div id="ppxo-initialPlaceholder"
                 class="ppxo-empty-placeholder text-center text-muted"
                 aria-hidden="true">
                <i class="fas fa-hand-point-down fa-2x mb-3"></i>
                <h5 class="mb-2">Drag components here</h5>
                <p class="mb-0">
                    Drop fields in this highlighted area to add them to your form
                </p>
            </div>
        `);
    }
}


jQuery(document).ready(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    if (action === 'new') {
        ensureBuilderPlaceholder();
    }
});










