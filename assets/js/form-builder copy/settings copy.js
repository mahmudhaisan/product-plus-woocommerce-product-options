// settings.js
// Clean, serial, and modular: settings panel logic for field builder
// Exports: initSettings, openSettingsPanel, createFieldInstantly, applySettings, showPanel, hidePanel

import { state, updateState, formData } from './core.js';
import { addField, updateField } from './fields.js';
import { findFieldById } from './utils.js';




/* ============================
   Public exports (top-level)
   ============================ */
export function initSettings() {
    // Initialize event bindings and any required UI wiring
    bindModalEvents();



    // bindTabSwitching();
    console.info('WFB: Settings initialized');
}

export function openSettingsPanel(fieldType, fieldId = null, columnId = null) {
    // Prepare state for edit or create and render modal
    console.log('Opening settings panel', { fieldType, fieldId, columnId });

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


    // showModal();
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





export function applySettings(e = null) {

    if (e) e.preventDefault();

    console.log(state);



    if (!state.currentFieldId) {
        console.error('WFB: Missing field ID on apply');
        alert('Error: Field ID is missing. Please try again.');
        return;
    }

    // Ensure ID in settings
    state.currentSettings.id = state.currentFieldId;

    // Collect data from UI
    collectDisplaySettings();



    // collectValidationSettings();
    // collectConditionSettings();
    // collectAdvancedSettings();
    // collectPricingSettings();

    console.debug('WFB: Final settings to save', state.currentSettings);

    if (state.isEditMode) {
        updateField(state.currentSettings);
    } else {
        addField(state.currentSettings);
    }


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




function getDefaultSettings(fieldType, fieldId, columnId) {
    return {
        id: fieldId,
        type: fieldType,
        columnId: columnId || null,
        label: getDefaultLabel(fieldType),
        required: false,
        placeholder: '',
        className: '',
        rows: 4,
        height: 120,
        validation: {
            min: '', max: '',
            minLength: '', maxLength: '',
            pattern: '', errorMessage: '',
            allowedTypes: '', maxFileSize: '', step: ''
        },
        conditions: {
            action: 'show',
            logic: 'all',
            rules: []
        },
        advanced: {
            defaultValue: '',
            helpText: '',
            description: '',
            cssClass: '',
            wrapperClass: '',
            inputClass: '',
            beforeText: '',
            afterText: '',
            displayStyle: {
                label: { color: '', fontSize: '' },
                placeholder: { color: '', fontSize: '' },
                defaultValue: { color: '', fontSize: '' },
                helpText: { color: '', fontSize: '' },
                description: { color: '', fontSize: '' },
                fieldBackground: ''
            }
        },
        pricing: {
            enabled: false,
            type: 'fixed',
            amount: 0,
            calculate: 'per_field'
        },
        visibility: {
            adminOnly: false,
            showInCart: true,
            showInCheckout: true,
            showInOrder: true,
            showInEmail: true
        },
        options: []
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



/* ============================
   Main form generation (tabs)
   ============================ */
function generateSettingsForm() {
    // Generate each tab's HTML
    generateDisplayTab();
    generateValidationTab();
    generateAdvancedTab();


    

    // generateConditionsTab();
    // generatePricingTab();

    // Initialize tooltips (Bootstrap)
    jQuery('[data-bs-toggle="tooltip"]').tooltip();

    // After render, bind inputs and UI behaviors
    bindSettingsInputs();
}



function generateDisplayTab() {
    const s = state.currentSettings || {};

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
                            
                              placeholder="Enter help text">${escapeHtml(s.advanced?.helpText || '')}</text>
                   
                </div>

            </div>

            <!-- ROW 3: PLACEHOLDER -->
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
        html += generateOptionsSection();
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
   Options & Pricing helpers
   ---------------------------- */
function generateOptionsSection() {
    return `
        <div class="mb-3">
            <label class="wfb-form-label-modern"><i class="fas fa-list me-1"></i>Field Options</label>
            <div class="alert alert-info mb-3"><i class="fas fa-info-circle me-2"></i>Set individual prices for each option below</div>
            <div id="wfb-options-container" class="border rounded p-3 bg-light">
                <div class="row mb-2 fw-bold small">
                    <div class="col-md-5">Option Name</div>
                    <div class="col-md-4">Additional Price</div>
                    <div class="col-md-2">Default</div>
                    <div class="col-md-1">Action</div>
                </div>
                <div id="wfb-options-list"></div>
                <button type="button" class="btn btn-sm btn-outline-primary mt-3" id="wfb-add-option"><i class="fas fa-plus me-1"></i> Add New Option</button>
            </div>
            <div class="form-text mt-2">Each option can have an additional price</div>
        </div>
    `;
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
                        <th style="width: 35%">Discount Price</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>
                            <select id="wfb-priceType" class="form-select wfb-form-control-modern">
                                <option value="fixed" ${pricing.type === 'fixed' ? 'selected' : ''}>Fixed</option>
                                <option value="percent" ${pricing.type === 'percent' ? 'selected' : ''}>Percentage</option>
                                <option value="free" ${pricing.type === 'free' ? 'selected' : ''}>Free</option>
                            </select>
                        </td>

                        <td>
                            <input type="number"
                                   id="wfb-priceRegular"
                                   class="form-control wfb-form-control-modern"
                                   value="${pricing.price || ''}"
                                   placeholder="0.00"
                                   step="1"
                                   min="0">
                        </td>

                        <td>
                            <input type="number"
                                   id="wfb-priceDiscount"
                                   class="form-control wfb-form-control-modern"
                                   value="${pricing.discount || ''}"
                                   placeholder="0.00"
                                   step="1"
                                   min="0">
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
    `;
}


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
                    <input class="form-check-input-box wfb-option-default" type="radio" name="defaultOption" ${isDefault ? 'checked' : ''}>
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

/* ----------------------------
   Validation Tab
   ---------------------------- */
function generateValidationTab() {
    const s = state.currentSettings || {};
    const html = `
    <div class="wfb-settings-card">
       
        <div class="wfb-settings-card-body">
            <div class="mb-3">
                <div class="form-checkbox">
                    <input class="form-check-input-box" type="checkbox" id="wfb-validationRequired" ${s.required ? 'checked' : ''}>
                    <label class="form-check-label" for="wfb-validationRequired">Required Field</label>
                </div>
            </div>

            ${(['text', 'textarea', 'email', 'url', 'tel'].includes(s.type) ? `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Minimum Length</label>
                        <input type="number" class="form-control wfb-form-control-modern" id="wfb-validationMinLength" value="${s.validation?.minLength || ''}" min="0">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Maximum Length</label>
                        <input type="number" class="form-control wfb-form-control-modern" id="wfb-validationMaxLength" value="${s.validation?.maxLength || ''}" min="1">
                    </div>
                </div>
            </div>` : '')}

            ${(['number'].includes(s.type) ? `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Minimum Value</label>
                        <input type="number" class="form-control wfb-form-control-modern" id="wfb-validationMin" value="${s.validation?.min || ''}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Maximum Value</label>
                        <input type="number" class="form-control wfb-form-control-modern" id="wfb-validationMax" value="${s.validation?.max || ''}">
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="wfb-form-label-modern">Step</label>
                <input type="number" class="form-control wfb-form-control-modern" id="wfb-validationStep" value="${s.validation?.step || ''}" placeholder="1" step="0.01">
            </div>` : '')}

            ${(['file'].includes(s.type) ? `
            <div class="mb-3">
                <label class="wfb-form-label-modern">Allowed File Types</label>
                <input type="text" class="form-control wfb-form-control-modern" id="wfb-validationAllowedTypes" value="${s.validation?.allowedTypes || ''}" placeholder=".jpg,.png,.pdf">
                <div class="form-text">Separate extensions with commas (e.g., .jpg,.png,.pdf)</div>
            </div>
            <div class="mb-3">
                <label class="wfb-form-label-modern">Maximum File Size (MB)</label>
                <input type="number" class="form-control wfb-form-control-modern" id="wfb-validationMaxFileSize" value="${s.validation?.maxFileSize || ''}" min="1">
            </div>` : '')}

            ${(['text', 'tel', 'email'].includes(s.type) ? `
            <div class="mb-3">
                <label class="wfb-form-label-modern">Quick Patterns</label>
                <select class="form-select wfb-form-control-modern" id="wfb-validationQuickPattern">
                    <option value="">Select a pattern...</option>
                    <option value="^[a-zA-Z ]+$">Letters only</option>
                    <option value="^[0-9]+$">Numbers only</option>
                    <option value="^[a-zA-Z0-9 ]+$">Alphanumeric</option>
                    <option value="^\\+?[1-9]\\d{1,14}$">Phone number (E.164)</option>
                    <option value="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$">Email format</option>
                    <option value="^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$">URL format</option>
                </select>
            </div>` : '')}

            <div class="mb-3">
                <label class="wfb-form-label-modern">Custom Error Message</label>
                <input type="text" class="form-control wfb-form-control-modern" id="wfb-validationErrorMessage" value="${escapeHtml(s.validation?.errorMessage || '')}" placeholder="Please enter a valid value">
                <div class="form-text">Displayed when validation fails</div>
            </div>
        </div>
    </div>
    `;
    jQuery('#wfb-validation').html(html);

    // Bind quick pattern
    jQuery('#wfb-validationQuickPattern').off('change').on('change', function () {
        const pattern = this.value;
        if (pattern) {
            // set into a hidden pattern field for collection
            if (!jQuery('#wfb-validationPattern').length) {
                jQuery('#wfb-validation').append(`<input type="hidden" id="wfb-validationPattern" value="${escapeHtml(pattern)}">`);
            } else {
                jQuery('#wfb-validationPattern').val(pattern);
            }
        }
    });
}

/* ----------------------------
   Conditions Tab
   ---------------------------- */
function generateConditionsTab() {
    const s = state.currentSettings || {};
    let html = `
    <div class="wfb-settings-card">
       
        <div class="wfb-settings-card-body">
            <div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>Show or hide this field based on other field values</div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="wfb-form-label-modern">Action</label>
                    <select class="form-select wfb-form-control-modern" id="wfb-conditionAction">
                        <option value="show" ${s.conditions?.action === 'show' ? 'selected' : ''}>Show this field</option>
                        <option value="hide" ${s.conditions?.action === 'hide' ? 'selected' : ''}>Hide this field</option>
                        <option value="enable" ${s.conditions?.action === 'enable' ? 'selected' : ''}>Enable this field</option>
                        <option value="disable" ${s.conditions?.action === 'disable' ? 'selected' : ''}>Disable this field</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="wfb-form-label-modern">Logic</label>
                    <select class="form-select wfb-form-control-modern" id="wfb-conditionLogic">
                        <option value="all" ${s.conditions?.logic === 'all' ? 'selected' : ''}>All conditions must be true</option>
                        <option value="any" ${s.conditions?.logic === 'any' ? 'selected' : ''}>Any condition must be true</option>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <button class="btn btn-outline-primary btn-sm" id="wfb-addConditionRule"><i class="fas fa-plus me-1"></i> Add Condition</button>
            </div>

            <div id="wfb-conditionRules">
    `;

    if (s.conditions?.rules && s.conditions.rules.length) {
        s.conditions.rules.forEach((rule, idx) => {
            html += generateConditionRuleHtml(rule, idx);
        });
    }

    html += `</div></div></div>`;
    jQuery('#wfb-conditions').html(html);

    jQuery('#wfb-addConditionRule').off('click').on('click', function () { addConditionRule(); });

    // Delegate remove event
    jQuery(document).off('click', '.wfb-remove-condition').on('click', '.wfb-remove-condition', function () {
        const $rule = jQuery(this).closest('.wfb-condition-rule');
        const index = parseInt($rule.data('index'), 10);
        if (state.currentSettings.conditions?.rules && state.currentSettings.conditions.rules.length > index) {
            state.currentSettings.conditions.rules.splice(index, 1);
            generateSettingsForm();
        }
    });
}

function generateConditionRuleHtml(rule = {}, index = 0) {
    const availableFields = getAvailableFieldsForConditions();
    return `
        <div class="wfb-condition-rule  mb-3" data-index="${index}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="card-title mb-0">Condition ${index + 1}</h6>
                    <button type="button" class="btn btn-sm btn-outline-danger wfb-remove-condition"><i class="fas fa-times"></i></button>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label small">Field</label>
                        <select class="form-select form-select-sm wfb-condition-field"><option value="">Select a field</option>
                            ${availableFields.map(field => `<option value="${field.id}" ${rule.field === field.id ? 'selected' : ''}>${escapeHtml(field.label || field.type)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small">Operator</label>
                        <select class="form-select form-select-sm wfb-condition-operator">
                            <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>Equals</option>
                            <option value="not_equals" ${rule.operator === 'not_equals' ? 'selected' : ''}>Not Equals</option>
                            <option value="contains" ${rule.operator === 'contains' ? 'selected' : ''}>Contains</option>
                            <option value="not_contains" ${rule.operator === 'not_contains' ? 'selected' : ''}>Not Contains</option>
                            <option value="greater_than" ${rule.operator === 'greater_than' ? 'selected' : ''}>Greater Than</option>
                            <option value="less_than" ${rule.operator === 'less_than' ? 'selected' : ''}>Less Than</option>
                            <option value="is_empty" ${rule.operator === 'is_empty' ? 'selected' : ''}>Is Empty</option>
                            <option value="is_not_empty" ${rule.operator === 'is_not_empty' ? 'selected' : ''}>Is Not Empty</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small">Value</label>
                        <input type="text" class="form-control form-control-sm wfb-condition-value" value="${escapeHtml(rule.value || '')}" placeholder="Enter value">
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getAvailableFieldsForConditions() {
    const availableFields = [];
    function processFields(fields) {
        fields.forEach(field => {
            if (field.id !== state.currentFieldId && field.type !== 'container') {
                availableFields.push({ id: field.id, label: field.label || field.type, type: field.type });
            }
            if (field.type === 'container' && field.columns) {
                field.columns.forEach(column => {
                    if (column.fields) processFields(column.fields);
                });
            }
        });
    }
    if (formData && formData.fields) processFields(formData.fields);
    return availableFields;
}

function addConditionRule() {
    if (!state.currentSettings.conditions) state.currentSettings.conditions = { rules: [], action: 'show', logic: 'all' };
    state.currentSettings.conditions.rules.push({ field: '', operator: 'equals', value: '' });
    generateSettingsForm();
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

/* ----------------------------
   Pricing Tab
   ---------------------------- */
function generatePricingTab() {
    const s = state.currentSettings || {};
    const p = s.pricing || { enabled: false, type: 'fixed', amount: 0, calculate: 'per_field' };

    const html = `
    <div class="wfb-settings-card">
       
        <div class="wfb-settings-card-body">
            <div class="mb-3">
                <div class="form-checkbox">
                    <input class="form-check-input-box" type="checkbox" id="wfb-pricingEnabled" ${p.enabled ? 'checked' : ''}>
                    <label class="form-check-label" for="wfb-pricingEnabled">Enable Extra Pricing</label>
                </div>
                <div class="form-text">Add extra cost when this field is used</div>
            </div>

            <div id="wfb-pricing-options" style="${p.enabled ? '' : 'display: none;'}">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="wfb-form-label-modern">Price Type</label>
                            <select class="form-select wfb-form-control-modern" id="wfb-pricingType">
                                <option value="fixed" ${p.type === 'fixed' ? 'selected' : ''}>Fixed Amount</option>
                                <option value="percent" ${p.type === 'percent' ? 'selected' : ''}>Percentage</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="wfb-form-label-modern">Amount</label>
                            <div class="input-group">
                                <span class="input-group-text" id="wfb-pricingSymbol">${p.type === 'percent' ? '%' : '$'}</span>
                                <input type="number" class="form-control wfb-form-control-modern" id="wfb-pricingAmount" value="${p.amount || ''}" step="0.01" min="0">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="wfb-form-label-modern">Calculation Method</label>
                    <select class="form-select wfb-form-control-modern" id="wfb-pricingCalculate">
                        <option value="per_field" ${p.calculate === 'per_field' ? 'selected' : ''}>Per Field</option>
                        <option value="per_option" ${p.calculate === 'per_option' ? 'selected' : ''}>Per Option</option>
                        <option value="per_character" ${p.calculate === 'per_character' ? 'selected' : ''}>Per Character</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    `;
    jQuery('#wfb-pricing').html(html);


    jQuery('#wfb-pricingType').off('change').on('change', function () {
        jQuery('#wfb-pricingSymbol').text(this.value === 'percent' ? '%' : '$');
    });
}

/* ============================
   Collectors (read UI into state.currentSettings)
   ============================ */
function collectDisplaySettings() {
    const s = state.currentSettings;

    
    s.label = jQuery('#wfb-fieldLabel').val() || 'Untitled Field';
    s.required = jQuery('#wfb-fieldRequired').is(':checked');
    if (jQuery('#wfb-fieldPlaceholder').length) s.placeholder = jQuery('#wfb-fieldPlaceholder').val() || '';
    if (jQuery('#wfb-fieldDefaultValue').length) s.advanced = s.advanced || {}, s.advanced.defaultValue = jQuery('#wfb-fieldDefaultValue').val() || '';
    if (jQuery('#wfb-fieldHelpText').length) s.advanced = s.advanced || {}, s.advanced.helpText = jQuery('#wfb-fieldHelpText').val() || '';
    if (jQuery('#wfb-fieldDescription').length) s.advanced = s.advanced || {}, s.advanced.description = jQuery('#wfb-fieldDescription').val() || '';

    if (s.type === 'textarea') {
        s.rows = parseInt(jQuery('#wfb-fieldRows').val(), 10) || 4;
        s.height = parseInt(jQuery('#wfb-fieldHeight').val(), 10) || 120;
    }

    if (['select', 'radio', 'checkbox'].includes(s.type)) {
        s.options = collectOptionsData();
    }

    if (!['select', 'radio', 'checkbox'].includes(s.type)) {
        s.pricing = s.pricing || {};
        s.pricing.enabled = jQuery('#wfb-pricingEnabled').is(':checked');
        s.pricing.amount = parseFloat(jQuery('#wfb-pricingAmount').val()) || 0;
    }

    // inline styles
    s.advanced = s.advanced || {};
    s.advanced.displayStyle = {
        label: {
            color: jQuery('input[data-style-key="label.color"]').val() || '',
            fontSize: jQuery('input[data-style-key="label.fontSize"]').val() || ''
        },
        placeholder: {
            color: jQuery('input[data-style-key="placeholder.color"]').val() || '',
            fontSize: jQuery('input[data-style-key="placeholder.fontSize"]').val() || ''
        },
        defaultValue: {
            color: jQuery('input[data-style-key="defaultValue.color"]').val() || '',
            fontSize: jQuery('input[data-style-key="defaultValue.fontSize"]').val() || ''
        },
        helpText: {
            color: jQuery('input[data-style-key="helpText.color"]').val() || '',
            fontSize: jQuery('input[data-style-key="helpText.fontSize"]').val() || ''
        },
        description: {
            color: jQuery('input[data-style-key="description.color"]').val() || '',
            fontSize: jQuery('input[data-style-key="description.fontSize"]').val() || ''
        },
        fieldBackground: jQuery('input[data-style-key="fieldBackground"]').val() || ''
    };
}

function collectValidationSettings() {
    const s = state.currentSettings;
    s.validation = s.validation || {};
    s.validation.min = jQuery('#wfb-validationMin').val() || '';
    s.validation.max = jQuery('#wfb-validationMax').val() || '';
    s.validation.minLength = jQuery('#wfb-validationMinLength').val() || '';
    s.validation.maxLength = jQuery('#wfb-validationMaxLength').val() || '';
    s.validation.pattern = jQuery('#wfb-validationPattern').val() || '';
    s.validation.errorMessage = jQuery('#wfb-validationErrorMessage').val() || '';
    s.validation.allowedTypes = jQuery('#wfb-validationAllowedTypes').val() || '';
    s.validation.maxFileSize = jQuery('#wfb-validationMaxFileSize').val() || '';
    s.validation.step = jQuery('#wfb-validationStep').val() || '';
}

function collectConditionSettings() {
    const s = state.currentSettings;
    s.conditions = s.conditions || {};
    s.conditions.action = jQuery('#wfb-conditionAction').val() || 'show';
    s.conditions.logic = jQuery('#wfb-conditionLogic').val() || 'all';
    s.conditions.rules = [];

    jQuery('.wfb-condition-rule').each(function () {
        const $r = jQuery(this);
        const rule = {
            field: $r.find('.wfb-condition-field').val(),
            operator: $r.find('.wfb-condition-operator').val(),
            value: $r.find('.wfb-condition-value').val()
        };
        if (rule.field && rule.operator) s.conditions.rules.push(rule);
    });
}

function collectAdvancedSettings() {
    const s = state.currentSettings;
    s.cssClass = jQuery('#wfb-advancedCssClass').val() || '';
    s.wrapperClass = jQuery('#wfb-advancedWrapperClass').val() || '';
    s.inputClass = jQuery('#wfb-advancedInputClass').val() || '';
    s.beforeText = jQuery('#wfb-advancedBeforeText').val() || '';
    s.afterText = jQuery('#wfb-advancedAfterText').val() || '';
}

function collectPricingSettings() {
    const s = state.currentSettings;
    s.pricing = s.pricing || {};
    s.pricing.enabled = jQuery('#wfb-pricingEnabled').is(':checked');
    s.pricing.type = jQuery('#wfb-pricingType').val() || 'fixed';
    s.pricing.amount = parseFloat(jQuery('#wfb-pricingAmount').val()) || 0;
    s.pricing.calculate = jQuery('#wfb-pricingCalculate').val() || 'per_field';
}






/* ============================
   UI binding helpers
   ============================ */
function bindModalEvents() {
    jQuery('#wfb-applySettings').off('click').on('click', applySettings);

    // Remove condition is handled via delegation in generateConditionsTab
    // Close modal via X or cancel handled by bootstrap default
}




function bindSettingsInputs() {
    // Style inputs already have a dedicated data-style-key attribute
    jQuery('.wfb-style-input').off('change input').on('change input', function () {
        // update style live in state
        const key = jQuery(this).data('style-key');
        if (!key) return;
        setNestedStyleValue(key, jQuery(this).val());
    });

    // Quick bindings for display field inputs (some ids may be absent depending on field type)
    jQuery('#wfb-fieldLabel, #wfb-fieldPlaceholder, #wfb-fieldDefaultValue, #wfb-fieldHelpText, #wfb-fieldDescription')
        .off('input').on('input', function () {
            // No direct state write here; we collect on apply to keep flow simple
        });

    // Validation quick pattern already bound in generateValidationTab
    // Pricing changes bound in generatePricingTab
}









/* ----------------------------
   Small utilities
   ---------------------------- */
function setNestedStyleValue(path, value) {
    // path: 'label.color' or 'fieldBackground'
    const s = state.currentSettings;
    s.advanced = s.advanced || {};
    s.advanced.displayStyle = s.advanced.displayStyle || {};

    if (path.indexOf('.') === -1) {
        s.advanced.displayStyle[path] = value;
        return;
    }

    const parts = path.split('.');
    const first = parts[0];
    const second = parts[1];

    s.advanced.displayStyle[first] = s.advanced.displayStyle[first] || {};
    s.advanced.displayStyle[first][second] = value;
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
}





/* ============================
   Modal show/hide & Panels
   ============================ */
function showModal() {
    const modalEl = document.getElementById('wfb-settingsModal');
    if (!modalEl) {
        console.warn('WFB: settings modal element not found (#wfb-settingsModal)');
        return;
    }
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function hideModal() {
    const modalEl = document.getElementById('wfb-settingsModal');
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
}

export function showPanel(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

export function hidePanel(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}
