import { state, formData, updateState, updateFormData } from './core.js';
import { generateFieldHtml } from './utils.js';
import { openSettingsPanel } from './settings.js';

export function initContainers(state, formData) {
    bindContainerEvents();
    initContainerSettingsModal();
}

export function openContainerSettings() {
    const modal = new bootstrap.Modal(document.getElementById('wfb-containerSettingsModal'));
    modal.show();
}

function initContainerSettingsModal() {
    // Update column widths UI when number of columns changes
    jQuery('#wfb-containerColumns').on('change', function() {
        const numColumns = parseInt(jQuery(this).val());
        updateColumnWidthsUI(numColumns);
    });

    // Apply container settings
    jQuery('#wfb-applyContainerSettings').on('click', function(e) {
        e.preventDefault();
        const numColumns = parseInt(jQuery('#wfb-containerColumns').val());
        addContainer(numColumns);
        jQuery('#wfb-containerSettingsModal').modal('hide');
    });

    // Initialize with 2 columns
    updateColumnWidthsUI(2);
}

function updateColumnWidthsUI(numColumns) {
    const $columnWidthsContainer = jQuery('#wfb-columnWidths');
    $columnWidthsContainer.empty();

    const defaultWidth = Math.floor(100 / numColumns);

    for (let i = 0; i < numColumns; i++) {
        $columnWidthsContainer.append(`
            <div class="col-md-6 mb-2">
                <label class="form-label">Column ${i + 1} Width (%)</label>
                <input type="number" class="form-control wfb-column-width" value="${defaultWidth}" min="5" max="100">
            </div>
        `);
    }
}

export function addContainer(numColumns = 2) {
    const containerId = 'wfb-container-' + Date.now();
    updateState({ currentContainerId: containerId });

    // Get column widths
    const columnWidths = [];
    jQuery('.wfb-column-width').each(function() {
        columnWidths.push(parseInt(jQuery(this).val()));
    });

    // Create columns array
    const columns = [];
    for (let i = 0; i < numColumns; i++) {
        const columnId = 'wfb-column-' + Date.now() + '-' + (i + 1);
        columns.push({
            id: columnId,
            width: columnWidths[i] || Math.floor(100 / numColumns),
            fields: []
        });
    }

    // Generate container HTML
    const containerHtml = generateContainerHtml(containerId, columns);

    // Remove placeholder if it exists
    if (jQuery('#wfb-formBuilder .wfb-container-placeholder').length) {
        jQuery('#wfb-formBuilder .wfb-container-placeholder').remove();
    }

    // Insert at the correct position if we have a drop position
    if (state.dropPosition && state.dropPosition.index !== undefined) {
        if (state.dropPosition.index >= jQuery('#wfb-formBuilder').children().length) {
            jQuery('#wfb-formBuilder').append(containerHtml);
        } else {
            jQuery(`#wfb-formBuilder > *:eq(${state.dropPosition.index})`).before(containerHtml);
        }
    } else {
        jQuery('#wfb-formBuilder').append(containerHtml);
    }

    // Make columns droppable
    jQuery('.wfb-column-drop-zone').droppable({
        accept: '.wfb-component',
        hoverClass: 'active',
        drop: function(event, ui) {
            const componentType = ui.draggable.data('type');
            if (componentType !== 'container') {
                openSettingsPanel(componentType, null, jQuery(this).closest('.wfb-column').data('column-id'));
            }
        }
    });

    // Initialize column resize handles
    jQuery('.wfb-column-resize-handle').on('mousedown', function(e) {
        e.preventDefault();
        const $column = jQuery(this).closest('.wfb-column');
        const columnId = $column.data('column-id');
        const startX = e.pageX;
        const startWidth = $column.width();

        jQuery(document).on('mousemove.wfb-resize', function(e) {
            const newWidth = startWidth + (e.pageX - startX);
            $column.width(newWidth);
        });

        jQuery(document).on('mouseup.wfb-resize', function() {
            jQuery(document).off('mousemove.wfb-resize');
            jQuery(document).off('mouseup.wfb-resize');

            // Update the column width in form data
            for (const field of formData.fields) {
                if (field.type === 'container' && field.id === state.currentContainerId) {
                    for (const col of field.columns) {
                        if (col.id === columnId) {
                            col.width = $column.width();
                            break;
                        }
                    }
                    break;
                }
            }
        });
    });

    // Add container to form data
    formData.fields.push({
        id: containerId,
        type: 'container',
        columns: columns
    });

    // Make the container sortable
    jQuery('#wfb-formBuilder').sortable('refresh');
}

