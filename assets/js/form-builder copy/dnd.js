import { state, updateState } from './core.js';
import { openSettingsPanel } from './settings.js';
import { openContainerSettings } from './containers.js';
import { updateFieldOrder } from './fields.js';

export function initDnD(state, formData) {
    makeComponentsDraggable();
    makeBuilderDroppable();
    initSortable();
    initMobileSupport();
}

function makeComponentsDraggable() {
    jQuery('.wfb-component').draggable({
        revert: 'invalid',
        cursor: 'move',
        zIndex: 10000,
        scroll: false,
        containment: 'document',
        helper: function () {
            return jQuery('<div class="p-2 bg-light border rounded" style="z-index: 10001;">' + jQuery(this).text() + '</div>');
        },
        start: function (event, ui) {
            console.log('Making component draggable:', this);
            jQuery(this).addClass('dragging');
            jQuery('body').addClass('dragging');
            ui.helper.css('z-index', '10001');
        },
        stop: function (event, ui) {
            jQuery(this).removeClass('dragging');
            jQuery('body').removeClass('dragging');
        }
    });
}

function makeBuilderDroppable() {
    jQuery('#wfb-formBuilder').droppable({
        accept: '.wfb-component',
        hoverClass: 'wfb-drop-zone-highlight',
        drop: function (event, ui) {
            const componentType = ui.draggable.data('type');
            updateState({ dropPosition: null });

            if (componentType === 'container') {
                openContainerSettings();
            } else {
                openSettingsPanel(componentType);
            }
        }
    });
}

function initSortable() {
    jQuery('#wfb-formBuilder').sortable({
        placeholder: 'wfb-sortable-placeholder',
        cursor: 'move',
        opacity: 0.7,
        tolerance: 'pointer',
        update: updateFieldOrder
    });
}

function initMobileSupport() {
    if ('ontouchstart' in window) {
        jQuery('.wfb-component').each(function () {
            jQuery(this).append('<div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>');
        });

        jQuery('.wfb-mobile-drag-handle').on('touchstart', function (e) {
            e.preventDefault();
            jQuery(this).closest('.wfb-component').trigger('mousedown');
        });
    }
}