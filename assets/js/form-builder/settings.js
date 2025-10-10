import { state, updateState, formData } from './core.js';
import { addField, updateField } from './fields.js';
import { findFieldById } from './utils.js';

export function initSettings(state, formData) {
    bindModalEvents();
}



// Main function to open settings panel
export function openSettingsPanel(fieldType, fieldId = null, columnId = null) {
    console.log('Opening settings panel:', { fieldType, fieldId, columnId });

    // Reset state first to ensure clean state
    updateState({
        isEditMode: !!fieldId,
        currentColumnId: columnId || null,
        currentFieldId: null,
        currentSettings: {}
    });

    if (state.isEditMode) {
        // Editing existing field
        const fieldData = findFieldById(fieldId, formData);
        console.log('Found field data for editing:', fieldData);

        if (fieldData) {
            updateState({
                currentFieldId: fieldId,
                currentSettings: jQuery.extend(true, {}, fieldData)
            });
        } else {
            console.error('Field not found for editing:', fieldId);
            return;
        }
    } else {
        // Creating new field - cleaner ID generation
        const newFieldId = generateFieldId(fieldType);
        console.log('Creating new field with ID:', newFieldId);

        updateState({
            currentFieldId: newFieldId,
            currentSettings: getDefaultSettings(fieldType, newFieldId, columnId)
        });
    }

    console.log('Final state before generating form:', state);
    generateSettingsForm();
    showModal();
}




// Clean ID generator function
function generateFieldId(fieldType) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4);
    const typeAbbr = getFieldTypeAbbreviation(fieldType);

    return `wfb-${typeAbbr}-${timestamp}${random}`;
}


// Modal handling
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
    const defaultSettings = {
        id: fieldId,
        type: fieldType,
        columnId: columnId,
        label: getDefaultLabel(fieldType),
        required: false,
        placeholder: '',
        className: '',
        // VALIDATION
        validation: {
            min: '', max: '',
            minLength: '', maxLength: '',
            pattern: '', errorMessage: '',
            allowedTypes: '', maxFileSize: ''
        },
        // CONDITIONS
        conditions: {
            action: 'show',
            logic: 'all',
            rules: []
        },
        // ADVANCED
        advanced: {
            defaultValue: '',
            helpText: '',
            description: '',
            cssClass: '',
            wrapperClass: '',
            inputClass: '',
            beforeText: '',
            afterText: ''
        },
        // PRICING
        pricing: {
            enabled: false,
            type: 'fixed', // fixed, percent, dynamic
            amount: 0,
            calculate: 'per_field' // per_field, per_option, per_character
        },
        // VISIBILITY
        visibility: {
            adminOnly: false,
            showInCart: true,
            showInCheckout: true,
            showInOrder: true,
            showInEmail: true
        },
        // OPTIONS (for select, radio, checkbox)
        options: []
    };

    return defaultSettings;
}

// Default label generator
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



function generateSettingsForm() {
    console.log('Generating settings form for:', state.currentSettings.type);

    // Generate all tabs
    generateDisplayTab();
    generateValidationTab();
    generateConditionsTab();
    generateAdvancedTab();
    generatePricingTab();

    // Initialize tooltips
    jQuery('[data-bs-toggle="tooltip"]').tooltip();

    console.log('Settings form generated successfully');
}


