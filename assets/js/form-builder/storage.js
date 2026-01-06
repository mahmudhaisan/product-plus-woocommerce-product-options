// import { log10 } from 'core-js/core/number';
import { state, formData, updateFormData } from './core.js';
import { addField, updateFieldOrder } from './fields.js';





// jQuery('#ppxo-formBuilder, #ppxo-settingsTabsContent').on(
//     'click input change keyup focus',
//     function (e) {
//         console.log('Event:', e.type);
//         console.log('Target:', e.target);
//         console.log('State snapshot:', structuredClone(state));
//     }
// );


jQuery('#ppxo-settingsTabsContent').on(
    'click input change keyup focus blur',
    function (e) {
        
        
        
        
        const formDataJSON = JSON.stringify({
            fields: formData.fields,
            products: formData.products,
            hook: formData.hook
        });





        console.log(formData);
        console.log(state);
        
        jQuery('#ppxo_form_data_latest').val(formDataJSON);

        //     console.log('Current formData snapshot:', structuredClone(formDataJSON));
        //     console.log('Current formData snapshot:', structuredClone(formDataJSON));
        //
    }
);



jQuery('#ppxo-formBuilder').on(
    'click input change keyup focus blur',
    function (e) {



        const formDataJSON = JSON.stringify({
            fields: formData.fields,
            products: formData.products,
            hook: formData.hook,
        });




        jQuery('#ppxo_form_data_latest').val(formDataJSON);

        // console.log('Current formData snapshot:', structuredClone(formDataJSON));
    }
);









let isDirty = false;
let allowNavigation = false;

jQuery(function ($) {

    const $original = $('#ppxo_form_data');
    const $latest = $('#ppxo_form_data_latest');

    if (!$original.length || !$latest.length) return;

    function decode(val) {
        const t = document.createElement('textarea');
        t.innerHTML = val;
        return t.value.trim();
    }

    // Initial state
    const initialOriginal = decode($original.val());
    const initialLatest = decode($latest.val());

    isDirty = initialOriginal !== initialLatest;
    // console.log('Initial dirty:', isDirty);

    // Observe changes to both inputs
    const observer = new MutationObserver(() => {
        const currentOriginal = decode($original.val());
        const currentLatest = decode($latest.val());

        const newDirty = currentOriginal !== currentLatest;

        if (newDirty !== isDirty) {
            isDirty = newDirty;
            // console.log('Dirty state changed:', isDirty);
        }
    });

    [$original[0], $latest[0]].forEach(el => {
        observer.observe(el, {
            attributes: true,
            attributeFilter: ['value']
        });
    });

    // beforeunload guard
    window.addEventListener('beforeunload', function (e) {
        if (allowNavigation) return;
        if (!isDirty) return;

        const msg = 'Changes you made may not be saved.';
        e.preventDefault();
        e.returnValue = msg;
        return msg;
    });

    /* ---------------- MODAL ---------------- */

    if (!$('#unsavedChangesModal').length) {
        $('body').append(`
            <div class="modal fade" id="unsavedChangesModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Unsaved Changes</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    Changes you made may not be saved.
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                      Stay
                    </button>
                    <button type="button" class="btn btn-primary" id="confirmExit">
                      Exit Anyway
                    </button>
                  </div>
                </div>
              </div>
            </div>
        `);
    }

    // Exit button click
    $('#wfb-exitBtn').on('click', function (e) {
        e.preventDefault();

        if (!isDirty) {
            allowNavigation = true;
            window.location.href = 'admin.php?page=ppxo-main';
            return;
        }

        const modal = new bootstrap.Modal(
            document.getElementById('unsavedChangesModal')
        );
        modal.show();
    });

    // Confirm exit
    $(document).on('click', '#confirmExit', function () {
        allowNavigation = true;
        window.location.href = 'admin.php?page=ppxo-main';
    });

});




let formId = null; // store ID after first save

export function initStorage() {
    bindStorageEvents();
    // Load form data if editing existing form
    loadFormData();
}

