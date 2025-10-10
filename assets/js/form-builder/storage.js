import { state, formData, updateFormData } from './core.js';
import { addField } from './fields.js';
import { rebuildContainer } from './containers.js';

let isSaving = false;

export function initStorage(state, formData) {
    bindStorageEvents();
    loadSavedForm();
}

function bindStorageEvents() {
    // Handle custom save button
    jQuery('#wfb-saveFormBtn').on('click', function(e) {
        e.preventDefault();
        saveFormData();
    });

    // Intercept WP publish/update button
    jQuery('#publish').on('click', function(e) {
        e.preventDefault();
        handlePublishButton();
    });
}

function handlePublishButton() {
    if (isSaving) {
        console.log('Already saving, please wait...');
        return;
    }

    isSaving = true;
    const $wpBtn = jQuery('#publish');
    const originalText = $wpBtn.val() || $wpBtn.text();
    const isNewPost = jQuery('#original_post_status').val() === 'auto-draft';
    
    console.log('Is new post:', isNewPost);
    
    // Show loading state on WP button
    $wpBtn.prop('disabled', true).val('Saving form...');

    // Save form data first
    saveFormData(function(success) {
        if (success) {
            // Form saved successfully, now handle WordPress publish
            if (isNewPost) {
                // For new posts, we need to let WordPress handle the redirect
                handleNewPostPublish($wpBtn, originalText);
            } else {
                // For existing posts, we can use AJAX
                handleExistingPostPublish($wpBtn, originalText);
            }
        } else {
            // Form save failed, re-enable button
            isSaving = false;
            $wpBtn.prop('disabled', false).val(originalText);
            alert('Failed to save form data. Please try again.');
        }
    });
}

function handleNewPostPublish($wpBtn, originalText) {
    console.log('Handling new post publish...');
    
    // Re-enable the button
    $wpBtn.prop('disabled', false).val(originalText);
    
    // Remove our click handler temporarily
    $wpBtn.off('click');
    
    // Store that we've saved the form data
    localStorage.setItem('ppxo_form_saved_before_publish', 'true');
    
    // Create a hidden field to store our form data
    const formDataJSON = JSON.stringify({ fields: formData.fields });
    if (!jQuery('#ppxo_form_data_publish').length) {
        jQuery('#post').append(`<input type="hidden" name="ppxo_form_data_publish" id="ppxo_form_data_publish" value='${formDataJSON}'>`);
    } else {
        jQuery('#ppxo_form_data_publish').val(formDataJSON);
    }
    
    // Trigger the original WordPress publish
    $wpBtn[0].click();
    
    // Re-bind our handler after a delay
    setTimeout(() => {
        bindStorageEvents();
        isSaving = false;
    }, 2000);
}

function handleExistingPostPublish($wpBtn, originalText) {
    console.log('Handling existing post publish...');
    
    // Get the form
    const $form = jQuery('#post');
    const formData = new FormData($form[0]);
    
    // Add our form data to the submission
    const formDataJSON = JSON.stringify({ fields: formData.fields });
    formData.append('ppxo_form_data_publish', formDataJSON);
    
    // Submit via AJAX
    jQuery.ajax({
        url: $form.attr('action'),
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log('Post updated successfully');
            isSaving = false;
            
            // Show success message
            // showSuccessMessage('Post updated successfully!');
            
            // Re-enable button
            $wpBtn.prop('disabled', false).val(originalText);
            
            // Check if we need to update the URL (for autosave to published)
            updatePostStatus(response);
        },
        error: function(xhr, status, error) {
            console.error('Post update failed:', error);
            isSaving = false;
            
            // Re-enable button
            $wpBtn.prop('disabled', false).val(originalText);
            alert('Error updating post. Please try again.');
        }
    });
}

function updatePostStatus(response) {
    // Check if post status changed and update UI if needed
    const statusMatch = response.match(/<span id="post-status-display">([^<]+)<\/span>/);
    if (statusMatch) {
        jQuery('#post-status-display').text(statusMatch[1]);
    }
}





