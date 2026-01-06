<?php

namespace PPXO\Admin;

defined('ABSPATH') || exit;

class EnqueueAssets
{
    public function register()
    {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }







/**
 * Enqueue CSS and JS assets for ALL Product Plus admin pages.
 */
public function enqueue_admin_assets($hook)
{
    global $post_type;

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

    /**
     * STYLES
     */

    wp_enqueue_style(
        'ppxo-fontawesome',
        PPXO_ASSETS . '/css/fontawesome.min.css',
        [],
        '6.5.1'
    );

    wp_enqueue_style(
        'ppxo-select2',
        PPXO_ASSETS . '/css/select2.min.css',
        [],
        '4.1.0'
    );

    // Load Bootstrap 5 CSS (not v4)
    wp_enqueue_style(
        'ppxo-bootstrap',
        PPXO_ASSETS . '/css/bootstrap.min.css', // make sure this is BS5 CSS
        [],
        '5.3.3'
    );

    wp_enqueue_style(
        'ppxo-admin-style',
        PPXO_ASSETS . '/css/admin.css',
        [],
        PPXO_VERSION
    );


    /**
     * SCRIPTS
     */


    wp_enqueue_script(
        'ppxo-bootstrap',
        PPXO_ASSETS . '/js/bootstrap.min.js',
        ['jquery'],
        '5.3.3',
        true
    );

    wp_enqueue_script(
        'ppxo-select2',
        PPXO_ASSETS . '/js/select2.min.js',
        ['jquery'],
        '4.1.0',
        true
    );


    // Form builder or normal admin
    $is_form_builder_page = (
        ($post_type === 'ppxo_form' && ($hook === 'post.php' || $hook === 'post-new.php'))
        || $hook === 'product-plus_page_ppxo-options'
    );

    if ($is_form_builder_page) {
        $this->enqueue_form_builder_assets();
    } else {
        wp_enqueue_script(
            'ppxo-admin-script',
            PPXO_ASSETS . '/js/admin.js',
            ['jquery', 'ppxo-bootstrap', 'ppxo-select2'],
            PPXO_VERSION,
            true
        );
    }


    // Dashboard localization
    if ($hook === 'toplevel_page_ppxo-main') {
        wp_localize_script(
            'ppxo-admin-script',
            'ppxo_dashboard',
            [
                // 'chart_data' => $this->get_chart_data(),
                'ajax_url'   => admin_url('admin-ajax.php'),
                'nonce'      => wp_create_nonce('ppxo_dashboard_nonce')
            ]
        );
    }
}







    /**
     * Enqueue form builder specific assets
     */
    private function enqueue_form_builder_assets()
    {
        // Form builder CSS
        wp_enqueue_style(
            'ppxo-form-builder-style',
            PPXO_ASSETS . '/css/form-builder.css',
            ['ppxo-bootstrap'],
            PPXO_VERSION
        );

        // Main ES6 form builder module
        wp_enqueue_script(
            'ppxo-form-builder',
            PPXO_ASSETS . '/js/form-builder/index.js',
            [],
            PPXO_VERSION,
            true
        );

        // Add type="module" to the form builder script
        add_filter('script_loader_tag', function ($tag, $handle) {
            if ($handle === 'ppxo-form-builder') {
                $tag = preg_replace("/type=['\"][^'\"]*['\"]/", '', $tag);
                return str_replace('<script ', '<script type="module" ', $tag);
            }
            return $tag;
        }, 10, 2);

        // Select2 (for product/category selection inside builder)
        wp_enqueue_script(
            'ppxo-select2',
            PPXO_ASSETS . '/js/select2.min.js',
            ['jquery'],
            '4.1.0',
            true
        );

        // Localize data for the form builder
        wp_localize_script(
            'ppxo-form-builder',
            'ppxo_admin',
            [
                'ajax_url'         => admin_url('admin-ajax.php'),
                'nonce'            => wp_create_nonce('ppxo_form_nonce'),
                'post_id'          => get_the_ID() ?: 0,
                'plugin_url'       => PPXO_ASSETS,
                'assets_url'       => PPXO_ASSETS,
                'currency_symbol'  => get_woocommerce_currency_symbol(),
            ]
        );

        // jQuery UI components for drag-drop builder
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
}
