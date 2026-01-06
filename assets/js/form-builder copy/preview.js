import { formData } from './core.js';
import { generateFieldPreview } from './utils.js';

export function initPreview(state, formData) {
    bindPreviewEvents();
}

function bindPreviewEvents() {
    // Preview form
    jQuery('#wfb-previewBtn').on('click', function(e) {
        e.preventDefault();
        generateFormPreview();
        jQuery('#wfb-previewModal').modal('show');
    });

    // Export JSON
    jQuery('#wfb-exportBtn').on('click', function(e) {
        e.preventDefault();
        jQuery('#wfb-jsonOutput').text(JSON.stringify(formData, null, 2));
        jQuery('#wfb-jsonModal').modal('show');
    });

    // Copy JSON to clipboard
    jQuery('#wfb-copyJsonBtn').on('click', function(e) {
        e.preventDefault();
        const jsonText = JSON.stringify(formData, null, 2);
        navigator.clipboard.writeText(jsonText).then(function() {
            alert('JSON copied to clipboard!');
        });
    });
}

function generateFormPreview() {
    console.log(formData);

    let previewHtml = '<form class="p-3">';
    
    if (!formData.fields || formData.fields.length === 0) {
        previewHtml += '<div class="alert alert-info">No fields in the form yet. Add some fields first.</div>';
    } else {
        formData.fields.forEach(field => {
            if (!field) return;

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
                                if (subField) {
                                    previewHtml += generateFieldPreview(subField);
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
                previewHtml += generateFieldPreview(field);
            }
        });
    }
    
    previewHtml += '<button type="submit" class="btn btn-primary mt-3">Submit Form</button>';
    previewHtml += '</form>';

    jQuery('#wfb-formPreview').html(previewHtml);

    // Prevent Enter from submitting the preview form
    jQuery('#wfb-previewForm').on('keydown', 'input, textarea', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
}