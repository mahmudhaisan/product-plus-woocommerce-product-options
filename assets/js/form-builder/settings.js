
import { state, updateState, formData, updateFormData } from './core.js';
import { addField, updateField } from './fields.js';
import { findFieldById } from './utils.js';



/* ============================
   Public exports (top-level)
   ============================ */

export function initSettings() {

    bindOptionsEvents();

    document.addEventListener('change', function (e) {
        if (!e.target.classList.contains('ppxo-option-price-type')) return;

        const row = e.target.closest('tr');
        if (!row) return;

        const priceInput = row.querySelector('.ppxo-option-price');
        if (!priceInput) return;

        if (e.target.value === 'fixed') {
            priceInput.disabled = false;
            priceInput.focus();
        } else {
            priceInput.value = 0;
            priceInput.disabled = true;
        }
    });

}


// Event handlers for options management
function bindOptionsEvents() {


    // Add new option
    jQuery(document).on('click', '.ppxo-options-add-new-btn', function (e) {
        e.preventDefault();
        const fieldId = jQuery(this).data('field-id');
        addNewOption(fieldId);
    });

    // Remove option
    jQuery(document).on('click', '.ppxo-remove-option', function (e) {
        e.preventDefault();
        const fieldId = jQuery(this).data('field-id');
        const optionIndex = parseInt(jQuery(this).data('option-index'));
        removeOption(fieldId, optionIndex);
    });



}

export function openSettingsPanel(fieldType, fieldId = null, columnId = null) {

    updateState({
        isEditMode: !!fieldId,
        currentColumnId: columnId || null,
        currentFieldId: null,
        currentSettings: {}
    });

    if (state.isEditMode) {
        const fieldData = findFieldById(fieldId, formData);

        if (!fieldData) {
            console.error('WFB: Field not found for editing', fieldId);
            alert('Field not found. Refresh and try again.');
            return;
        }

        updateState({
            currentFieldId: fieldId,
            currentSettings: jQuery.extend(true, {}, fieldData)
        });

    } else {
        const newFieldId = generateFieldId(fieldType);
        updateState({
            currentFieldId: newFieldId,
            currentSettings: getDefaultSettings(fieldType, newFieldId, columnId)
        });
    }

    // Render UI and show modal
    generateSettingsForm();

}


/* ============================
   ID generator & defaults
   ============================ */
function generateFieldId(fieldType) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4);
    const typeAbbr = getFieldTypeAbbreviation(fieldType);
    return `wfb-${typeAbbr}-${timestamp}${random}`;
}



function getFieldTypeAbbreviation(fieldType) {
    const abbreviations = {
        'text': 'txt', 'textarea': 'ta', 'email': 'eml', 'number': 'num',
        'select': 'sel', 'radio': 'rad', 'checkbox': 'chk', 'date': 'dt',
        'url': 'url', 'password': 'pwd', 'tel': 'tel', 'time': 'time',
        'color': 'color', 'file': 'file', 'hidden': 'hid'
    };
    return abbreviations[fieldType] || 'fld';
}



// 
function getDefaultSettings(fieldType, fieldId, columnId) {
    const defaultOptions = [];

    // Add default options for select, radio, and checkbox fields
    if (['select', 'radio', 'checkbox'].includes(fieldType)) {
        const isSelect = fieldType === 'select';
        const isRadio = fieldType === 'radio';
        const isCheckbox = fieldType === 'checkbox';

        defaultOptions.push(
            {
                label: 'Option 1',
                selected: isSelect || isRadio || isCheckbox,
                pricing: {
                    type: 'free',
                    price: 0
                }
            },
            {
                label: 'Option 2',
                selected: false,
                pricing: {
                    type: 'free',
                    price: 0
                }
            },
            {
                label: 'Option 3',
                selected: false,
                pricing: {
                    type: 'free',
                    price: 0
                }
            }
        );
    }

    // Determine if field should have placeholder
    const hasPlaceholder = !['select', 'radio', 'checkbox'].includes(fieldType);

    return {
        id: fieldId,
        type: fieldType,
        columnId: columnId || null,
        label: getDefaultLabel(fieldType),
        required: false,
        placeholder: hasPlaceholder ? 'Enter your placeholder text' : '',
        hideLabel: false,
        className: '',
        rows: '',
        height: '',
        helpText: '',
        advanced: {
            defaultValue: '',
            description: '',
            cssClass: '',
            wrapperClass: '',
            inputClass: '',
            beforeText: '',
            afterText: '',
        },
        pricing: {
            type: 'free',
            price: 0,
            discount_price: 0,
        },
        options: defaultOptions.length > 0 ? defaultOptions : []
    };
}

