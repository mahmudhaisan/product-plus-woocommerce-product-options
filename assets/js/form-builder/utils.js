// Find field by ID (including fields in containers)
export function findFieldById(fieldId, formData) {
    for (const field of formData.fields) {
        if (field.id === fieldId) {
            return field;
        }

        // Check if this is a container and search its columns
        if (field.type === 'container' && field.columns) {
            for (const column of field.columns) {
                for (const colField of column.fields) {
                    if (colField.id === fieldId) {
                        return colField;
                    }
                }
            }
        }
    }
    return null;
}




// Generate field HTML
export function generateFieldHtml(settings) {
    console.log(settings);

    let fieldHtml = '';
    const fieldId = settings.id;
    console.log(fieldId);
    
    // Helper: generate price label if pricing is enabled
    const priceLabel = settings.pricing?.enabled && settings.pricing?.amount 
        ? ` <span class="text-success">(+$${settings.pricing.amount})</span>`
        : '';

    // Helper: generate tooltip for help text
    const helpTextTooltip = settings.helpText 
        ? `data-bs-toggle="tooltip" data-bs-placement="top" title="${settings.helpText}"`
        : '';

    const defaultValue = settings.defaultValue || '';

    switch (settings.type) {
        case 'text':
        case 'email':
        case 'number':
        case 'date':
        case 'password':
        case 'url':
        case 'tel':
            fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label" ${helpTextTooltip}>
                        ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}${priceLabel}
                    </label>
                    <input type="${settings.type}" class="form-control" 
                        placeholder="${settings.placeholder || ''}" 
                        value="${defaultValue}">
                    ${getFieldActionsHtml()}
                </div>
            `;
            break;

        case 'textarea':
            fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label" ${helpTextTooltip}>
                        ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}${priceLabel}
                    </label>
                    <textarea class="form-control" rows="3" placeholder="${settings.placeholder || ''}">${defaultValue}</textarea>
                    ${getFieldActionsHtml()}
                </div>
            `;
            break;

        case 'select':
            let optionsHtml = '';
            if (settings.options && settings.options.length) {
                settings.options.forEach(option => {
                    // Handle both string options and object options
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const optionPrice = typeof option === 'object' && option.price ? ` (+$${option.price})` : '';
                    const selected = optionValue === defaultValue ? 'selected' : '';
                    optionsHtml += `<option value="${optionValue}" ${selected}>${optionLabel}${optionPrice}</option>`;
                });
            }

            fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label" ${helpTextTooltip}>
                        ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}${priceLabel}
                    </label>
                    <select class="form-select">
                        <option value="">Please select</option>
                        ${optionsHtml}
                    </select>
                    ${getFieldActionsHtml()}
                </div>
            `;
            break;

        case 'checkbox':
            // For checkbox, we might have multiple options or single checkbox
            if (settings.options && settings.options.length > 0) {
                // Multiple checkboxes (like for multiple choices)
                let checkboxesHtml = '';
                settings.options.forEach((option, index) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const optionPrice = typeof option === 'object' && option.price ? ` (+$${option.price})` : '';
                    const checked = Array.isArray(defaultValue) ? defaultValue.includes(optionValue) : false;
                    
                    checkboxesHtml += `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="${fieldId}[]" 
                                id="${fieldId}-${index}" value="${optionValue}" ${checked ? 'checked' : ''}>
                            <label class="form-check-label" for="${fieldId}-${index}">
                                ${optionLabel}${optionPrice}
                            </label>
                        </div>
                    `;
                });

                fieldHtml = `
                    <div class="wfb-form-field" data-field-id="${fieldId}">
                        <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                        <label class="form-label" ${helpTextTooltip}>
                            ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}${priceLabel}
                        </label>
                        ${checkboxesHtml}
                        ${getFieldActionsHtml()}
                    </div>
                `;
            } else {
                // Single checkbox
                fieldHtml = `
                    <div class="wfb-form-field" data-field-id="${fieldId}">
                        <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="${fieldId}" 
                                ${defaultValue ? 'checked' : ''}>
                            <label class="form-check-label" for="${fieldId}" ${helpTextTooltip}>
                                ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}${priceLabel}
                            </label>
                        </div>
                        ${getFieldActionsHtml()}
                    </div>
                `;
            }
            break;

        case 'radio':
            let radiosHtml = '';
            if (settings.options && settings.options.length) {
                settings.options.forEach((option, index) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const optionPrice = typeof option === 'object' && option.price ? ` (+$${option.price})` : '';
                    const checked = optionValue === defaultValue ? 'checked' : '';
                    
                    radiosHtml += `
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="${fieldId}" 
                                id="${fieldId}-${index}" value="${optionValue}" ${checked}>
                            <label class="form-check-label" for="${fieldId}-${index}">
                                ${optionLabel}${optionPrice}
                            </label>
                        </div>
                    `;
                });
            } else {
                // Default options if none provided
                radiosHtml = `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${fieldId}" id="${fieldId}-1" value="option1">
                        <label class="form-check-label" for="${fieldId}-1">Option 1</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${fieldId}" id="${fieldId}-2" value="option2">
                        <label class="form-check-label" for="${fieldId}-2">Option 2</label>
                    </div>`;
            }

            fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label" ${helpTextTooltip}>
                        ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}${priceLabel}
                    </label>
                    ${radiosHtml}
                    ${getFieldActionsHtml()}
                </div>
            `;
            break;

        case 'file':
            fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label" ${helpTextTooltip}>
                        ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}${priceLabel}
                    </label>
                    <input type="file" class="form-control" 
                        ${settings.multiple ? 'multiple' : ''}
                        ${settings.accept ? `accept="${settings.accept}"` : ''}>
                    ${getFieldActionsHtml()}
                </div>
            `;
            break;

        case 'hidden':
            fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label" ${helpTextTooltip}>
                        ${settings.label} (Hidden Field)
                    </label>
                    <input type="hidden" value="${defaultValue}">
                    ${getFieldActionsHtml()}
                </div>
            `;
            break;
    }

    return fieldHtml;
}

