<?php

defined('ABSPATH') || exit;

class PPXO_Page_Main
{
    /**
     * Entry point
     */
    public function render()
    {
        $nonce = wp_create_nonce('ppxo_admin_nonce');
        $ver   = PPXO_VERSION;

        $theme = get_option('ppxo_admin_theme', 'ppxo-theme-purple');
        $dark  = get_option('ppxo_dark_mode', false) ? 'ppxo-dark' : '';
        $tab   = $this->get_current_tab();
?>

        <div
            id="ppxo-app"
            class="ppxo-root <?php echo esc_attr($theme . ' ' . $dark); ?>"
            data-nonce="<?php echo esc_attr($nonce); ?>"
            data-version="<?php echo esc_attr($ver); ?>"
            role="application">

            <?php $this->render_header($tab); ?>

            <main class="ppxo-main">
                <?php $this->render_current_tab($tab); ?>
            </main>

        </div>
    <?php
    }

    /* -------------------------------------------------------------------------
     * Helpers
     * ---------------------------------------------------------------------- */

    private function get_current_tab()
    {
        return isset($_GET['tab'])
            ? sanitize_key($_GET['tab'])
            : 'dashboard';
    }







    /* -------------------------------------------------------------------------
     * Header / Footer
     * ---------------------------------------------------------------------- */
    private function render_header($current_tab)
    {
    ?>
        <!-- HEADER -->
        <header class="ppxo-header shadow-sm">
            <div class="ppxo-header-inner container-fluid d-flex justify-content-between align-items-center">

                <!-- LEFT SIDE -->
                <div class="d-flex align-items-center gap-3">

                    <img
                        class="ppxo-logo"
                        src="<?php echo esc_url(PPXO_PLUGIN_URL . 'assets/img/logo.png'); ?>"
                        alt="Product Plus" />

                    <!-- <div class="ppxo-product-meta">
                        <strong>Product Plus</strong>
                        <span>Extra Product Options</span>
                    </div> -->






                </div>

                <div>
                    <nav class="ppxo-nav ms-4">

                        <?php $this->tab_link('dashboard', 'Dashboard', 'fa-tachometer', $current_tab); ?>
                        <?php $this->tab_link('options_list', 'Options', 'fa-th-large', $current_tab); ?>
                        <?php $this->tab_link('settings', 'Settings', 'fa-cog', $current_tab); ?>
                        <?php $this->tab_link('help', 'Help', 'fa-life-ring', $current_tab); ?>

                    </nav>
                </div>

                <!-- RIGHT SIDE -->
                <div class="ppxo-header-actions d-flex align-items-center gap-2">

                    <a
                        href="<?php echo admin_url('admin.php?page=ppxo-options&action=new'); ?>"
                        class="btn header-options-btn">
                        <i class="fa fa-plus-circle me-1"></i>
                        New Option Group
                    </a>


                    <a
                        href="#"
                        class="btn header-options-btn">
                        <i class="fa fa-lock me-1"></i>
                        Go Pro
                    </a>

                </div>

            </div>
        </header>

    <?php
    }










    private function tab_link($tab, $label, $icon, $current_tab)
    {
        $active = $current_tab === $tab ? 'is-active' : '';
        $url    = admin_url('admin.php?page=ppxo-main&tab=' . $tab);
    ?>
        <a href="<?php echo esc_url($url); ?>" class="ppxo-tab <?php echo esc_attr($active); ?>">
            <i class="fa <?php echo esc_attr($icon); ?>"></i> <?php echo esc_html($label); ?>
        </a>
    <?php
    }

    /* -------------------------------------------------------------------------
     * Tab Router
     * ---------------------------------------------------------------------- */

    private function render_current_tab($tab)
    {
        switch ($tab) {
            case 'options_list':
                $this->render_options_list_tab();
                break;

            case 'settings':
                $this->render_settings_tab();
                break;

            case 'help':
                $this->render_help_tab();
                break;

            case 'dashboard':
            default:
                $this->render_dashboard_tab();
                break;
        }
    }




    /* -------------------------------------------------------------------------
     * Tabs
     * ---------------------------------------------------------------------- */

