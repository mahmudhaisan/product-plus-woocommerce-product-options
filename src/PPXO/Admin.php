<?php

namespace PPXO;

defined('ABSPATH') || exit;

class Admin
{
    private $current_form_data = array();
    private $post_type = 'ppxo_form';


    public function __construct()
    {
        // Register custom post type for forms
        add_action('init', [$this, 'register_form_cpt']);

        // Add admin menu
        add_action('admin_menu', [$this, 'add_admin_menu']);

        // Enqueue assets for the admin page
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);

        // Add settings link to plugin action links
        add_filter('plugin_action_links_' . plugin_basename(PPXO_PLUGIN_FILE), [$this, 'plugin_settings_link']);

        // Add meta box for form builder
        add_action('add_meta_boxes_ppxo_form', [$this, 'add_form_builder_meta_box']);

        // Add meta box for form shortcode
        add_action('add_meta_boxes_ppxo_form', [$this, 'add_shortcode_meta_box']);

        // Save form data
        add_action('save_post_ppxo_form', [$this, 'save_form_data']);

        // Handle form preview
        add_action('admin_post_ppxo_form_preview', [$this, 'handle_form_preview']);

        // Handle AJAX requests
        add_action('wp_ajax_ppxo_save_form', [$this, 'handle_ajax_save_form']);

        // Localize script for AJAX
        add_action('admin_enqueue_scripts', [$this, 'localize_admin_script']);

        add_filter('parent_file', [$this, 'set_cpt_parent_menu']);
        add_filter('submenu_file', [$this, 'set_cpt_submenu']);

        // Hook to remove default publish box
        add_action('add_meta_boxes', array($this, 'remove_default_publish_box'));


        add_filter('post_updated_messages', [$this, 'custom_form_messages']);
    }

    /**
     * Localize admin script for AJAX
     */
    public function localize_admin_script($hook)
    {
        $current_screen = get_current_screen();

        if (
            $current_screen
            && $current_screen->post_type === 'ppxo_form'
            && ($hook === 'post.php' || $hook === 'post-new.php')
        ) {

            $post_id = 0;

            if (isset($_GET['post'])) {
                $post_id = intval($_GET['post']);
            } elseif (isset($_POST['post_ID'])) {
                $post_id = intval($_POST['post_ID']);
            } elseif (!empty($GLOBALS['post']->ID)) {
                $post_id = intval($GLOBALS['post']->ID);
            }

            wp_localize_script('ppxo-admin-script', 'ppxo_admin', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('ppxo_form_nonce'),
                'post_id'  => $post_id,
            ));
        }
    }


    /**
     * Register Form Custom Post Type
     */
    public function register_form_cpt()
    {
        $labels = array(
            'name' => __('Global Forms', 'ppxo'),
            'singular_name' => __('Global Form', 'ppxo'),
            'menu_name' => __('Global Forms', 'ppxo'),
            'name_admin_bar' => __('Global Form', 'ppxo'),
            'add_new' => __('Add New', 'ppxo'),
            'add_new_item' => __('Add New Global Form', 'ppxo'),
            'new_item' => __('New Global Form', 'ppxo'),
            'edit_item' => __('Edit Global Form', 'ppxo'),
            'view_item' => __('View Global Form', 'ppxo'),
            'all_items' => __('All Global Forms', 'ppxo'),
            'search_items' => __('Search Global Forms', 'ppxo'),
            'not_found' => __('No global forms found.', 'ppxo'),
            'not_found_in_trash' => __('No global forms found in Trash.', 'ppxo')
        );

        $args = array(
            'labels' => $labels,
            'public' => false,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => false, // <— now it has its own menu
            'query_var' => true,
            'capability_type' => 'post',
            'has_archive' => false,
            'hierarchical' => false,
            'menu_position' => 25,
            'supports' => array('title'),
            'menu_icon' => 'dashicons-forms'
        );

        register_post_type('ppxo_form', $args);
    }



    
    /**
     * Register Product Plus main menu and submenus
     */
    public function add_admin_menu()
    {
        // Add top-level menu
        add_menu_page(
            __('Product Plus', 'ppxo'),
            __('Product Plus', 'ppxo'),
            'manage_options',
            'ppxo-main',
            [$this, 'render_main_page'],
            'dashicons-admin-generic',
            56
        );

        // Add submenu: Forms (CPT listing)
        add_submenu_page(
            'ppxo-main',
            __('Forms', 'ppxo'),
            __('Forms', 'ppxo'),
            'manage_options',
            'edit.php?post_type=ppxo_form'
        );

        // Add submenu: Add New Form
        add_submenu_page(
            'ppxo-main',
            __('Add New Form', 'ppxo'),
            __('Add New Form', 'ppxo'),
            'manage_options',
            'post-new.php?post_type=ppxo_form'
        );

        // Add submenu: Options
        add_submenu_page(
            'ppxo-main',
            __('Product Plus Options', 'ppxo'),
            __('Options', 'ppxo'),
            'manage_options',
            'ppxo-global-form',
            [$this, 'render_global_form_page']
        );

        // Add submenu: Help & Docs
        add_submenu_page(
            'ppxo-main',
            __('Help & Docs', 'ppxo'),
            __('Help', 'ppxo'),
            'manage_options',
            'ppxo-help',
            [$this, 'render_help_page']
        );
    }



  /**
 * Enqueue CSS and JS assets for ALL Product Plus admin pages.
 *
 * @param string $hook The current admin page hook.
 */
