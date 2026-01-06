import { state, formData, updateFormData } from './core.js';
import { generateFieldHtml, findFieldById } from './utils.js';
import { openSettingsPanel } from './settings.js';

export function initFields(state, formData) {
    bindFieldEvents();
}



export function addField(settings) {
    if (settings.columnId) {
        addFieldToColumn(settings);
    } else {
        formData.fields.push(settings);
    }

    renderField(settings);
    refreshSortable();
}




export function updateField(settings) {
    if (settings.columnId) {
        updateFieldInColumn(settings);
    } else {
        const index = formData.fields.findIndex(field => field.id === settings.id);
        if (index !== -1) {
            formData.fields[index] = settings;
        }
    }

    renderField(settings, true);
}

function addFieldToColumn(settings) {
    for (const field of formData.fields) {
        if (field.type === 'container' && field.columns) {
            for (const column of field.columns) {
                if (column.id === settings.columnId) {
                    if (!column.fields) column.fields = [];
                    column.fields.push(settings);
                    updateColumnBadge(column.id, column.fields.length);
                    break;
                }
            }
        }
    }
}



function updateFieldInColumn(settings) {
    for (const field of formData.fields) {
        if (field.type === 'container' && field.columns) {
            for (const column of field.columns) {
                if (column.fields) {
                    const index = column.fields.findIndex(f => f.id === settings.id);
                    if (index !== -1) {
                        column.fields[index] = settings;
                        break;
                    }
                }
            }
        }
    }
}



function renderField(settings, isUpdate = false) {
    const fieldHtml = generateFieldHtml(settings);

    if (isUpdate) {
        jQuery(`[data-field-id="${settings.id}"]`).replaceWith(fieldHtml);
    } else {
        if (settings.columnId) {
            jQuery(`[data-column-id="${settings.columnId}"] .wfb-column-drop-zone`).append(fieldHtml);
        } else {
            if (jQuery('#wfb-formBuilder .wfb-container-placeholder').length) {
                jQuery('#wfb-formBuilder .wfb-container-placeholder').remove();
            }

            if (state.dropPosition && state.dropPosition.index !== undefined) {
                if (state.dropPosition.index >= jQuery('#wfb-formBuilder').children().length) {
                    jQuery('#wfb-formBuilder').append(fieldHtml);
                } else {
                    jQuery(`#wfb-formBuilder > *:eq(${state.dropPosition.index})`).before(fieldHtml);
                }
            } else {
                jQuery('#wfb-formBuilder').append(fieldHtml);
            }
        }
    }

    jQuery('[data-bs-toggle="tooltip"]').tooltip();
}




export function removeField(fieldId) {
    const $field = jQuery(`[data-field-id="${fieldId}"]`);
    const $column = $field.closest('.wfb-column');

    if ($column.length) {
        const columnId = $column.data('column-id');
        removeFieldFromColumn(fieldId, columnId);
    } else {
        formData.fields = formData.fields.filter(field => field.id !== fieldId);
    }

    $field.remove();
    checkEmptyBuilder();
}




function removeFieldFromColumn(fieldId, columnId) {
    for (const field of formData.fields) {
        if (field.type === 'container' && field.columns) {
            for (const column of field.columns) {
                if (column.id === columnId && column.fields) {
                    column.fields = column.fields.filter(f => f.id !== fieldId);
                    updateColumnBadge(columnId, column.fields.length);
                    break;
                }
            }
        }
    }
}





function bindFieldEvents() {
    jQuery(document).on('click', '.wfb-remove-field', function (e) {
        e.preventDefault();
        const fieldId = jQuery(this).closest('.wfb-form-field').data('field-id');
        removeField(fieldId);
    });

    jQuery(document).on('click', '.wfb-edit-field', function (e) {
        e.preventDefault();
        const fieldId = jQuery(this).closest('.wfb-form-field').data('field-id');
        const fieldData = findFieldById(fieldId, formData);
        if (fieldData) {
            openSettingsPanel(fieldData.type, fieldData.id, fieldData.columnId);
        }
    });

    jQuery(document).on('click', '.wfb-duplicate-field', function (e) {
        e.preventDefault();
        const fieldId = jQuery(this).closest('.wfb-form-field').data('field-id');
        const fieldData = findFieldById(fieldId, formData);
        if (fieldData) {
            const duplicatedField = jQuery.extend(true, {}, fieldData);
            duplicatedField.id = 'wfb-field-' + Date.now();
            duplicatedField.label = duplicatedField.label + ' (Copy)';
            addField(duplicatedField);
        }
    });
}



export function updateFieldOrder() {
    const updatedFields = [];
    jQuery('#wfb-formBuilder').children().each(function () {
        const fieldId = jQuery(this).data('field-id') || jQuery(this).data('container-id');
        if (fieldId) {
            const field = findFieldById(fieldId, formData);
            if (field) updatedFields.push(field);
        }
    });

    updateFormData({ fields: updatedFields });
}



function updateColumnBadge(columnId, fieldCount) {
    const $column = jQuery(`[data-column-id="${columnId}"]`);
    const $badge = $column.find('.badge');
    $badge.text(fieldCount + ' fields');
}



function checkEmptyBuilder() {
    if (jQuery('#wfb-formBuilder').children().length === 0) {
        jQuery('#wfb-formBuilder').html(`
            <div class="wfb-container-placeholder highlight" id="wfb-initialPlaceholder">
                <i class="fas fa-hand-point-left fa-2x mb-2"></i>
                <h5>Drag components from the sidebar to start building your form</h5>
                <p class="mb-0">Drop fields in the highlighted area to add them to your form</p>
            </div>
        `);
    }
}



function refreshSortable() {
    jQuery('#wfb-formBuilder').sortable('refresh');
}

