<?php

namespace PPXO\Admin;


use PPXO\Admin;





defined('ABSPATH') || exit;

class MetaBoxes
{
    public function register()
    {
        add_action('add_meta_boxes_ppxo_form', [$this, 'add_form_meta_boxes']);
    }

    /**
     * Add meta boxes
     */
    public function add_form_meta_boxes()
    {
        // Main form builder box
        add_meta_box(
            'ppxo_form_builder',
            __('Form Builder', 'ppxo'),
            [$this, 'render_form_builder_meta_box'],
            'ppxo_form',
            'normal',
            'high'
        );

        // Sidebar display settings box
        add_meta_box(
            'ppxo_form_display',
            __('Display Settings', 'ppxo'),
            [$this, 'render_display_settings_meta_box'],
            'ppxo_form',
            'side',
            'default'
        );
    }




    /**
     * Render the Display Settings meta box with a vibrant, enhanced UX design.
     */
    public function render_display_settings_meta_box($post)
    {
        // Get saved values
        $selected_products_ids = get_post_meta($post->ID, '_ppxo_products', true) ?: [];
        $selected_hook         = get_post_meta($post->ID, '_ppxo_hook', true) ?: 'woocommerce_before_add_to_cart_button';

        // Get all simple + variable products for the selector dropdown
        $products = get_posts([
            'post_type'      => 'product',
            'posts_per_page' => -1,
            'post_status'    => 'publish',
            'orderby'        => 'title',
            'order'          => 'ASC'
        ]);

        // Data needed for displaying the currently saved products list
        $saved_products_display = [];
        $product_permalink_map = []; // New array to hold ID => Permalink for JS lookup

        // Process products to build display data and the JS map
        foreach ($products as $product) {
            $wc_product = wc_get_product($product->ID);
            if ($wc_product) {
                $type_label = ucfirst($wc_product->get_type());
                $product_id = $product->ID;

                // Construct the exact display text (Name (Type ID: #))
                $display_text = sprintf(
                    '%s (%s ID: %s)',
                    $wc_product->get_name(),
                    $type_label,
                    $product_id
                );

                // Add to saved display data if it was previously selected
                if (in_array($product_id, (array)$selected_products_ids)) {
                    $saved_products_display[] = [
                        'text' => $display_text,
                        'id'   => $product_id
                    ];
                }

                // Populate the permalink map for ALL products
                $product_permalink_map[$product_id] = get_permalink($product_id);
            }
        }
?>

        <style>
            /*
         * --- Vibrant Custom CSS for PPXO Meta Box ---
         * Focused on modern, high-contrast, and clean UX.
         */

            /* 1. Base Container Styling (Mimicking a modern card)
        .ppxo-panel {
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            transition: opacity 0.3s ease-in;
        } */

            /* 2. Typography and Headers */
            .ppxo-panel h4 {
                font-size: 1.35rem;
                font-weight: 700;
                color: #004d99;
                /* Deep blue accent for titles */
                margin-bottom: 20px;
                padding-bottom: 8px;
                border-bottom: 2px solid #eef7ff;
                /* Light accent divider */
            }

            .ppxo-panel label.form-label {
                font-weight: 600;
                color: #333;
                margin-bottom: 5px;
                display: block;
            }

            .ppxo-panel small.text-muted {
                display: block;
                margin-top: 5px;
                font-size: 0.85rem;
                color: #6c757d;
            }

            /* 3. Loading State */
            #ppxo-loader {
                min-height: 250px;
                /* Generous height to prevent layout shift */
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: #007bff;
                font-size: 1.1rem;
                font-weight: 500;
                text-align: center;
            }

            /* Hide content until loaded */
            .ppxo-display-settings:not(.ppxo-loaded) {
                opacity: 0;
                visibility: hidden;
            }

            /* 4. Currently Selected Products List */
            .ppxo-selected-header {
                font-weight: 700;
                color: #555;
                margin-top: 15px;
                margin-bottom: 10px;
                font-size: 1rem;
            }

