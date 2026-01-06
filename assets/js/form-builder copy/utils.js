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



export function generateFieldHtml(settings) {
    console.log('Generating HTML for field:', settings);

    const fieldId = settings.id;
    const defaultValue = settings.defaultValue || '';
    const wrapperClass = settings.wrapperClass || '';
    const inputClass = settings.inputClass || '';
    const helpText = settings.helpText || '';
    const description = settings.description || '';
    const beforeText = settings.beforeText || '';
    const afterText = settings.afterText || '';

    // --- Styles from displayStyle ---
    const displayStyle = settings.advanced?.displayStyle || {};
    const labelStyle = displayStyle.label || {};
    const placeholderStyle = displayStyle.placeholder || {};
    const defaultValueStyle = displayStyle.defaultValue || {};
    const helpTextStyle = displayStyle.helpText || {};
    const descriptionStyle = displayStyle.description || {};
    const fieldBackground = displayStyle.fieldBackground || ''; // wrapper bg

    // Convert style object to inline CSS string
    const styleToString = (style) => {
        let s = '';
        if (style.color) s += `color:${style.color};`;
        if (style.fontSize) s += `font-size:${style.fontSize}px;`;
        return s;
    };

    // Price label
    const priceLabel = settings.pricing?.enabled && settings.pricing?.amount
        ? ` <span class="text-success">(+ ${ppxo_admin.currency_symbol}${settings.pricing.amount})</span>`
        : '';

    // Tooltip for help text
    const helpTextTooltip = helpText
        ? `data-bs-toggle="tooltip" data-bs-placement="top" title="${helpText}"`
        : '';

    // --- Wrapper start ---
    const fieldStart = `
        <div class="wfb-form-field ${wrapperClass}" data-field-id="${fieldId}" 
             style="${fieldBackground ? `background:${fieldBackground}; padding:10px; border-radius:5px;` : ''}">
            <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
            ${beforeText ? `<div class="ppxo-before-text">${beforeText}</div>` : ''}
            <label class="form-label" ${helpTextTooltip} style="${styleToString(labelStyle)}">
                ${settings.label || ''}${settings.required ? ' <span class="text-danger">*</span>' : ''}${priceLabel}
            </label>
    `;

    // --- Wrapper end ---
    const fieldEnd = `
            ${afterText ? `<div class="ppxo-after-text">${afterText}</div>` : ''}
            ${description ? `<small class="form-text text-muted" style="${styleToString(descriptionStyle)}">${description}</small>` : ''}
            ${getFieldActionsHtml()}
        </div>
    `;

    let fieldHtml = '';

    // --- Field type handling ---
    switch (settings.type) {
        case 'text':
        case 'email':
        case 'number':
        case 'date':
        case 'password':
        case 'url':
        case 'tel':
            fieldHtml = `
                ${fieldStart}
                <input type="${settings.type}" class="form-control ${inputClass}" 
                    placeholder="${settings.placeholder || ''}" 
                    value="${defaultValue}"
                    style="${styleToString(defaultValueStyle)}">
                ${fieldEnd}
            `;
            break;

        case 'textarea':
            const rows = settings.rows || 4;
            const height = settings.height || 120;
            fieldHtml = `
                ${fieldStart}
                <textarea class="form-control ${inputClass}" 
                    rows="${rows}" 
                    placeholder="${settings.placeholder || ''}" 
                    style="height:${height}px;${styleToString(defaultValueStyle)}"
                >${defaultValue}</textarea>
                ${fieldEnd}
            `;
            break;

        case 'select':
            let optionsHtml = '';
            if (settings.options?.length) {
                settings.options.forEach(option => {
                    const value = typeof option === 'object' ? option.value : option;
                    const label = typeof option === 'object' ? option.label : option;
                    const price = typeof option === 'object' && option.price
                        ? ` (+ ${ppxo_admin.currency_symbol}${option.price})`
                        : '';
                    const selected = value === defaultValue ? 'selected' : '';
                    optionsHtml += `<option value="${value}" ${selected}>${label}${price}</option>`;
                });
            }
            fieldHtml = `
                ${fieldStart}
                <select class="form-select ${inputClass}" style="${styleToString(defaultValueStyle)}">
                    <option value="">Please select</option>
                    ${optionsHtml}
                </select>
                ${fieldEnd}
            `;
            break;

        case 'checkbox':
        case 'radio':
            let optionsHtmlMulti = '';
            if (settings.options?.length) {
                settings.options.forEach((option, i) => {
                    const value = typeof option === 'object' ? option.value : option;
                    const label = typeof option === 'object' ? option.label : option;
                    const price = typeof option === 'object' && option.price
                        ? ` (+ ${ppxo_admin.currency_symbol}${option.price})`
                        : '';
                    const checked = settings.type === 'checkbox'
                        ? (Array.isArray(defaultValue) ? defaultValue.includes(value) : false)
                        : value === defaultValue ? 'checked' : '';
                    optionsHtmlMulti += `
                        <div class="form-checkbox">
                            <input class="form-check-input-box ${inputClass}" type="${settings.type}" 
                                name="${settings.type === 'checkbox' ? fieldId + '[]' : fieldId}" 
                                id="${fieldId}-${i}" value="${value}" ${checked} 
                                style="${styleToString(defaultValueStyle)}">
                            <label class="form-check-label" for="${fieldId}-${i}" style="${styleToString(labelStyle)}">
                                ${label}${price}
                            </label>
                        </div>
                    `;
                });
            }
            fieldHtml = `${fieldStart}${optionsHtmlMulti}${fieldEnd}`;
            break;

        case 'file':
            fieldHtml = `
                ${fieldStart}
                <input type="file" class="form-control ${inputClass}"
                    ${settings.multiple ? 'multiple' : ''}
                    ${settings.accept ? `accept="${settings.accept}"` : ''}
                    style="${styleToString(defaultValueStyle)}">
                ${fieldEnd}
            `;
            break;

        case 'hidden':
            fieldHtml = `
                ${fieldStart}
                <input type="hidden" value="${defaultValue}">
                ${fieldEnd}
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
          
            <button class="btn btn-sm btn-outline-danger wfb-remove-field" data-bs-toggle="tooltip" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}






// Generate field preview HTML with inline styles
export function generateFieldPreview(field) {
    console.log(field);

    const advanced = field.advanced || {};
    const displayStyle = advanced.displayStyle || {};

    const defaultValue = advanced.defaultValue || '';
    const helpText = advanced.helpText || '';
    const description = advanced.description || '';
    const placeholder = field.placeholder || '';

    // Helper to convert style object {color, fontSize} to CSS string
    const styleToString = (style) => {
        let s = '';
        if (style.color) s += `color:${style.color};`;
        if (style.fontSize) s += `font-size:${style.fontSize}px;`;
        return s;
    };

    // Wrapper background
    const wrapperStyle = displayStyle.fieldBackground
        ? `background:${displayStyle.fieldBackground}; padding:10px; border-radius:5px;`
        : '';

    let fieldHtml = '';
    const requiredMark = field.required ? ' <span class="text-danger">*</span>' : '';

    switch (field.type) {
        case 'text':
        case 'email':
        case 'number':
        case 'date':
        case 'password':
            fieldHtml = `
                <div class="mb-3" style="${wrapperStyle}">
                    <label class="form-label" style="${styleToString(displayStyle.label)}">
                        ${field.label}${requiredMark}
                    </label>
                    <input type="${field.type}" class="form-control" 
                        placeholder="${placeholder}" 
                        value="${defaultValue}" 
                        style="${styleToString(displayStyle.defaultValue)}">
                    ${helpText ? `<div class="form-text" style="${styleToString(displayStyle.helpText)}">${helpText}</div>` : ''}
                    ${description ? `<small class="form-text text-muted" style="${styleToString(displayStyle.description)}">${description}</small>` : ''}
                </div>
            `;
            break;

        case 'textarea':
            const rows = field.rows || 4;
            const height = field.height || 120;
            fieldHtml = `
                <div class="mb-3" style="${wrapperStyle}">
                    <label class="form-label" style="${styleToString(displayStyle.label)}">
                        ${field.label}${requiredMark}
                    </label>
                    <textarea class="form-control" rows="${rows}" 
                        placeholder="${placeholder}" 
                        style="height:${height}px;${styleToString(displayStyle.defaultValue)}">${defaultValue}</textarea>
                    ${helpText ? `<div class="form-text" style="${styleToString(displayStyle.helpText)}">${helpText}</div>` : ''}
                    ${description ? `<small class="form-text text-muted" style="${styleToString(displayStyle.description)}">${description}</small>` : ''}
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
                <div class="mb-3" style="${wrapperStyle}">
                    <label class="form-label" style="${styleToString(displayStyle.label)}">
                        ${field.label}${requiredMark}
                    </label>
                    <select class="form-select" style="${styleToString(displayStyle.defaultValue)}">
                        <option value="">Please select</option>
                        ${optionsHtml}
                    </select>
                    ${helpText ? `<div class="form-text" style="${styleToString(displayStyle.helpText)}">${helpText}</div>` : ''}
                    ${description ? `<small class="form-text text-muted" style="${styleToString(displayStyle.description)}">${description}</small>` : ''}
                </div>
            `;
            break;

        case 'checkbox':
        case 'radio':
            let optionsHtmlMulti = '';
            if (field.options && field.options.length) {
                field.options.forEach((option, index) => {
                    const checked = (field.type === 'checkbox' 
                        ? Array.isArray(defaultValue) && defaultValue.includes(option)
                        : option === defaultValue) ? 'checked' : '';

                    optionsHtmlMulti += `
                        <div class="form-check">
                            <input class="form-check-input" type="${field.type}" 
                                name="${field.type === 'checkbox' ? field.id + '[]' : field.id}" 
                                id="preview-${field.id}-${index}" value="${option}" ${checked}
                                style="${styleToString(displayStyle.defaultValue)}">
                            <label class="form-check-label" for="preview-${field.id}-${index}" style="${styleToString(displayStyle.label)}">
                                ${option}
                            </label>
                        </div>
                    `;
                });
            }

            fieldHtml = `
                <div class="mb-3" style="${wrapperStyle}">
                    <label class="form-label" style="${styleToString(displayStyle.label)}">${field.label}${requiredMark}</label>
                    ${optionsHtmlMulti}
                    ${helpText ? `<div class="form-text" style="${styleToString(displayStyle.helpText)}">${helpText}</div>` : ''}
                    ${description ? `<small class="form-text text-muted" style="${styleToString(displayStyle.description)}">${description}</small>` : ''}
                </div>
            `;
            break;

        default:
            // fallback to text
            fieldHtml = `
                <div class="mb-3" style="${wrapperStyle}">
                    <label class="form-label" style="${styleToString(displayStyle.label)}">
                        ${field.label}${requiredMark}
                    </label>
                    <input type="text" class="form-control" placeholder="${placeholder}" value="${defaultValue}" style="${styleToString(displayStyle.defaultValue)}">
                    ${helpText ? `<div class="form-text" style="${styleToString(displayStyle.helpText)}">${helpText}</div>` : ''}
                    ${description ? `<small class="form-text text-muted" style="${styleToString(displayStyle.description)}">${description}</small>` : ''}
                </div>
            `;
    }

    return fieldHtml;
}
