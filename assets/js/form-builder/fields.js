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


    // console.log(settings);



    if (settings.columnId) {
        updateFieldInColumn(settings);
    } else {
        const index = formData.fields.findIndex(field => field.id === settings.id);
        if (index !== -1) {
            // Existing field — update the data
            formData.fields[index] = settings;

            // Update the DOM instead of appending
            renderField(settings, true); // pass true to indicate "update"
            return;
        } else {
            // New field — add to formData
            formData.fields.push(settings);
        }
    }

    // Render new field
    renderField(settings, false);
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
    const builder = jQuery('#ppxo-formBuilder');

    const existingEl = builder.find(`.wfb-form-field[data-field-id="${settings.id}"]`);

    if (isUpdate && existingEl.length) {
        // Replace existing field HTML instead of appending
        existingEl.replaceWith(generateFieldHtml(settings));
        return;
    }

    const fieldHtml = generateFieldHtml(settings);
    const dropPos = state.dropPosition?.index;

    if (dropPos !== undefined && dropPos !== null) {
        const children = builder.children();

        if (dropPos >= children.length) {
            builder.append(fieldHtml);
        } else {
            jQuery(children[dropPos]).before(fieldHtml);
        }
    } else {
        builder.append(fieldHtml);
    }

    jQuery('[data-bs-toggle="tooltip"]').tooltip();
}





// function renderField(settings) {

//     const fieldHtml = generateFieldHtml(settings);


//     const builder = jQuery('#ppxo-formBuilder');


//     const dropPos = state.dropPosition?.index;




//     if (dropPos !== undefined && dropPos !== null) {
//         // insert before exact index
//         const children = builder.children();


//         console.log(dropPos);
//         console.log(children.length);


//         if (dropPos >= children.length) {
//             builder.append(fieldHtml);
//         } else {
//             jQuery(children[dropPos]).before(fieldHtml);
//         }
//     } else {
//         // default append
//         builder.append(fieldHtml);
//     }

//     jQuery('[data-bs-toggle="tooltip"]').tooltip();
// }




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


const RIGHT_SIDEBAR_SECTIONS = [
    '#ppxo-right-sidebar-placeholder',
    '#wfb-settingsSections',
    // '#wfb-panelStyles',
    '#wfb-panelAssign',
    '#wfb-panelPreview',
    '#wfb-panelJson'
];


function showRightSidebarSection(selectorToShow) {
    RIGHT_SIDEBAR_SECTIONS.forEach(selector => {
        const $el = jQuery(selector);
        if (!$el.length) return;




        if (selector === selectorToShow) {
            $el.removeClass('d-none');
        } else {
            $el.addClass('d-none');
        }
    });
}









function bindFieldEvents() {


    jQuery(document).on('click', '.wfb-remove-field', function (e) {
        e.preventDefault();

        const fieldId = jQuery(this)
            .closest('.wfb-form-field')
            .data('field-id');

        removeField(fieldId);

        // console.log(fieldId);
        // console.log(formData);

        const formDataJSON = JSON.stringify({
            fields: formData.fields,
            products: formData.products,
            hook: formData.hook
        });




        jQuery('#ppxo_form_data_latest').val(formDataJSON);



        showRightSidebarSection('#ppxo-right-sidebar-placeholder');
    });



    jQuery(document).on('click', '.wfb-edit-field', function (e) {
        e.preventDefault();

        const fieldId = jQuery(this)
            .closest('.wfb-form-field')
            .data('field-id');


        console.log(state);


        const fieldData = findFieldById(fieldId, formData);
        if (!fieldData) return;

        showRightSidebarSection('#wfb-settingsSections');

        openSettingsPanel(
            fieldData.type,
            fieldData.id,
            fieldData.columnId
        );
    });




    jQuery(document).on('click', '.wfb-duplicate-field', function (e) {
        e.preventDefault();

        const $original = jQuery(this).closest('.wfb-form-field');
        const fieldId = $original.data('field-id');
        const fieldData = findFieldById(fieldId, formData);

        if (!fieldData) return;

        const duplicated = jQuery.extend(true, {}, fieldData);
        duplicated.id = 'wfb-field-' + Date.now();
        duplicated.label += ' (Copy)';


        // console.log(formData);

        const $newField = addFieldAfter(duplicated, $original);


        // 🔑 THIS IS THE FIX
        updateFieldOrder();

        // console.log(formData);

        if ($newField && $newField.length) {
            showRightSidebarSection('#wfb-settingsSections');
            $newField.find('.wfb-edit-field').trigger('click');
        }
    });




    jQuery(document).on('click', '#ppxo-assignProductsBtn', function (e) {
        e.preventDefault();
        showRightSidebarSection('#wfb-panelAssign');
        loadWooProducts();

    });




    // jQuery(document).on('click', '#ppxo-globalStylesBtn', function (e) {
    //     e.preventDefault();
    //     showRightSidebarSection('#wfb-panelStyles');
    // });



    jQuery(document).on('click', '#ppxo-exportBtn', function (e) {
        e.preventDefault();
        showRightSidebarSection('#wfb-panelJson');
    });


    // Search functionality
    jQuery(document).on('input', '#ppxo-product-search', function () {
        const query = jQuery(this).val().toLowerCase();
        jQuery('#ppxo-product-list .ppxo-product-item').each(function () {
            const title = jQuery(this).data('title');
            jQuery(this).toggle(title.includes(query));
        });
    });







    jQuery(document).on('change', '.ppxo-product-checkbox', function () {
        const id = parseInt(this.value, 10);

        let products = [...(formData.products || [])];

        if (this.checked && !products.includes(id)) {
            products.push(id);
        }

        if (!this.checked) {
            products = products.filter(pid => pid !== id);
        }

        updateFormData({
            products
        });



        const formDataJSON = JSON.stringify({
            fields: formData.fields,
            products: formData.products,
            hook: formData.hook
        });

        jQuery('#ppxo_form_data_latest').val(formDataJSON);


        // console.log('Updated formData:', formData);
    });












    jQuery(document).on('change', '#ppxo-product-hook', function () {
        updateFormData({
            hook: this.value
        });

        // console.log('Hook updated:', formData.hook);

        const formDataJSON = JSON.stringify({
            fields: formData.fields,
            products: formData.products,
            hook: formData.hook
        });




        jQuery('#ppxo_form_data_latest').val(formDataJSON);

    });



}