    private function render_dashboard_tab()
    {
    ?>
        <div class="container-fluid ppxo-container">

            <div class="ppxo-hero">
                <div class="ppxo-hero-content row align-items-center">
                    <div class="ppxo-hero-text col-md-8">
                        <h1 class="ppxo-page-title">Extra Product Options</h1>
                        <p class="ppxo-page-subtitle">
                            Create flexible product add-ons with conditional logic and dynamic pricing.
                        </p>
                    </div>

                    <div class="ppxo-hero-action col-md-4 text-md-end mt-4 mt-md-0">
                        <a href="<?php echo admin_url('admin.php?page=ppxo-options&action=new'); ?>"
                            class="ppxo-btn-hero">
                            <i class="fa fa-plus-circle"></i>
                            <span>Create New Option Group</span>
                        </a>
                    </div>
                </div>

                <div class="ppxo-hero-glow"></div>
            </div>


            <div class="row mt-5">
                <div class="col-md-8">

                    <div class="ppxo-card ppxo-spotlight-card">
                        <div class="row align-items-center g-5">
                            <div class="col-md-6">
                                <div class="ppxo-spotlight-content">
                                    <span class="ppxo-badge-mini">Smart Upselling</span>
                                    <h2 class="ppxo-spotlight-title">Sell More With Smart Customization</h2>
                                    <p class="ppxo-spotlight-text">
                                        Create flexible option groups, apply smart conditions, and control pricing with precision.
                                        <strong>Product Plus</strong> helps you increase average order value and deliver exactly
                                        what buyers want without writing a single line of code.
                                    </p>
                                    <div class="ppxo-mt">
                                        <a href="<?php echo admin_url('admin.php?page=ppxo-options&action=new'); ?>"
                                            class="ppxo-btn-hero">
                                            <i class="fa fa-plus-circle"></i>
                                            <span>Get Started Now</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6 text-center">
                                <div class="ppxo-media-wrapper">
                                    <img src="<?php echo esc_url(PPXO_PLUGIN_URL . 'assets/img/dashboard-hero.png'); ?>"
                                        class="img-fluid ppxo-floating-img"
                                        alt="Product Plus Illustration">
                                    <div class="ppxo-img-glow"></div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="row mt-3">
                        <div class="col-md-6">
                            <div class="ppxo-glass-card h-100">
                                <div class="ppxo-card-head">
                                    <div class="ppxo-icon-circle">
                                        <i class="fa fa-users"></i>
                                    </div>
                                    <h5 class="ppxo-side-title mb-0">Support & Community</h5>
                                </div>

                                <div class="ppxo-action-grid mt-3">
                                    <a target="_blank" href="https://wpagain.com/support" class="ppxo-action-tile">
                                        <i class="fa fa-envelope-open"></i>
                                        <span>Contact Support</span>
                                    </a>
                                    <a target="_blank" href="https://wpagain.com/community" class="ppxo-action-tile">
                                        <i class="fa fa-discord"></i>
                                        <span>Join Community</span>
                                    </a>
                                    <a target="_blank" href="https://wpagain.com/report" class="ppxo-action-tile highlight-red">
                                        <i class="fa fa-bug"></i>
                                        <span>Report Issue</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="ppxo-glass-card h-100">
                                <div class="ppxo-card-head">
                                    <div class="ppxo-icon-circle color-lime">
                                        <i class="fa fa-book-open"></i>
                                    </div>
                                    <h5 class="ppxo-side-title mb-0">Learning Resources</h5>
                                </div>

                                <div class="ppxo-action-grid mt-3">
                                    <a target="_blank" href="https://wpagain.com/docs" class="ppxo-action-tile">
                                        <i class="fa fa-file-alt"></i>
                                        <span>Documentation</span>
                                    </a>
                                    <a target="_blank" href="https://wpagain.com/tutorials" class="ppxo-action-tile">
                                        <i class="fa fa-play-circle"></i>
                                        <span>Video Lessons</span>
                                    </a>
                                    <a target="_blank" href="https://wpagain.com/blog" class="ppxo-action-tile">
                                        <i class="fa fa-lightbulb"></i>
                                        <span>Tips & Tricks</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="col-md-4">
                    <div class="ppxo-side-card mb-4">
                        <h5 class="ppxo-side-title">Resources</h5>
                        <div class="ppxo-resource-grid">
                            <a href="#" class="ppxo-resource-item">
                                <i class="fa fa-book-open"></i>
                                <span>Docs</span>
                            </a>
                            <a href="#" class="ppxo-resource-item">
                                <i class="fa fa-video"></i>
                                <span>Tutorials</span>
                            </a>
                            <a href="#" class="ppxo-resource-item">
                                <i class="fa fa-code"></i>
                                <span>Snippets</span>
                            </a>
                            <a href="https://wordpress.org/plugins/product-plus/" target="_blank" class="ppxo-resource-item highlight">
                                <i class="fa fa-star"></i>
                                <span>Review</span>
                            </a>
                        </div>
                    </div>

                    <div class="ppxo-side-card">
                        <div class="d-flex justify-content-between align-items:center mb-3">
                            <h5 class="ppxo-side-title mb-0">System Status</h5>
                            <span class="ppxo-status-dot pulse"></span>
                        </div>
                        <div class="ppxo-status-list">
                            <div class="ppxo-status-row">
                                <span>WordPress</span>
                                <strong><?php echo esc_html(get_bloginfo('version')); ?></strong>
                            </div>
                            <div class="ppxo-status-row">
                                <span>WooCommerce</span>
                                <strong><?php echo class_exists('WooCommerce') ? esc_html(WC()->version) : 'N/A'; ?></strong>
                            </div>
                            <div class="ppxo-status-row">
                                <span>PHP Version</span>
                                <strong><?php echo esc_html(phpversion()); ?></strong>
                            </div>
                            <div class="ppxo-status-row">
                                <span>Memory</span>
                                <strong><?php echo esc_html(WP_MEMORY_LIMIT); ?></strong>
                            </div>
                        </div>
                        <a href="#" class="ppxo-btn-secondary ppxo-full mt-3 text-center">Contact Support</a>
                    </div>
                </div>
            </div>

        </div>






    <?php
    }