function bindStorageEvents() {
    jQuery('#ppxo-saveBtn').on('click', function (e) {
        e.preventDefault();
        saveFormData();





    });
}



// Helper function to update URL without reloading page
function updateURLWithId(formId) {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const currentAction = urlParams.get('action');
    const currentId = urlParams.get('id');

    // Only update URL if we're on a "new" form and got an ID back
    if (currentAction === 'new' && (!currentId || currentId === '0')) {
        // Update URL with the new ID
        urlParams.set('id', formId);
        urlParams.set('action', 'edit'); // Change action from 'new' to 'edit'

        // Update browser URL without reloading page
        const newUrl = window.location.pathname + '?' + urlParams.toString() + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);

        // Update any displayed ID in the UI if needed
        jQuery('#ppxo_current_form_id').val(formId);

        // Show success message with the new ID
        showSuccessMessage('New form created with ID: ' + formId);
        return true;
    }
    return false;
}



export function saveFormData(callback) {

    const urlParams = new URLSearchParams(window.location.search);
    const currentAction = urlParams.get('action');
    const currentId = urlParams.get('id');
    const isNewForm = (currentAction === 'new') || (!currentId || currentId === '0');

    // Check if form has data - but only show alert for new forms
    if (formData.fields.length === 0 && isNewForm) {
        alert('Please add some fields to the form before saving.');
        return;
    }



    // console.log(formData);



    // const formDataJSON = JSON.stringify({ fields: formData.fields });




    const formDataJSON = JSON.stringify({
        fields: formData.fields,
        products: formData.products,
        hook: formData.hook,
    });

    jQuery('#ppxo_form_data').val(formDataJSON);


    jQuery.ajax({
        url: ppxo_admin.ajax_url,
        type: 'POST',
        data: {
            action: 'ppxo_save_form',
            nonce: ppxo_admin.nonce,
            form_id: formId || currentId || 0,
            form_data: formDataJSON,
            is_new_form: isNewForm // Send flag indicating if this is a new form
        },
        beforeSend: function () {
            jQuery('#ppxo-saveBtn').prop('disabled', true).text('Saving...');
        },
        success: function (response) {
            if (response.success) {
                formId = response.data.form_id; // set/update form ID

                // If this was a new form, update the URL
                if (response.data.was_new) {
                    updateURLWithId(formId);
                } else {
                    showSuccessMessage(response.data.message || 'Form saved successfully!');
                }

                if (callback) callback(true, response.data);
            } else {
                alert('Error saving form: ' + (response.data.message || 'Unknown error'));
                if (callback) callback(false, response.data);
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX error:', error);
            alert('Error saving form. Check console.');
            if (callback) callback(false, null);
        },
        complete: function () {
            jQuery('#ppxo-saveBtn').prop('disabled', false).text('Saved');
        }
    });
}







// Load form data when editing existing form
function loadFormData() {


    const urlParams = new URLSearchParams(window.location.search);
    const urlFormId = urlParams.get('id');
    const action = urlParams.get('action');


    // If we have an ID and action is not 'new', load the form data
    if (urlFormId && action !== 'new') {
        jQuery.ajax({
            url: ppxo_admin.ajax_url,
            type: 'POST',
            data: {
                action: 'ppxo_get_form',
                nonce: ppxo_admin.nonce,
                form_id: urlFormId
            },
            beforeSend: function () {
                // Show loading state
                jQuery('#ppxo-formBuilder').addClass('loading');
            },
            success: function (response) {
                if (!response.success) {
                    alert('Error loading form');
                    return;
                }




                formId = parseInt(urlFormId);
                jQuery('#ppxo_current_form_id').val(formId);

                let rawData = response.data.form_data;



                // console.log('RAW form_data:', rawData);
                // console.log('RAW form_data:', formData);

                // Parse JSON if needed
                if (typeof rawData === 'string') {
                    try {
                        rawData = JSON.parse(rawData);
                    } catch (e) {
                        console.error('Invalid form_data JSON');
                        rawData = {};
                    }
                }



                // Build fields into UI + state
                rawData.fields.forEach(field => {
                    addField(field);

                });


                syncBuilderPlaceholder();

                // --------------------
                // Save full form data
                // --------------------
                const formDataJSON = JSON.stringify({
                    fields: rawData.fields,
                    products: rawData.products,
                    hook: rawData.hook,
                });


                updateFormData({
                    fields: rawData.fields,
                    products: rawData.products,
                    hook: rawData.hook,
                })


                jQuery('#ppxo_form_data_latest').val(formDataJSON);
                jQuery('#ppxo_form_data').val(formDataJSON);


                // console.log(formData);
                jQuery('#ppxo-assignProductsBtn').trigger('click');


            },



            error: function () {
                alert('Error loading form data');
            },
            complete: function () {
                jQuery('#ppxo-form-builder').removeClass('loading');
            }
        });
    }
}













// Helper function to update query string parameters
function updateQueryStringParameter(uri, key, value) {
    const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    const separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    return uri + separator + key + "=" + value;
}





function syncBuilderPlaceholder() {
    const $builder = jQuery('#ppxo-formBuilder');
    if (!$builder.length) return;

    const fieldCount = $builder.find('.wfb-form-field').length;
    const $placeholder = $builder.find('#ppxo-initialPlaceholder');

    // console.log('[Builder] field count:', fieldCount);

    if (fieldCount === 0) {
        if (!$placeholder.length) {
            // console.log('[Builder] adding placeholder');

            $builder.append(`
                <div id="ppxo-initialPlaceholder"
                     class="ppxo-empty-placeholder text-center text-muted"
                     aria-hidden="true">
                    <i class="fas fa-hand-point-down fa-2x mb-3"></i>
                    <h5 class="mb-2">Drag components here</h5>
                    <p class="mb-0">
                        Drop fields in this highlighted area to add them to your form
                    </p>
                </div>
            `);
        }
    } else {
        if ($placeholder.length) {
            // console.log('[Builder] removing placeholder');
            $placeholder.remove();
        }
    }
}








function showSuccessMessage(message) {
    const $ = jQuery;

    $('#ppxo-successMsg').remove();

    $('body').append(`
        <div id="ppxo-successMsg"
             class="alert alert-success shadow-lg d-flex align-items-start gap-2"
             role="alert"
             style="
                position: fixed;
                top: 110px;
                right: 20px;
                z-index: 99999;
                min-width: 320px;
                max-width: 420px;
                border-radius: 10px;
                padding: 14px 16px;
                font-size: 14px;
             ">
            
            <div class="flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"
                     class="text-success">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 11.03
                             a.75.75 0 0 0 1.07 0l3.992-3.992
                             a.75.75 0 1 0-1.06-1.06L7.5 9.44
                             5.53 7.47a.75.75 0 0 0-1.06 1.06l2.5 2.5z"/>
                </svg>
            </div>

            <div class="flex-grow-1">
                <div class="fw-semibold mb-1">Success</div>
                <div class="text-body">${message}</div>
            </div>

            <button type="button"
                    class="btn-close ms-2"
                    aria-label="Close"></button>
        </div>
    `);

    const $msg = $('#ppxo-successMsg');

    // Close button
    $msg.find('.btn-close').on('click', function () {
        $msg.fadeOut(200, () => $msg.remove());
    });

    // Auto dismiss
    setTimeout(() => {
        $msg.fadeOut(300, () => $msg.remove());
    }, 2200);
}




function removePlaceholderIfFieldsExist() {
    const $builder = jQuery('#ppxo-formBuilder');

    // builder not in DOM yet → safely exit
    if (!$builder.length) {
        console.warn('Form builder not found');
        return;
    }

    const $placeholder = $builder.find('#ppxo-initialPlaceholder');
    const fieldCount = $builder.find('.wfb-form-field').length;

    // console.log('Field count:', fieldCount);

    if (fieldCount > 0 && $placeholder.length) {
        // console.log('Removing empty placeholder (fields exist)');
        $placeholder.remove();
    }
}

removePlaceholderIfFieldsExist();