// Load WooCommerce products via AJAX
function loadWooProducts() {



    const $list = jQuery('#ppxo-product-list');

    if ($list.data('loaded')) return;


    $list.html(`
        <div class="d-flex justify-content-center align-items-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);

    jQuery.ajax({
        url: ppxo_admin.ajax_url,
        type: 'POST',
        data: {
            action: 'ppxo_get_products',
            nonce: ppxo_admin.nonce
        },
        success(response) {
            if (!response.success || !response.data.length) {
                $list.html(`<div class="text-center py-4 text-muted small">No products found</div>`);
                return;
            }

            jQuery('#ppxo-product-hook').val(formData.hook || '');



            // console.log(formData);


            const selectedProducts = Array.isArray(formData.products)
                ? formData.products.map(Number)
                : [];


            const html = response.data.map(product => {
                const checked = selectedProducts.includes(product.id) ? 'checked' : '';

                return `
            <div class="ppxo-product-item" data-title="${product.title.toLowerCase()}">
                <input type="checkbox"
                       class="ppxo-product-checkbox"
                       value="${product.id}"
                       ${checked}>
                <img src="${product.image}" width="44" height="44" alt="">
                <div class="flex-grow-1">
                    <div class="ppxo-product-title text-dark">${product.title}</div>
                    <div class="text-muted small">#${product.id}</div>
                </div>
            </div>
        `;
            }).join('');

            $list.hide().html(html).fadeIn(150);
            $list.data('loaded', true);
        },
        error() {
            $list.html(`<div class="text-center py-4 text-danger small">Failed to load products</div>`);
        }
    });
}


function addFieldAfter(settings, $afterElement) {




    // ❌ REMOVE THIS LINE
    formData.fields.push(settings);

    // console.log(formData);


    // Generate HTML
    const fieldHtml = generateFieldHtml(settings);

    // Insert after original
    $afterElement.after(fieldHtml);

    const $newField = jQuery(`.wfb-form-field[data-field-id="${settings.id}"]`);

    refreshSortable();
    jQuery('[data-bs-toggle="tooltip"]').tooltip();

    return $newField;
}





export function updateFieldOrder() {
    const updatedFields = [];
    jQuery('#ppxo-formBuilder').children().each(function () {
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
    if (jQuery('#ppxo-formBuilder').children().length === 0) {
        jQuery('#ppxo-formBuilder').html(`
             <div id="ppxo-initialPlaceholder" class="text-center text-muted">
                <i class="fas fa-hand-point-down fa-2x mb-3"></i>
                <h5 class="mb-2">Drag components here</h5>
                <p class="mb-0">Drop fields in this highlighted area to add them to your form</p>
            </div>
        `);
    }
}



function refreshSortable() {
    jQuery('#ppxo-formBuilder').sortable('refresh');
}