            .ppxo-tag-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                min-height: 40px;
                background: #f7f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 10px;
            }

            .ppxo-tag {
                display: inline-flex;
                align-items: center;
                background-color: #e3f2fd;
                /* Light blue, vibrant accent */
                color: #007bff;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 500;
                white-space: nowrap;
                text-decoration: none;
                /* Base style for <a> */
                transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
            }

            /* Style for SAVED/LIVE, clickable tags */
            .ppxo-tag-link {
                cursor: pointer;
                text-decoration: none;
                /* Override default <a> underline */
            }

            .ppxo-tag-link:hover {
                background-color: #cce5ff;
                /* Slightly darker blue hover */
                color: #0056b3;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .ppxo-empty-state {
                color: #8c8c8c;
                font-style: italic;
                padding: 5px;
            }

            /* 5. Select2 Overrides for Modern Look */
            .ppxo-panel .select2-container--default .select2-selection--multiple {
                border-color: #ced4da !important;
                border-radius: 8px !important;
                /* Larger radius for modern feel */
                min-height: 45px;
                padding: 5px 10px;
                transition: border-color 0.2s;
            }

            .ppxo-panel .select2-container--default.select2-container--focus .select2-selection--multiple {
                border-color: #007bff !important;
                box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25) !important;
            }
        </style>

        <!-- LOADER -->
        <div id="ppxo-loader" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden"><?php _e('Loading...', 'ppxo'); ?></span>
            </div>
            <p class="mt-2 text-muted small"><?php _e('Preparing plugin settings...', 'ppxo'); ?></p>
        </div>

        <!-- MAIN SETTINGS CONTAINER -->
        <div class="ppxo-display-settings container-fluid p-0" style="display:none;">
            <div class="ppxo-panel p-2 bg-white  rounded-3 shadow-sm">

                <!-- 1. Product Selector -->
                <div class="row mb-4">
                    <div class="col-12">

                        <label for="ppxo_products" class="form-label"><?php _e('Select Products to Display Content On', 'ppxo'); ?></label>

                        <select id="ppxo_products" name="ppxo_products[]" multiple class="form-select ppxo-select2" data-placeholder="<?php _e('Search and select products...', 'ppxo'); ?>">
                            <?php
                            // Products options loop uses the same logic as before, just ensuring proper escaping
                            foreach ($products as $product) {
                                $wc_product = wc_get_product($product->ID);
                                if (!$wc_product || !in_array($wc_product->get_type(), ['simple', 'variable'])) continue;
                                $type_label = ucfirst($wc_product->get_type());
                            ?>
                                <option value="<?php echo esc_attr($product->ID); ?>"
                                    <?php selected(in_array($product->ID, (array)$selected_products_ids)); ?>>
                                    <?php echo esc_html($product->post_title); ?>
                                    (<?php echo esc_html($type_label); ?> ID: <?php echo esc_html($product->ID); ?>)
                                </option>
                            <?php } ?>
                        </select>
                        <small class="text-muted"><?php _e('The content of this form will be injected into the selected WooCommerce product pages.', 'ppxo'); ?></small>
                    </div>
                </div>

                <!-- 2. Currently Selected Products (UX Confirmation) -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="ppxo-selected-header"><?php _e('Currently Selected Products', 'ppxo'); ?></div>
                        <div id="ppxo-selected-products" class="ppxo-tag-list">
                            <?php if (!empty($saved_products_display)): ?>
                                <?php foreach ($saved_products_display as $product): ?>
                                    <?php
                                    // *** SAVED LINK: Links to the FRONT-END single product page ***
                                    $link = esc_url(get_permalink($product['id']));
                                    // Use minimal PHP echo to prevent extra whitespace inside the tag
                                    echo '<a href="' . $link . '" target="_blank" class="ppxo-tag ppxo-tag-link">' . esc_html($product['text']) . '</a>';
                                    ?>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <span class="ppxo-empty-state text-muted small">
                                    <?php _e('No products selected yet.', 'ppxo'); ?>
                                </span>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <hr class="my-4">

                <!-- 3. Hook Location -->
                <div class="row">
                    <div class="col-md-12">
                        <h4><?php _e('Display Location', 'ppxo'); ?></h4>
                        <label for="ppxo_hook" class="form-label"><?php _e('Choose Insertion Point on Product Page', 'ppxo'); ?></label>

                        <?php
                        // Curated list of WooCommerce product page hooks
                        $product_hooks = [


                            // Before Product
                            'woocommerce_before_single_product'                 => 'Before Single Product Wrapper',
                            'woocommerce_before_single_product_summary'        => 'Before Product Summary (Near Image)',
                            'woocommerce_before_add_to_cart_form'              => 'Before Add to Cart Form',
                            'woocommerce_before_add_to_cart_button'            => 'Before Add to Cart Button',

                            // After Product
                            'woocommerce_after_add_to_cart_button'             => 'After Add to Cart Button',
                            'woocommerce_after_add_to_cart_form'              => 'After Add to Cart Form',
                            'woocommerce_after_single_product_summary'        => 'After Product Summary (Below Content)',
                            'woocommerce_after_single_product'                => 'After Single Product Wrapper',

                            // Classic and Block theme friendly hooks
                            'woocommerce_single_product_summary'              => 'Inside Product Summary (title, price, etc.)',
                        ];

                        // Selected hook from saved option
                        $selected_hook = get_post_meta($post->ID, '_ppxo_hook', true);
                        ?>

                        <select id="ppxo_hook" name="ppxo_hook" class="form-select">
                            <?php foreach ($product_hooks as $hook => $label): ?>
                                <option value="<?php echo esc_attr($hook); ?>" <?php selected($selected_hook, $hook); ?>>
                                    <?php echo esc_html($label); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <small class="text-muted"><?php _e('This setting controls exactly where the form appears on the front-end product page.', 'ppxo'); ?></small>
                    </div>
                </div>

            </div>
        </div>

        <!-- JavaScript for Select2 Initialization and Smooth Loading -->
        <script>
            jQuery(document).ready(function($) {
                const $loader = $('#ppxo-loader');
                const $container = $('.ppxo-display-settings');
                const $select2 = $('#ppxo_products');
                const $tagList = $('#ppxo-selected-products');

                // Pass the pre-generated permalink map from PHP to JavaScript
                const productPermalinkMap = <?php echo json_encode($product_permalink_map); ?>;

                // 1. Initialize Select2
                $select2.select2({
                    placeholder: $select2.data('placeholder'),
                    allowClear: true,
                    width: '100%',
                });

                // 2. Smooth fade in
                setTimeout(() => {
                    $loader.fadeOut(200, () => {
                        $container.fadeIn(200).addClass('ppxo-loaded');
                        $select2.trigger('resize.select2');
                    });
                }, 300);

                // 3. Live update tags when selection changes (Reflects UNSAVED choices)
                // Creates the exact same linked <a> tag structure as the PHP output.
                $select2.on('change', function() {
                    const selected = $(this).find('option:selected');
                    $tagList.empty(); // Clear existing (saved/live) tags

                    if (selected.length === 0) {
                        $tagList.html('<span class="ppxo-empty-state text-muted small"><?php _e('No products selected yet.', 'ppxo'); ?></span>');
                        return;
                    }

                    // Construct the new list based on live selection
                    selected.each(function() {
                        const text = $(this).text().trim();
                        const id = $(this).val();

                        // Look up permalink using the pre-loaded map (links to front-end page)
                        const productLink = productPermalinkMap[id] || '#';

                        // Live linked <a> tag
                        $tagList.append('<a href="' + productLink + '" target="_blank" class="ppxo-tag ppxo-tag-link">' + text + '</a>');
                    });
                });
            });
        </script>
    <?php
    }







    /**
     * Render the form builder meta box
     */
    public function render_form_builder_meta_box($post)
    {
        // Get saved form data
        $form_data = get_post_meta($post->ID, '_ppxo_form_data', true);



        // Assign to static property
        Admin::$current_form_data = $form_data ? $form_data : array();

        // Add nonce field for security
        wp_nonce_field('ppxo_save_form', 'ppxo_form_nonce');
    ?>

        <div class="wfb-body">

            <div class="wfb-header">
                <div class="d-flex justify-content-between align-items-center">
                    <!-- Title -->
                    <div class="mb-0 h4">
                        <i class="fas fa-wrench me-2"></i> Extra Products Options for WooCommerce
                    </div>

                    <!-- Action Buttons -->
                    <div class="wfb-actions d-flex align-items-center gap-2">
                        <button class="btn btn-outline-secondary" id="wfb-previewBtn" data-form-id="<?php echo $post->ID; ?>">
                            <i class="fas fa-eye me-1"></i> Preview
                        </button>
                        <button class="btn btn-outline-primary" id="wfb-exportBtn">
                            <i class="fas fa-download me-1"></i> Export JSON
                        </button>


                        <!-- WP Publish/Update button as Save -->
                        <?php
                        // submit_button(
                        //     $post->post_status === 'publish' ? __('Update', 'ppxo') : __('Publish', 'ppxo'),
                        //     'primary',
                        //     'publish',
                        //     false,
                        //     array(
                        //         'class' => 'btn btn-primary wfb-save-publish'
                        //     )
                        // );
                        ?>



                    </div>
                </div>
            </div>



            <div class="wfb-main-container">
                <div class="wfb-sidebar">
                    <div class="mb-4 h4"><i class="fas fa-tools me-2"></i>Components</div>

                    <div class="wfb-search-box">
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" class="form-control" placeholder="Search components..."
                                id="wfb-searchComponents">
                        </div>
                    </div>

                    <h6 class="wfb-group-title">Basic Components</h6>
                    <div class="wfb-component" data-type="text">
                        <i class="fas fa-font wfb-component-icon"></i> Text Input
                    </div>
                    <div class="wfb-component" data-type="textarea">
                        <i class="fas fa-align-left wfb-component-icon"></i> Text Area
                    </div>
                    <div class="wfb-component" data-type="email">
                        <i class="fas fa-envelope wfb-component-icon"></i> Email
                    </div>
                    <div class="wfb-component" data-type="number">
                        <i class="fas fa-hashtag wfb-component-icon"></i> Number
                    </div>
                    <div class="wfb-component" data-type="date">
                        <i class="fas fa-calendar wfb-component-icon"></i> Date
                    </div>
                    <div class="wfb-component" data-type="select">
                        <i class="fas fa-caret-square-down wfb-component-icon"></i> Dropdown
                    </div>
                    <div class="wfb-component" data-type="checkbox">
                        <i class="fas fa-check-square wfb-component-icon"></i> Checkbox
                    </div>
                    <div class="wfb-component" data-type="radio">
                        <i class="fas fa-dot-circle wfb-component-icon"></i> Radio Button
                    </div>



                    <!-- <div class="wfb-component" data-type="container">
                        <i class="fas fa-columns wfb-component-icon"></i> Container
                    </div>

                    <h6 class="wfb-group-title">Premium Components</h6>
                    <div class="wfb-component premium" data-type="file">
                        <i class="fas fa-file-upload wfb-component-icon"></i> File Upload
                    </div>
                    <div class="wfb-component premium" data-type="password">
                        <i class="fas fa-lock wfb-component-icon"></i> Password
                    </div> -->




                </div>




                <div class="wfb-main-content">
                    <div class="wfb-form-builder-area" id="wfb-formBuilder">

                        <!-- will push from js -->
                    </div>
                </div>
            </div>



            <!-- Hidden field to store form data -->
            <input type="hidden" name="ppxo_form_data" id="ppxo_form_data" value="<?php echo esc_attr(json_encode(\PPXO\Admin::$current_form_data)); ?>">

            <!-- Settings Modal -->
            <div class="modal fade wfb-settings-modal" id="wfb-settingsModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-xl"> <!-- full width modal -->
                    <div class="modal-content shadow-lg rounded-3 border-0">

                        <div class="modal-header">
                            <h4 class="modal-title">
                                <i class="fas fa-cog me-2 text-primary"></i> Field Settings
                            </h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>


                        <div class="modal-body">

                            <ul class="nav nav-tabs mb-3" id="wfb-settingsTabs" role="tablist">
                                <li class="nav-item">
                                    <button class="nav-link active" id="wfb-display-tab" data-bs-toggle="tab" data-bs-target="#wfb-display"
                                        type="button" role="tab" aria-controls="wfb-display" aria-selected="true">Display</button>
                                </li>

                                <li class="nav-item">
                                    <button class="nav-link" id="wfb-validation-tab" data-bs-toggle="tab" data-bs-target="#wfb-validation"
                                        type="button" role="tab" aria-controls="wfb-validation" aria-selected="false">Validation</button>
                                </li>


                                <!-- <li class="nav-item">
                                    <button class="nav-link" id="wfb-conditions-tab" data-bs-toggle="tab" data-bs-target="#wfb-conditions"
                                        type="button" role="tab" aria-controls="wfb-conditions" aria-selected="false">Conditions</button>
                                </li> -->





                                <li class="nav-item">
                                    <button class="nav-link" id="wfb-advanced-tab" data-bs-toggle="tab" data-bs-target="#wfb-advanced"
                                        type="button" role="tab" aria-controls="wfb-advanced" aria-selected="false">Advanced</button>
                                </li>
                            </ul>

                            <div class="tab-content wfb-tab-content-modern" id="wfb-settingsContent">
                                <div class="tab-pane fade show active" id="wfb-display" role="tabpanel" aria-labelledby="wfb-display-tab"></div>
                                <div class="tab-pane fade" id="wfb-validation" role="tabpanel" aria-labelledby="wfb-validation-tab"></div>
                                <div class="tab-pane fade" id="wfb-conditions" role="tabpanel" aria-labelledby="wfb-conditions-tab"></div>
                                <div class="tab-pane fade" id="wfb-advanced" role="tabpanel" aria-labelledby="wfb-advanced-tab"></div>
                            </div>
                        </div>


                        <!-- Footer -->
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i> Cancel
                            </button>
                            <button type="button" class="btn btn-primary" id="wfb-applySettings">
                                <i class="fas fa-check me-1"></i> Apply Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Preview Modal -->
            <div class="modal fade" id="wfb-previewModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-eye me-2"></i>Form Preview</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div id="wfb-formPreview"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- JSON Modal -->
            <div class="modal fade" id="wfb-jsonModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-code me-2"></i>Form JSON</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="wfb-json-output" id="wfb-jsonOutput"></div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" id="wfb-copyJsonBtn">
                                <i class="fas fa-copy me-1"></i> Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Container Settings Modal -->
            <div class="modal fade" id="wfb-containerSettingsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-columns me-2"></i>Container Settings</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Number of Columns</label>
                                <select class="form-select" id="wfb-containerColumns">
                                    <option value="1">1 Column</option>
                                    <option value="2" selected>2 Columns</option>
                                    <option value="3">3 Columns</option>
                                    <option value="4">4 Columns</option>
                                </select>
                            </div>
                            <div id="wfb-columnWidthsContainer">
                                <label class="form-label">Column Widths</label>
                                <div class="row" id="wfb-columnWidths">
                                    <!-- Will be populated dynamically -->
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="wfb-applyContainerSettings">Apply</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
<?php
    }
}