function getDefaultLabel(fieldType) {
    const labels = {
        'text': 'Text Field', 'textarea': 'Text Area', 'email': 'Email Address',
        'number': 'Number Field', 'select': 'Dropdown Selection', 'radio': 'Radio Buttons',
        'checkbox': 'Checkbox', 'date': 'Date Picker', 'url': 'Website URL',
        'password': 'Password Field', 'tel': 'Phone Number', 'time': 'Time Picker',
        'color': 'Color Picker', 'file': 'File Upload', 'hidden': 'Hidden Field'
    };
    return labels[fieldType] || (fieldType.charAt(0).toUpperCase() + fieldType.slice(1) + ' Field');
}






export function createFieldInstantly(fieldType) {
    const newId = generateFieldId(fieldType);
    const defaults = getDefaultSettings(fieldType, newId, null);

    updateState({
        currentFieldId: newId,
        currentSettings: defaults,
        isEditMode: false
    });

    addField(defaults);
    // Return the newly added field element
    return jQuery(`.wfb-form-field[data-field-id="${newId}"]`);

}










/* ============================
   Main form generation (tabs)
   ============================ */
function generateSettingsForm() {
    // Generate each tab's HTML
    generateDisplayTab();
    // generateValidationTab();
    generateAdvancedTab();


    // After render, bind inputs and UI behaviors
    bindSettingsInputs();
}



/* ----------------------------
   Display Tab
   ---------------------------- */

function generateDisplayTab() {
    const s = state.currentSettings || {};

    // Check if field type should show placeholder
    const showPlaceholder = !['select', 'radio', 'checkbox'].includes(s.type);

    let html = `
        <div class=" wfb-settings-card shadow-sm border-0">
            <div class="card-body p-4">

                <!-- ROW 1: REQUIRED + HIDE LABEL -->
                <div class="row mb-4 g-3 wfb-checkbox-row">

        <div class="col-md-6">
            <label class="wfb-checkbox-modern">
                <input type="checkbox" id="wfb-fieldRequired" ${s.required ? 'checked' : ''}>
                <span class="wfb-checkbox-label">Required Field</span>
            </label>
        </div>

        <div class="col-md-6">
            <label class="wfb-checkbox-modern">
                <input type="checkbox" id="wfb-fieldHideLabel" ${s.hideLabel ? 'checked' : ''}>
                <span class="wfb-checkbox-label">Hide Field Label</span>
            </label>
        </div>

    </div>


        <!-- ROW 2: LABEL + HELP TEXT -->
        <div class="row mb-4 g-4">

            <div class="col-md-6">
                <label class="form-label wfb-form-label-modern">Field Label</label>
                <input type="text"
                       class="form-control wfb-input-modern"
                       id="wfb-fieldLabel"
                       placeholder="Enter field title"
                       value="${escapeHtml(s.label || '')}">
                
            </div>

            <div class="col-md-6">
                <label class="form-label wfb-form-label-modern">Help Text</label>
               
                <input type="text"
                       class="form-control wfb-input-modern"
                          id="wfb-fieldHelpText"
                        
                          placeholder="Enter help text"
                          value="${escapeHtml(s.helpText || '')}">
               
            </div>

        </div>
`;

    // Conditionally add placeholder row
    if (showPlaceholder) {
        html += `
        <!-- ROW 3: PLACEHOLDER (only for non-option fields) -->
        <div class="row mb-4 g-4">
            <div class="col-md-12">
                <label class="form-label wfb-form-label-modern">Placeholder</label>
                <input type="text"
                       class="form-control wfb-input-modern"
                       id="wfb-fieldPlaceholder"
                       placeholder="Hint text inside the field"
                       value="${escapeHtml(s.placeholder || '')}">
            </div>
        </div>
    `;
    }

    /* ------------------------------------------------
       TEXTAREA EXTRA SETTINGS
    ------------------------------------------------ */
    if (s.type === 'textarea') {
        html += `
        <div class="row mb-4 g-4">

            <div class="col-md-6">
                <label class="form-label wfb-form-label-modern">Rows</label>
                <input type="number"
                       class="form-control wfb-input-modern"
                       id="wfb-fieldRows"
                       min="1"
                       value="${s.rows || 4}">
            </div>

            <div class="col-md-6">
                <label class="form-label wfb-form-label-modern">Height (px)</label>
                <input type="number"
                       class="form-control wfb-input-modern"
                       id="wfb-fieldHeight"
                       min="50"
                       step="10"
                       value="${s.height || 120}">
            </div>

        </div>
        `;
    }

    /* ------------------------------------------------
       OPTIONS or GENERAL PRICING
    ------------------------------------------------ */
    if (['select', 'radio', 'checkbox'].includes(s.type)) {
        html += generateOptionsSection(s);
    } else {
        html += generateGeneralPricingSection();
    }

    html += `
        </div>
    </div>
    `;

    jQuery('#wfb-display').html(html);

    if (['select', 'radio', 'checkbox'].includes(s.type)) {
        initializeOptions();
    }
}