function saveFormData(callback) {
    const formDataJSON = JSON.stringify({ fields: formData.fields });
    jQuery('#ppxo_form_data').val(formDataJSON);

    // Disable the save button if exists
    const $btn = jQuery('#wfb-saveFormBtn');
    const originalHTML = $btn.html();
    if ($btn.length) {
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...');
    }

    jQuery.ajax({
        url: ppxo_admin.ajax_url,
        type: 'POST',
        data: {
            action: 'ppxo_save_form',
            nonce: ppxo_admin.nonce,
            post_id: ppxo_admin.post_id,
            form_data: formDataJSON
        },
        success: function(response) {
            if (response.success) {
                // Show success message
                showSuccessMessage('Form saved successfully!');
                
                // Update the post_id in case it's a new post
                if (response.data && response.data.post_id) {
                    window.ppxo_admin.post_id = response.data.post_id;
                }
                
                // Call callback with success
                if (typeof callback === 'function') {
                    callback(true);
                }
            } else {
                console.error('Save failed:', response.data);
                alert('Error saving form: ' + (response.data.message || 'Unknown error'));
                
                // Call callback with failure
                if (typeof callback === 'function') {
                    callback(false);
                }
            }
        },
        error: function(xhr, status, error) {
            console.error("AJAX error:", error, "Status:", status);
            console.error("XHR response:", xhr.responseText);
            alert('Error saving form. Check console.');
            
            // Call callback with failure
            if (typeof callback === 'function') {
                callback(false);
            }
        },
        complete: function() {
            if ($btn.length) {
                $btn.prop('disabled', false).html(originalHTML);
            }
        }
    });
}

function showSuccessMessage(message) {
    // Remove any existing success messages
    jQuery('#wfb-successMsg').remove();
    
    // Create new success message
    jQuery('.wfb-main-content').prepend(`
        <div id="wfb-successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        jQuery('#wfb-successMsg').fadeOut();
    }, 3000);
}











function loadSavedForm() {
    const savedData = jQuery('#ppxo_form_data').val();

    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            console.log("Loaded form data from hidden field:", parsedData);

            // Display all field options for debugging/development
            displayFieldOptions(parsedData.fields);

            // Reset fields array
            let rebuiltFields = [];
            
            // Rebuild form from saved data
            if (Array.isArray(parsedData.fields) && parsedData.fields.length > 0) {
                parsedData.fields.forEach(field => {
                    if (field.type === 'container') {
                        rebuildContainer(field);
                    } else {
                        addField(field);
                    }
                    rebuiltFields.push(field);
                });
            }

            // Replace with clean rebuilt list
            updateFormData({ fields: rebuiltFields });

            console.log("Final form data:", formData);

            // If nothing was rebuilt, show default placeholder
            if (formData.fields.length === 0) {
                jQuery('#wfb-formBuilder').html(`
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

            // Display field options from localStorage too
            displayFieldOptions(parsedData.fields);

            // Only use localStorage data if no data from hidden field
            if (!savedData && parsedData.fields && parsedData.fields.length > 0) {
                updateFormData(parsedData);

                // Rebuild the form
                jQuery('#wfb-formBuilder').empty();
                let rebuiltFields = [];

                formData.fields.forEach(field => {
                    if (field.type === 'container') {
                        rebuildContainer(field);
                    } else {
                        addField(field);
                    }
                    rebuiltFields.push(field);
                });

                updateFormData({ fields: rebuiltFields });
            }
        }
    } catch (e) {
        console.error('Error parsing localStorage data:', e);
    }
}



// Function to display all possible field options
function displayFieldOptions(fields) {
    if (!fields || !Array.isArray(fields)) return;

    console.group('📋 ALL FIELD OPTIONS ANALYSIS');
    
    fields.forEach((field, index) => {
        console.group(`🏷️ Field ${index + 1}: ${field.type} (${field.id})`);
        
        // Basic Properties
        console.log('🔹 BASIC PROPERTIES:', {
            id: field.id,
            type: field.type,
            columnId: field.columnId,
            label: field.label,
            required: field.required,
            placeholder: field.placeholder,
            className: field.className
        });

        // Validation Options
        console.log('🔹 VALIDATION OPTIONS:', field.validation || {});

        // Conditional Logic
        console.log('🔹 CONDITIONAL LOGIC:', field.conditions || {});

        // Advanced Settings
        console.log('🔹 ADVANCED SETTINGS:', field.advanced || {});

        // Pricing Options
        console.log('🔹 PRICING OPTIONS:', field.pricing || {});

        // Visibility Settings
        console.log('🔹 VISIBILITY SETTINGS:', field.visibility || {});

        // Field-specific options (for select, radio, checkbox)
        console.log('🔹 FIELD OPTIONS:', field.options || []);

        // Legacy/Additional Properties (for backward compatibility)
        const legacyProps = {
            defaultValue: field.defaultValue,
            helpText: field.helpText,
            description: field.description,
            cssClass: field.cssClass,
            wrapperClass: field.wrapperClass,
            inputClass: field.inputClass,
            beforeText: field.beforeText,
            afterText: field.afterText,
            adminOnly: field.adminOnly,
            customAttributes: field.customAttributes
        };
        console.log('🔹 LEGACY PROPERTIES:', legacyProps);

        // Show actual values vs default values
        console.log('🔹 ACTUAL VALUES USED:', {
            label: field.label,
            required: field.required,
            placeholder: field.placeholder,
            defaultValue: field.defaultValue || field.advanced?.defaultValue,
            helpText: field.helpText || field.advanced?.helpText,
            pricingEnabled: field.pricing?.enabled,
            pricingAmount: field.pricing?.amount,
            adminOnly: field.adminOnly || field.visibility?.adminOnly
        });

        console.groupEnd();
    });

    // Show summary of all field types and their counts
    const fieldTypeCount = fields.reduce((acc, field) => {
        acc[field.type] = (acc[field.type] || 0) + 1;
        return acc;
    }, {});

    console.log('📊 FIELD TYPE SUMMARY:', fieldTypeCount);
    console.groupEnd();
}