// Initialize tooltips after adding fields to DOM
export function initFieldTooltips() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}















// Helper: common field action buttons
function getFieldActionsHtml() {
    return `
        <div class="wfb-field-actions">
            <button class="btn btn-sm btn-outline-secondary wfb-edit-field" data-bs-toggle="tooltip" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-info wfb-duplicate-field" data-bs-toggle="tooltip" title="Duplicate">
                <i class="fas fa-copy"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary wfb-move-field" data-bs-toggle="tooltip" title="Move">
                <i class="fas fa-arrows-alt"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger wfb-remove-field" data-bs-toggle="tooltip" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// Generate field preview HTML
export function generateFieldPreview(field) {
    // Make sure field.advanced exists
    const advanced = field.advanced || {};
    const defaultValue = advanced.defaultValue || '';
    const helpText = advanced.helpText || '';

    let fieldHtml = '';

    switch (field.type) {
        case 'text':
        case 'email':
        case 'number':
        case 'date':
        case 'password':
            fieldHtml = `
                <div class="mb-3">
                    <label class="form-label">${field.label}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
                    <input type="${field.type}" class="form-control" placeholder="${field.placeholder || ''}" value="${defaultValue}">
                    ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
                </div>
            `;
            break;
        case 'textarea':
            fieldHtml = `
                <div class="mb-3">
                    <label class="form-label">${field.label}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
                    <textarea class="form-control" rows="3" placeholder="${field.placeholder || ''}">${defaultValue}</textarea>
                    ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
                </div>
            `;
            break;
        case 'select':
            let optionsHtml = '';
            if (field.options && field.options.length) {
                field.options.forEach(option => {
                    const selected = option === defaultValue ? 'selected' : '';
                    optionsHtml += `<option value="${option}" ${selected}>${option}</option>`;
                });
            }

            fieldHtml = `
                <div class="mb-3">
                    <label class="form-label">${field.label}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
                    <select class="form-select">
                        <option value="">Please select</option>
                        ${optionsHtml}
                    </select>
                    ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
                </div>
            `;
            break;
        case 'checkbox':
            fieldHtml = `
                <div class="mb-3">
                    <div class="form-checkbox">
                        <input class="form-check-input" type="checkbox" id="preview-${field.id}" ${defaultValue ? 'checked' : ''}>
                        <label class="form-check-label" for="preview-${field.id}">${field.label}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
                    </div>
                    ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
                </div>
            `;
            break;
        case 'radio':
            fieldHtml = `
                <div class="mb-3">
                    <label class="form-label">${field.label}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
                    <div class="form-checkbox">
                        <input class="form-check-input" type="radio" name="preview-${field.id}" id="preview-${field.id}-1" ${defaultValue === 'Option 1' ? 'checked' : ''}>
                        <label class="form-check-label" for="preview-${field.id}-1">Option 1</label>
                    </div>
                    <div class="form-checkbox">
                        <input class="form-check-input" type="radio" name="preview-${field.id}" id="preview-${field.id}-2" ${defaultValue === 'Option 2' ? 'checked' : ''}>
                        <label class="form-check-label" for="preview-${field.id}-2">Option 2</label>
                    </div>
                    ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
                </div>
            `;
            break;
        default:
            // Default case for unknown field types
            fieldHtml = `
                <div class="mb-3">
                    <label class="form-label">${field.label}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
                    <input type="text" class="form-control" placeholder="${field.placeholder || ''}" value="${defaultValue}">
                    ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
                </div>
            `;
    }

    return fieldHtml;
}