    private function render_options_list_tab()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ppxo_forms';

        // 1. Pagination & Data Logic
        $per_page = 10;
        $current_page = isset($_GET['paged']) ? max(1, intval($_GET['paged'])) : 1;
        $offset = ($current_page - 1) * $per_page;
        $total_items = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        $total_pages = ceil($total_items / $per_page);

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name ORDER BY created_at DESC LIMIT %d OFFSET %d",
            $per_page,
            $offset
        ));
    ?>
        <div class="ppxo-admin-wrap animate-in">

            <div class="ppxo-top-bar d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="ppxo-page-title mb-0">Option Groups</h1>
                    <p class="text-muted small mb-0">Manage and deploy custom product addons.</p>
                </div>
                <a href="<?php echo admin_url('admin.php?page=ppxo-options&action=new'); ?>" class="ppxo-btn-hero">
                    <i class="fa fa-plus-circle"></i> Create New Group
                </a>
            </div>

            <div class="ppxo-main-card shadow-sm border-0 rounded-3 overflow-hidden bg-white">
                <div class="table-responsive">
                    <table class="table ppxo-modern-table mb-0">
                        <thead>
                            <tr>
                                <th class="ps-4" width="40"><input type="checkbox" class="ppxo-main-check custom-check"></th>
                                <th>Group Details</th>
                                <th>Status</th>
                                <th>Visibility</th>
                                <th>Last Activity</th>
                                <th class="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if ($results) : foreach ($results as $row) :
                                    $data = json_decode($row->form_data, true);
                                    $name = !empty($data['group_name']) ? $data['group_name'] : 'Untitled Options';
                                    $fields_count = count($data['fields'] ?? []);
                                    $prods_count = count($data['products'] ?? []);
                            ?>
                                    <tr class="ppxo-row-item" data-id="<?php echo $row->form_id; ?>">
                                        <td class="ps-4">
                                            <input type="checkbox" class="ppxo-row-check custom-check" value="<?php echo $row->form_id; ?>">
                                        </td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="ppxo-table-icon"><i class="fa fa-layer-group"></i></div>
                                                <div>
                                                    <div class="fw-bold text-dark mb-0"><?php echo esc_html($name); ?></div>
                                                    <small class="text-muted"><?php echo $fields_count; ?> Input Fields</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span class="ppxo-status-pill">Active</span></td>
                                        <td>
                                            <div class="ppxo-mini-tag"><?php echo $prods_count; ?> Products</div>
                                        </td>
                                        <td>
                                            <div class="small fw-600 text-dark"><?php echo date('M d, Y', strtotime($row->updated_at)); ?></div>
                                            <div class="text-muted smaller"><?php echo date('H:i', strtotime($row->updated_at)); ?></div>
                                        </td>
                                        <td class="text-end pe-4">
                                            <div class="ppxo-action-btn-group">
                                                <a href="<?php echo admin_url('admin.php?page=ppxo-options&action=edit&id=' . $row->form_id); ?>" class="ppxo-icon-btn edit-btn"><i class="fa fa-pencil-alt"></i></a>
                                                <button class="ppxo-icon-btn delete-btn ppxo-trigger-single-delete" data-id="<?php echo $row->form_id; ?>"><i class="fa fa-trash-alt"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach;
                            else: ?>
                                <tr>
                                    <td colspan="6" class="text-center py-5 text-muted">No records found.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>

                <div class="ppxo-table-footer border-top p-4 d-flex justify-content-between align-items-center bg-white">

                    <div class="ppxo-footer-left">
                        <div id="ppxo-selection-panel" class="ppxo-selection-bar d-none">
                            <span class="ppxo-selection-label">
                                <i class="fa fa-check-circle text-primary me-2"></i>
                                <span id="selected-count">0</span> Selected
                            </span>
                            <button class="ppxo-btn-delete-bulk ppxo-trigger-batch-delete">
                                <i class="fa fa-trash-alt me-1"></i> Delete
                            </button>
                        </div>
                        <div id="ppxo-footer-info" class="text-muted small">
                            Showing <?php echo count($results); ?> of <?php echo $total_items; ?> entries
                        </div>
                    </div>

                    <div class="ppxo-pagination-container">
                        <?php
                        echo paginate_links([
                            'base'      => add_query_arg('paged', '%#%'),
                            'format'    => '',
                            'prev_text' => '<i class="fa fa-angle-left"></i>',
                            'next_text' => '<i class="fa fa-angle-right"></i>',
                            'total'     => $total_pages,
                            'current'   => $current_page,
                            'type'      => 'list',
                        ]);
                        ?>
                    </div>
                </div>
            </div>
        </div>

        <div class="ppxo-modal-overlay" id="ppxo-delete-modal">
            <div class="ppxo-modal-body">
                <div class="ppxo-modal-header text-danger"><i class="fa fa-exclamation-circle fa-3x"></i></div>
                <h4 class="fw-bold mt-3">Confirm Deletion</h4>
                <p class="text-muted">Are you sure you want to remove the selected groups? This action cannot be undone.</p>
                <div class="d-flex gap-2 justify-content-center mt-4">
                    <button class="ppxo-btn-cancel" id="ppxo-cancel-delete">Cancel</button>
                    <button class="ppxo-btn-confirm" id="ppxo-confirm-delete">Delete Permanently</button>
                </div>
            </div>
        </div>

        <style>
            /* ANIMATIONS & MODERN UI
        ---------------------------------------*/
            .animate-in {
                animation: ppxoFadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
            }

            @keyframes ppxoFadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }

                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* FOOTER DESIGN */
            .ppxo-table-footer {
                background: #fff;
            }

            .ppxo-selection-bar {
                display: flex;
                align-items: center;
                gap: 12px;
                animation: ppxoSlideInLeft 0.3s ease;
            }

            @keyframes ppxoSlideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }

                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .ppxo-selection-label {
                background: rgba(16, 185, 129, 0.1);
                color: #059669;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 700;
            }

            .ppxo-btn-delete-bulk {
                border: 1px solid #fee2e2;
                background: #fff;
                color: #ef4444;
                padding: 6px 15px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 700;
                transition: all 0.2s;
            }

            .ppxo-btn-delete-bulk:hover {
                background: #ef4444;
                color: #fff;
            }

            /* PAGINATION OVERRIDE */
            .ppxo-pagination-container ul.page-numbers {
                display: flex;
                list-style: none;
                margin: 0;
                padding: 0;
                gap: 4px;
            }

            .ppxo-pagination-container ul.page-numbers li a,
            .ppxo-pagination-container ul.page-numbers li span {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 34px;
                height: 34px;
                text-decoration: none;
                color: #64748b;
                font-weight: 600;
                font-size: 13px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                transition: 0.2s;
            }

            .ppxo-pagination-container ul.page-numbers li span.current {
                background: var(--ppxo-primary);
                color: #fff;
                border-color: var(--ppxo-primary);
            }

            .ppxo-pagination-container ul.page-numbers li a:hover {
                border-color: var(--ppxo-primary);
                color: var(--ppxo-primary);
                background: rgba(16, 185, 129, 0.05);
            }

            /* MODAL STYLES */
            .ppxo-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.4);
                backdrop-filter: blur(8px);
                z-index: 10001;
                display: none;
                align-items: center;
                justify-content: center;
            }

            .ppxo-modal-body {
                background: #fff;
                border-radius: 24px;
                padding: 40px;
                width: 420px;
                text-align: center;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
            }

            .ppxo-btn-cancel {
                border: none;
                background: #f1f5f9;
                color: #64748b;
                padding: 10px 25px;
                border-radius: 12px;
                font-weight: 700;
            }

            .ppxo-btn-confirm {
                border: none;
                background: #ef4444;
                color: #fff;
                padding: 10px 25px;
                border-radius: 12px;
                font-weight: 700;
            }

            /* TABLE UI ELEMENTS */
            .ppxo-table-icon {
                width: 40px;
                height: 40px;
                background: rgba(16, 185, 129, 0.1);
                color: var(--ppxo-primary);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
            }

            .ppxo-status-pill {
                background: rgba(16, 185, 129, 0.1);
                color: #059669;
                font-size: 11px;
                font-weight: 800;
                padding: 4px 10px;
                border-radius: 20px;
                text-transform: uppercase;
            }

            /* ACTION GROUP CONTAINER */
            .ppxo-action-btn-group {
                display: inline-flex;
                background: #f8fafc;
                /* Very light gray background tray */
                padding: 4px;
                border-radius: 10px;
                border: 1px solid var(--ppxo-border);
                gap: 4px;
            }

            /* INDIVIDUAL ICON BUTTONS */
            .ppxo-icon-btn {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 7px;
                border: none;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                text-decoration: none !important;
                font-size: 13px;
                cursor: pointer;
            }

            /* EDIT BUTTON - SOFT PRIMARY */
            .edit-btn {
                color: var(--ppxo-primary);
                background: transparent;
            }

            .edit-btn:hover {
                background: var(--ppxo-primary);
                color: #fff;
                box-shadow: 0 4px 8px var(--ppxo-primary-glow);
                transform: translateY(-1px);
            }

            /* DELETE BUTTON - SOFT DANGER */
            .delete-btn {
                color: #ef4444;
                background: transparent;
            }

            .delete-btn:hover {
                background: #ef4444;
                color: #fff;
                box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
                transform: translateY(-1px);
            }

            .ppxo-toast {
                position: fixed;
                top: 30px;
                right: 30px;
                background: #fff;
                padding: 15px 25px;
                border-radius: 12px;
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10002;
                transform: translateX(120%);
                transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                border-left: 5px solid #10b981;
            }

            .ppxo-toast.show {
                transform: translateX(0);
            }

            .ppxo-toast.success i {
                color: #10b981;
            }

            .ppxo-toast.error {
                border-left-color: #ef4444;
            }

            .ppxo-toast.error i {
                color: #ef4444;
            }

            .ppxo-toast span {
                font-weight: 600;
                color: #1e293b;
                font-size: 14px;
            }
        </style>


    <?php
    }









