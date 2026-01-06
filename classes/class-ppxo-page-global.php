<?php

defined('ABSPATH') || exit;

/**
 * Options Page
 */
class PPXO_Page_Global
{

    /**
     * Render settings page
     */


    /**
     * Render the form builder meta box
     */
    public function render()
    {

        // Load saved data (optional — adjust to your storage)
        $form_data = get_option('_ppxo_form_data', []);
        $current_form_data = !empty($form_data) ? $form_data : [];




?>
        <div class="wfb-body">


            <!-- HEADER -->
            <div class="ppxo-header-sticky shadow-sm bg-white border-bottom">
                <div class="ppxo-header-inner d-flex justify-content-between align-items-center">

                    <div class="d-flex align-items-center gap-3 ppxo-header-left">
                        <a href="<?php echo admin_url('admin.php?page=ppxo-main&tab=dashboard'); ?>" class="ppxo-btn-icon-label" id="ppxo-exitBtn">
                            <i class="fas fa-arrow-left"></i>
                            <span>Back to Dashboard</span>
                        </a>

                        <div class="ppxo-header-divider"></div>

                        <div class="ppxo-header-title-group d-flex align-items-center gap-2">
                            <div class="ppxo-header-icon-box">
                                <i class="fas fa-magic"></i>
                            </div>
                            <div>
                                <span class="ppxo-breadcrumb">Builder</span>
                                <h4 class="ppxo-header-title mb-0">Extra Product Options</h4>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex align-items-center gap-2 ppxo-header-actions">
                        <button class="ppxo-btn-outline" id="ppxo-assignProductsBtn">
                            <i class="fas fa-tags me-2"></i> Assign Products
                        </button>

                        <button class="ppxo-btn-outline" id="ppxo-exportBtn">
                            <i class="fas fa-file-export me-2"></i> Export JSON
                        </button>

                        <div class="ppxo-header-divider mx-1"></div>

                        <button class="ppxo-btn-hero border-0" id="ppxo-saveBtn">
                            <i class="fas fa-save me-2"></i> Save Changes
                        </button>
                    </div>
                </div>
            </div>





            <!-- MAIN LAYOUT -->
            <div class="ppxo-options-layout">


                <aside class="ppxo-options-sidebar-left shadow-lg p-4 rounded-3">



                    <div class="ppxo-options-components">
                        <div class="ppxo-sidebar-header p-4 pb-0">

                            <div class="ppxo-header-title-wrap d-flex align-items-center mb-4">
                                <div class="ppxo-icon-glow me-3">
                                    <i class="fas fa-magic"></i>
                                </div>
                                <div>
                                    <h5 class="mb-0 fw-bold text-slate-900">Form Fields</h5>
                                    <small class="text-muted">Drag fields to the canvas</small>
                                </div>
                            </div>

                            <div class="ppxo-search-container mb-4">
                                <div class="ppxo-search-inner">
                                    <i class="fas fa-search search-icon"></i>
                                    <input type="text"
                                        class="ppxo-minimal-input"
                                        placeholder="Search components..."
                                        id="ppxo-search-components">
                                   
                                        <button>Seacrh</button>
                                </div>
                            </div>

                            <div class="ppxo-divider"></div>
                        </div>
                        <!-- Unified Field List -->
                        <div class="ppxo-options-component-list mb-5">

                            <!-- Free -->
                            <div class="ppxo-options-component" data-type="text">
                                <i class="fas fa-font fa-2x text-primary mb-2"></i>
                                <div class="fw-medium">Text Input</div>
                            </div>

                            <div class="ppxo-options-component" data-type="number">
                                <i class="fas fa-hashtag fa-2x text-warning mb-2"></i>
                                <div class="fw-medium">Number Input</div>
                            </div>

                            <div class="ppxo-options-component" data-type="email">
                                <i class="fas fa-envelope fa-2x text-info mb-2"></i>
                                <div class="fw-medium">Email</div>
                            </div>

                            <div class="ppxo-options-component" data-type="tel">
                                <i class="fas fa-phone fa-2x text-orange mb-2"></i>
                                <div class="fw-medium">Phone Number</div>
                            </div>

                            <div class="ppxo-options-component" data-type="textarea">
                                <i class="fas fa-align-left fa-2x text-success mb-2"></i>
                                <div class="fw-medium">Text Area</div>
                            </div>

                            <!-- Paid -->
                            <div class="ppxo-options-component ppxo-pro locked" data-type="fileupload">
                                <i class="fas fa-upload fa-2x text-danger mb-2"></i>
                                <div class="fw-medium text-danger">File Upload</div>
                                <span class="badge bg-danger position-absolute top-0 end-0 mt-1 me-1">PRO</span>
                            </div>

                            <!-- Free -->
                            <div class="ppxo-options-component" data-type="checkbox">
                                <i class="fas fa-check-square fa-2x text-success mb-2"></i>
                                <div class="fw-medium">Checkbox</div>
                            </div>

                            <div class="ppxo-options-component" data-type="radio">
                                <i class="fas fa-dot-circle fa-2x text-info mb-2"></i>
                                <div class="fw-medium">Radio Button</div>
                            </div>

                            <div class="ppxo-options-component" data-type="select">
                                <i class="fas fa-caret-square-down fa-2x text-purple mb-2"></i>
                                <div class="fw-medium">Dropdown</div>
                            </div>

                            <!-- Paid -->
                            <div class="ppxo-options-component ppxo-pro locked" data-type="image_swatch">
                                <i class="fas fa-image fa-2x text-teal mb-2"></i>
                                <div class="fw-medium text-danger">Image Swatch</div>
                            </div>

                            <div class="ppxo-options-component ppxo-pro locked" data-type="color_swatch">
                                <i class="fas fa-palette fa-2x text-pink mb-2"></i>
                                <div class="fw-medium text-danger">Color Swatch</div>
                            </div>

                            <!-- Free -->
                            <div class="ppxo-options-component" data-type="date">
                                <i class="fas fa-calendar-alt fa-2x text-danger mb-2"></i>
                                <div class="fw-medium">Date Picker</div>
                            </div>

                            <!-- Paid -->
                            <div class="ppxo-options-component ppxo-pro locked" data-type="time">
                                <i class="fas fa-clock fa-2x text-blue mb-2"></i>
                                <div class="fw-medium text-danger">Time Picker</div>
                            </div>

                            <div class="ppxo-options-component ppxo-pro locked" data-type="range">
                                <i class="fas fa-sliders-h fa-2x text-cyan mb-2"></i>
                                <div class="fw-medium text-danger">Range Slider</div>
                            </div>

                            <!-- Free -->
                            <div class="ppxo-options-component" data-type="toggle">
                                <i class="fas fa-toggle-on fa-2x text-dark-blue mb-2"></i>
                                <div class="fw-medium">Toggle Switch</div>
                            </div>

                            <!-- Paid -->
                            <div class="ppxo-options-component ppxo-pro locked" data-type="url">
                                <i class="fas fa-link fa-2x text-secondary mb-2"></i>
                                <div class="fw-medium text-danger">URL Field</div>
                            </div>

                            <div class="ppxo-options-component ppxo-pro locked" data-type="password">
                                <i class="fas fa-key fa-2x text-dark mb-2"></i>
                                <div class="fw-medium text-danger">Password</div>
                            </div>

                            <!-- Free -->
                            <div class="ppxo-options-component" data-type="hidden">
                                <i class="fas fa-eye-slash fa-2x text-muted mb-2"></i>
                                <div class="fw-medium">Hidden Field</div>
                            </div>

                        </div>
                    </div>




                </aside>




                <!-- MAIN CONTENT AREA -->
                <main class="ppxo-options-main">

                    <div class="wfb-form-builder-area position-relative" id="ppxo-formBuilder">


                    </div>


                </main>


                <!-- RIGHT SIDEBAR (SETTINGS) -->
                <aside class="ppxo-options-sidebar-right p-4">


                    <?php
                    $this->render_right_sidebar();

                    ?>

                </aside>

            </div>



            <input type="hidden" id="ppxo_form_data" value="<?php echo esc_attr(json_encode($current_form_data)); ?>">
            <input type="hidden" id="ppxo_form_data_latest" value="<?php echo esc_attr(json_encode($current_form_data)); ?>">

        <?php
    }