public function enqueue_admin_assets($hook)
{
    global $post_type;

    // Load on ALL Product Plus admin pages
    $is_ppxo_page = (
        strpos($hook, 'ppxo-') !== false ||
        $post_type === 'ppxo_form' ||
        $hook === 'toplevel_page_ppxo-main' ||
        (isset($_GET['post_type']) && $_GET['post_type'] === 'ppxo_form') ||
        $hook === 'product-plus_page_ppxo-global-form' ||
        $hook === 'product-plus_page_ppxo-help'
    );

    if (!$is_ppxo_page) {
        return;
    }

    // Bootstrap CSS
    wp_enqueue_style(
        'ppxo-bootstrap',
        PPXO_ASSETS . '/css/bootstrap.min.css',
        [],
        '5.3.3'
    );

    // Font Awesome
    wp_enqueue_style(
        'ppxo-fontawesome',
        PPXO_ASSETS . '/css/fontawesome.min.css',
        [],
        '6.5.1'
    );

    // Check if we're on the form builder page
    $is_form_builder_page = ($post_type === 'ppxo_form' && ($hook === 'post.php' || $hook === 'post-new.php'));

    // jQuery UI (only needed for form builder)
    if ($is_form_builder_page) {
        wp_enqueue_script(
            'ppxo-jquery-ui',
            PPXO_ASSETS . '/js/jquery-ui.min.js',
            ['jquery'],
            PPXO_VERSION,
            true
        );
    }

    // Chart.js (for dashboard statistics) - Use CDN version for reliability
    if ($hook === 'toplevel_page_ppxo-main') {
        wp_enqueue_script(
            'ppxo-chart-js',
            'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
            [],
            '3.9.1',
            true
        );
    }

    // Bootstrap JS
    wp_enqueue_script(
        'ppxo-bootstrap',
        PPXO_ASSETS . '/js/bootstrap.min.js',
        ['jquery'],
        '5.3.3',
        true
    );

    // Custom admin styles for all pages
    wp_enqueue_style(
        'ppxo-admin-style',
        PPXO_ASSETS . '/css/admin.css',
        ['ppxo-bootstrap'],
        PPXO_VERSION
    );

    // var_dump($is_form_builder_page);
    // Handle form builder scripts separately
    if ($is_form_builder_page) {
         // Regular admin script for other pages
        // wp_enqueue_script(
        //     'ppxo-admin-script',
        //     PPXO_ASSETS . '/js/admin-copy.js',
        //     ['jquery', 'ppxo-bootstrap'],
        //     PPXO_VERSION,
        //     true
        // );

        
        $this->enqueue_form_builder_assets();


        
    } else {
        // Regular admin script for other pages
        wp_enqueue_script(
            'ppxo-admin-script',
            PPXO_ASSETS . '/js/admin.js',
            ['jquery', 'ppxo-bootstrap'],
            PPXO_VERSION,
            true
        );
    }

    // Localize script for dashboard chart data
    if ($hook === 'toplevel_page_ppxo-main') {
        // Get chart data
        $chart_data = $this->get_chart_data();

        wp_localize_script(
            'ppxo-admin-script',
            'ppxo_dashboard',
            [
                'chart_data' => $chart_data,
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('ppxo_dashboard_nonce')
            ]
        );
    }
}



/**
 * Enqueue form builder specific assets
 */