/* ----------------------------
   Advanced Tab
   ---------------------------- */
function generateAdvancedTab() {
    const s = state.currentSettings || {};
    const html = `
    <div class="wfb-settings-card">
       
        <div class="wfb-settings-card-body">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">CSS Class</label>
                        <input type="text" class="form-control wfb-form-control-modern" id="wfb-advancedCssClass" value="${escapeHtml(s.cssClass || '')}" placeholder="custom-field my-class">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Wrapper Class</label>
                        <input type="text" class="form-control wfb-form-control-modern" id="wfb-advancedWrapperClass" value="${escapeHtml(s.wrapperClass || '')}" placeholder="field-wrapper">
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <label class="wfb-form-label-modern">Input Class</label>
                <input type="text" class="form-control wfb-form-control-modern" id="wfb-advancedInputClass" value="${escapeHtml(s.inputClass || '')}" placeholder="form-control-lg">
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Before Text</label>
                        <input type="text" class="form-control wfb-form-control-modern" id="wfb-advancedBeforeText" value="${escapeHtml(s.beforeText || '')}" placeholder="Text before field">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">After Text</label>
                        <input type="text" class="form-control wfb-form-control-modern" id="wfb-advancedAfterText" value="${escapeHtml(s.afterText || '')}" placeholder="Text after field">
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    jQuery('#wfb-advanced').html(html);
}


function generateGeneralPricingSection() {
    const pricing = state.currentSettings.pricing || {};

    return `
    <div class="mb-4">
       
        <div class="table-responsive">
            <table class="table table-bordered align-middle wfb-table-pricing">
                <thead class="table-light">
                    <tr>
                        <th style="width: 30%">Price Type</th>
                        <th style="width: 35%">Price</th>
                       
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>
                            <select id="wfb-priceType" class="form-select wfb-form-control-modern">
                            <option value="free" ${pricing.type === 'free' ? 'selected' : ''}>Free</option>
                                <option value="fixed" ${pricing.type === 'fixed' ? 'selected' : ''}>Fixed</option>
                            </select>
                        </td>

                        <td>
                            <input type="number"
                            id="wfb-priceRegular"
                            class="form-control wfb-form-control-modern"
                            value="${pricing.price || ''}"
                            placeholder="0.00"
                            step="1"
                            min="0"
                            ${pricing.type === 'free' ? 'disabled' : ''}>
                        </td>

                       
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
    `;
}






function generateOptionsSection(s) {
    return `
    <div class="ppxo-field-options-section">

        <!-- Header -->
        <div class="ppxo-options-header">
            <strong>Options</strong>
            <span class="ppxo-type-hint">
                ${s.type === 'radio' ? 'Single select' : ''}
                ${s.type === 'checkbox' ? 'Multi select' : ''}
                ${s.type === 'select' ? 'Dropdown' : ''}
            </span>
        </div>

        <!-- Table -->
        <div class="table-responsive">
            <table class="table table-sm ppxo-options-table">
                <thead>
                    <tr>
                        <th class="ppxo-col-check">
                            <i class="fa-solid fa-check"></i>
                        </th>
                        <th class="ppxo-col-option">Option</th>
                        <th class="ppxo-col-pricing">Pricing</th>
                        <th class="ppxo-col-action"></th>
                    </tr>
                </thead>

                <tbody class="ppxo-options-list">
                ${s.options && s.options.length ? s.options.map((option, index) => {
                    // Ensure option has pricing structure
                    const optionWithPricing = {
                        label: option.label || '',
                        selected: option.selected || false,
                        pricing: option.pricing || {
                            type: 'free',
                            price: 0
                        }
                    };

                const pricingType = optionWithPricing.pricing.type;
                const priceValue = optionWithPricing.pricing.price || 0;
                const isFixed = pricingType === 'fixed';

                return `
                            <tr data-index="${index}">
                                <!-- Select -->
                                <td>
                                    <input
                                        type="${s.type === 'radio' ? 'radio' : 'checkbox'}"
                                        class="ppxo-option-selected"
                                        ${optionWithPricing.selected ? 'checked' : ''}
                                        name="option-${s.id}"
                                        data-field-id="${s.id}"
                                        data-option-index="${index}">
                                </td>

                                <!-- Option name -->
                                <td>
                                    <input
                                        type="text"
                                        class="ppxo-input ppxo-option-label"
                                        placeholder="Option name"
                                        value="${optionWithPricing.label}"
                                        data-field-id="${s.id}"
                                        data-option-index="${index}">
                                </td>

                                <!-- Pricing -->
                                <td>
                                    <div class="ppxo-pricing-row">
                                        <select
                                            class="ppxo-select ppxo-option-price-type"
                                            data-field-id="${s.id}"
                                            data-option-index="${index}">
                                            <option value="free" ${pricingType === 'free' ? 'selected' : ''}>Free</option>
                                            <option value="fixed" ${pricingType === 'fixed' ? 'selected' : ''}>Fixed</option>
                                        </select>

                                        <input
                                            type="number"
                                            class="ppxo-input ppxo-option-price mt-2"
                                            value="${priceValue}"
                                            min="0"
                                            step="1"
                                            ${isFixed ? '' : 'disabled'}
                                            data-field-id="${s.id}"
                                            data-option-index="${index}"
                                            placeholder="0.00">
                                    </div>
                                </td>

                                <!-- Action -->
                                <td class="text-end">
                                    <button
                                        type="button"
                                        class="btn btn-danger btn-sm ppxo-remove-option"
                                        title="Remove option"
                                        data-field-id="${s.id}"
                                        data-option-index="${index}">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            `;
            }).join('') : `
                            <tr>
                                <td colspan="4" class="ppxo-empty">
                                    No options added
                                </td>
                            </tr>
                        `}
                        </tbody>
                    </table>
                </div>

                <!-- Add -->
                <button
                    type="button"
                    class="btn btn-success ppxo-options-add-new-btn"
                    data-field-id="${s.id}">
                    <i class="fa-solid fa-plus"></i> Add option
                </button>

            </div>
            `;
}


// Helper functions
function addNewOption(fieldId) {
    if (!state.currentSettings || state.currentSettings.id !== fieldId) {
        console.error('Cannot add option: field not found in state');
        return;
    }

    // Create new option
    const newOption = {
        label: `Option ${state.currentSettings.options.length + 1}`,
        selected: false,
        pricing: {
            type: 'free',
            price: 0
        }
    };

    // Add to state
    state.currentSettings.options.push(newOption);

    // Update form preview with new options
    updateFieldPreview(fieldId);

    // Refresh the options section
    refreshOptionsSection(fieldId);

    console.log('Added new option:', newOption);
    console.log('State:', state);
    console.log('FormData:', formData);
}

function removeOption(fieldId, optionIndex) {
    if (!state.currentSettings || state.currentSettings.id !== fieldId) {
        console.error('Cannot remove option: field not found in state');
        return;
    }

    if (state.currentSettings.options.length <= 1) {
        alert('Cannot remove the last option. At least one option is required.');
        return;
    }

    // Remove from state
    state.currentSettings.options.splice(optionIndex, 1);

    // Update form preview
    updateFieldPreview(fieldId);

    // Refresh the options section
    refreshOptionsSection(fieldId);

    console.log('Removed option at index:', optionIndex);
    console.log('State:', state);
    console.log('FormData:', formData);
}

function updateOptionProperty(fieldId, optionIndex, property, value) {
    if (!state.currentSettings || state.currentSettings.id !== fieldId) {
        return;
    }

    const option = state.currentSettings.options[optionIndex];
    if (!option) {
        return;
    }

    // Handle nested properties
    if (property === 'label') {
        option.label = value;
        // Update option label in preview
        updateOptionLabelInPreview(fieldId, optionIndex, value);
    }
    else if (property === 'selected') {
        option.selected = value;
        // Update selection in preview
        updateOptionSelectionInPreview(fieldId, optionIndex, value);
    }
    else if (property === 'priceType') {
        option.pricing = option.pricing || { type: 'free', price: 0 };
        option.pricing.type = value;
        // Update price type in preview
        updateOptionPriceInPreview(fieldId, optionIndex, option.pricing);
    }
    else if (property === 'price') {
        option.pricing = option.pricing || { type: 'free', price: 0 };
        option.pricing.price = parseFloat(value) || 0;
        // Update price in preview
        updateOptionPriceInPreview(fieldId, optionIndex, option.pricing);
    }

    // Update form preview
    updateFieldPreview(fieldId);
}

function refreshOptionsSection(fieldId) {
    if (!state.currentSettings || state.currentSettings.id !== fieldId) return;

    // 1️⃣ Update formData for the specific field
    const updatedFields = formData.fields.map(f =>
        f.id === fieldId ? JSON.parse(JSON.stringify(state.currentSettings)) : f
    );
    updateFormData({ fields: updatedFields });

    // 2️⃣ Update the options section HTML
    const optionsSection = jQuery('.ppxo-field-options-section');
    if (optionsSection.length) {
        const newHtml = generateOptionsSection(state.currentSettings);
        optionsSection.replaceWith(newHtml);
    }

    // 3️⃣ Reattach event handlers
    attachOptionEventHandlers();

    // 4️⃣ Update WFB preview
    updateFieldPreview(fieldId);

    // 5️⃣ Apply settings to preview
    applySettings();

    console.log('FormData updated:', formData);
    console.log('State updated:', state);
}

// Function to update the actual field preview in WFB
function updateFieldPreview(fieldId) {
    const fieldElement = jQuery(`[data-field-id="${fieldId}"]`);
    if (!fieldElement.length) return;

    const fieldType = state.currentSettings.type;
    const fieldLabel = state.currentSettings.label || '';
    const options = state.currentSettings.options || [];

    // Update field label
    const labelElement = fieldElement.find('.wfb-field-label');
    if (labelElement.length) {
        labelElement.text(fieldLabel);
    }

    // Update options based on field type
    const fieldContent = fieldElement.find('.wfb-field-content');
    if (!fieldContent.length) return;

    if (fieldType === 'select') {
        updateSelectPreview(fieldContent, options);
    } else if (fieldType === 'radio') {
        updateRadioPreview(fieldContent, options);
    } else if (fieldType === 'checkbox') {
        updateCheckboxPreview(fieldContent, options);
    }
}

function updateSelectPreview(container, options) {
    let html = `<select class="form-control wfb-input-modern">`;
    
    options.forEach((option, index) => {
        const priceLabel = option.pricing && option.pricing.type === 'fixed' && option.pricing.price > 0 
            ? ` (+$${option.pricing.price})` 
            : '';
        
        html += `<option value="${index}" ${option.selected ? 'selected' : ''}>
                    ${option.label || ''}${priceLabel}
                 </option>`;
    });
    
    html += `</select>`;
    container.html(html);
}

function updateRadioPreview(container, options) {
    let html = '<div class="wfb-radio-group">';
    
    options.forEach((option, index) => {
        const priceLabel = option.pricing && option.pricing.type === 'fixed' && option.pricing.price > 0 
            ? ` (+$${option.pricing.price})` 
            : '';
        
        html += `
            <div class="form-check">
                <input class="form-check-input" type="radio" 
                       name="radio-${state.currentSettings.id}" 
                       id="radio-${state.currentSettings.id}-${index}"
                       value="${index}"
                       ${option.selected ? 'checked' : ''}>
                <label class="form-check-label" for="radio-${state.currentSettings.id}-${index}">
                    ${option.label || ''}${priceLabel}
                </label>
            </div>
        `;
    });
    
    html += '</div>';
    container.html(html);
}

function updateCheckboxPreview(container, options) {
    let html = '<div class="wfb-checkbox-group">';
    
    options.forEach((option, index) => {
        const priceLabel = option.pricing && option.pricing.type === 'fixed' && option.pricing.price > 0 
            ? ` (+$${option.pricing.price})` 
            : '';
        
        html += `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" 
                       id="checkbox-${state.currentSettings.id}-${index}"
                       value="${index}"
                       ${option.selected ? 'checked' : ''}>
                <label class="form-check-label" for="checkbox-${state.currentSettings.id}-${index}">
                    ${option.label || ''}${priceLabel}
                </label>
            </div>
        `;
    });
    
    html += '</div>';
    container.html(html);
}

function updateOptionLabelInPreview(fieldId, optionIndex, label) {
    const fieldElement = jQuery(`[data-field-id="${fieldId}"]`);
    const fieldType = state.currentSettings.type;
    
    if (fieldType === 'select') {
        const optionElement = fieldElement.find(`option[value="${optionIndex}"]`);
        if (optionElement.length) {
            // Get current price label if exists
            const currentText = optionElement.text();
            const priceMatch = currentText.match(/\(\+\$[\d\.]+\)$/);
            const priceLabel = priceMatch ? priceMatch[0] : '';
            optionElement.text(label + priceLabel);
        }
    } else if (fieldType === 'radio') {
        const labelElement = fieldElement.find(`label[for="radio-${fieldId}-${optionIndex}"]`);
        if (labelElement.length) {
            const currentText = labelElement.text();
            const priceMatch = currentText.match(/\(\+\$[\d\.]+\)$/);
            const priceLabel = priceMatch ? priceMatch[0] : '';
            labelElement.text(label + priceLabel);
        }
    } else if (fieldType === 'checkbox') {
        const labelElement = fieldElement.find(`label[for="checkbox-${fieldId}-${optionIndex}"]`);
        if (labelElement.length) {
            const currentText = labelElement.text();
            const priceMatch = currentText.match(/\(\+\$[\d\.]+\)$/);
            const priceLabel = priceMatch ? priceMatch[0] : '';
            labelElement.text(label + priceLabel);
        }
    }
}

function updateOptionSelectionInPreview(fieldId, optionIndex, selected) {
    const fieldElement = jQuery(`[data-field-id="${fieldId}"]`);
    const fieldType = state.currentSettings.type;
    
    if (fieldType === 'select') {
        const optionElement = fieldElement.find(`option[value="${optionIndex}"]`);
        if (optionElement.length) {
            optionElement.prop('selected', selected);
        }
    } else if (fieldType === 'radio') {
        const radioElement = fieldElement.find(`input[type="radio"][value="${optionIndex}"]`);
        if (radioElement.length) {
            radioElement.prop('checked', selected);
        }
    } else if (fieldType === 'checkbox') {
        const checkboxElement = fieldElement.find(`input[type="checkbox"][value="${optionIndex}"]`);
        if (checkboxElement.length) {
            checkboxElement.prop('checked', selected);
        }
    }
}

function updateOptionPriceInPreview(fieldId, optionIndex, pricing) {
    const fieldElement = jQuery(`[data-field-id="${fieldId}"]`);
    const fieldType = state.currentSettings.type;
    const option = state.currentSettings.options[optionIndex];
    const priceLabel = pricing && pricing.type === 'fixed' && pricing.price > 0 
        ? ` (+$${pricing.price})` 
        : '';
    
    if (fieldType === 'select') {
        const optionElement = fieldElement.find(`option[value="${optionIndex}"]`);
        if (optionElement.length) {
            optionElement.text((option.label || '') + priceLabel);
        }
    } else if (fieldType === 'radio') {
        const labelElement = fieldElement.find(`label[for="radio-${fieldId}-${optionIndex}"]`);
        if (labelElement.length) {
            labelElement.text((option.label || '') + priceLabel);
        }
    } else if (fieldType === 'checkbox') {
        const labelElement = fieldElement.find(`label[for="checkbox-${fieldId}-${optionIndex}"]`);
        if (labelElement.length) {
            labelElement.text((option.label || '') + priceLabel);
        }
    }
}

// Event handlers for options
function attachOptionEventHandlers() {
    // Label change
    jQuery(document).off('input', '.ppxo-option-label').on('input', '.ppxo-option-label', function() {
        const fieldId = jQuery(this).data('field-id');
        const optionIndex = parseInt(jQuery(this).data('option-index'));
        const label = jQuery(this).val();
        updateOptionProperty(fieldId, optionIndex, 'label', label);
    });

    // Selection change
    jQuery(document).off('change', '.ppxo-option-selected').on('change', '.ppxo-option-selected', function() {
        const fieldId = jQuery(this).data('field-id');
        const optionIndex = parseInt(jQuery(this).data('option-index'));
        const selected = jQuery(this).is(':checked');
        const fieldType = jQuery(this).attr('type');
        
        updateOptionProperty(fieldId, optionIndex, 'selected', selected);
        
        // Handle radio buttons - only one selected
        if (fieldType === 'radio' && selected) {
            jQuery(`.ppxo-option-selected[name="option-${fieldId}"]`).each(function() {
                const idx = parseInt(jQuery(this).data('option-index'));
                if (idx !== optionIndex) {
                    jQuery(this).prop('checked', false);
                    updateOptionProperty(fieldId, idx, 'selected', false);
                }
            });
        }
    });

    // Price type change
    jQuery(document).off('change', '.ppxo-option-price-type').on('change', '.ppxo-option-price-type', function() {
        const row = jQuery(this).closest('tr');
        const priceInput = row.find('.ppxo-option-price');
        
        if (this.value === 'fixed') {
            priceInput.prop('disabled', false).focus();
        } else {
            priceInput.prop('disabled', true).val(0);
            const fieldId = jQuery(this).data('field-id');
            const optionIndex = parseInt(jQuery(this).data('option-index'));
            updateOptionProperty(fieldId, optionIndex, 'price', 0);
        }
        
        const fieldId = jQuery(this).data('field-id');
        const optionIndex = parseInt(jQuery(this).data('option-index'));
        updateOptionProperty(fieldId, optionIndex, 'priceType', this.value);
    });

    // Price change
    jQuery(document).off('input', '.ppxo-option-price').on('input', '.ppxo-option-price', function() {
        const fieldId = jQuery(this).data('field-id');
        const optionIndex = parseInt(jQuery(this).data('option-index'));
        const price = parseFloat(jQuery(this).val()) || 0;
        updateOptionProperty(fieldId, optionIndex, 'price', price);
    });
}

// Initialize event handlers when document is ready
jQuery(document).ready(function() {
    attachOptionEventHandlers();
});
/* ----------------------------
   Options management
   ---------------------------- */
function initializeOptions() {
    const $optionsList = jQuery('#wfb-options-list');
    $optionsList.empty();

    if (!state.currentSettings.options) state.currentSettings.options = [];

    if (state.currentSettings.options.length > 0) {
        state.currentSettings.options.forEach((opt, index) => {
            addOptionRow(opt.label, opt.price, opt.isDefault, index);
        });
    } else {
        addOptionRow('Option 1', 0, true, 0);
    }

    jQuery('#wfb-add-option').off('click').on('click', function () {
        addOptionRow('', 0, false, jQuery('.wfb-option-row').length);
    });


}

function addOptionRow(name = '', price = 0, isDefault = false, index = 0) {
    const $optionsList = jQuery('#wfb-options-list');
    const existingCount = jQuery('.wfb-option-row').length || 0;
    const rowId = 'option_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const optionHtml = `
        <div class="row mb-2 wfb-option-row align-items-center" data-row-id="${rowId}">
            <div class="col-md-5">
                <input type="text" class="form-control form-control-sm wfb-option-name" placeholder="Option name" value="${escapeHtml(name)}" required>
            </div>
            <div class="col-md-4">
                <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control wfb-option-price" placeholder="0.00" step="0.01" min="0" value="${price}">
                </div>
            </div>
            <div class="col-md-2">
                <div class="form-check text-center">
                    <input class="-box wfb-option-default" type="radio" name="defaultOption" ${isDefault ? 'checked' : ''}>
                    <label class="form-check-label small">Default</label>
                </div>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-sm btn-outline-danger wfb-remove-option" ${existingCount < 1 ? 'disabled' : ''}><i class="fas fa-times"></i></button>
            </div>
        </div>
    `;

    $optionsList.append(optionHtml);

    // Bind remove
    jQuery(`.wfb-option-row[data-row-id="${rowId}"] .wfb-remove-option`).off('click').on('click', function () {
        if (jQuery('.wfb-option-row').length > 1) {
            jQuery(this).closest('.wfb-option-row').remove();
            updateRemoveButtonStates();
        }
    });

    // Bind default radio
    jQuery(`.wfb-option-row[data-row-id="${rowId}"] .wfb-option-default`).off('change').on('change', function () {
        if (this.checked) {
            jQuery('.wfb-option-default').not(this).prop('checked', false);
        }
    });

    updateRemoveButtonStates();
}

function updateRemoveButtonStates() {
    const $removeButtons = jQuery('.wfb-remove-option');
    $removeButtons.prop('disabled', $removeButtons.length <= 1);
}



function collectOptionsData() {
    const options = [];
    jQuery('.wfb-option-row').each(function () {
        const $row = jQuery(this);
        const optionName = $row.find('.wfb-option-name').val().trim();
        const optionPrice = parseFloat($row.find('.wfb-option-price').val()) || 0;
        const isDefault = $row.find('.wfb-option-default').is(':checked');

        if (optionName) {
            options.push({
                label: optionName,
                price: optionPrice,
                value: optionName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                isDefault: isDefault
            });
        }
    });

    if (options.length === 0) {
        options.push({ label: 'Option 1', price: 0, value: 'option_1', isDefault: true });
    }

    const defaultOptions = options.filter(opt => opt.isDefault);
    if (defaultOptions.length === 0) {
        options[0].isDefault = true;
    } else if (defaultOptions.length > 1) {
        options.forEach((opt, i) => opt.isDefault = i === 0);
    }

    return options;
}



/* ============================
   UI binding helpers
   ============================ */


function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
}



/* ----------------------------------------------------------
   State Commit Helper
---------------------------------------------------------- */
function commitSettings() {
    updateState({
        currentSettings: state.currentSettings
    });

    // Call applySettings immediately after commit
    applySettings();
}


/* ----------------------------------------------------------
   Bind All Settings Inputs
---------------------------------------------------------- */
function bindSettingsInputs() {

    /* Text Inputs ----------------------------------------- */

    jQuery('#wfb-fieldLabel').on('input', function () {
        state.currentSettings.label = this.value.trim();
        commitSettings();
        liveUpdateFieldPreview();
    });

    jQuery('#wfb-fieldHelpText').on('input', function () {
        state.currentSettings.helpText = this.value.trim();
        commitSettings();
        liveUpdateFieldPreview();
    });

    jQuery('#wfb-fieldPlaceholder').on('input', function () {
        state.currentSettings.placeholder = this.value.trim();
        commitSettings();
        liveUpdateFieldPreview();
    });


    /* Toggles --------------------------------------------- */

    jQuery('#wfb-fieldRequired').on('change', function () {
        state.currentSettings.required = jQuery(this).is(':checked');
        commitSettings();
        liveUpdateFieldPreview();
    });

    jQuery('#wfb-fieldHideLabel').on('change', function () {
        state.currentSettings.hideLabel = jQuery(this).is(':checked');
        commitSettings();
        liveUpdateFieldPreview();
    });


    /* Textarea Settings ----------------------------------- */

    jQuery('#wfb-fieldRows').on('input', function () {
        state.currentSettings.rows = parseInt(this.value) || 4;
        commitSettings();
        liveUpdateFieldPreview();
    });

    jQuery('#wfb-fieldHeight').on('input', function () {
        state.currentSettings.height = parseInt(this.value) || 120;
        commitSettings();
        liveUpdateFieldPreview();
    });


    /* Pricing Settings ------------------------------------ */

    jQuery('#wfb-priceType').on('change', function () {

        const type = this.value;
        const priceField = jQuery('#wfb-priceRegular');

        state.currentSettings.pricing.type = type;

        if (type === 'free') {
            priceField.prop('disabled', true).val(0);
            state.currentSettings.pricing.price = 0;
        } else {
            priceField.prop('disabled', false);
        }

        commitSettings();
        liveUpdateFieldPreview();
    });

    jQuery('#wfb-priceRegular').on('input', function () {
        state.currentSettings.pricing.price = parseFloat(this.value) || 0;
        commitSettings();
        liveUpdateFieldPreview();
    });

    jQuery('#wfb-priceDiscount').on('input', function () {
        state.currentSettings.pricing.discount_price = parseFloat(this.value) || 0;
        commitSettings();
        liveUpdateFieldPreview();
    });
}


function liveUpdateFieldPreview() {
    if (!state.currentFieldId) return;

    const preview = jQuery(
        `.wfb-form-field[data-field-id="${state.currentFieldId}"]`
    );
    if (!preview.length) return;

    const st = state.currentSettings;

    /* --------------------------------------------------
       LABEL + REQUIRED
    -------------------------------------------------- */

    const labelWrap = preview.find('.wfb-field-label');
    const requiredEl = preview.find('.wfb-required');

    if (st.hideLabel) {
        labelWrap.hide();
    } else {
        labelWrap.show();

        // Update only label text node (not children)
        labelWrap
            .contents()
            .filter(function () {
                return this.nodeType === 3;
            })
            .first()
            .replaceWith(st.label || '');

        requiredEl.toggle(!!st.required);
    }

    // Required attribute (independent of hideLabel)
    preview.find('input, textarea, select')
        .prop('required', !!st.required);

    /* --------------------------------------------------
       HELP TEXT
    -------------------------------------------------- */

    const helpEl = preview.find('.wfb-field-help');
    const helpText = (st.helpText || '').trim();

    helpEl
        .attr('data-help', helpText)
        .toggle(!!helpText);

    /* --------------------------------------------------
       PLACEHOLDER
    -------------------------------------------------- */

    preview.find('input:not([type=checkbox]):not([type=radio]), textarea')
        .attr('placeholder', st.placeholder || '');

    /* --------------------------------------------------
       TEXTAREA
    -------------------------------------------------- */

    if (st.type === 'textarea') {
        const textarea = preview.find('textarea');
        textarea
            .attr('rows', st.rows || 4)
            .css('height', st.height ? `${st.height}px` : '');
    }

    /* --------------------------------------------------
       PRICING
    -------------------------------------------------- */

    const priceLabel = preview.find('.ppxo-price-label');
    const price = Number(st.pricing?.price || 0);

    priceLabel.toggle(price > 0);

    if (price > 0) {
        priceLabel.text(`(+ ${ppxo_admin.currency_symbol}${price})`);
    }
}






export function applySettings(e = null) {

    if (e) e.preventDefault();

    if (!state.currentFieldId) {
        console.error('WFB: Missing field ID on apply');
        alert('Error: Field ID is missing. Please try again.');
        return;
    }

    // Ensure ID in settings
    state.currentSettings.id = state.currentFieldId;

    if (state.isEditMode) {
        updateField(state.currentSettings);
    } else {
        addField(state.currentSettings);
    }


}

