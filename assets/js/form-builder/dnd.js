import { state, updateState, formData } from './core.js';
import { openSettingsPanel, applySettings, createFieldInstantly } from './settings.js';
import { openContainerSettings } from './containers.js';
import { updateFieldOrder } from './fields.js';


export function initDnD(state, formData) {
    makeComponentsDraggable();
    // makeBuilderDroppable();
    initSortable();
    initMobileSupport();
}


function makeComponentsDraggable() {
    jQuery('.ppxo-options-component').draggable({
        connectToSortable: '#ppxo-formBuilder',
        helper: 'clone',
        start: function () {
            jQuery(this).addClass('dragging');
        },
        stop: function () {

            jQuery(this).removeClass('dragging');

        }
    });
}



function initSortable() {
    const $builder = jQuery('#ppxo-formBuilder');

    $builder.sortable({
        // ONLY real fields are sortable
        items: '> .wfb-form-field',

        // placeholder should never be draggable or receive focus
        // cancel: '#ppxo-initialPlaceholder',

        placeholder: 'wfb-sortable-placeholder',
        opacity: 0.7,
        tolerance: 'pointer',

        start(event, ui) {
            // highlight empty area ONLY if placeholder exists
            $builder.find('#ppxo-initialPlaceholder').addClass('highlighted');
        },

        stop(event, ui) {
            $builder.find('#ppxo-initialPlaceholder').removeClass('highlighted');
        },

        receive(event, ui) {
            // when something is dropped from outside
            removePlaceholderForce();
        },

        update(event, ui) {
            removePlaceholderForce();

            const $item = ui.item;
            const dropIndex = $item.index();

            // CASE 1: Dragged from left panel
            if ($item.hasClass('ui-draggable')) {
                const componentType = $item.data('type');
                if (!componentType) return;

                $item.remove(); // remove clone

                updateState({ dropPosition: { index: dropIndex } });

                if (componentType === 'container') {
                    openContainerSettings();
                } else {
                    const $newField = createFieldInstantly(componentType);
                    const newFieldId = $newField.data('field-id');
                    reorderFormData(dropIndex, newFieldId);
                    $newField.find('.wfb-edit-field').trigger('click');
                }

                updateFieldOrder();
                return;
            }

            // CASE 2: Manual sort
            updateFieldOrder();


            jQuery('#ppxo_form_data_latest').val(
                JSON.stringify({ 
                    fields: formData.fields,
                    products: formData.products,
                    hook: formData.hook,

                 })
            );

            console.log('FormData after manual sort:', formData);
        }
    });

    function removePlaceholderForce() {
        const $placeholder = $builder.find('#ppxo-initialPlaceholder');
        if ($placeholder.length) {
            console.log('Removing empty placeholder (forced)');
            $placeholder.remove();
        }
    }

}


function reorderFormData(dropIndex, newFieldId) {
    // Find the field object
    const item = formData.fields.find(f => f.id === newFieldId);
    if (!item) return;

    // Remove from old position
    formData.fields = formData.fields.filter(f => f.id !== newFieldId);

    // Insert at new position
    formData.fields.splice(dropIndex, 0, item);
}



function initMobileSupport() {
    if ('ontouchstart' in window) {
        jQuery('.ppxo-options-component').each(function () {
            jQuery(this).append('<div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>');
        });

        jQuery('.wfb-mobile-drag-handle').on('touchstart', function (e) {
            e.preventDefault();
            jQuery(this).closest('.ppxo-options-component').trigger('mousedown');
        });
    }
}