function generateDisplayTab() {
    let displayHtml = `
    <div class="wfb-settings-card">
        <div class="wfb-settings-card-header">
            <i class="fas fa-sliders-h me-2"></i>Display Settings
        </div>
        <div class="wfb-settings-card-body">
            <!-- Field Label -->
            <div class="mb-3">
                <label class="wfb-form-label-modern">
                    <i class="fas fa-tag me-1"></i>Field Label
                </label>
                <input type="text" 
                    class="form-control wfb-form-control-modern" 
                    id="wfb-fieldLabel" 
                    value="${state.currentSettings.label || ''}" 
                    placeholder="Enter field label">
                <div class="form-text">This will be displayed as the field label</div>
            </div>

            <!-- Required Field -->
            <div class="mb-3">
                <div class="form-checkbox">
                    <input class="form-check-input" type="checkbox" id="wfb-fieldRequired" ${state.currentSettings.required ? 'checked' : ''}>
                    <label class="form-check-label" for="wfb-fieldRequired">
                        Required Field
                    </label>
                </div>
                <div class="form-text">User must fill this field before submission</div>
            </div>
    `;

    // Placeholder for input fields
    if (['text', 'email', 'textarea', 'number', 'url', 'tel', 'password'].includes(state.currentSettings.type)) {
        displayHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">
                    <i class="fas fa-quote-left me-1"></i>Placeholder Text
                </label>
                <input type="text" 
                    class="form-control wfb-form-control-modern" 
                    id="wfb-fieldPlaceholder" 
                    value="${state.currentSettings.placeholder || ''}" 
                    placeholder="Hint text for users">
            </div>
        `;
    }

    // Default Value
    displayHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">
                    <i class="fas fa-magic me-1"></i>Default Value
                </label>
                <input type="text" 
                    class="form-control wfb-form-control-modern" 
                    id="wfb-fieldDefaultValue" 
                    value="${state.currentSettings.defaultValue || ''}" 
                    placeholder="Pre-filled value">
            </div>
    `;

    // Help Text
    displayHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">
                    <i class="fas fa-info-circle me-1"></i>Help Text
                </label>
                <textarea class="form-control wfb-form-control-modern" 
                    id="wfb-fieldHelpText" 
                    rows="2" 
                    placeholder="Additional information for users">${state.currentSettings.helpText || ''}</textarea>
            </div>
    `;

    // Description (rich text)
    displayHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">
                    <i class="fas fa-align-left me-1"></i>Field Description
                </label>
                <textarea class="form-control wfb-form-control-modern" 
                    id="wfb-fieldDescription" 
                    rows="3" 
                    placeholder="Detailed description (supports HTML)">${state.currentSettings.description || ''}</textarea>
                <div class="form-text">Supports basic HTML tags</div>
            </div>
    `;

    // Options for select, radio, checkbox (they handle pricing per option)
    if (['select', 'radio', 'checkbox'].includes(state.currentSettings.type)) {
        displayHtml += generateOptionsSection();
    }

    // General pricing for non-option fields
    if (!['select', 'radio', 'checkbox'].includes(state.currentSettings.type)) {
        displayHtml += generateGeneralPricingSection();
    }

    displayHtml += `
        </div>
    </div>
    `;

    jQuery('#wfb-display').html(displayHtml);

    // Initialize options if needed
    if (['select', 'radio', 'checkbox'].includes(state.currentSettings.type)) {
        initializeOptions();
    }
}


// Add this new function for general pricing
function generateGeneralPricingSection() {
    return `
        <div class="mb-3">
            <label class="wfb-form-label-modern">
                <i class="fas fa-tag me-1"></i>Additional Price
            </label>
            <div class="form-checkbox mb-2">
                <input class="form-check-input" type="checkbox" id="wfb-pricingEnabled" ${state.currentSettings.pricing?.enabled ? 'checked' : ''}>
                <label class="form-check-label" for="wfb-pricingEnabled">
                    Add extra cost when this field is used
                </label>
            </div>
            <div id="wfb-pricing-amount-container" style="${state.currentSettings.pricing?.enabled ? '' : 'display: block;'}">
                <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" 
                        class="form-control wfb-form-control-modern" 
                        id="wfb-pricingAmount" 
                        value="${state.currentSettings.pricing?.amount || ''}" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00">
                </div>
                <div class="form-text">Additional amount added to product price</div>
            </div>
        </div>
    `;
}


// Update the options section to show it's for option-based pricing
function generateOptionsSection() {
    return `
        <div class="mb-3">
            <label class="wfb-form-label-modern">
                <i class="fas fa-list me-1"></i>Field Options
            </label>
            <div class="alert alert-info mb-3">
                <i class="fas fa-info-circle me-2"></i>
                Set individual prices for each option below
            </div>
            <div id="wfb-options-container" class="border rounded p-3 bg-light">
                <div class="row mb-2 fw-bold small">
                    <div class="col-md-5">Option Name</div>
                    <div class="col-md-4">Additional Price</div>
                    <div class="col-md-2">Default</div>
                    <div class="col-md-1">Action</div>
                </div>
                <div id="wfb-options-list">
                    <!-- Options will be dynamically added here -->
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary mt-3" id="wfb-add-option">
                    <i class="fas fa-plus me-1"></i> Add New Option
                </button>
            </div>
            <div class="form-text mt-2">Each option can have an additional price</div>
        </div>
    `;
}





function generateValidationTab() {
    let validationHtml = `
    <div class="wfb-settings-card">
        <div class="wfb-settings-card-header">
            <i class="fas fa-check-circle me-2"></i>Validation Rules
        </div>
        <div class="wfb-settings-card-body">
    `;

    // Required (duplicate from display for convenience)
    validationHtml += `
            <div class="mb-3">
                <div class="form-checkbox">
                    <input class="form-check-input" type="checkbox" id="wfb-validationRequired" ${state.currentSettings.required ? 'checked' : ''}>
                    <label class="form-check-label" for="wfb-validationRequired">
                        Required Field
                    </label>
                </div>
            </div>
    `;

    // Text-based validation
    if (['text', 'textarea', 'email', 'url', 'tel'].includes(state.currentSettings.type)) {
        validationHtml += `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Minimum Length</label>
                        <input type="number" class="form-control wfb-form-control-modern" 
                            id="wfb-validationMinLength" 
                            value="${state.currentSettings.validation.minLength || ''}" 
                            placeholder="0" min="0">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Maximum Length</label>
                        <input type="number" class="form-control wfb-form-control-modern" 
                            id="wfb-validationMaxLength" 
                            value="${state.currentSettings.validation.maxLength || ''}" 
                            placeholder="255" min="1">
                    </div>
                </div>
            </div>
        `;
    }

    // Number validation
    if (['number'].includes(state.currentSettings.type)) {
        validationHtml += `
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Minimum Value</label>
                        <input type="number" class="form-control wfb-form-control-modern" 
                            id="wfb-validationMin" 
                            value="${state.currentSettings.validation.min || ''}" 
                            placeholder="0">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Maximum Value</label>
                        <input type="number" class="form-control wfb-form-control-modern" 
                            id="wfb-validationMax" 
                            value="${state.currentSettings.validation.max || ''}" 
                            placeholder="100">
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="wfb-form-label-modern">Step</label>
                <input type="number" class="form-control wfb-form-control-modern" 
                    id="wfb-validationStep" 
                    value="${state.currentSettings.validation.step || ''}" 
                    placeholder="1" step="0.01">
            </div>
        `;
    }

    // File validation
    if (['file'].includes(state.currentSettings.type)) {
        validationHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">Allowed File Types</label>
                <input type="text" class="form-control wfb-form-control-modern" 
                    id="wfb-validationAllowedTypes" 
                    value="${state.currentSettings.validation.allowedTypes || ''}" 
                    placeholder=".jpg,.png,.pdf,.doc">
                <div class="form-text">Separate extensions with commas (e.g., .jpg,.png,.pdf)</div>
            </div>
            <div class="mb-3">
                <label class="wfb-form-label-modern">Maximum File Size (MB)</label>
                <input type="number" class="form-control wfb-form-control-modern" 
                    id="wfb-validationMaxFileSize" 
                    value="${state.currentSettings.validation.maxFileSize || ''}" 
                    placeholder="5" min="1">
            </div>
        `;
    }

    // Pattern validation
    if (['text', 'textarea', 'email', 'url', 'tel'].includes(state.currentSettings.type)) {
        validationHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">Validation Pattern (RegEx)</label>
                <input type="text" class="form-control wfb-form-control-modern" 
                    id="wfb-validationPattern" 
                    value="${state.currentSettings.validation.pattern || ''}" 
                    placeholder="^[A-Za-z ]+$">
                <div class="form-text">Use regular expressions for custom validation</div>
            </div>
        `;
    }

    // Predefined patterns
    if (['text', 'tel', 'email'].includes(state.currentSettings.type)) {
        validationHtml += `
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
            </div>
        `;
    }

    // Error message
    validationHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">Custom Error Message</label>
                <input type="text" class="form-control wfb-form-control-modern" 
                    id="wfb-validationErrorMessage" 
                    value="${state.currentSettings.validation.errorMessage || ''}" 
                    placeholder="Please enter a valid value">
                <div class="form-text">Displayed when validation fails</div>
            </div>
    `;

    validationHtml += `
        </div>
    </div>
    `;

    jQuery('#wfb-validation').html(validationHtml);

    // Bind quick pattern selection
    jQuery('#wfb-validationQuickPattern').on('change', function () {
        if (this.value) {
            jQuery('#wfb-validationPattern').val(this.value);
        }
    });
}

function generateConditionsTab() {
    let conditionsHtml = `
    <div class="wfb-settings-card">
        <div class="wfb-settings-card-header">
            <i class="fas fa-code-branch me-2"></i>Conditional Logic
        </div>
        <div class="wfb-settings-card-body">
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Show or hide this field based on other field values
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="wfb-form-label-modern">Action</label>
                    <select class="form-select wfb-form-control-modern" id="wfb-conditionAction">
                        <option value="show" ${state.currentSettings.conditions.action === 'show' ? 'selected' : ''}>Show this field</option>
                        <option value="hide" ${state.currentSettings.conditions.action === 'hide' ? 'selected' : ''}>Hide this field</option>
                        <option value="enable" ${state.currentSettings.conditions.action === 'enable' ? 'selected' : ''}>Enable this field</option>
                        <option value="disable" ${state.currentSettings.conditions.action === 'disable' ? 'selected' : ''}>Disable this field</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="wfb-form-label-modern">Logic</label>
                    <select class="form-select wfb-form-control-modern" id="wfb-conditionLogic">
                        <option value="all" ${state.currentSettings.conditions.logic === 'all' ? 'selected' : ''}>All conditions must be true</option>
                        <option value="any" ${state.currentSettings.conditions.logic === 'any' ? 'selected' : ''}>Any condition must be true</option>
                    </select>
                </div>
            </div>

            <div class="mb-3">
                <button class="btn btn-outline-primary btn-sm" id="wfb-addConditionRule">
                    <i class="fas fa-plus me-1"></i> Add Condition
                </button>
            </div>

            <div id="wfb-conditionRules">
    `;

    // Existing rules
    if (state.currentSettings.conditions.rules && state.currentSettings.conditions.rules.length > 0) {
        state.currentSettings.conditions.rules.forEach((rule, index) => {
            conditionsHtml += generateConditionRuleHtml(rule, index);
        });
    }

    conditionsHtml += `
            </div>
        </div>
    </div>
    `;

    jQuery('#wfb-conditions').html(conditionsHtml);

    // Bind add condition button
    jQuery('#wfb-addConditionRule').on('click', function () {
        addConditionRule();
    });
}

function generateConditionRuleHtml(rule = {}, index = 0) {
    const availableFields = getAvailableFieldsForConditions();

    return `
        <div class="wfb-condition-rule card mb-3" data-index="${index}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="card-title mb-0">Condition ${index + 1}</h6>
                    <button type="button" class="btn btn-sm btn-outline-danger wfb-remove-condition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label small">Field</label>
                        <select class="form-select form-select-sm wfb-condition-field">
                            <option value="">Select a field</option>
                            ${availableFields.map(field =>
        `<option value="${field.id}" ${rule.field === field.id ? 'selected' : ''}>${field.label}</option>`
    ).join('')}
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
                        <input type="text" class="form-control form-control-sm wfb-condition-value" 
                            value="${rule.value || ''}" 
                            placeholder="Enter value">
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateAdvancedTab() {
    let advancedHtml = `
    <div class="wfb-settings-card">
        <div class="wfb-settings-card-header">
            <i class="fas fa-cogs me-2"></i>Advanced Settings
        </div>
        <div class="wfb-settings-card-body">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">CSS Class</label>
                        <input type="text" class="form-control wfb-form-control-modern" 
                            id="wfb-advancedCssClass" 
                            value="${state.currentSettings.cssClass || ''}" 
                            placeholder="custom-field my-class">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Wrapper Class</label>
                        <input type="text" class="form-control wfb-form-control-modern" 
                            id="wfb-advancedWrapperClass" 
                            value="${state.currentSettings.wrapperClass || ''}" 
                            placeholder="field-wrapper">
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <label class="wfb-form-label-modern">Input Class</label>
                <input type="text" class="form-control wfb-form-control-modern" 
                    id="wfb-advancedInputClass" 
                    value="${state.currentSettings.inputClass || ''}" 
                    placeholder="form-control-lg">
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">Before Text</label>
                        <input type="text" class="form-control wfb-form-control-modern" 
                            id="wfb-advancedBeforeText" 
                            value="${state.currentSettings.beforeText || ''}" 
                            placeholder="Text before field">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">After Text</label>
                        <input type="text" class="form-control wfb-form-control-modern" 
                            id="wfb-advancedAfterText" 
                            value="${state.currentSettings.afterText || ''}" 
                            placeholder="Text after field">
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <div class="form-checkbox">
                    <input class="form-check-input" type="checkbox" id="wfb-advancedAdminOnly" ${state.currentSettings.adminOnly ? 'checked' : ''}>
                    <label class="form-check-label" for="wfb-advancedAdminOnly">
                        Admin Only Field
                    </label>
                </div>
                <div class="form-text">Only visible to administrators</div>
            </div>

            <div class="mb-3">
                <label class="wfb-form-label-modern">Custom Attributes</label>
                <textarea class="form-control wfb-form-control-modern" 
                    id="wfb-advancedCustomAttributes" 
                    rows="3" 
                    placeholder="data-custom=&quot;value&quot;&#10;aria-label=&quot;description&quot;">${state.currentSettings.customAttributes || ''}</textarea>
                <div class="form-text">One attribute per line: attribute=&quot;value&quot;</div>
            </div>
        </div>
    </div>
    `;

    jQuery('#wfb-advanced').html(advancedHtml);
}

function generatePricingTab() {
    let pricingHtml = `
    <div class="wfb-settings-card">
        <div class="wfb-settings-card-header">
            <i class="fas fa-tag me-2"></i>Pricing Settings
        </div>
        <div class="wfb-settings-card-body">
            <div class="mb-3">
                <div class="form-checkbox">
                    <input class="form-check-input" type="checkbox" id="wfb-pricingEnabled" ${state.currentSettings.pricing?.enabled ? 'checked' : ''}>
                    <label class="form-check-label" for="wfb-pricingEnabled">
                        Enable Extra Pricing
                    </label>
                </div>
                <div class="form-text">Add extra cost when this field is used</div>
            </div>

            <div id="wfb-pricing-options" style="${state.currentSettings.pricing?.enabled ? '' : 'display: none;'}">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="wfb-form-label-modern">Price Type</label>
                            <select class="form-select wfb-form-control-modern" id="wfb-pricingType">
                                <option value="fixed" ${state.currentSettings.pricing?.type === 'fixed' ? 'selected' : ''}>Fixed Amount</option>
                                <option value="percent" ${state.currentSettings.pricing?.type === 'percent' ? 'selected' : ''}>Percentage</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="wfb-form-label-modern">Amount</label>
                            <div class="input-group">
                                <span class="input-group-text">${state.currentSettings.pricing?.type === 'percent' ? '%' : '$'}</span>
                                <input type="number" class="form-control wfb-form-control-modern" 
                                    id="wfb-pricingAmount" 
                                    value="${state.currentSettings.pricing?.amount || ''}" 
                                    step="0.01" min="0">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="wfb-form-label-modern">Calculation Method</label>
                    <select class="form-select wfb-form-control-modern" id="wfb-pricingCalculate">
                        <option value="per_field" ${state.currentSettings.pricing?.calculate === 'per_field' ? 'selected' : ''}>Per Field</option>
                        <option value="per_option" ${state.currentSettings.pricing?.calculate === 'per_option' ? 'selected' : ''}>Per Option</option>
                        <option value="per_character" ${state.currentSettings.pricing?.calculate === 'per_character' ? 'selected' : ''}>Per Character</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    `;

    jQuery('#wfb-pricing').html(pricingHtml);

    // Bind pricing toggle
    jQuery('#wfb-pricingEnabled').on('change', function () {
        jQuery('#wfb-pricing-options').toggle(this.checked);
    });

    // Bind pricing type change
    jQuery('#wfb-pricingType').on('change', function () {
        const symbol = this.value === 'percent' ? '%' : '$';
        jQuery('#wfb-pricingAmount').prev('.input-group-text').text(symbol);
    });
}

// Helper functions
function getAvailableFieldsForConditions() {
    // Get all fields except the current one and containers
    const availableFields = [];

    function processFields(fields) {
        fields.forEach(field => {
            if (field.id !== state.currentFieldId && field.type !== 'container') {
                availableFields.push({
                    id: field.id,
                    label: field.label || field.type,
                    type: field.type
                });
            }

            // Process container fields
            if (field.type === 'container' && field.columns) {
                field.columns.forEach(column => {
                    if (column.fields) {
                        processFields(column.fields);
                    }
                });
            }
        });
    }

    processFields(formData.fields);
    return availableFields;
}

function addConditionRule() {
    if (!state.currentSettings.conditions.rules) {
        state.currentSettings.conditions.rules = [];
    }

    const newRule = {
        field: '',
        operator: 'equals',
        value: ''
    };

    state.currentSettings.conditions.rules.push(newRule);
    generateSettingsForm(); // Regenerate to show new rule
}






// Update the initializeOptions function to include default selection
function initializeOptions() {
    const $optionsList = jQuery('#wfb-options-list');
    $optionsList.empty();
    
    // Ensure options array exists
    if (!state.currentSettings.options) {
        state.currentSettings.options = [];
    }
    
    if (state.currentSettings.options.length > 0) {
        // Load existing options
        state.currentSettings.options.forEach((option, index) => {
            addOptionRow(option.label, option.price, option.isDefault, index);
        });
    } else {
        // Add default options for new fields
        addOptionRow('Option 1', 0, true, 0);
        addOptionRow('Option 2', 0, false, 1);
    }
    
    // Re-bind add option button
    jQuery('#wfb-add-option').off('click').on('click', function() {
        addOptionRow('', 0, false, jQuery('.wfb-option-row').length);
    });

    // Bind pricing toggle for general fields
    jQuery('#wfb-pricingEnabled').off('change').on('change', function() {
        jQuery('#wfb-pricing-amount-container').toggle(this.checked);
    });
}




// Update addOptionRow to include default option
function addOptionRow(name = '', price = 0, isDefault = false, index = 0) {
    const $optionsList = jQuery('#wfb-options-list');
    const rowId = 'option_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const optionHtml = `
        <div class="row mb-2 wfb-option-row align-items-center" data-row-id="${rowId}">
            <div class="col-md-5">
                <input type="text" 
                    class="form-control form-control-sm wfb-option-name" 
                    placeholder="Option name" 
                    value="${name}" required>
            </div>
            <div class="col-md-4">
                <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input type="number" 
                        class="form-control wfb-option-price" 
                        placeholder="0.00" 
                        step="0.01" 
                        min="0" 
                        value="${price}">
                </div>
            </div>
            <div class="col-md-2">
                <div class="form-check text-center">
                    <input class="form-check-input wfb-option-default" type="radio" name="defaultOption" 
                        ${isDefault ? 'checked' : ''}>
                    <label class="form-check-label small">Default</label>
                </div>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-sm btn-outline-danger wfb-remove-option" ${jQuery('.wfb-option-row').length < 2 ? 'disabled' : ''}>
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    $optionsList.append(optionHtml);
    
    // Bind remove event
    jQuery(`.wfb-option-row[data-row-id="${rowId}"] .wfb-remove-option`).off('click').on('click', function() {
        if (jQuery('.wfb-option-row').length > 1) {
            jQuery(this).closest('.wfb-option-row').remove();
            updateRemoveButtonStates();
        }
    });
    
    // Bind default option selection
    jQuery(`.wfb-option-row[data-row-id="${rowId}"] .wfb-option-default`).off('change').on('change', function() {
        if (this.checked) {
            // Uncheck all other default options
            jQuery('.wfb-option-default').not(this).prop('checked', false);
        }
    });
    
    updateRemoveButtonStates();
}


















function updateRemoveButtonStates() {
    const $removeButtons = jQuery('.wfb-remove-option');
    if ($removeButtons.length <= 1) {
        $removeButtons.prop('disabled', true);
    } else {
        $removeButtons.prop('disabled', false);
    }
}







// Update collectOptionsData to handle default options properly
function collectOptionsData() {
    const options = [];
    
    jQuery('.wfb-option-row').each(function(index) {
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
    
    // Ensure at least one option exists
    if (options.length === 0) {
        options.push({
            label: 'Option 1',
            price: 0,
            value: 'option_1',
            isDefault: true
        });
    }
    
    // Ensure exactly one default option
    const defaultOptions = options.filter(opt => opt.isDefault);
    if (defaultOptions.length === 0) {
        options[0].isDefault = true;
    } else if (defaultOptions.length > 1) {
        options.forEach((opt, index) => {
            opt.isDefault = index === 0;
        });
    }
    
    return options;
}
























function bindModalEvents() {
    // Remove existing event handlers to prevent duplicates
    jQuery('#wfb-applySettings').off('click');

    // Bind apply settings event
    jQuery('#wfb-applySettings').on('click', applySettings);

    // Bind remove condition events
    jQuery(document).on('click', '.wfb-remove-condition', function () {
        const $rule = jQuery(this).closest('.wfb-condition-rule');
        const index = $rule.data('index');

        if (state.currentSettings.conditions.rules && state.currentSettings.conditions.rules.length > index) {
            state.currentSettings.conditions.rules.splice(index, 1);
            generateSettingsForm(); // Regenerate form
        }
    });
}

function applySettings(e) {
    e.preventDefault();

    console.log('Applying settings with current state:', state);

    // Validate that we have a field ID
    if (!state.currentFieldId) {
        console.error('No field ID found when applying settings');
        alert('Error: Field ID is missing. Please try again.');
        return;
    }

    // Ensure currentSettings has the ID
    state.currentSettings.id = state.currentFieldId;


    // COLLECT ALL SETTINGS FROM FORM
    collectDisplaySettings();
    collectValidationSettings();
    collectConditionSettings();
    collectAdvancedSettings();
    collectPricingSettings();

    console.log('Final settings to save:', state.currentSettings);

    if (state.isEditMode) {
        updateField(state.currentSettings);
    } else {
        addField(state.currentSettings);
    }

    hideModal();
}






// Update collectDisplaySettings to handle both pricing types
function collectDisplaySettings() {

    
    state.currentSettings.label = jQuery('#wfb-fieldLabel').val() || 'Untitled Field';
    state.currentSettings.required = jQuery('#wfb-fieldRequired').is(':checked');
    state.currentSettings.placeholder = jQuery('#wfb-fieldPlaceholder').val() || '';
    state.currentSettings.defaultValue = jQuery('#wfb-fieldDefaultValue').val() || '';
    state.currentSettings.helpText = jQuery('#wfb-fieldHelpText').val() || '';
    state.currentSettings.description = jQuery('#wfb-fieldDescription').val() || '';
    
    // Options for select/radio/checkbox
    if (['select', 'radio', 'checkbox'].includes(state.currentSettings.type)) {
        state.currentSettings.options = collectOptionsData();
    }
    
    // General pricing for other fields
    if (!['select', 'radio', 'checkbox'].includes(state.currentSettings.type)) {
        state.currentSettings.pricing = {
            enabled: jQuery('#wfb-pricingEnabled').is(':checked'),
            amount: parseFloat(jQuery('#wfb-pricingAmount').val()) || 0
        };
    }
}







function collectValidationSettings() {
    state.currentSettings.validation.min = jQuery('#wfb-validationMin').val() || '';
    state.currentSettings.validation.max = jQuery('#wfb-validationMax').val() || '';
    state.currentSettings.validation.minLength = jQuery('#wfb-validationMinLength').val() || '';
    state.currentSettings.validation.maxLength = jQuery('#wfb-validationMaxLength').val() || '';
    state.currentSettings.validation.pattern = jQuery('#wfb-validationPattern').val() || '';
    state.currentSettings.validation.errorMessage = jQuery('#wfb-validationErrorMessage').val() || '';
    state.currentSettings.validation.allowedTypes = jQuery('#wfb-validationAllowedTypes').val() || '';
    state.currentSettings.validation.maxFileSize = jQuery('#wfb-validationMaxFileSize').val() || '';
    state.currentSettings.validation.step = jQuery('#wfb-validationStep').val() || '';
}

function collectConditionSettings() {
    state.currentSettings.conditions.action = jQuery('#wfb-conditionAction').val();
    state.currentSettings.conditions.logic = jQuery('#wfb-conditionLogic').val();

    // Collect condition rules
    state.currentSettings.conditions.rules = [];
    jQuery('.wfb-condition-rule').each(function () {
        const $rule = jQuery(this);
        const rule = {
            field: $rule.find('.wfb-condition-field').val(),
            operator: $rule.find('.wfb-condition-operator').val(),
            value: $rule.find('.wfb-condition-value').val()
        };

        if (rule.field && rule.operator) {
            state.currentSettings.conditions.rules.push(rule);
        }
    });
}

function collectAdvancedSettings() {
    state.currentSettings.cssClass = jQuery('#wfb-advancedCssClass').val() || '';
    state.currentSettings.wrapperClass = jQuery('#wfb-advancedWrapperClass').val() || '';
    state.currentSettings.inputClass = jQuery('#wfb-advancedInputClass').val() || '';
    state.currentSettings.beforeText = jQuery('#wfb-advancedBeforeText').val() || '';
    state.currentSettings.afterText = jQuery('#wfb-advancedAfterText').val() || '';
    state.currentSettings.adminOnly = jQuery('#wfb-advancedAdminOnly').is(':checked');
    state.currentSettings.customAttributes = jQuery('#wfb-advancedCustomAttributes').val() || '';
}

function collectPricingSettings() {
    state.currentSettings.pricing.enabled = jQuery('#wfb-pricingEnabled').is(':checked');
    state.currentSettings.pricing.type = jQuery('#wfb-pricingType').val();
    state.currentSettings.pricing.amount = parseFloat(jQuery('#wfb-pricingAmount').val()) || 0;
    state.currentSettings.pricing.calculate = jQuery('#wfb-pricingCalculate').val();
}

function showModal() {
    const modal = new bootstrap.Modal(document.getElementById('wfb-settingsModal'));
    modal.show();
}

function hideModal() {
    const modalEl = document.getElementById('wfb-settingsModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}