// Function to get all possible options for a specific field type
export function getAllFieldOptions(fieldType) {
    const baseOptions = {
        // Common to all fields
        id: 'string',
        type: 'string',
        columnId: 'string|null',
        label: 'string',
        required: 'boolean',
        placeholder: 'string',
        className: 'string',

        // Validation (common patterns)
        validation: {
            min: 'number|string',
            max: 'number|string',
            minLength: 'number|string',
            maxLength: 'number|string',
            pattern: 'string',
            errorMessage: 'string',
            allowedTypes: 'string', // for file fields
            maxFileSize: 'number|string', // for file fields
            step: 'number|string' // for number fields
        },

        // Conditional Logic
        conditions: {
            action: 'string', // 'show', 'hide'
            logic: 'string', // 'all', 'any'
            rules: 'array' // array of condition rules
        },

        // Advanced Settings
        advanced: {
            defaultValue: 'string',
            helpText: 'string',
            description: 'string',
            cssClass: 'string',
            wrapperClass: 'string',
            inputClass: 'string',
            beforeText: 'string',
            afterText: 'string'
        },

        // Pricing
        pricing: {
            enabled: 'boolean',
            amount: 'number'
        },

        // Visibility
        visibility: {
            adminOnly: 'boolean',
            showInCart: 'boolean',
            showInCheckout: 'boolean',
            showInOrder: 'boolean',
            showInEmail: 'boolean'
        },

        // Field-specific options
        options: 'array', // for select, radio, checkbox
        rows: 'number', // for textarea
        multiple: 'boolean', // for select, file
        accept: 'string' // for file upload
    };

    // Field-specific additional options
    const fieldSpecificOptions = {
        text: {
            // Uses all base options
        },
        textarea: {
            rows: 'number'
        },
        email: {
            // Uses all base options
        },
        number: {
            min: 'number|string',
            max: 'number|string',
            step: 'number|string'
        },
        select: {
            options: 'array', // {label: string, value: string, price?: number}
            multiple: 'boolean'
        },
        radio: {
            options: 'array' // {label: string, value: string, price?: number}
        },
        checkbox: {
            options: 'array' // {label: string, value: string, price?: number}
        },
        file: {
            multiple: 'boolean',
            accept: 'string',
            maxFileSize: 'number|string',
            allowedTypes: 'string'
        },
        date: {
            min: 'string', // date string
            max: 'string' // date string
        },
        time: {
            // Uses all base options
        },
        url: {
            // Uses all base options
        },
        container: {
            columns: 'array',
            layout: 'string' // 'equal', 'custom'
        }
    };

    return {
        ...baseOptions,
        ...(fieldSpecificOptions[fieldType] || {})
    };
}

// Function to display available options for a specific field type in console
export function showFieldTypeOptions(fieldType) {
    const options = getAllFieldOptions(fieldType);
    console.group(`🎯 Available options for ${fieldType} field:`);
    console.log('Full options structure:', options);
    
    // Show in a more readable format
    Object.keys(options).forEach(key => {
        if (typeof options[key] === 'object' && options[key] !== null) {
            console.log(`📁 ${key}:`, options[key]);
        } else {
            console.log(`✓ ${key}: ${options[key]}`);
        }
    });
    console.groupEnd();
    return options;
}

// Initialize options display when needed
export function initFieldOptionsDisplay() {
    // You can call this function from browser console to see all options
    window.showFieldOptions = function(fieldType = null) {
        if (fieldType) {
            showFieldTypeOptions(fieldType);
        } else {
            const allFieldTypes = ['text', 'textarea', 'email', 'number', 'select', 'radio', 'checkbox', 'file', 'date', 'time', 'url', 'container'];
            allFieldTypes.forEach(type => showFieldTypeOptions(type));
        }
    };

    // Also make it available globally for debugging
    window.getAllFieldOptions = getAllFieldOptions;
    
    console.log('🔧 Field options helper loaded!');
    console.log('💡 Use showFieldOptions() in console to see available options for all field types');
    console.log('💡 Use showFieldOptions("text") to see options for specific field type');
}

// Call this in your init function
initFieldOptionsDisplay();