private function render_settings_tab()
{
    $settings = get_option('ppxo_settings', [
        'enable_plugin'      => 'on',
        'load_conditionally' => 'off',
        'show_price_labels'  => 'on',
        'display_style'      => 'modern',
        'total_price_box'    => 'on',
        'debug_mode'         => 'off'
    ]);
    ?>
    <div class="ppxo-admin-wrap animate-in">
        <div class=" d-flex justify-content-between align-items-center mb-4 ppxo-hero">
            <div>
                <h1 class="ppxo-page-title mb-1">General Settings</h1>
                <p class="ppxo-page-subtitle">Configure your product options experience and performance.</p>
            </div>
            <button type="button" id="ppxo-save-settings" class="ppxo-btn-hero">
                <span class="btn-text"><i class="fa fa-save me-2"></i> Save Settings</span>
            </button>
        </div>

        <form id="ppxo-settings-form" class="ppxo-settings-grid">
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="ppxo-main-card h-100">
                        <div class="ppxo-card-inner">
                            <div class="ppxo-section-title">
                                <i class="fa fa-eye"></i>
                                <span>Display Options</span>
                            </div>

                            <div class="ppxo-control-group">
                                <div class="ppxo-control-info">
                                    <label class="ppxo-label">Enable Extra Options</label>
                                    <p class="ppxo-desc">Show or hide custom options on the frontend globally.</p>
                                </div>
                                <label class="ppxo-switch">
                                    <input type="checkbox" name="enable_plugin" <?php checked($settings['enable_plugin'], 'on'); ?>>
                                    <span class="ppxo-slider"></span>
                                </label>
                            </div>

                            <div class="ppxo-control-group">
                                <div class="ppxo-control-info">
                                    <label class="ppxo-label">Display Total Price</label>
                                    <p class="ppxo-desc">Update product price dynamically based on selection.</p>
                                </div>
                                <label class="ppxo-switch">
                                    <input type="checkbox" name="total_price_box" <?php checked($settings['total_price_box'], 'on'); ?>>
                                    <span class="ppxo-slider"></span>
                                </label>
                            </div>

                            <div class="ppxo-control-group border-0">
                                <div class="ppxo-control-info">
                                    <label class="ppxo-label">Price Labels</label>
                                    <p class="ppxo-desc">Show price surcharges (+ $5.00) next to option names.</p>
                                </div>
                                <label class="ppxo-switch">
                                    <input type="checkbox" name="show_price_labels" <?php checked($settings['show_price_labels'], 'on'); ?>>
                                    <span class="ppxo-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="ppxo-main-card h-100">
                        <div class="ppxo-card-inner">
                            <div class="ppxo-section-title">
                                <i class="fa fa-sliders-h"></i>
                                <span>System & Style</span>
                            </div>

                            <div class="ppxo-input-group mb-4">
                                <label class="ppxo-label d-block mb-2">Frontend Theme Style</label>
                                <select class="ppxo-select-field" name="display_style">
                                    <option value="modern" <?php selected($settings['display_style'], 'modern'); ?>>Modern (Rounded Tiles)</option>
                                    <option value="classic" <?php selected($settings['display_style'], 'classic'); ?>>Classic (WP Standard)</option>
                                    <option value="minimal" <?php selected($settings['display_style'], 'minimal'); ?>>Minimalist (Borderless)</option>
                                </select>
                            </div>

                            <div class="ppxo-control-group">
                                <div class="ppxo-control-info">
                                    <label class="ppxo-label">Conditional Loading</label>
                                    <p class="ppxo-desc">Only load assets on products with assigned options.</p>
                                </div>
                                <label class="ppxo-switch">
                                    <input type="checkbox" name="load_conditionally" <?php checked($settings['load_conditionally'], 'on'); ?>>
                                    <span class="ppxo-slider"></span>
                                </label>
                            </div>

                            <div class="ppxo-control-group border-0">
                                <div class="ppxo-control-info">
                                    <label class="ppxo-label text-danger">Developer Debug Mode</label>
                                    <p class="ppxo-desc">Log technical data to the browser console for testing.</p>
                                </div>
                                <label class="ppxo-switch">
                                    <input type="checkbox" name="debug_mode" <?php checked($settings['debug_mode'], 'on'); ?>>
                                    <span class="ppxo-slider-danger"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <input type="hidden" name="action" value="ppxo_save_settings">
            <input type="hidden" name="nonce" value="<?php echo wp_create_nonce('ppxo_settings_nonce'); ?>">
        </form>
    </div>

    <style>
        /* NON-CONFLICTING PREMIUM TOGGLE & STYLES */
        .ppxo-card-inner { padding: 30px; }
        
        .ppxo-section-title {
            display: flex; align-items: center; gap: 12px;
            margin-bottom: 25px; color: #1e293b; font-weight: 700; font-size: 16px;
        }
        .ppxo-section-title i {
            width: 32px; height: 32px; background: rgba(16, 185, 129, 0.1);
            color: var(--ppxo-primary); display: flex; align-items: center;
            justify-content: center; border-radius: 8px; font-size: 14px;
        }

        .ppxo-control-group {
            display: flex; justify-content: space-between; align-items: center;
            padding: 18px 0; border-bottom: 1px solid #f1f5f9;
        }
        .ppxo-label { font-weight: 600; color: #334155; margin-bottom: 2px; display: block; }
        .ppxo-desc { font-size: 12.5px; color: #64748b; margin: 0; }

        /* CUSTOM SELECT */
        .ppxo-select-field {
            width: 100%; padding: 10px 15px; border-radius: 10px;
            border: 1px solid #e2e8f0; background: #fff; color: #475569;
            font-size: 14px; outline: none; transition: border 0.2s;
        }
        .ppxo-select-field:focus { border-color: var(--ppxo-primary); }

        /* PREMIUM SWITCH (Replaces Bootstrap Switch) */
        .ppxo-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
        .ppxo-switch input { opacity: 0; width: 0; height: 0; }
        .ppxo-slider {
            position: absolute; cursor: pointer; inset: 0; background-color: #cbd5e1;
            transition: .3s; border-radius: 34px;
        }
        .ppxo-slider:before {
            position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
            background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input:checked + .ppxo-slider { background-color: var(--ppxo-primary); }
        input:checked + .ppxo-slider:before { transform: translateX(20px); }
        
        /* Danger Switch for Debug */
        input:checked + .ppxo-slider-danger { background-color: #ef4444; }
        .ppxo-slider-danger { position: absolute; cursor: pointer; inset: 0; background-color: #cbd5e1; transition: .3s; border-radius: 34px; }
        .ppxo-slider-danger:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .ppxo-slider-danger:before { transform: translateX(20px); }
    </style>

    <script>
    jQuery(document).ready(function($) {
        $('#ppxo-save-settings').on('click', function() {
            const $btn = $(this);
            const formData = $('#ppxo-settings-form').serialize();

            $btn.prop('disabled', true).find('.btn-text').html('<i class="fa fa-spinner fa-spin me-2"></i> Saving...');

            $.post(ppxo_dashboard.ajax_url, formData, function(response) {
                if(response.success) {
                    showPpxoToast('Settings updated successfully', 'success');
                } else {
                    showPpxoToast('Error saving settings', 'error');
                }
                $btn.prop('disabled', false).find('.btn-text').html('<i class="fa fa-save me-2"></i> Save Settings');
            });
        });
    });
    </script>
    <?php
}





private function render_help_tab()
{
    ?>
    <div class="ppxo-admin-wrap animate-in">
        <div class="ppxo-hero mb-4">
            <h1 class="ppxo-page-title mb-1">Help & Documentation</h1>
            <p class="ppxo-page-subtitle">Everything you need to configure and troubleshoot your product options.</p>
        </div>

        <div class="row g-4">
            <div class="col-md-8">
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="ppxo-guide-card">
                            <i class="fa fa-magic"></i>
                            <h6>Quick Setup</h6>
                            <p>Learn how to create your first option group in 60 seconds.</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="ppxo-guide-card">
                            <i class="fa fa-code"></i>
                            <h6>Shortcodes</h6>
                            <p>Display your options anywhere using our custom shortcodes.</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="ppxo-guide-card">
                            <i class="fa fa-book"></i>
                            <h6>Full Docs</h6>
                            <p>Read our comprehensive online documentation manual.</p>
                        </div>
                    </div>
                </div>

                <div class="ppxo-main-card p-4">
                    <h5 class="fw-bold mb-4 text-dark"><i class="fa fa-question-circle me-2 text-primary"></i> Frequently Asked Questions</h5>
                    
                    <div class="ppxo-accordion">
                        <div class="ppxo-acc-item">
                            <div class="ppxo-acc-trigger">How do I assign options to specific products? <i class="fa fa-chevron-down"></i></div>
                            <div class="ppxo-acc-content">Go to <strong>Option Groups</strong>, click edit, and use the "Assigned Products" search bar to select one or multiple products.</div>
                        </div>
                        <div class="ppxo-acc-item">
                            <div class="ppxo-acc-trigger">Can I set different prices for different choices? <i class="fa fa-chevron-down"></i></div>
                            <div class="ppxo-acc-content">Yes! When adding fields like Checkboxes or Dropdowns, you can enter a "Price" for each individual option.</div>
                        </div>
                        <div class="ppxo-acc-item border-0">
                            <div class="ppxo-acc-trigger">Why are options not showing on my product page? <i class="fa fa-chevron-down"></i></div>
                            <div class="ppxo-acc-content">Ensure the "Global Status" is enabled in Settings and that your theme supports standard WooCommerce hooks like <code>woocommerce_before_add_to_cart_button</code>.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="ppxo-main-card p-4 mb-4 bg-dark text-white border-0">
                    <h6 class="text-uppercase small fw-bold opacity-75 mb-3">System Status</h6>
                    <div class="d-flex justify-content-between mb-2">
                        <span>WooCommerce</span>
                        <span class="text-success small fw-bold"><i class="fa fa-check-circle"></i> Active</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>PHP Version</span>
                        <span><?php echo PHP_VERSION; ?></span>
                    </div>
                    <div class="d-flex justify-content-between mb-0">
                        <span>Database Table</span>
                        <span class="text-success small fw-bold"><i class="fa fa-check-circle"></i> Ready</span>
                    </div>
                </div>

                <div class="ppxo-main-card p-4 border-0 shadow-sm text-center">
                    <div class="ppxo-support-icon mb-3">
                        <i class="fa fa-headset fa-2x"></i>
                    </div>
                    <h5 class="fw-bold">Need Personal Help?</h5>
                    <p class="text-muted small">Our technical team is available Monday - Friday to assist with custom implementations.</p>
                    <a href="mailto:support@example.com" class="ppxo-btn-hero w-100 justify-content-center">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    </div>

    <style>
        /* HELP TAB SPECIFIC STYLES */
        .ppxo-guide-card {
            background: #fff; padding: 25px 20px; border-radius: 15px;
            border: 1px solid #e2e8f0; text-align: center; transition: all 0.3s ease;
            cursor: pointer; height: 100%;
        }
        .ppxo-guide-card:hover { transform: translateY(-5px); border-color: var(--ppxo-primary); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .ppxo-guide-card i { font-size: 24px; color: var(--ppxo-primary); margin-bottom: 15px; display: block; }
        .ppxo-guide-card h6 { font-weight: 700; color: #1e293b; margin-bottom: 8px; }
        .ppxo-guide-card p { font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; }

        /* ACCORDION */
        .ppxo-acc-item { border-bottom: 1px solid #f1f5f9; }
        .ppxo-acc-trigger {
            padding: 18px 0; font-weight: 600; color: #334155; cursor: pointer;
            display: flex; justify-content: space-between; align-items: center; transition: 0.2s;
        }
        .ppxo-acc-trigger:hover { color: var(--ppxo-primary); }
        .ppxo-acc-trigger i { font-size: 12px; transition: 0.3s; }
        .ppxo-acc-content { padding: 0 0 18px 0; font-size: 13.5px; color: #64748b; display: none; line-height: 1.6; }
        .ppxo-acc-item.active .ppxo-acc-content { display: block; }
        .ppxo-acc-item.active .ppxo-acc-trigger i { transform: rotate(180deg); }

        /* SUPPORT CARD */
        .ppxo-support-icon {
            width: 60px; height: 60px; background: rgba(16, 185, 129, 0.1);
            color: var(--ppxo-primary); border-radius: 50%; display: flex;
            align-items: center; justify-content: center; margin: 0 auto;
        }
    </style>

    <script>
    jQuery(document).ready(function($) {
        // Simple Accordion Toggle
        $('.ppxo-acc-trigger').on('click', function() {
            const item = $(this).closest('.ppxo-acc-item');
            item.toggleClass('active').siblings().removeClass('active');
        });
    });
    </script>
    <?php
}
}