private function enqueue_form_builder_assets()
{
    // Form builder specific CSS
    wp_enqueue_style(
        'ppxo-form-builder-style',
        PPXO_ASSETS . '/css/form-builder.css',
        ['ppxo-bootstrap'],
        PPXO_VERSION
    );

    // Main form builder script as module
    wp_enqueue_script(
        'ppxo-form-builder',
        PPXO_ASSETS . '/js/form-builder/index.js',
        [], // No dependencies for ES6 module
        PPXO_VERSION,
        true
    );

    // Add module type to form builder script
    add_filter('script_loader_tag', function($tag, $handle) {
        if ($handle === 'ppxo-form-builder') {
            // Remove any existing type attribute and add module type
            $tag = preg_replace("/type=['\"][^'\"]*['\"]/", '', $tag);
            return str_replace('<script ', '<script type="module" ', $tag);
        }
        return $tag;
    }, 10, 2);

    // Localize script data for form builder
    wp_localize_script(
        'ppxo-form-builder',
        'ppxo_admin',
        [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ppxo_form_nonce'),
            'post_id' => get_the_ID() ?: 0,
            'plugin_url' => PPXO_ASSETS,
            'assets_url' => PPXO_ASSETS
        ]
    );

    // Enqueue jQuery UI components separately for better dependency handling
    wp_enqueue_script('jquery-ui-sortable');
    wp_enqueue_script('jquery-ui-draggable');
    wp_enqueue_script('jquery-ui-droppable');
    wp_enqueue_script('jquery-ui-resizable');
}

    /**
     * Get chart data for dashboard
     */
    private function get_chart_data()
    {
        // Sample data - replace with actual data from your plugin
        return [
            'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            'data' => [12, 19, 8, 15, 24, 18],
            'colors' => [
                'border' => '#4e5ea9',
                'background' => 'rgba(78, 94, 169, 0.1)'
            ]
        ];
    }









    public function render_main_page()
    {
        // Get statistics data
        $forms_count = wp_count_posts('ppxo_form');
        $active_forms = $forms_count->publish;
        $products_enhanced = get_option('ppxo_products_enhanced', 0);
        $options_created = get_option('ppxo_options_created', 0);
        $woocommerce_active = class_exists('WooCommerce');

        // Get recent activity
        $recent_forms = get_posts([
            'post_type' => 'ppxo_form',
            'posts_per_page' => 5,
            'orderby' => 'modified',
            'order' => 'DESC'
        ]);

        // Get usage data for chart (example data)
        $usage_data = array(
            'labels' => array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'),
            'data' => array(12, 19, 8, 15, 24, 18)
        );
?>

        <div class="wrap ppxo-admin-page">
            <!-- Header Section -->
            <div class="ppxo-header mb-4">
                <div class="ppxo-header-content">
                    <div class="ppxo-header-left">
                        <h1 class="ppxo-title">
                            <span class="ppxo-icon"><i class="dashicons dashicons-admin-generic"></i></span>
                            <?php esc_html_e('Product Plus Dashboard', 'ppxo'); ?>
                        </h1>
                        <p class="ppxo-subtitle">
                            <?php esc_html_e('Enhance your WooCommerce products with customizable extra options', 'ppxo'); ?>
                        </p>
                    </div>
                    <div class="ppxo-header-right">
                        <span class="ppxo-version-badge">v<?php echo esc_html(PPXO_VERSION); ?></span>
                        <button class="ppxo-refresh-btn" id="ppxo-refresh-btn">
                            <i class="dashicons dashicons-update"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="ppxo-stats-grid">
                <div class="ppxo-stat-card">
                    <div class="ppxo-stat-icon">
                        <i class="dashicons dashicons-welcome-widgets-menus"></i>
                    </div>
                    <div class="ppxo-stat-content">
                        <h3 id="active-forms-count"><?php echo esc_html($active_forms); ?></h3>
                        <p><?php esc_html_e('Active Forms', 'ppxo'); ?></p>
                    </div>
                    <div class="ppxo-stat-progress">
                        <div class="ppxo-progress-bar">
                            <div class="ppxo-progress-fill" style="width: <?php echo esc_attr(min(($active_forms / max($active_forms, 1)) * 100, 100)); ?>%"></div>
                        </div>
                    </div>
                </div>

                <div class="ppxo-stat-card">
                    <div class="ppxo-stat-icon">
                        <i class="dashicons dashicons-cart"></i>
                    </div>
                    <div class="ppxo-stat-content">
                        <h3 id="products-enhanced-count"><?php echo esc_html($products_enhanced); ?></h3>
                        <p><?php esc_html_e('Products Enhanced', 'ppxo'); ?></p>
                    </div>
                    <div class="ppxo-stat-progress">
                        <div class="ppxo-progress-bar">
                            <div class="ppxo-progress-fill" style="width: <?php echo esc_attr(min(($products_enhanced / max($products_enhanced, 1)) * 100, 100)); ?>%"></div>
                        </div>
                    </div>
                </div>

                <div class="ppxo-stat-card">
                    <div class="ppxo-stat-icon">
                        <i class="dashicons dashicons-admin-settings"></i>
                    </div>
                    <div class="ppxo-stat-content">
                        <h3 id="options-created-count"><?php echo esc_html($options_created); ?></h3>
                        <p><?php esc_html_e('Options Created', 'ppxo'); ?></p>
                    </div>
                    <div class="ppxo-stat-progress">
                        <div class="ppxo-progress-bar">
                            <div class="ppxo-progress-fill" style="width: <?php echo esc_attr(min(($options_created / max($options_created, 1)) * 100, 100)); ?>%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="ppxo-dashboard-content">
                <div class="ppxo-main-content">
                    <!-- Activity Section -->
                    <div class="ppxo-card">
                        <div class="ppxo-card-header">
                            <h2><i class="dashicons dashicons-update"></i> <?php esc_html_e('Recent Activity', 'ppxo'); ?></h2>
                            <a href="<?php echo esc_url(admin_url('edit.php?post_type=ppxo_form')); ?>" class="ppxo-view-all">
                                <?php esc_html_e('View All', 'ppxo'); ?> <i class="dashicons dashicons-arrow-right-alt"></i>
                            </a>
                        </div>
                        <div class="ppxo-card-body">
                            <div class="ppxo-activity-list">
                                <?php if ($recent_forms) : ?>
                                    <?php foreach ($recent_forms as $form) :
                                        $modified_time = human_time_diff(strtotime($form->post_modified), current_time('timestamp'));
                                        $action = ($form->post_date == $form->post_modified) ? 'created' : 'updated';
                                        $icon = ($action == 'created') ? 'dashicons-plus-alt' : 'dashicons-edit';
                                        $color = ($action == 'created') ? 'ppxo-success' : 'ppxo-primary';
                                    ?>
                                        <div class="ppxo-activity-item">
                                            <div class="ppxo-activity-icon <?php echo esc_attr($color); ?>">
                                                <i class="dashicons <?php echo esc_attr($icon); ?>"></i>
                                            </div>
                                            <div class="ppxo-activity-content">
                                                <h4><?php echo esc_html($form->post_title); ?> <span class="ppxo-activity-action"><?php echo esc_html($action); ?></span></h4>
                                                <p><?php printf(esc_html__('%s ago', 'ppxo'), $modified_time); ?></p>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                <?php else : ?>
                                    <div class="ppxo-empty-state">
                                        <i class="dashicons dashicons-info-outline"></i>
                                        <p><?php esc_html_e('No recent activity', 'ppxo'); ?></p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Chart Section -->
                    <div class="ppxo-card">
                        <div class="ppxo-card-header">
                            <h2><i class="dashicons dashicons-chart-line"></i> <?php esc_html_e('Form Usage Statistics', 'ppxo'); ?></h2>
                        </div>
                        <div class="ppxo-card-body">
                            <div class="ppxo-chart-container">
                                <canvas id="ppxoUsageChart" height="250"></canvas>
                                <div id="ppxo-chart-fallback" style="display: none; text-align: center; padding: 40px 0;">
                                    <p><?php esc_html_e('Chart loading failed. Please refresh the page.', 'ppxo'); ?></p>
                                    <button onclick="window.location.reload()" class="button button-primary">
                                        <?php esc_html_e('Refresh Page', 'ppxo'); ?>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                <div class="ppxo-sidebar">
                    <!-- Quick Actions -->
                    <div class="ppxo-card">
                        <div class="ppxo-card-header">
                            <h2><i class="dashicons dashicons-admin-tools"></i> <?php esc_html_e('Quick Actions', 'ppxo'); ?></h2>
                        </div>
                        <div class="ppxo-card-body">
                            <div class="ppxo-action-buttons">
                                <a href="<?php echo esc_url(admin_url('post-new.php?post_type=ppxo_form')); ?>" class="ppxo-action-btn ppxo-primary">
                                    <i class="dashicons dashicons-plus"></i>
                                    <span><?php esc_html_e('Create New Form', 'ppxo'); ?></span>
                                </a>
                                <a href="<?php echo esc_url(admin_url('edit.php?post_type=ppxo_form')); ?>" class="ppxo-action-btn">
                                    <i class="dashicons dashicons-list-view"></i>
                                    <span><?php esc_html_e('Manage Forms', 'ppxo'); ?></span>
                                </a>
                                <a href="<?php echo esc_url(admin_url('admin.php?page=ppxo-global-form')); ?>" class="ppxo-action-btn">
                                    <i class="dashicons dashicons-admin-generic"></i>
                                    <span><?php esc_html_e('Global Settings', 'ppxo'); ?></span>
                                </a>
                                <button class="ppxo-action-btn" id="ppxo-import-export-btn">
                                    <i class="dashicons dashicons-migrate"></i>
                                    <span><?php esc_html_e('Import/Export Forms', 'ppxo'); ?></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Plugin Info -->
                    <div class="ppxo-card">
                        <div class="ppxo-card-header">
                            <h2><i class="dashicons dashicons-info-outline"></i> <?php esc_html_e('Plugin Info', 'ppxo'); ?></h2>
                        </div>
                        <div class="ppxo-card-body">
                            <div class="ppxo-info-list">
                                <div class="ppxo-info-item">
                                    <span class="ppxo-info-label"><?php esc_html_e('Version', 'ppxo'); ?></span>
                                    <span class="ppxo-info-value"><?php echo esc_html(PPXO_VERSION); ?></span>
                                </div>
                                <div class="ppxo-info-item">
                                    <span class="ppxo-info-label"><?php esc_html_e('WooCommerce', 'ppxo'); ?></span>
                                    <span class="ppxo-info-value <?php echo $woocommerce_active ? 'ppxo-status-success' : 'ppxo-status-error'; ?>">
                                        <?php echo $woocommerce_active ? esc_html__('Active', 'ppxo') : esc_html__('Inactive', 'ppxo'); ?>
                                    </span>
                                </div>
                                <div class="ppxo-info-item">
                                    <span class="ppxo-info-label"><?php esc_html_e('Forms', 'ppxo'); ?></span>
                                    <span class="ppxo-info-value"><?php echo esc_html($active_forms); ?></span>
                                </div>
                                <div class="ppxo-info-item">
                                    <span class="ppxo-info-label"><?php esc_html_e('Last Updated', 'ppxo'); ?></span>
                                    <span class="ppxo-info-value"><?php echo date_i18n(get_option('date_format')); ?></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Support Card -->
                    <div class="ppxo-card">
                        <div class="ppxo-card-header">
                            <h2><i class="dashicons dashicons-sos"></i> <?php esc_html_e('Need Help?', 'ppxo'); ?></h2>
                        </div>
                        <div class="ppxo-card-body">
                            <p><?php esc_html_e('Check our documentation or contact support if you need assistance.', 'ppxo'); ?></p>
                            <div class="ppxo-support-links">
                                <a href="<?php echo esc_url(admin_url('admin.php?page=ppxo-help')); ?>" class="ppxo-support-link">
                                    <i class="dashicons dashicons-book"></i>
                                    <span><?php esc_html_e('Documentation', 'ppxo'); ?></span>
                                </a>
                                <a href="https://wordpress.org/support/plugin/your-plugin" class="ppxo-support-link" target="_blank">
                                    <i class="dashicons dashicons-forum"></i>
                                    <span><?php esc_html_e('Support Forum', 'ppxo'); ?></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .ppxo-admin-page {
                max-width: 1200px;
                margin: 20px auto;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            }

            .ppxo-header {
                background: #fff;
                border-radius: 8px;
                padding: 25px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                margin-bottom: 24px;
                border-left: 4px solid #4e5ea9;
            }

            .ppxo-header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ppxo-title {
                font-size: 24px;
                font-weight: 600;
                margin: 0 0 5px 0;
                color: #1d2327;
                display: flex;
                align-items: center;
            }

            .ppxo-icon {
                margin-right: 10px;
                color: #4e5ea9;
            }

            .ppxo-subtitle {
                margin: 0;
                color: #646970;
                font-size: 14px;
            }

            .ppxo-header-right {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .ppxo-version-badge {
                background: #4e5ea9;
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
            }

            .ppxo-refresh-btn {
                background: #f6f7f7;
                border: 1px solid #dcdcde;
                border-radius: 4px;
                padding: 6px;
                cursor: pointer;
                color: #3c434a;
            }

            .ppxo-refresh-btn:hover {
                background: #f0f0f1;
            }

            .ppxo-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 24px;
            }

            .ppxo-stat-card {
                background: #fff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
            }

            .ppxo-stat-icon {
                font-size: 24px;
                color: #4e5ea9;
                margin-bottom: 15px;
            }

            .ppxo-stat-content h3 {
                font-size: 32px;
                margin: 0 0 5px 0;
                color: #1d2327;
                font-weight: 600;
            }

            .ppxo-stat-content p {
                margin: 0;
                color: #646970;
                font-size: 14px;
            }

            .ppxo-stat-progress {
                margin-top: 15px;
            }

            .ppxo-progress-bar {
                height: 6px;
                background: #f0f0f1;
                border-radius: 3px;
                overflow: hidden;
            }

            .ppxo-progress-fill {
                height: 100%;
                background: #4e5ea9;
                border-radius: 3px;
                transition: width 0.5s ease;
            }

            .ppxo-dashboard-content {
                display: grid;
                grid-template-columns: 1fr 320px;
                gap: 24px;
            }

            .ppxo-card {
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                margin-bottom: 24px;
                overflow: hidden;
            }

            .ppxo-card-header {
                padding: 16px 20px;
                border-bottom: 1px solid #f0f0f1;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ppxo-card-header h2 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
            }

            .ppxo-card-header h2 .dashicons {
                margin-right: 8px;
                color: #4e5ea9;
            }

            .ppxo-view-all {
                font-size: 13px;
                color: #2271b1;
                text-decoration: none;
                display: flex;
                align-items: center;
            }

            .ppxo-view-all:hover {
                color: #135e96;
            }

            .ppxo-view-all .dashicons {
                font-size: 16px;
                margin-left: 4px;
            }

            .ppxo-card-body {
                padding: 20px;
            }

            .ppxo-activity-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .ppxo-activity-item {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .ppxo-activity-icon {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .ppxo-activity-icon.ppxo-success {
                background: #edfaef;
                color: #00a32a;
            }

            .ppxo-activity-icon.ppxo-primary {
                background: #f0f6ff;
                color: #4e5ea9;
            }

            .ppxo-activity-content h4 {
                margin: 0 0 4px 0;
                font-size: 14px;
                font-weight: 500;
            }

            .ppxo-activity-action {
                text-transform: capitalize;
                color: #646970;
                font-weight: 400;
            }

            .ppxo-activity-content p {
                margin: 0;
                font-size: 12px;
                color: #9ca2a7;
            }

            .ppxo-empty-state {
                text-align: center;
                padding: 30px 0;
                color: #9ca2a7;
            }

            .ppxo-empty-state .dashicons {
                font-size: 32px;
                margin-bottom: 10px;
            }

            .ppxo-chart-container {
                position: relative;
                height: 250px;
            }

            .ppxo-action-buttons {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .ppxo-action-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 16px;
                background: #f6f7f7;
                border: 1px solid #dcdcde;
                border-radius: 6px;
                text-decoration: none;
                color: #2c3338;
                transition: all 0.2s ease;
                cursor: pointer;
                text-align: left;
            }

            .ppxo-action-btn:hover {
                background: #f0f0f1;
            }

            .ppxo-action-btn.ppxo-primary {
                background: #4e5ea9;
                color: white;
                border-color: #4e5ea9;
            }

            .ppxo-action-btn.ppxo-primary:hover {
                background: #434f8f;
            }

            .ppxo-info-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .ppxo-info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ppxo-info-label {
                font-size: 13px;
                color: #646970;
            }

            .ppxo-info-value {
                font-size: 13px;
                font-weight: 500;
            }

            .ppxo-status-success {
                color: #00a32a;
            }

            .ppxo-status-error {
                color: #d63638;
            }

            .ppxo-support-links {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 15px;
            }

            .ppxo-support-link {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #2271b1;
                text-decoration: none;
                font-size: 14px;
            }

            .ppxo-support-link:hover {
                color: #135e96;
            }

            @media (max-width: 1024px) {
                .ppxo-dashboard-content {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .ppxo-stats-grid {
                    grid-template-columns: 1fr;
                }

                .ppxo-header-content {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                }

                .ppxo-header-right {
                    align-self: stretch;
                    justify-content: space-between;
                }
            }
        </style>

        <script>
            jQuery(document).ready(function($) {
                // Initialize chart
                function initChart() {
                    const ctx = document.getElementById('ppxoUsageChart').getContext('2d');
                    if (typeof Chart === 'undefined') {
                        console.error('Chart.js is not loaded');
                        return;
                    }

                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: <?php echo json_encode($usage_data['labels']); ?>,
                            datasets: [{
                                label: 'Form Usage',
                                data: <?php echo json_encode($usage_data['data']); ?>,
                                borderColor: '#4e5ea9',
                                backgroundColor: 'rgba(78, 94, 169, 0.1)',
                                tension: 0.3,
                                fill: true,
                                pointBackgroundColor: '#4e5ea9',
                                pointBorderColor: '#fff',
                                pointRadius: 4,
                                pointHoverRadius: 6
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        drawBorder: false
                                    },
                                    ticks: {
                                        precision: 0
                                    }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                }
                            }
                        }
                    });
                }

                // Refresh button functionality
                $('#ppxo-refresh-btn').on('click', function() {
                    const $btn = $(this);
                    $btn.addClass('is-active');

                    // Simulate refresh action
                    setTimeout(function() {
                        window.location.reload();
                    }, 800);
                });

                // Import/Export button
                $('#ppxo-import-export-btn').on('click', function() {
                    alert('<?php esc_html_e('Import/Export functionality would open here', 'ppxo'); ?>');
                });

                // Initialize chart
                initChart();
            });
        </script>
    <?php
    }









    /**
     * 
     * 
     * Render the global form page
     */
    public function render_global_form_page()
    {
    ?>
        <div class="wrap ppxo-admin-page">
            <div class="ppxo-header mb-4">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h1 class="ppxo-title">
                            <i class="fas fa-cog me-2"></i>
                            <?php esc_html_e('Product Plus Options', 'ppxo'); ?>
                        </h1>
                        <p class="ppxo-subtitle text-muted">
                            <?php esc_html_e('Configure global settings for your product forms', 'ppxo'); ?>
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <button type="button" class="btn btn-primary" id="ppxo-save-global-settings">
                            <i class="fas fa-save me-2"></i>
                            <?php esc_html_e('Save Settings', 'ppxo'); ?>
                        </button>
                    </div>
                </div>
            </div>

            <div class="ppxo-global-settings">
                <div class="row">
                    <div class="col-md-3">
                        <div class="nav flex-column nav-pills me-3" id="ppxo-settings-tabs" role="tablist" aria-orientation="vertical">
                            <button class="nav-link active" id="ppxo-general-tab" data-bs-toggle="pill" data-bs-target="#ppxo-general" type="button" role="tab" aria-controls="ppxo-general" aria-selected="true">
                                <i class="fas fa-sliders-h me-2"></i>
                                <?php esc_html_e('General Settings', 'ppxo'); ?>
                            </button>
                            <button class="nav-link" id="ppxo-display-tab" data-bs-toggle="pill" data-bs-target="#ppxo-display" type="button" role="tab" aria-controls="ppxo-display" aria-selected="false">
                                <i class="fas fa-desktop me-2"></i>
                                <?php esc_html_e('Display Options', 'ppxo'); ?>
                            </button>
                            <button class="nav-link" id="ppxo-advanced-tab" data-bs-toggle="pill" data-bs-target="#ppxo-advanced" type="button" role="tab" aria-controls="ppxo-advanced" aria-selected="false">
                                <i class="fas fa-cogs me-2"></i>
                                <?php esc_html_e('Advanced Settings', 'ppxo'); ?>
                            </button>
                            <button class="nav-link" id="ppxo-import-export-tab" data-bs-toggle="pill" data-bs-target="#ppxo-import-export" type="button" role="tab" aria-controls="ppxo-import-export" aria-selected="false">
                                <i class="fas fa-exchange-alt me-2"></i>
                                <?php esc_html_e('Import/Export', 'ppxo'); ?>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-9">
                        <div class="tab-content" id="ppxo-settings-tabs-content">
                            <div class="tab-pane fade show active" id="ppxo-general" role="tabpanel" aria-labelledby="ppxo-general-tab">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">
                                            <i class="fas fa-sliders-h me-2"></i>
                                            <?php esc_html_e('General Settings', 'ppxo'); ?>
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label for="ppxo-enable-global" class="form-label"><?php esc_html_e('Enable Global Form', 'ppxo'); ?></label>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="ppxo-enable-global" checked>
                                                <label class="form-check-label" for="ppxo-enable-global">
                                                    <?php esc_html_e('Apply global form to all products', 'ppxo'); ?>
                                                </label>
                                            </div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="ppxo-global-form" class="form-label"><?php esc_html_e('Select Global Form', 'ppxo'); ?></label>
                                            <select class="form-select" id="ppxo-global-form">
                                                <option value=""><?php esc_html_e('-- Select a form --', 'ppxo'); ?></option>
                                                <option value="1"><?php esc_html_e('Gift Options', 'ppxo'); ?></option>
                                                <option value="2"><?php esc_html_e('Personalization', 'ppxo'); ?></option>
                                                <option value="3"><?php esc_html_e('Add-ons', 'ppxo'); ?></option>
                                            </select>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label"><?php esc_html_e('Form Position', 'ppxo'); ?></label>
                                            <select class="form-select" id="ppxo-form-position">
                                                <option value="after_add_to_cart"><?php esc_html_e('After Add to Cart button', 'ppxo'); ?></option>
                                                <option value="before_add_to_cart"><?php esc_html_e('Before Add to Cart button', 'ppxo'); ?></option>
                                                <option value="after_summary"><?php esc_html_e('After product summary', 'ppxo'); ?></option>
                                                <option value="in_tab"><?php esc_html_e('In a separate tab', 'ppxo'); ?></option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="ppxo-display" role="tabpanel" aria-labelledby="ppxo-display-tab">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">
                                            <i class="fas fa-desktop me-2"></i>
                                            <?php esc_html_e('Display Options', 'ppxo'); ?>
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label class="form-label"><?php esc_html_e('Form Style', 'ppxo'); ?></label>
                                            <select class="form-select" id="ppxo-form-style">
                                                <option value="default"><?php esc_html_e('Default', 'ppxo'); ?></option>
                                                <option value="minimal"><?php esc_html_e('Minimal', 'ppxo'); ?></option>
                                                <option value="boxed"><?php esc_html_e('Boxed', 'ppxo'); ?></option>
                                                <option value="custom"><?php esc_html_e('Custom CSS', 'ppxo'); ?></option>
                                            </select>
                                        </div>

                                        <div class="mb-3">
                                            <label for="ppxo-custom-css" class="form-label"><?php esc_html_e('Custom CSS', 'ppxo'); ?></label>
                                            <textarea class="form-control" id="ppxo-custom-css" rows="6" placeholder="<?php esc_attr_e('Add your custom CSS here...', 'ppxo'); ?>"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="ppxo-advanced" role="tabpanel" aria-labelledby="ppxo-advanced-tab">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">
                                            <i class="fas fa-cogs me-2"></i>
                                            <?php esc_html_e('Advanced Settings', 'ppxo'); ?>
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="ppxo-debug-mode">
                                                <label class="form-check-label" for="ppxo-debug-mode">
                                                    <?php esc_html_e('Enable Debug Mode', 'ppxo'); ?>
                                                </label>
                                            </div>
                                            <div class="form-text"><?php esc_html_e('Log plugin events for debugging purposes', 'ppxo'); ?></div>
                                        </div>

                                        <div class="mb-3">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="ppxo-load-assets" checked>
                                                <label class="form-check-label" for="ppxo-load-assets">
                                                    <?php esc_html_e('Optimize Assets Loading', 'ppxo'); ?>
                                                </label>
                                            </div>
                                            <div class="form-text"><?php esc_html_e('Load CSS and JS only on pages that need them', 'ppxo'); ?></div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="ppxo-price-format" class="form-label"><?php esc_html_e('Price Display Format', 'ppxo'); ?></label>
                                            <input type="text" class="form-control" id="ppxo-price-format" value="+{price}" placeholder="+{price}">
                                            <div class="form-text"><?php esc_html_e('Use {price} as placeholder for the actual price', 'ppxo'); ?></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="ppxo-import-export" role="tabpanel" aria-labelledby="ppxo-import-export-tab">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="card-title mb-0">
                                            <i class="fas fa-exchange-alt me-2"></i>
                                            <?php esc_html_e('Import/Export Settings', 'ppxo'); ?>
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="card mb-4">
                                                    <div class="card-header">
                                                        <h6 class="card-title mb-0"><?php esc_html_e('Export Settings', 'ppxo'); ?></h6>
                                                    </div>
                                                    <div class="card-body">
                                                        <p><?php esc_html_e('Export your plugin settings for backup or to migrate to another site.', 'ppxo'); ?></p>
                                                        <button type="button" class="btn btn-outline-primary">
                                                            <i class="fas fa-download me-2"></i>
                                                            <?php esc_html_e('Export Settings', 'ppxo'); ?>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="card">
                                                    <div class="card-header">
                                                        <h6 class="card-title mb-0"><?php esc_html_e('Import Settings', 'ppxo'); ?></h6>
                                                    </div>
                                                    <div class="card-body">
                                                        <p><?php esc_html_e('Import plugin settings from a backup file.', 'ppxo'); ?></p>
                                                        <div class="mb-3">
                                                            <input class="form-control" type="file" id="ppxo-import-file">
                                                        </div>
                                                        <button type="button" class="btn btn-outline-secondary">
                                                            <i class="fas fa-upload me-2"></i>
                                                            <?php esc_html_e('Import Settings', 'ppxo'); ?>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <?php
    }

    /**
     * Help Page callback
     */
    public function render_help_page()
    {
    ?>
        <div class="wrap ppxo-admin-page">
            <div class="ppxo-header mb-4">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h1 class="ppxo-title">
                            <i class="fas fa-life-ring me-2"></i>
                            <?php esc_html_e('Help & Documentation', 'ppxo'); ?>
                        </h1>
                        <p class="ppxo-subtitle text-muted">
                            <?php esc_html_e('Get help with Product Plus and learn how to make the most of it', 'ppxo'); ?>
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <a href="https://wpagain.com/support" target="_blank" class="btn btn-primary">
                            <i class="fas fa-question-circle me-2"></i>
                            <?php esc_html_e('Contact Support', 'ppxo'); ?>
                        </a>
                    </div>
                </div>
            </div>

            <div class="ppxo-help-content">
                <div class="row">
                    <div class="col-md-8">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-book me-2"></i>
                                    <?php esc_html_e('Documentation', 'ppxo'); ?>
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="accordion" id="ppxo-docs-accordion">
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="ppxo-getting-started-heading">
                                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#ppxo-getting-started" aria-expanded="true" aria-controls="ppxo-getting-started">
                                                <?php esc_html_e('Getting Started', 'ppxo'); ?>
                                            </button>
                                        </h2>
                                        <div id="ppxo-getting-started" class="accordion-collapse collapse show" aria-labelledby="ppxo-getting-started-heading" data-bs-parent="#ppxo-docs-accordion">
                                            <div class="accordion-body">
                                                <p><?php esc_html_e('Welcome to Product Plus! Follow these steps to get started:', 'ppxo'); ?></p>
                                                <ol>
                                                    <li><?php esc_html_e('Create your first form by going to Forms → Add New', 'ppxo'); ?></li>
                                                    <li><?php esc_html_e('Add fields to your form using the drag and drop builder', 'ppxo'); ?></li>
                                                    <li><?php esc_html_e('Configure field settings and pricing options', 'ppxo'); ?></li>
                                                    <li><?php esc_html_e('Assign the form to products or categories', 'ppxo'); ?></li>
                                                    <li><?php esc_html_e('Test your form on the product page', 'ppxo'); ?></li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="ppxo-field-types-heading">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#ppxo-field-types" aria-expanded="false" aria-controls="ppxo-field-types">
                                                <?php esc_html_e('Field Types', 'ppxo'); ?>
                                            </button>
                                        </h2>
                                        <div id="ppxo-field-types" class="accordion-collapse collapse" aria-labelledby="ppxo-field-types-heading" data-bs-parent="#ppxo-docs-accordion">
                                            <div class="accordion-body">
                                                <p><?php esc_html_e('Product Plus supports various field types:', 'ppxo'); ?></p>
                                                <ul>
                                                    <li><strong><?php esc_html_e('Text Input', 'ppxo'); ?></strong>: <?php esc_html_e('Single line text input', 'ppxo'); ?></li>
                                                    <li><strong><?php esc_html_e('Text Area', 'ppxo'); ?></strong>: <?php esc_html_e('Multi-line text input', 'ppxo'); ?></li>
                                                    <li><strong><?php esc_html_e('Checkbox', 'ppxo'); ?></strong>: <?php esc_html_e('Single or multiple checkboxes', 'ppxo'); ?></li>
                                                    <li><strong><?php esc_html_e('Radio Buttons', 'ppxo'); ?></strong>: <?php esc_html_e('Select one option from many', 'ppxo'); ?></li>
                                                    <li><strong><?php esc_html_e('Dropdown', 'ppxo'); ?></strong>: <?php esc_html_e('Select from a dropdown menu', 'ppxo'); ?></li>
                                                    <li><strong><?php esc_html_e('File Upload', 'ppxo'); ?></strong>: <?php esc_html_e('Allow customers to upload files', 'ppxo'); ?></li>
                                                    <li><strong><?php esc_html_e('Date Picker', 'ppxo'); ?></strong>: <?php esc_html_e('Select dates with a calendar', 'ppxo'); ?></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="ppxo-pricing-heading">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#ppxo-pricing" aria-expanded="false" aria-controls="ppxo-pricing">
                                                <?php esc_html_e('Pricing Options', 'ppxo'); ?>
                                            </button>
                                        </h2>
                                        <div id="ppxo-pricing" class="accordion-collapse collapse" aria-labelledby="ppxo-pricing-heading" data-bs-parent="#ppxo-docs-accordion">
                                            <div class="accordion-body">
                                                <p><?php esc_html_e('You can add pricing to your fields in several ways:', 'ppxo'); ?></p>
                                                <ul>
                                                    <li><strong><?php esc_html_e('Fixed Price', 'ppxo'); ?></strong>: <?php esc_html_e('Add a fixed amount to the product price', 'ppxo'); ?></li>
                                                    <li><strong><?php esc_html_e('Percentage', 'ppxo'); ?></strong>: <?php esc_html_e('Add a percentage of the product price', 'ppxo'); ?></li>
                                                    <li><strong><?php esc_html_e('Per Character', 'ppxo'); ?></strong>: <?php esc_html_e('Charge per character for text inputs', 'ppxo'); ?></li>
                                                    <li><strong><?php esc_html_e('Quantity Based', 'ppxo'); ?></strong>: <?php esc_html_e('Price changes based on quantity selected', 'ppxo'); ?></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-video me-2"></i>
                                    <?php esc_html_e('Video Tutorials', 'ppxo'); ?>
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <div class="card h-100">
                                            <div class="card-body text-center">
                                                <i class="fas fa-play-circle text-muted display-4 mb-3"></i>
                                                <h6><?php esc_html_e('Creating Your First Form', 'ppxo'); ?></h6>
                                                <p class="text-muted"><?php esc_html_e('Learn how to create and configure your first product form', 'ppxo'); ?></p>
                                                <a href="#" class="btn btn-outline-primary btn-sm"><?php esc_html_e('Watch Now', 'ppxo'); ?></a>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <div class="card h-100">
                                            <div class="card-body text-center">
                                                <i class="fas fa-play-circle text-muted display-4 mb-3"></i>
                                                <h6><?php esc_html_e('Advanced Pricing Setup', 'ppxo'); ?></h6>
                                                <p class="text-muted"><?php esc_html_e('Master advanced pricing options for your product fields', 'ppxo'); ?></p>
                                                <a href="#" class="btn btn-outline-primary btn-sm"><?php esc_html_e('Watch Now', 'ppxo'); ?></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-question-circle me-2"></i>
                                    <?php esc_html_e('FAQs', 'ppxo'); ?>
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="accordion" id="ppxo-faq-accordion">
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="ppxo-faq1-heading">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#ppxo-faq1" aria-expanded="false" aria-controls="ppxo-faq1">
                                                <?php esc_html_e('How do I assign a form to a product?', 'ppxo'); ?>
                                            </button>
                                        </h2>
                                        <div id="ppxo-faq1" class="accordion-collapse collapse" aria-labelledby="ppxo-faq1-heading" data-bs-parent="#ppxo-faq-accordion">
                                            <div class="accordion-body">
                                                <?php esc_html_e('You can assign forms to products in two ways: 1) Edit a product and select the form from the "Product Plus" meta box, or 2) Use the global form setting to apply a form to all products.', 'ppxo'); ?>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="ppxo-faq2-heading">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#ppxo-faq2" aria-expanded="false" aria-controls="ppxo-faq2">
                                                <?php esc_html_e('Can I use conditional logic?', 'ppxo'); ?>
                                            </button>
                                        </h2>
                                        <div id="ppxo-faq2" class="accordion-collapse collapse" aria-labelledby="ppxo-faq2-heading" data-bs-parent="#ppxo-faq-accordion">
                                            <div class="accordion-body">
                                                <?php esc_html_e('Yes, Product Plus includes conditional logic capabilities. You can show or hide fields based on selections in other fields. This is available in the "Conditions" tab of the field settings.', 'ppxo'); ?>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="ppxo-faq3-heading">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#ppxo-faq3" aria-expanded="false" aria-controls="ppxo-faq3">
                                                <?php esc_html_e('How do I translate the plugin?', 'ppxo'); ?>
                                            </button>
                                        </h2>
                                        <div id="ppxo-faq3" class="accordion-collapse collapse" aria-labelledby="ppxo-faq3-heading" data-bs-parent="#ppxo-faq-accordion">
                                            <div class="accordion-body">
                                                <?php esc_html_e('Product Plus is translation ready. You can use translation plugins like Loco Translate or create your own translation files. The text domain is "ppxo".', 'ppxo'); ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-external-link-alt me-2"></i>
                                    <?php esc_html_e('Useful Links', 'ppxo'); ?>
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="d-grid gap-2">
                                    <a href="https://wpagain.com/docs" target="_blank" class="btn btn-outline-primary">
                                        <i class="fas fa-book me-2"></i>
                                        <?php esc_html_e('Full Documentation', 'ppxo'); ?>
                                    </a>
                                    <a href="https://wpagain.com/support" target="_blank" class="btn btn-outline-primary">
                                        <i class="fas fa-question-circle me-2"></i>
                                        <?php esc_html_e('Support Center', 'ppxo'); ?>
                                    </a>
                                    <a href="https://wordpress.org/support/plugin/product-plus/reviews/" target="_blank" class="btn btn-outline-primary">
                                        <i class="fas fa-star me-2"></i>
                                        <?php esc_html_e('Leave a Review', 'ppxo'); ?>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <?php esc_html_e('System Info', 'ppxo'); ?>
                                </h5>
                            </div>
                            <div class="card-body">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <?php esc_html_e('PHP Version', 'ppxo'); ?>
                                        <span class="badge bg-info"><?php echo phpversion(); ?></span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <?php esc_html_e('WordPress Version', 'ppxo'); ?>
                                        <span class="badge bg-info"><?php echo get_bloginfo('version'); ?></span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <?php esc_html_e('WooCommerce', 'ppxo'); ?>
                                        <span class="badge bg-success"><?php esc_html_e('Active', 'ppxo'); ?></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <?php
    }

    // ... Rest of your code ...











    /**
     * Add settings link to plugin action links
     */
    public function plugin_settings_link($links)
    {
        $url = admin_url('admin.php?page=ppxo-global-form');
        $settings_link = '<a href="' . esc_url($url) . '">' . __('Global Form', 'ppxo') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Add form builder meta box
     */
    public function add_form_builder_meta_box()
    {
        add_meta_box(
            'ppxo_form_builder',
            __('Form Builder', 'ppxo'),
            [$this, 'render_form_builder_meta_box'],
            'ppxo_form',
            'normal',
            'high'
        );
    }

    /**
     * Add shortcode meta box
     */
    public function add_shortcode_meta_box()
    {
        add_meta_box(
            'ppxo_shortcode',
            __('Form Shortcode', 'ppxo'),
            [$this, 'render_shortcode_meta_box'],
            'ppxo_form',
            'side',
            'default'
        );
    }

    /**
     * Render shortcode meta box
     */
    public function render_shortcode_meta_box($post)
    {
        if ($post->post_status !== 'auto-draft') {
            echo '<p>' . __('Use this shortcode to display this form on your site:', 'ppxo') . '</p>';
            echo '<code>[ppxo_form id="' . $post->ID . '"]</code>';
            echo '<p class="description">' . __('Copy and paste this shortcode into any post, page or widget.', 'ppxo') . '</p>';
        } else {
            echo '<p>' . __('Save your form to generate a shortcode.', 'ppxo') . '</p>';
        }
    }

    /**
     * Render the form builder meta box
     */
    public function render_form_builder_meta_box($post)
    {
        // Get saved form data
        $form_data = get_post_meta($post->ID, '_ppxo_form_data', true);
        $this->current_form_data = $form_data ? $form_data : array();

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
                        submit_button(
                            $post->post_status === 'publish' ? __('Update', 'ppxo') : __('Publish', 'ppxo'),
                            'primary',
                            'publish',
                            false,
                            array(
                                'class' => 'btn btn-primary wfb-save-publish'
                            )
                        );
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
                    <div class="wfb-component" data-type="container">
                        <i class="fas fa-columns wfb-component-icon"></i> Container
                    </div>

                    <h6 class="wfb-group-title">Premium Components</h6>
                    <div class="wfb-component premium" data-type="file">
                        <i class="fas fa-file-upload wfb-component-icon"></i> File Upload
                    </div>
                    <div class="wfb-component premium" data-type="password">
                        <i class="fas fa-lock wfb-component-icon"></i> Password
                    </div>
                </div>

                <div class="wfb-main-content">
                    <div class="wfb-form-builder-area" id="wfb-formBuilder">

                        <!-- will push from js -->
                    </div>
                </div>
            </div>


            <!-- Hidden field to store form data -->
            <input type="hidden" name="ppxo_form_data" id="ppxo_form_data" value="<?php echo esc_attr(json_encode($this->current_form_data)); ?>">

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


                                <li class="nav-item">
                                    <button class="nav-link" id="wfb-conditions-tab" data-bs-toggle="tab" data-bs-target="#wfb-conditions"
                                        type="button" role="tab" aria-controls="wfb-conditions" aria-selected="false">Conditions</button>
                                </li>
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






    /**
     * Save form data
     */
    public function save_form_data($post_id)
    {
        // Check if our nonce is set
        if (!isset($_POST['ppxo_form_nonce'])) {
            return;
        }

        // Verify that the nonce is valid
        if (!wp_verify_nonce($_POST['ppxo_form_nonce'], 'ppxo_save_form')) {
            return;
        }

        // If this is an autosave, our form has not been submitted, so we don't want to do anything
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Check the user's permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Save form data
        if (isset($_POST['ppxo_form_data'])) {
            $form_data = json_decode(stripslashes($_POST['ppxo_form_data']), true);
            update_post_meta($post_id, '_ppxo_form_data', $form_data);
        }
    }





    public function handle_ajax_save_form()
    {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'ppxo_form_nonce')) {
            error_log('PPXO: Nonce verification failed. Nonce: ' . ($_POST['nonce'] ?? 'not set'));
            wp_send_json_error(['message' => 'Nonce verification failed']);
        }

        if (!current_user_can('edit_posts')) {
            error_log('PPXO: Unauthorized user. Current user: ' . get_current_user_id());
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $post_id   = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $form_data = isset($_POST['form_data']) ? $_POST['form_data'] : '';

        error_log('PPXO: Received post_id: ' . $post_id);
        error_log('PPXO: Form data length: ' . strlen($form_data));

        if (!$post_id) {
            error_log('PPXO: Missing post_id. POST data: ' . print_r($_POST, true));
            wp_send_json_error(['message' => 'Missing post ID']);
        }

        if (empty($form_data)) {
            error_log('PPXO: Empty form data. POST data: ' . print_r($_POST, true));
            wp_send_json_error(['message' => 'Empty form data']);
        }

        try {
            // Decode the JSON data
            $decoded_data = json_decode(stripslashes($form_data), true);
            error_log('PPXO: Decoded data type: ' . gettype($decoded_data));

            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('PPXO: JSON decode error: ' . json_last_error_msg());
                error_log('PPXO: Raw form data: ' . $form_data);
                wp_send_json_error(['message' => 'Invalid JSON data: ' . json_last_error_msg()]);
            }

            // Check if post exists
            if (!get_post($post_id)) {
                error_log('PPXO: Post does not exist: ' . $post_id);
                wp_send_json_error(['message' => 'Post does not exist']);
            }

            // Get old meta before saving
            $old_meta = get_post_meta($post_id, '_ppxo_form_data', true);

            // Save to post meta
            update_post_meta($post_id, '_ppxo_form_data', $decoded_data);

            // Fetch new meta to confirm
            $new_meta = get_post_meta($post_id, '_ppxo_form_data', true);

            error_log('PPXO: Old meta: ' . print_r($old_meta, true));
            error_log('PPXO: New meta: ' . print_r($new_meta, true));

            if ($new_meta !== null) {
                error_log('PPXO: Form saved successfully for post ' . $post_id);
                wp_send_json_success([
                    'message' => 'Form saved successfully',
                    'data'    => $new_meta
                ]);
            } else {
                error_log('PPXO: Failed to save form data for post ' . $post_id);
                wp_send_json_error(['message' => 'Failed to save form data']);
            }
        } catch (\Exception $e) {
            error_log('PPXO: Exception in save form: ' . $e->getMessage());
            error_log('PPXO: Exception trace: ' . $e->getTraceAsString());
            wp_send_json_error(['message' => 'Exception: ' . $e->getMessage()]);
        }
    }



    /**
     * Handle form preview
     */
    public function handle_form_preview()
    {
        // Check user capabilities
        if (!current_user_can('edit_posts')) {
            wp_die('Unauthorized');
        }

        $form_id = intval($_GET['form_id']);
        $form_data = get_post_meta($form_id, '_ppxo_form_data', true);

        // Render preview page
        include PPXO_PLUGIN_DIR . 'templates/form-preview.php';
        exit;
    }

    /**
     * Force CPT menu to stay expanded on edit screens
     */
    public function set_cpt_parent_menu($parent_file)
    {
        global $current_screen, $post;

        // Make sure we're on the right CPT (works for post-new.php and post.php)
        if ($current_screen->post_type === $this->post_type) {
              $parent_file = 'ppxo-main';
        }

        return $parent_file;
    }



    /**
     * Force correct submenu highlight
     */
    public function set_cpt_submenu($submenu_file)
    {
         global $current_screen;

    if ($current_screen->post_type === 'ppxo_form') {
        if ($current_screen->base === 'post' && isset($_GET['action']) && $_GET['action'] === 'edit') {
            // Editing form → highlight Forms submenu
            $submenu_file = 'edit.php?post_type=ppxo_form';
        } elseif ($current_screen->base === 'post' && $current_screen->action === 'add') {
            // Adding new form → highlight Add New submenu
            $submenu_file = 'post-new.php?post_type=ppxo_form';
        } elseif ($current_screen->base === 'post-new') {
            // Add New Form page
            $submenu_file = 'post-new.php?post_type=ppxo_form';
        } else {
            // Default listing
            $submenu_file = 'edit.php?post_type=ppxo_form';
        }
    }


        return $submenu_file;
    }



    public function remove_default_publish_box()
    {
        remove_meta_box('submitdiv', 'ppxo_form', 'side'); // Replace 'ppxo_form' with your CPT slug
    }





    public function custom_form_messages($messages)
    {
        global $post, $post_ID;

        $messages['ppxo_form'] = [
            0  => '', // Unused. Messages start at index 1.
            1  => __('Form updated.', 'ppxo'),
            2  => __('Custom field updated.', 'ppxo'),
            3  => __('Custom field deleted.', 'ppxo'),
            4  => __('Form updated.', 'ppxo'),
            5  => isset($_GET['revision'])
                ? sprintf(__('Form restored to revision from %s', 'ppxo'), wp_post_revision_title((int) $_GET['revision'], false))
                : false,
            6  => __('Form published.', 'ppxo'),
            7  => __('Form saved.', 'ppxo'),
            8  => __('Form submitted.', 'ppxo'),
            9  => sprintf(
                __('Form scheduled for: <strong>%1$s</strong>.', 'ppxo'),
                date_i18n(__('M j, Y @ G:i', 'ppxo'), strtotime($post->post_date))
            ),
            10 => __('Form draft updated.', 'ppxo')
        ];

        return $messages;
    }
}