function generateContainerHtml(containerId, columns) {
    return `
        <div class="wfb-container-wrapper" data-container-id="${containerId}">
            <div class="wfb-container-actions">
                <button class="btn btn-sm btn-outline-secondary wfb-edit-container" data-bs-toggle="tooltip" title="Edit Container">
                    <i class="fas fa-cog"></i>
                </button>
                <button class="btn btn-sm btn-outline-info wfb-add-column" data-bs-toggle="tooltip" title="Add Column">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary wfb-move-container" data-bs-toggle="tooltip" title="Move">
                    <i class="fas fa-arrows-alt"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger wfb-remove-container" data-bs-toggle="tooltip" title="Remove Container">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5><i class="fas fa-columns me-2"></i>Container</h5>
            </div>
            <div class="row">
                ${columns.map((column, index) => `
                    <div class="col-md-${12 / columns.length}" style="position: relative;">
                        <div class="wfb-column" data-column-id="${column.id}" data-column-index="${index}">
                            <div class="wfb-column-actions">
                                <button class="btn btn-sm btn-outline-secondary wfb-edit-column" data-bs-toggle="tooltip" title="Edit Column">
                                    <i class="fas fa-cog"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger wfb-remove-column" data-bs-toggle="tooltip" title="Remove Column">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="wfb-column-resize-handle">
                                <i class="fas fa-expand-alt"></i>
                            </div>
                            <div class="column-header">
                                <span>Column ${index + 1}</span>
                                <span class="badge bg-primary">0 fields</span>
                            </div>
                            <div class="wfb-column-drop-zone">
                                <div class="wfb-form-field-placeholder">
                                    <i class="fas fa-arrow-down"></i>
                                    <p>Drop fields here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function bindContainerEvents() {
    // Remove container
    jQuery(document).on('click', '.wfb-remove-container', function(e) {
        e.preventDefault();
        const containerId = jQuery(this).closest('.wfb-container-wrapper').data('container-id');
        jQuery(this).closest('.wfb-container-wrapper').remove();

        // Remove from form data
        formData.fields = formData.fields.filter(field => field.id !== containerId);

        // Add placeholder if no components left
        if (jQuery('#wfb-formBuilder').children().length === 0) {
            jQuery('#wfb-formBuilder').html(`
                <div class="wfb-container-placeholder highlight" id="wfb-initialPlaceholder">
                    <i class="fas fa-hand-point-left fa-2x mb-2"></i>
                    <h5>Drag components from the sidebar to start building your form</h5>
                    <p class="mb-0">Drop fields in the highlighted area to add them to your form</p>
                </div>
            `);
        }
    });
}

export function rebuildContainer(containerData) {
    const containerId = containerData.id;
    updateState({ currentContainerId: containerId });

    // Generate container HTML
    const containerHtml = generateContainerHtml(containerId, containerData.columns);

    // Remove placeholder if it exists
    if (jQuery('#wfb-formBuilder .wfb-container-placeholder').length) {
        jQuery('#wfb-formBuilder .wfb-container-placeholder').remove();
    }

    jQuery('#wfb-formBuilder').append(containerHtml);

    // Make columns droppable
    jQuery('.wfb-column-drop-zone').droppable({
        accept: '.wfb-component',
        hoverClass: 'active',
        drop: function(event, ui) {
            const componentType = ui.draggable.data('type');
            if (componentType !== 'container') {
                openSettingsPanel(componentType, null, jQuery(this).closest('.wfb-column').data('column-id'));
            }
        }
    });

    // Initialize column resize handles
    jQuery('.wfb-column-resize-handle').on('mousedown', function(e) {
        e.preventDefault();
        const $column = jQuery(this).closest('.wfb-column');
        const columnId = $column.data('column-id');
        const startX = e.pageX;
        const startWidth = $column.width();

        jQuery(document).on('mousemove.wfb-resize', function(e) {
            const newWidth = startWidth + (e.pageX - startX);
            $column.width(newWidth);
        });

        jQuery(document).on('mouseup.wfb-resize', function() {
            jQuery(document).off('mousemove.wfb-resize');
            jQuery(document).off('mouseup.wfb-resize');

            // Update the column width in form data
            for (const field of formData.fields) {
                if (field.type === 'container' && field.id === state.currentContainerId) {
                    for (const col of field.columns) {
                        if (col.id === columnId) {
                            col.width = $column.width();
                            break;
                        }
                    }
                    break;
                }
            }
        });
    });

    // Rebuild fields in container
    containerData.columns.forEach(column => {
        if (column.fields) {
            column.fields.forEach(subField => {
                const fieldHtml = generateFieldHtml(subField);
                jQuery(`[data-column-id="${column.id}"] .wfb-column-drop-zone`).append(fieldHtml);
            });
        }
    });

    // Make the container sortable
    jQuery('#wfb-formBuilder').sortable('refresh');
}