    private function render_right_sidebar()
    {
        ?>

            <!-- Right Sidebar Placeholder -->
            <div id="ppxo-right-sidebar-placeholder"
                class="d-flex flex-column align-items-center justify-content-center
            text-center px-4 py-5 text-muted">

                <div class="mb-3 d-flex align-items-center justify-content-center
                rounded-circle bg-light"
                    style="width:64px;height:64px;">
                    <i class="fas fa-layer-group fs-3 text-primary"></i>
                </div>

                <h6 class="fw-semibold text-dark mb-2">
                    Nothing to show
                </h6>

                <p class="mb-3 small" style="max-width:260px;">
                    This panel updates based on your current selection.
                    Choose something from the main area to continue.
                </p>

                <small class="small">
                    Tip: Add or select an item to reveal options here.
                </small>

            </div>


            <!-- Field Settings Panel -->
            <div class="wfb-settings-sections d-none" id="wfb-settingsSections">

                <!-- HEADER -->
                <div class="wfb-settings-header d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <div class="wfb-settings-icon text-primary">
                            <i class="fas fa-sliders-h"></i>
                        </div>
                        <h4 class="wfb-settings-title m-0" id="wfb-settingsTitle">
                            Field Settings
                        </h4>
                    </div>

                </div>


                <!-- Modern Elegant Tabs -->
                <ul class="nav nav-tabs w-100 mt-3 mb-3 modern-tabs" id="ppxo-settingsTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active text-dark fw-semibold" id="ppxo-general-tab" data-bs-toggle="tab" data-bs-target="#wfb-display" type="button" role="tab" aria-controls="wfb-display" aria-selected="true">
                            General
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link text-dark fw-semibold" id="ppxo-logic-tab" data-bs-toggle="tab" data-bs-target="#wfb-advanced" type="button" role="tab" aria-controls="ppxo-logic" aria-selected="false">
                            Advanced
                        </button>
                    </li>
                </ul>

                <!-- Content Area -->
                <div class="tab-content" id="ppxo-settingsTabsContent">
                    <!-- General Tab -->
                    <div class="tab-pane fade show active" id="wfb-display" role="tabpanel" aria-labelledby="ppxo-general-tab">

                    </div>



                    <!-- Advanced Tab -->
                    <div class="tab-pane fade" id="wfb-advanced" role="tabpanel" aria-labelledby="ppxo-logic-tab">

                    </div>
                </div>

            </div>


            <!-- ASSIGN PRODUCTS -->
            <div id="wfb-panelAssign" class="wfb-panel d-none">
                <div class="p-3">

                    <!-- Header -->
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h5 class="mb-0 fw-semibold">Assign Products</h5>
                        <span class="text-muted small">WooCommerce</span>
                    </div>

                    <!-- Hook Selector -->
                    <div class="mb-3">
                        <label class="form-label small text-muted mb-1">
                            Display on product page
                        </label>

                        <select id="ppxo-product-hook" class="form-select">
                            <option value="">Select location</option>

                            <option value="woocommerce_before_add_to_cart_form">
                                Before Add to Cart
                            </option>

                            <option value="woocommerce_before_add_to_cart_button">
                                Before Add to Cart Button
                            </option>

                            <option value="woocommerce_after_add_to_cart_button">
                                After Add to Cart Button
                            </option>

                            <option value="woocommerce_after_add_to_cart_form">
                                After Add to Cart
                            </option>

                            <option value="woocommerce_product_meta_end">
                                Product Meta (bottom)
                            </option>
                        </select>


                        <small class="text-muted d-block mt-1">
                            Choose where this form appears on the product page.
                        </small>
                    </div>

                    <!-- Search -->
                    <div class="mb-3">
                        <input type="text"
                            id="ppxo-product-search"
                            class="form-control"
                            placeholder="Search products by name or ID…">
                    </div>

                    <!-- Product List -->
                    <div id="ppxo-product-list"
                        class="d-flex flex-column gap-2 p-1"
                        style="max-height:380px; overflow-y:auto;">
                        <!-- Products load here -->
                    </div>

                </div>
            </div>




            <!-- EXPORT JSON -->
            <div class="wfb-panel d-none" id="wfb-panelJson">
                <div class="p-3">
                    <h5>Export JSON</h5>
                    <pre id="wfb-jsonContent" class="json-panel"></pre>
                    <button id="wfb-copyJsonBtn" class="btn btn-sm btn-outline-primary mt-2">Copy JSON</button>
                </div>
            </div>




            <!-- PREVIEW -->
            <div class="wfb-panel d-none" id="wfb-panelPreview">
                <div class="p-3">
                    <h5>Preview</h5>
                    <div id="wfb-previewContent"></div>
                </div>
            </div>




    <?php
    }
}
