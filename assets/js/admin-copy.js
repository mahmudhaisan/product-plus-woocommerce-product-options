(function ($) {
    // Initialize when document is ready
    $(document).ready(function () {


        // Initialize tooltips
        $('[data-bs-toggle="tooltip"]').tooltip();


        // Form data structure
        let wfbFormData = {
            fields: []
        };

        let wfbCurrentFieldId = null;
        let wfbCurrentSettings = {};
        let wfbIsEditMode = false;
        let wfbCurrentContainerId = null;
        let wfbCurrentColumnId = null;
        let wfbDropPosition = null;

        // Make components draggable
        $('.wfb-component').draggable({
            revert: 'invalid',
            cursor: 'move',
            zIndex: 10000,
            scroll: false,
            containment: 'document',
            helper: function () {
                return $('<div class="p-2 bg-light border rounded" style="z-index: 10001;">' + $(this).text() + '</div>');
            },
            start: function (event, ui) {

                console.log('Making component draggable:', this);

                $(this).addClass('dragging');
                $('body').addClass('dragging');
                ui.helper.css('z-index', '10001');
            },
            stop: function (event, ui) {
                $(this).removeClass('dragging');
                $('body').removeClass('dragging');
            }
        });

        // Make form builder area droppable
        $('#wfb-formBuilder').droppable({
            accept: '.wfb-component',
            hoverClass: 'wfb-drop-zone-highlight',
            drop: function (event, ui) {
                const componentType = ui.draggable.data('type');
                wfbDropPosition = null; // Reset drop position

                if (componentType === 'container') {
                    wfbOpenContainerSettings();
                } else {
                    // Open settings panel for the field
                    wfbOpenSettingsPanel(componentType);
                }
            }
        });



        // Open settings panel
        function wfbOpenSettingsPanel(fieldType, fieldId = null, columnId = null) {
            wfbIsEditMode = !!fieldId;
            wfbCurrentColumnId = columnId || null;

            if (wfbIsEditMode) {
                const fieldData = wfbFindFieldById(fieldId);
                if (fieldData) {
                    wfbCurrentFieldId = fieldId;
                    wfbCurrentSettings = $.extend(true, {}, fieldData);
                }
            } else {
                wfbCurrentFieldId = 'wfb-field-' + Date.now();
                wfbCurrentSettings = {
                    id: wfbCurrentFieldId,
                    type: fieldType,
                    columnId: columnId,
                    label: fieldType.charAt(0).toUpperCase() + fieldType.slice(1) + ' Field',
                    required: false,
                    placeholder: '',
                    className: '',
                    validation: { min: '', max: '', pattern: '', errorMessage: '' },
                    conditions: { action: 'show', logic: 'all', rules: [] },
                    advanced: { defaultValue: '', helpText: '' }
                };
            }

            // Generate settings form
            wfbGenerateSettingsForm();

            // Show Bootstrap modal
            const modal = new bootstrap.Modal(document.getElementById('wfb-settingsModal'));
            modal.show();
        }







        // Mobile touch support for components
        if ('ontouchstart' in window) {
            $('.wfb-component').each(function () {
                $(this).append('<div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>');
            });

            // Make mobile handles draggable
            $('.wfb-mobile-drag-handle').on('touchstart', function (e) {
                e.preventDefault();
                $(this).closest('.wfb-component').trigger('mousedown');
            });
        }

        // Make form fields sortable
        $('#wfb-formBuilder').sortable({
            // items: '.wfb-form-field, .wfb-container-wrapper',
            // handle: '.wfb-mobile-drag-handle, .wfb-container-actions',
            placeholder: 'wfb-sortable-placeholder',
            cursor: 'move',
            opacity: 0.7,
            tolerance: 'pointer',
            update: function (event, ui) {
                wfbUpdateFieldOrder();
            }
        });

        // Update field order when sorted
        function wfbUpdateFieldOrder() {
            // Clear existing fields
            const updatedFields = [];

            // Get all fields in current order
            $('#wfb-formBuilder').children().each(function () {
                const fieldId = $(this).data('field-id') || $(this).data('container-id');
                if (fieldId) {
                    // Find the field in our form data
                    const field = wfbFindFieldById(fieldId);
                    if (field) {
                        updatedFields.push(field);
                    }
                }
            });

            // Update form data with new order
            wfbFormData.fields = updatedFields;

            console.log(wfbFormData);



        }

        // Open container settings
        function wfbOpenContainerSettings() {
            $('#wfb-containerSettingsModal').modal('show');
        }

        // Apply container settings
        $('#wfb-applyContainerSettings').on('click', function (e) {

            e.preventDefault();


            const numColumns = parseInt($('#wfb-containerColumns').val());
            wfbAddContainer(numColumns);
            $('#wfb-containerSettingsModal').modal('hide');
        });

        // Update column widths UI when number of columns changes
        $('#wfb-containerColumns').on('change', function () {
            const numColumns = parseInt($(this).val());
            wfbUpdateColumnWidthsUI(numColumns);
        });

        // Initialize column widths UI
        function wfbUpdateColumnWidthsUI(numColumns) {
            const columnWidthsContainer = $('#wfb-columnWidths');
            columnWidthsContainer.empty();

            const defaultWidth = Math.floor(100 / numColumns);

            for (let i = 0; i < numColumns; i++) {
                columnWidthsContainer.append(`
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Column ${i + 1} Width (%)</label>
                                <input type="number" class="form-control wfb-column-width" value="${defaultWidth}" min="5" max="100">
                            </div>
                        `);
            }
        }

        // Initialize with 2 columns
        wfbUpdateColumnWidthsUI(2);

        // Find field by ID (including fields in containers)
        function wfbFindFieldById(fieldId) {
            for (const field of wfbFormData.fields) {
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





        // Generate settings form based on field type
        function wfbGenerateSettingsForm() {




            // Display tab content
            let displayHtml = `
            <div class="wfb-settings-card">
                <div class="wfb-settings-card-header">Basic Settings</div>
                <div class="wfb-settings-card-body">

                    <!-- Field Label -->
                    <div class="mb-3">
                        <label class="wfb-form-label-modern">
                            Field Label 
                            <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="This text will appear as the field label on your product page">
                                <i class="fas fa-question-circle"></i>
                            </span>
                        </label>
                        <input type="text" 
                            class="form-control wfb-form-control-modern" 
                            id="wfb-fieldLabel" 
                            value="${wfbCurrentSettings.label || ''}" 
                            placeholder="e.g., Engraving Text, Gift Message, Size Selection">
                    </div>

                
                    <!-- Required Field -->
                    <div class="mb-3">
                        <div class="form-checkbox">
                            <input class="form-check-input" 
                                type="checkbox" 
                                id="wfb-fieldRequired" 
                                ${wfbCurrentSettings.required ? 'checked' : ''}>
                            <label class="form-check-label" for="wfb-fieldRequired">
                                Required Field
                                <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Customer must fill this field before adding product to cart">
                                    <i class="fas fa-question-circle"></i>
                                </span>
                            </label>
                        </div>
                    </div>
        `;

            // Placeholder for text-like fields
            if (['text', 'email', 'textarea', 'number', 'url'].includes(wfbCurrentSettings.type)) {
                displayHtml += `
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        Placeholder Text
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Hint text that appears inside the field before customer types">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <input type="text" 
                        class="form-control wfb-form-control-modern" 
                        id="wfb-fieldPlaceholder" 
                        value="${wfbCurrentSettings.placeholder || ''}" 
                        placeholder="e.g., Enter your custom text here...">
                </div>
            `;
            }

            // Options for select, radio, or checkbox fields
            if (['select', 'radio', 'checkbox'].includes(wfbCurrentSettings.type)) {
                displayHtml += `
        <div class="mb-3">
            <label class="wfb-form-label-modern">
                Options with Pricing
                <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Add options with individual prices for each choice">
                    <i class="fas fa-question-circle"></i>
                </span>
            </label>
            <div id="wfb-options-container" class="border rounded p-3 bg-light">
                <div class="row mb-2 fw-bold small">
                    <div class="col-md-6">Option Name</div>
                    <div class="col-md-4">Additional Price</div>
                    <div class="col-md-2">Action</div>
                </div>
                <div id="wfb-options-list">
                    <!-- Options will be dynamically added here -->
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary mt-3" id="wfb-add-option">
                    <i class="fas fa-plus me-1"></i> Add New Option
                </button>
            </div>
            <div class="form-text mt-2">Each option can have an additional price that will be added to the product cost</div>
        </div>
    `;
            }



            // Default value (for all fields)
            displayHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">
                    Default Value
                    <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Pre-filled value that appears when product page loads">
                        <i class="fas fa-question-circle"></i>
                    </span>
                </label>
                <input type="text" 
                    class="form-control wfb-form-control-modern" 
                    id="wfb-fieldDefaultValue" 
                    value="${wfbCurrentSettings.defaultValue || ''}" 
                    placeholder="e.g., Standard, Yes, No, Default selection">
            </div>
        `;

            // Tooltip/help text
            displayHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">
                    Help / Tooltip Text
                    <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Additional information shown below the field to guide customers">
                        <i class="fas fa-question-circle"></i>
                    </span>
                </label>
                <textarea class="form-control wfb-form-control-modern" 
                    id="wfb-fieldHelpText" 
                    rows="2" 
                    placeholder="e.g., Maximum 50 characters allowed, Please choose your preferred option">${wfbCurrentSettings.helpText || ''}</textarea>
            </div>
        `;

            // Field Description
            displayHtml += `
            <div class="mb-3">
                <label class="wfb-form-label-modern">
                    Field Description
                    <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Detailed explanation shown below the field (supports HTML)">
                        <i class="fas fa-question-circle"></i>
                    </span>
                </label>
                <textarea class="form-control wfb-form-control-modern" 
                    id="wfb-fieldDescription" 
                    rows="3" 
                    placeholder="e.g., This text will be engraved on your product. Please check spelling carefully.">${wfbCurrentSettings.description || ''}</textarea>
            </div>
        `;

            // Optional price field (for premium later)
            displayHtml += `
            <div class="mb-3 row align-items-center">
                <div class="col-auto">
                    <div class="form-checkbox">
                        <input class="form-check-input" type="checkbox" id="wfb-fieldPriceEnable" ${wfbCurrentSettings.priceEnable ? 'checked' : ''}>
                        <label class="form-check-label" for="wfb-fieldPriceEnable">
                            Enable Extra Price
                            <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Add extra cost to product when this field is filled or selected">
                                <i class="fas fa-question-circle"></i>
                            </span>
                        </label>
                    </div>
                </div>
                <div class="col-auto">
                    <input type="number" 
                        class="form-control wfb-form-control-modern" 
                        id="wfb-fieldPrice" 
                        step="1" 
                        min="0" 
                        value="${wfbCurrentSettings.price || ''}" 
                        placeholder="0.00" 
                        >
                </div>
                <div class="col-auto d-flex align-items-center">
                    <span id="wfb-currencySymbol">${wfbCurrentSettings.currencySymbol || '$'}</span>
                </div>
            </div>
        `;

            displayHtml += `
            </div>
        </div>
    `;





            // Validation tab content
            let validationHtml = `
        <div class="wfb-settings-card">
            <div class="wfb-settings-card-header">Validation Rules</div>
            <div class="wfb-settings-card-body">
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        Minimum Length
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Minimum number of characters required">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <input type="number" class="form-control wfb-form-control-modern" id="wfb-fieldMin" value="${wfbCurrentSettings.validation.min || ''}" placeholder="e.g., 2">
                </div>
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        Maximum Length
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Maximum number of characters allowed">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <input type="number" class="form-control wfb-form-control-modern" id="wfb-fieldMax" value="${wfbCurrentSettings.validation.max || ''}" placeholder="e.g., 100">
                </div>
                
                <!-- Character Counter -->
                <div class="mb-3">
                    <div class="form-checkbox">
                        <input class="form-check-input" type="checkbox" id="wfb-fieldCharCounter" ${wfbCurrentSettings.charCounter ? 'checked' : ''}>
                        <label class="form-check-label" for="wfb-fieldCharCounter">
                            Show Character Counter
                            <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Display remaining character count for text fields">
                                <i class="fas fa-question-circle"></i>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        Validation Pattern (Regex)
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Advanced: Use regular expressions for custom validation">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <input type="text" class="form-control wfb-form-control-modern" id="wfb-fieldPattern" value="${wfbCurrentSettings.validation.pattern || ''}" placeholder="e.g., ^[A-Za-z ]+$ (letters only)">
                </div>
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        Custom Error Message
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Custom message shown when validation fails">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <input type="text" class="form-control wfb-form-control-modern" id="wfb-fieldErrorMessage" value="${wfbCurrentSettings.validation.errorMessage || ''}" placeholder="e.g., Please enter a valid value">
                </div>
            </div>
        </div>
    `;

            // Conditions tab content
            let conditionsHtml = `
        <div class="wfb-settings-card">
            <div class="wfb-settings-card-header">Conditional Logic</div>
            <div class="wfb-settings-card-body">
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        Action
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="What should happen when conditions are met">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <select class="form-select wfb-form-control-modern" id="wfb-conditionAction">
                        <option value="show" ${wfbCurrentSettings.conditions.action === 'show' ? 'selected' : ''}>Show this field</option>
                        <option value="hide" ${wfbCurrentSettings.conditions.action === 'hide' ? 'selected' : ''}>Hide this field</option>
                        <option value="enable" ${wfbCurrentSettings.conditions.action === 'enable' ? 'selected' : ''}>Enable this field</option>
                        <option value="disable" ${wfbCurrentSettings.conditions.action === 'disable' ? 'selected' : ''}>Disable this field</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        Logic
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="How multiple conditions should be evaluated">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <select class="form-select wfb-form-control-modern" id="wfb-conditionLogic">
                        <option value="all" ${wfbCurrentSettings.conditions.logic === 'all' ? 'selected' : ''}>All conditions must be met</option>
                        <option value="any" ${wfbCurrentSettings.conditions.logic === 'any' ? 'selected' : ''}>Any condition must be met</option>
                    </select>
                </div>
                <div class="mb-3">
                    <button class="btn wfb-btn-modern btn-outline-primary" id="wfb-addConditionRule">
                        <i class="fas fa-plus me-1"></i> Add Condition
                    </button>
                </div>
                <div id="wfb-conditionRules">
    `;

            // Add existing condition rules
            if (wfbCurrentSettings.conditions.rules && wfbCurrentSettings.conditions.rules.length) {
                wfbCurrentSettings.conditions.rules.forEach((rule, index) => {
                    conditionsHtml += `
                <div class="wfb-condition-rule" data-index="${index}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong>Condition ${index + 1}</strong>
                        <span class="wfb-remove-condition"><i class="fas fa-times"></i></span>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-2">
                                <label class="form-label">Field</label>
                                <select class="form-select wfb-condition-field">
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-2">
                                <label class="form-label">Operator</label>
                                <select class="form-select wfb-condition-operator">
                                    <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>Equals</option>
                                    <option value="not_equals" ${rule.operator === 'not_equals' ? 'selected' : ''}>Not Equals</option>
                                    <option value="contains" ${rule.operator === 'contains' ? 'selected' : ''}>Contains</option>
                                    <option value="greater_than" ${rule.operator === 'greater_than' ? 'selected' : ''}>Greater Than</option>
                                    <option value="less_than" ${rule.operator === 'less_than' ? 'selected' : ''}>Less Than</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Value</label>
                        <input type="text" class="form-control wfb-condition-value" value="${rule.value || ''}">
                    </div>
                </div>
            `;
                });
            }

            conditionsHtml += `</div></div></div>`;

            // Advanced tab content
            let advancedHtml = `
        <div class="wfb-settings-card">
            <div class="wfb-settings-card-header">Advanced Settings</div>
            <div class="wfb-settings-card-body">
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        CSS Class
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Add custom CSS classes for styling">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <input type="text" class="form-control wfb-form-control-modern" id="wfb-fieldClassName" value="${wfbCurrentSettings.className || ''}" placeholder="e.g., custom-field premium-option">
                </div>
                
                <!-- Field ID -->
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        Field ID
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Unique identifier for this field (letters, numbers, underscore only)">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <input type="text" class="form-control wfb-form-control-modern" id="wfb-fieldId" value="${wfbCurrentSettings.fieldId || ''}" placeholder="e.g., custom_engraving, gift_message">
                </div>
                
                <!-- Field Visibility -->
                <div class="mb-3">
                    <label class="wfb-form-label-modern">
                        Field Visibility
                        <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Control where this field is displayed">
                            <i class="fas fa-question-circle"></i>
                        </span>
                    </label>
                    <select class="form-select wfb-form-control-modern" id="wfb-fieldVisibility">
                        <option value="everywhere" ${wfbCurrentSettings.visibility === 'everywhere' ? 'selected' : ''}>Everywhere (Product, Cart, Checkout)</option>
                        <option value="product_only" ${wfbCurrentSettings.visibility === 'product_only' ? 'selected' : ''}>Product Page Only</option>
                        <option value="cart_checkout" ${wfbCurrentSettings.visibility === 'cart_checkout' ? 'selected' : ''}>Cart & Checkout Only</option>
                    </select>
                </div>
                
                <!-- Admin Only -->
                <div class="mb-3">
                    <div class="form-checkbox">
                        <input class="form-check-input" type="checkbox" id="wfb-fieldAdminOnly" ${wfbCurrentSettings.adminOnly ? 'checked' : ''}>
                        <label class="form-check-label" for="wfb-fieldAdminOnly">
                            Admin Only Field
                            <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="This field will only be visible to administrators">
                                <i class="fas fa-question-circle"></i>
                            </span>
                        </label>
                    </div>
                </div>
                
                <!-- Meta Data -->
                <div class="mb-3">
                    <div class="form-checkbox">
                        <input class="form-check-input" type="checkbox" id="wfb-fieldSaveMeta" ${wfbCurrentSettings.saveMeta ? 'checked' : ''}>
                        <label class="form-check-label" for="wfb-fieldSaveMeta">
                            Save as Order Meta Data
                            <span class="wfb-tooltip-hint" data-bs-toggle="tooltip" title="Store this field value in order metadata for reference">
                                <i class="fas fa-question-circle"></i>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;

            $('#wfb-display').html(displayHtml);
            $('#wfb-validation').html(validationHtml);
            $('#wfb-conditions').html(conditionsHtml);
            $('#wfb-advanced').html(advancedHtml);

            // Initialize tooltips
            $('[data-bs-toggle="tooltip"]').tooltip();

            // Initialize condition rules functionality
            wfbInitConditionRules();

            // Initialize options if field type supports them
            if (['select', 'radio', 'checkbox'].includes(wfbCurrentSettings.type)) {
                initializeOptions();
            }
        }




        // Initialize options when settings form is generated
        function initializeOptions() {
            const $optionsList = $('#wfb-options-list');
            $optionsList.empty();

            // Check if we have existing options
            if (wfbCurrentSettings.options && wfbCurrentSettings.options.length > 0) {
                // Load existing options
                wfbCurrentSettings.options.forEach((option, index) => {
                    addOptionRow(option.label, option.price, index);
                });
            } else {
                // Add two default empty rows
                addOptionRow('Small', 0, 0);
                addOptionRow('Medium', 5.00, 1);
            }

            // Handle add new option button
            $('#wfb-add-option').off('click').on('click', function () {
                addOptionRow('', 0, $('.wfb-option-row').length);
            });
        }



        // Function to add a new option row
        function addOptionRow(name = '', price = 0, index = 0) {
            const $optionsList = $('#wfb-options-list');
            const rowId = 'option_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            const optionHtml = `
                <div class="row mb-2 wfb-option-row align-items-center" data-row-id="${rowId}">
                    <div class="col-md-6">
                        <input type="text" 
                            class="form-control form-control-sm wfb-option-name" 
                            placeholder="e.g., Small, Red, Gold Plating" 
                            value="${name}">
                    </div>
                    <div class="col-md-4">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text">${wfbCurrentSettings.currencySymbol || '$'}</span>
                            <input type="number" 
                                class="form-control wfb-option-price" 
                                placeholder="0.00" 
                                step="0.01" 
                                min="0" 
                                value="${price}">
                        </div>
                    </div>
                    <div class="col-md-2">
                        <button type="button" class="btn btn-sm btn-outline-danger wfb-remove-option" ${$('.wfb-option-row').length <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;

            $optionsList.append(optionHtml);

            // Handle remove button click
            $(`.wfb-option-row[data-row-id="${rowId}"] .wfb-remove-option`).off('click').on('click', function () {
                if ($('.wfb-option-row').length > 1) {
                    $(this).closest('.wfb-option-row').remove();
                    updateRemoveButtonStates();
                }
            });

            updateRemoveButtonStates();
        }

        // Update remove button states based on row count
        function updateRemoveButtonStates() {
            const $removeButtons = $('.wfb-remove-option');
            if ($removeButtons.length <= 1) {
                $removeButtons.prop('disabled', true);
            } else {
                $removeButtons.prop('disabled', false);
            }
        }

        // Collect options data before saving
        function collectOptionsData() {
            const options = [];
            let hasEmptyOptions = false;

            $('.wfb-option-row').each(function (index) {
                const $row = $(this);
                const optionName = $row.find('.wfb-option-name').val().trim();
                const optionPrice = parseFloat($row.find('.wfb-option-price').val()) || 0;

                if (optionName) {
                    options.push({
                        label: optionName,
                        price: optionPrice,
                        value: optionName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                        isDefault: index === 0 // First option as default
                    });
                } else {
                    hasEmptyOptions = true;
                }
            });

            // Show warning if there are empty options
            if (hasEmptyOptions && options.length > 0) {
                console.log('Some options without names were ignored');
            }

            // If no valid options, create defaults
            if (options.length === 0) {
                options.push(
                    { label: 'Option 1', price: 0, value: 'option_1', isDefault: true },
                    { label: 'Option 2', price: 0, value: 'option_2', isDefault: false }
                );
            }

            return options;
        }









        // Add CSS for tooltip hints
        function wfbAddTooltipStyles() {
            const css = `
                .wfb-tooltip-hint {
                    color: #6c757d;
                    margin-left: 5px;
                    cursor: help;
                }
                .wfb-tooltip-hint:hover {
                    color: #495057;
                }
                .wfb-form-control-modern:focus {
                    border-color: #007cba;
                    box-shadow: 0 0 0 1px #007cba;
                }
                .form-text {
                    font-size: 0.875em;
                    color: #6c757d;
                    margin-top: 0.25rem;
                }
            `;
                    $('head').append(`<style>${css}</style>`);
                }

        // Initialize when document is ready
        $(document).ready(function () {
            wfbAddTooltipStyles();
        });

        // Close settings panel
        $('#wfb-closeSettings, #wfb-settingsOverlay').on('click', function (e) {

            e.preventDefault();


            $('#wfb-settingsPanel').removeClass('open');
            $('#wfb-settingsOverlay').removeClass('active');
        });



        // Apply settings
        $('#wfb-applySettings').on('click', function (e) {



            e.preventDefault();


            console.log(wfbCurrentSettings);


            /** -----------------------------
             *  BASIC SETTINGS
             * ----------------------------- */
            wfbCurrentSettings.label = $('#wfb-fieldLabel').val();
            wfbCurrentSettings.required = $('#wfb-fieldRequired').is(':checked');
            wfbCurrentSettings.placeholder = $('#wfb-fieldPlaceholder').val() || '';
            wfbCurrentSettings.className = $('#wfb-fieldClassName').val() || '';

            /** -----------------------------
             *  VALIDATION SETTINGS
             * ----------------------------- */
            wfbCurrentSettings.validation.min = $('#wfb-fieldMin').val() || '';
            wfbCurrentSettings.validation.max = $('#wfb-fieldMax').val() || '';
            wfbCurrentSettings.validation.pattern = $('#wfb-fieldPattern').val() || '';
            wfbCurrentSettings.validation.errorMessage = $('#wfb-fieldErrorMessage').val() || '';

            /** -----------------------------
             *  CONDITIONAL LOGIC
             * ----------------------------- */
            wfbCurrentSettings.conditions.action = $('#wfb-conditionAction').val();
            wfbCurrentSettings.conditions.logic = $('#wfb-conditionLogic').val();

            /** -----------------------------
             *  ADVANCED SETTINGS
             * ----------------------------- */
            wfbCurrentSettings.advanced.defaultValue = $('#wfb-fieldDefaultValue').val() || '';
            wfbCurrentSettings.advanced.helpText = $('#wfb-fieldHelpText').val() || '';

            /** -----------------------------
             *  DISPLAY TAB SETTINGS
             * ----------------------------- */
            wfbCurrentSettings.defaultValue = $('#wfb-fieldDefaultValue').val() || '';
            wfbCurrentSettings.helpText = $('#wfb-fieldHelpText').val() || '';
            wfbCurrentSettings.price = $('#wfb-fieldPrice').val() || '';

            /** -----------------------------
             *  SELECT/RADIO/CHECKBOX OPTIONS
             * ----------------------------- */
            // if (['select', 'radio', 'checkbox'].includes(wfbCurrentSettings.type)) {
            //     const optionsText = $('#wfb-fieldOptions').val();
            //     wfbCurrentSettings.options = optionsText
            //         ? optionsText.split('\n').map(opt => opt.trim()).filter(Boolean)
            //         : ['Option 1', 'Option 2', 'Option 3'];
            // }

            // In your apply settings function, replace the options section with:
            if (['select', 'radio', 'checkbox'].includes(wfbCurrentSettings.type)) {
                wfbCurrentSettings.options = collectOptionsData();
            }




            /** -----------------------------
             *  UPDATE LIVE PREVIEW IN BUILDER
             * ----------------------------- */
            const $field = $(`.wfb-form-field[data-field-id="${wfbCurrentSettings.id}"]`);




            if ($field.length) {
                // Label + optional price
                let labelText = wfbCurrentSettings.label || 'Untitled Field';


                if (wfbCurrentSettings.price) {
                    labelText += ` <span class="text-muted fw-normal">(+${wfbCurrentSettings.price})</span>`;
                }
                if (wfbCurrentSettings.required) labelText += ' *';
                $field.find('label').html(labelText);

                console.log(labelText);


                // Input or textarea
                const $input = $field.find('input, textarea');
                if ($input.length) {
                    $input.attr('placeholder', wfbCurrentSettings.placeholder || '');
                    $input.val(wfbCurrentSettings.defaultValue || '');
                }

                // Help / tooltip text (below input)
                $field.find('.wfb-help-text').remove(); // clean old
                if (wfbCurrentSettings.helpText) {
                    $input.after(`<small class="wfb-help-text text-muted">${wfbCurrentSettings.helpText}</small>`);
                }
            }

            /** -----------------------------
             *  SAVE OR UPDATE FIELD
             * ----------------------------- */
            if (wfbIsEditMode) {
                wfbUpdateField(wfbCurrentSettings);
            } else {
                wfbAddField(wfbCurrentSettings);
            }

            /** -----------------------------
             *  CLOSE MODAL CLEANLY
             * ----------------------------- */
            const modalEl = document.getElementById('wfb-settingsModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
        });










        // Function to add a field
        function wfbAddField(settings) {
            // Add to form data
            if (settings.columnId) {
                // Find the container and add to the specific column
                for (const field of wfbFormData.fields) {
                    if (field.type === 'container' && field.columns) {
                        for (const column of field.columns) {
                            if (column.id === settings.columnId) {
                                if (!column.fields) column.fields = [];
                                column.fields.push(settings);
                                break;
                            }
                        }
                    }
                }
            } else {
                // Add to main form data
                wfbFormData.fields.push(settings);
            }

            // Generate field HTML
            const fieldHtml = wfbGenerateFieldHtml(settings);

            // Add to form builder area
            if (settings.columnId) {
                // Add to specific column
                $(`[data-column-id="${settings.columnId}"] .wfb-column-drop-zone`).append(fieldHtml);

                // Update column field count
                const column = $(`[data-column-id="${settings.columnId}"]`);
                const badge = column.find('.badge');
                const currentCount = parseInt(badge.text());
                badge.text(currentCount + 1 + ' fields');
            } else {
                // Add to main area
                if ($('#wfb-formBuilder .wfb-container-placeholder').length) {
                    $('#wfb-formBuilder .wfb-container-placeholder').remove();
                }

                // Insert at the correct position if we have a drop position
                if (wfbDropPosition && wfbDropPosition.index !== undefined) {
                    if (wfbDropPosition.index >= $('#wfb-formBuilder').children().length) {
                        $('#wfb-formBuilder').append(fieldHtml);
                    } else {
                        $(`#wfb-formBuilder > *:eq(${wfbDropPosition.index})`).before(fieldHtml);
                    }
                } else {
                    $('#wfb-formBuilder').append(fieldHtml);
                }
            }

            // Initialize tooltips for new fields
            $('[data-bs-toggle="tooltip"]').tooltip();

            // Make the field sortable
            $('#wfb-formBuilder').sortable('refresh');
        }

        // Function to update a field
        function wfbUpdateField(settings) {
            // Update in form data
            if (settings.columnId) {
                // Find the field in container columns
                for (const field of wfbFormData.fields) {
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
            } else {
                // Update in main form data
                const index = wfbFormData.fields.findIndex(field => field.id === settings.id);
                if (index !== -1) {
                    wfbFormData.fields[index] = settings;
                }
            }

            // Update in UI
            const fieldHtml = wfbGenerateFieldHtml(settings);
            $(`[data-field-id="${settings.id}"]`).replaceWith(fieldHtml);

            // Initialize tooltips for updated field
            $('[data-bs-toggle="tooltip"]').tooltip();
        }








        // Function to generate field HTML
        function wfbGenerateFieldHtml(settings) {
            let fieldHtml = '';
            const fieldId = settings.id;

            // Helper: generate help text and price if available
            const helpTextHtml = settings.helpText
                ? `<small class="text-muted d-block mt-1">${settings.helpText}</small>`
                : '';

            const priceHtml = settings.price
                ? `<div class="text-success small mt-1"><i class="fas fa-tag"></i> +${settings.price}</div>`
                : '';

            const defaultValue = settings.defaultValue || '';

            switch (settings.type) {
                case 'text':
                case 'email':
                case 'number':
                case 'date':
                case 'password':
                    fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label">
                        ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}
                    </label>
                    <input type="${settings.type}" class="form-control" 
                        placeholder="${settings.placeholder || ''}" 
                        value="${defaultValue}">
                    ${helpTextHtml}
                    ${priceHtml}
                    ${getFieldActionsHtml()}
                </div>
            `;
                    break;

                case 'textarea':
                    fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label">
                        ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}
                    </label>
                    <textarea class="form-control" rows="3" placeholder="${settings.placeholder || ''}">${defaultValue}</textarea>
                    ${helpTextHtml}
                    ${priceHtml}
                    ${getFieldActionsHtml()}
                </div>
            `;
                    break;

                case 'select':
                    let optionsHtml = '';
                    if (settings.options && settings.options.length) {
                        settings.options.forEach(option => {
                            const selected = option === defaultValue ? 'selected' : '';
                            optionsHtml += `<option value="${option}" ${selected}>${option}</option>`;
                        });
                    }

                    fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label">
                        ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}
                    </label>
                    <select class="form-select">
                        <option value="">Please select</option>
                        ${optionsHtml}
                    </select>
                    ${helpTextHtml}
                    ${priceHtml}
                    ${getFieldActionsHtml()}
                </div>
            `;
                    break;

                case 'checkbox':
                    fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <div class="form-checkbox">
                        <input class="form-check-input" type="checkbox" id="${fieldId}" ${defaultValue ? 'checked' : ''}>
                        <label class="form-check-label" for="${fieldId}">
                            ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}
                        </label>
                    </div>
                    ${helpTextHtml}
                    ${priceHtml}
                    ${getFieldActionsHtml()}
                </div>
            `;
                    break;

                case 'radio':
                    let radiosHtml = '';
                    if (settings.options && settings.options.length) {
                        settings.options.forEach((option, index) => {
                            const checked = option === defaultValue ? 'checked' : '';
                            radiosHtml += `
                        <div class="form-checkbox">
                            <input class="form-check-input" type="radio" name="${fieldId}-group" id="${fieldId}-${index}" ${checked}>
                            <label class="form-check-label" for="${fieldId}-${index}">${option}</label>
                        </div>
                    `;
                        });
                    } else {
                        radiosHtml = `
                    <div class="form-checkbox">
                        <input class="form-check-input" type="radio" name="${fieldId}-group" id="${fieldId}-1">
                        <label class="form-check-label" for="${fieldId}-1">Option 1</label>
                    </div>
                    <div class="form-checkbox">
                        <input class="form-check-input" type="radio" name="${fieldId}-group" id="${fieldId}-2">
                        <label class="form-check-label" for="${fieldId}-2">Option 2</label>
                    </div>`;
                    }

                    fieldHtml = `
                <div class="wfb-form-field" data-field-id="${fieldId}">
                    <div class="wfb-mobile-drag-handle"><i class="fas fa-grip-lines"></i></div>
                    <label class="form-label">
                        ${settings.label}${settings.required ? ' <span class="text-danger">*</span>' : ''}
                    </label>
                    ${radiosHtml}
                    ${helpTextHtml}
                    ${priceHtml}
                    ${getFieldActionsHtml()}
                </div>
            `;
                    break;
            }

            return fieldHtml;
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




        // Function to add a container
        function wfbAddContainer(numColumns = 2) {
            const containerId = 'wfb-container-' + Date.now();
            wfbCurrentContainerId = containerId;

            // Get column widths
            const columnWidths = [];
            $('.wfb-column-width').each(function () {
                columnWidths.push(parseInt($(this).val()));
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
            const containerHtml = `
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
                                    <div class="col-md-${12 / numColumns}" style="position: relative;">
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

            // Remove placeholder if it exists
            if ($('#wfb-formBuilder .wfb-container-placeholder').length) {
                $('#wfb-formBuilder .wfb-container-placeholder').remove();
            }

            // Insert at the correct position if we have a drop position
            if (wfbDropPosition && wfbDropPosition.index !== undefined) {
                if (wfbDropPosition.index >= $('#wfb-formBuilder').children().length) {
                    $('#wfb-formBuilder').append(containerHtml);
                } else {
                    $(`#wfb-formBuilder > *:eq(${wfbDropPosition.index})`).before(containerHtml);
                }
            } else {
                $('#wfb-formBuilder').append(containerHtml);
            }

            // Make columns droppable
            $('.wfb-column-drop-zone').droppable({
                accept: '.wfb-component',
                hoverClass: 'active',
                drop: function (event, ui) {
                    const componentType = ui.draggable.data('type');
                    if (componentType !== 'container') {
                        wfbOpenSettingsPanel(componentType, null, $(this).closest('.wfb-column').data('column-id'));
                    }
                }
            });

            // Initialize column resize handles
            $('.wfb-column-resize-handle').on('mousedown', function (e) {
                e.preventDefault();
                const column = $(this).closest('.wfb-column');
                const columnId = column.data('column-id');
                const startX = e.pageX;
                const startWidth = column.width();

                $(document).on('mousemove.wfb-resize', function (e) {
                    const newWidth = startWidth + (e.pageX - startX);
                    column.width(newWidth);
                });

                $(document).on('mouseup.wfb-resize', function () {
                    $(document).off('mousemove.wfb-resize');
                    $(document).off('mouseup.wfb-resize');

                    // Update the column width in form data
                    for (const field of wfbFormData.fields) {
                        if (field.type === 'container' && field.id === wfbCurrentContainerId) {
                            for (const col of field.columns) {
                                if (col.id === columnId) {
                                    col.width = column.width();
                                    break;
                                }
                            }
                            break;
                        }
                    }
                });
            });

            // Add container to form data
            wfbFormData.fields.push({
                id: containerId,
                type: 'container',
                columns: columns
            });




            // Make the container sortable
            $('#wfb-formBuilder').sortable('refresh');
        }

        // Remove field
        $(document).on('click', '.wfb-remove-field', function (e) {

            e.preventDefault();




            const fieldId = $(this).closest('.wfb-form-field').data('field-id');
            const fieldElement = $(this).closest('.wfb-form-field');
            const columnElement = fieldElement.closest('.wfb-column');

            // Remove from form data
            if (columnElement.length) {
                // Field is in a column
                const columnId = columnElement.data('column-id');
                for (const field of wfbFormData.fields) {
                    if (field.type === 'container' && field.columns) {
                        for (const column of field.columns) {
                            if (column.id === columnId && column.fields) {
                                column.fields = column.fields.filter(f => f.id !== fieldId);

                                // Update column field count
                                const badge = columnElement.find('.badge');
                                const currentCount = parseInt(badge.text());
                                badge.text(currentCount - 1 + ' fields');
                                break;
                            }
                        }
                    }
                }
            } else {
                // Field is in main area
                wfbFormData.fields = wfbFormData.fields.filter(field => field.id !== fieldId);
            }

            fieldElement.remove();

            // Add placeholder if no components left
            if ($('#wfb-formBuilder').children().length === 0) {
                $('#wfb-formBuilder').html(`
                            <div class="wfb-container-placeholder highlight" id="wfb-initialPlaceholder">
                                <i class="fas fa-hand-point-left fa-2x mb-2"></i>
                                <h5>Drag components from the sidebar to start building your form</h5>
                                <p class="mb-0">Drop fields in the highlighted area to add them to your form</p>
                            </div>
                        `);
            }
        });

        // Remove container
        $(document).on('click', '.wfb-remove-container', function (e) {


            e.preventDefault();


            const containerId = $(this).closest('.wfb-container-wrapper').data('container-id');
            $(this).closest('.wfb-container-wrapper').remove();

            // Remove from form data
            wfbFormData.fields = wfbFormData.fields.filter(field => field.id !== containerId);

            // Add placeholder if no components left
            if ($('#wfb-formBuilder').children().length === 0) {
                $('#wfb-formBuilder').html(`
                            <div class="wfb-container-placeholder highlight" id="wfb-initialPlaceholder">
                                <i class="fas fa-hand-point-left fa-2x mb-2"></i>
                                <h5>Drag components from the sidebar to start building your form</h5>
                                <p class="mb-0">Drop fields in the highlighted area to add them to your form</p>
                            </div>
                        `);
            }
        });

        // Edit field
        $(document).on('click', '.wfb-edit-field', function (e) {


            e.preventDefault();



            const fieldId = $(this).closest('.wfb-form-field').data('field-id');
            const fieldData = wfbFindFieldById(fieldId);

            if (fieldData) {
                wfbOpenSettingsPanel(fieldData.type, fieldData.id, fieldData.columnId);
            }
        });

        // Duplicate field
        $(document).on('click', '.wfb-duplicate-field', function (e) {

            e.preventDefault();


            const fieldId = $(this).closest('.wfb-form-field').data('field-id');
            const fieldData = wfbFindFieldById(fieldId);

            if (fieldData) {
                // Create a deep copy
                const duplicatedField = $.extend(true, {}, fieldData);
                duplicatedField.id = 'wfb-field-' + Date.now();
                duplicatedField.label = duplicatedField.label + ' (Copy)';

                // Add to form
                wfbAddField(duplicatedField);
            }
        });

        // Initialize condition rules functionality
        function wfbInitConditionRules() {
            // Add condition rule
            $('#wfb-addConditionRule').on('click', function (e) {
                e.preventDefault();


                if (!wfbCurrentSettings.conditions.rules) {
                    wfbCurrentSettings.conditions.rules = [];
                }

                const newRule = {
                    field: '',
                    operator: 'equals',
                    value: ''
                };

                wfbCurrentSettings.conditions.rules.push(newRule);


                wfbGenerateSettingsForm(); // Regenerate form to show new rule
            });

            // Remove condition rule
            $(document).on('click', '.wfb-remove-condition', function (e) {

                e.preventDefault();


                const index = $(this).closest('.wfb-condition-rule').data('index');
                wfbCurrentSettings.conditions.rules.splice(index, 1);
                wfbGenerateSettingsForm(); // Regenerate form
            });
        }

        // Preview form
        $('#wfb-previewBtn').on('click', function (e) {


            e.preventDefault();


            wfbGenerateFormPreview();



            $('#wfb-previewModal').modal('show');
        });



        // Export JSON
        $('#wfb-exportBtn').on('click', function (e) {

            e.preventDefault();


            $('#wfb-jsonOutput').text(JSON.stringify(wfbFormData, null, 2));
            $('#wfb-jsonModal').modal('show');
        });

        // Copy JSON to clipboard
        $('#wfb-copyJsonBtn').on('click', function (e) {

            e.preventDefault();


            const jsonText = JSON.stringify(wfbFormData, null, 2);

            navigator.clipboard.writeText(jsonText).then(function () {
                alert('JSON copied to clipboard!');
            });
        });




        // form preview generation
        function wfbGenerateFormPreview() {



            console.log(wfbFormData);


            let previewHtml = '<form class="p-3">';
            // Check if we have any fields
            if (!wfbFormData.fields || wfbFormData.fields.length === 0) {
                previewHtml += '<div class="alert alert-info">No fields in the form yet. Add some fields first.</div>';
            } else {
                // Only show fields that are actually in the form builder
                wfbFormData.fields.forEach(field => {
                    if (!field) return; // Skip undefined fields

                    if (field.type === 'container') {
                        previewHtml += `<div class="container border p-3 mb-3">`;
                        previewHtml += `<h5>Container</h5>`;
                        previewHtml += `<div class="row">`;

                        if (field.columns && field.columns.length) {
                            field.columns.forEach(column => {
                                const colWidth = column.width || Math.floor(100 / field.columns.length);
                                previewHtml += `<div class="col-md-${12 / field.columns.length}" style="flex: 0 0 ${colWidth}%; max-width: ${colWidth}%;">`;
                                if (column.fields && column.fields.length > 0) {
                                    column.fields.forEach(subField => {
                                        if (subField) { // Check if subField exists
                                            previewHtml += wfbGenerateFieldPreview(subField);
                                        }
                                    });
                                } else {
                                    previewHtml += '<p class="text-muted">No fields in this column</p>';
                                }
                                previewHtml += `</div>`;
                            });
                        } else {
                            previewHtml += '<div class="col-12"><p class="text-muted">No columns in this container</p></div>';
                        }

                        previewHtml += `</div></div>`;
                    } else {
                        previewHtml += wfbGenerateFieldPreview(field);
                    }
                });
            }
            previewHtml += '<button type="submit" class="btn btn-primary mt-3">Submit Form</button>';
            previewHtml += '</form>';


            $('#wfb-formPreview').html(previewHtml);


            // Prevent Enter from submitting the preview form
            $('#wfb-previewForm').on('keydown', 'input, textarea', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            });
        }











        // Fixed wfbGenerateFieldPreview function
        function wfbGenerateFieldPreview(field) {
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

        // Search functionality
        $('#wfb-searchComponents').on('keyup', function () {
            const searchText = $(this).val().toLowerCase();

            $('.wfb-component').each(function () {
                const componentText = $(this).text().toLowerCase();
                if (componentText.includes(searchText)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        });







        function saveFormData(callback) {
            const formDataJSON = JSON.stringify({ fields: wfbFormData.fields });
            $('#ppxo_form_data').val(formDataJSON);

            // Disable the save button if exists
            const $btn = $('#wfb-saveFormBtn');
            const originalHTML = $btn.html();
            $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...');

            $.ajax({
                url: ppxo_admin.ajax_url,
                type: 'POST',
                data: {
                    action: 'ppxo_save_form',
                    nonce: ppxo_admin.nonce,
                    post_id: ppxo_admin.post_id,
                    form_data: formDataJSON
                },
                success: function (response) {
                    if (response.success) {
                        // // Show success message
                        // if ($('#wfb-successMsg').length === 0) {
                        //     $('.wfb-main-content').prepend(`
                        //     <div id="wfb-successMsg" class="alert alert-success position-relative mb-3 shadow-sm w-100 text-center" style="display:none; z-index:9999;">
                        //         ✅ Form saved successfully!
                        //     </div>
                        // `);
                        // }
                        $('#wfb-successMsg').stop(true, true).fadeIn(400).delay(2000).fadeOut(600);
                    } else {
                        alert('Error saving form: ' + (response.data.message || 'Unknown error'));
                    }
                },
                error: function (xhr, status, error) {
                    console.error("AJAX error:", error, "Status:", status);
                    console.error("XHR response:", xhr.responseText);
                    alert('Error saving form. Check console.');
                },
                complete: function () {
                    $btn.prop('disabled', false).html(originalHTML);
                    if (typeof callback === 'function') callback();
                }
            });
        }

        // Handle custom save button
        $('#wfb-saveFormBtn').on('click', function (e) {
            e.preventDefault();
            saveFormData();
        });

        // Intercept WP publish/update button
        $('#publish').on('click', function (e) {
            e.preventDefault();

            const $wpBtn = $(this);
            const originalText = $wpBtn.val() || $wpBtn.text();

            // Show loading state on WP button
            $wpBtn.prop('disabled', true).val('Saving form...');

            saveFormData(function () {
                // After form saved, trigger original WordPress publish
                $wpBtn.prop('disabled', false).trigger('click.wp-custom-save');
            });
        });

        // Avoid infinite loop when triggering click
        $('#publish').on('click.wp-custom-save', function (e) {
            e.stopPropagation();
        });


        // Load saved form if exists
        const savedData = $('#ppxo_form_data').val();

        if (savedData) {
            try {
                wfbFormData = JSON.parse(savedData);



                console.log("Loaded form data from hidden field:", wfbFormData);


                // ✅ Reset fields array
                let rebuiltFields = [];
                // Rebuild form from saved data
                if (Array.isArray(wfbFormData.fields) && wfbFormData.fields.length > 0) {
                    wfbFormData.fields.forEach(field => {
                        if (field.type === 'container') {
                            wfbRebuildContainer(field);
                        } else {
                            wfbAddField(field);
                        }
                        rebuiltFields.push(field);
                    });
                }

                // ✅ Replace with clean rebuilt list
                wfbFormData.fields = rebuiltFields;


                console.log(wfbFormData);


                // ✅ If nothing was rebuilt, show default placeholder
                if (wfbFormData.fields.length === 0) {
                    $('#wfb-formBuilder').html(`
                <div class="wfb-container-placeholder highlight" id="wfb-initialPlaceholder">
                    <i class="fas fa-hand-point-left fa-2x mb-2"></i>
                    <h5>Drag components from the sidebar to start building your form</h5>
                    <p class="mb-0">Drop fields in the highlighted area to add them to your form</p>
                </div>
            `);
                }
            } catch (e) {
                console.error('Error parsing form data:', e);
            }
        }

        // Also try to load from localStorage as backup
        try {
            const localStorageData = localStorage.getItem('wfbFormBuilderData');
            if (localStorageData) {
                const parsedData = JSON.parse(localStorageData);
                console.log("Loaded form data from localStorage:", parsedData);

                // Only use localStorage data if no data from hidden field
                if (!savedData && parsedData.fields && parsedData.fields.length > 0) {
                    wfbFormData = parsedData;

                    // Rebuild the form
                    $('#wfb-formBuilder').empty();
                    let rebuiltFields = [];

                    wfbFormData.fields.forEach(field => {
                        if (field.type === 'container') {
                            wfbRebuildContainer(field);
                        } else {
                            wfbAddField(field);
                        }
                        rebuiltFields.push(field);
                    });

                    wfbFormData.fields = rebuiltFields;
                }
            }
        } catch (e) {
            console.error('Error parsing localStorage data:', e);
        }


        // Rebuild container from saved data
        function wfbRebuildContainer(containerData) {
            const containerId = containerData.id;
            wfbCurrentContainerId = containerId;

            // Generate container HTML
            const containerHtml = `
                        <div class="wfb-container-wrapper" data-container-id="${containerId}">
                            <div class="wfb-container-actions">
                                <button class="btn btn-sm btn-outline-secondary wfb-edit-container" data-bs-toggle="tooltip" title="Edit Container">
                                    <i class="fas fa-cog"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-info wfb-add-column" data-bs-toggle="tooltip" title="Add Column">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger wfb-remove-container" data-bs-toggle="tooltip" title="Remove Container">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5><i class="fas fa-columns me-2"></i>Container</h5>
                            </div>
                            <div class="row">
                                ${containerData.columns.map((column, index) => `
                                    <div class="col-md-${12 / containerData.columns.length}" style="position: relative; flex: 0 0 ${column.width}%; max-width: ${column.width}%;">
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
                                                <span class="badge bg-primary">${column.fields ? column.fields.length : 0} fields</span>
                                            </div>
                                            <div class="wfb-column-drop-zone">
                                                ${column.fields && column.fields.length ? '' : `
                                                    <div class="wfb-form-field-placeholder">
                                                        <i class="fas fa-arrow-down"></i>
                                                        <p>Drop fields here</p>
                                                    </div>
                                                `}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;

            // Remove placeholder if it exists
            if ($('#wfb-formBuilder .wfb-container-placeholder').length) {
                $('#wfb-formBuilder .wfb-container-placeholder').remove();
            }

            $('#wfb-formBuilder').append(containerHtml);

            // Make columns droppable
            $('.wfb-column-drop-zone').droppable({
                accept: '.wfb-component',
                hoverClass: 'active',
                drop: function (event, ui) {
                    const componentType = ui.draggable.data('type');
                    if (componentType !== 'container') {
                        wfbOpenSettingsPanel(componentType, null, $(this).closest('.wfb-column').data('column-id'));
                    }
                }
            });

            // Initialize column resize handles
            $('.wfb-column-resize-handle').on('mousedown', function (e) {
                e.preventDefault();
                const column = $(this).closest('.wfb-column');
                const columnId = column.data('column-id');
                const startX = e.pageX;
                const startWidth = column.width();

                $(document).on('mousemove.wfb-resize', function (e) {
                    const newWidth = startWidth + (e.pageX - startX);
                    column.width(newWidth);
                });

                $(document).on('mouseup.wfb-resize', function () {
                    $(document).off('mousemove.wfb-resize');
                    $(document).off('mouseup.wfb-resize');

                    // Update the column width in form data
                    for (const field of wfbFormData.fields) {
                        if (field.type === 'container' && field.id === wfbCurrentContainerId) {
                            for (const col of field.columns) {
                                if (col.id === columnId) {
                                    col.width = column.width();
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
                        const fieldHtml = wfbGenerateFieldHtml(subField);
                        $(`[data-column-id="${column.id}"] .wfb-column-drop-zone`).append(fieldHtml);
                    });
                }
            });

            // Make the container sortable
            $('#wfb-formBuilder').sortable('refresh');














































        }
    });
})(jQuery);


