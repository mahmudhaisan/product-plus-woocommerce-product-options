<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class AjaxHandler {

    public function register() {
        add_action('wp_ajax_ppxo_save_form', [$this, 'handle_ajax_save_form']);

        
        add_action('wp_ajax_ppxo_get_form', [$this, 'handle_ajax_get_form']);
        // Keep other AJAX actions as needed


         // Hook AJAX actions
        add_action('wp_ajax_ppxo_get_products', [$this, 'get_products']);
        add_action('wp_ajax_nopriv_ppxo_get_products', [$this, 'get_products']);


        // Register AJAX actions
        add_action('wp_ajax_ppxo_handle_deletion', [$this, 'ajax_handle_deletion']);
        add_action('wp_ajax_ajax_save_settings', [$this, 'ajax_save_settings']);

    }

    /**
     * Create custom table to store forms
     */
    public function create_form_table() {
        error_log('Creating forms table if not exists...');
        global $wpdb;
        $table = $wpdb->prefix . 'ppxo_forms';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table (
            form_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            form_data LONGTEXT NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (form_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }




    /**
     * Handle AJAX save - modified to return ID and check if it's a new form
     */
    public function handle_ajax_save_form() {
        global $wpdb;
        $table = $wpdb->prefix . 'ppxo_forms';

        check_ajax_referer('ppxo_form_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $form_id   = isset($_POST['form_id']) ? intval($_POST['form_id']) : 0;
        $form_data = isset($_POST['form_data']) ? wp_unslash($_POST['form_data']) : '';

        error_log('Received form data for saving: ' . $form_data);

        $is_new_form = isset($_POST['is_new_form']) ? (bool)$_POST['is_new_form'] : false;


        

        if (empty($form_data)) {
            wp_send_json_error(['message' => 'Empty form data']);
        }

        $current_time = current_time('mysql');
        
        if ($form_id > 0) {

            error_log('Updating existing form with ID: ' . $form_data);
            // Update existing form
            $updated = $wpdb->update(
                $table,
                ['form_data' => $form_data, 'updated_at' => $current_time],
                ['form_id' => $form_id],
                ['%s','%s'],
                ['%d']
            );

            if ($updated === false) {
                wp_send_json_error(['message' => 'Failed to update form']);
            }
            
            $was_new = false;
        } else {
            // Insert new form
            $wpdb->insert(
                $table,
                [
                    'form_data'  => $form_data,
                    'created_at' => $current_time,
                    'updated_at' => $current_time
                ],
                ['%s','%s','%s']
            );
            $form_id = $wpdb->insert_id;
            $was_new = true;
        }

        wp_send_json_success([
            'form_id' => $form_id,
            'was_new' => $was_new,
            'message' => $was_new ? 'New form created successfully!' : 'Form updated successfully!'
        ]);
    }






    
    /**
     * Handle AJAX get form
     */
    public function handle_ajax_get_form() {
        
        global $wpdb;
        $table = $wpdb->prefix . 'ppxo_forms';

        check_ajax_referer('ppxo_form_nonce', 'nonce');

        if (!current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $form_id = isset($_POST['form_id']) ? intval($_POST['form_id']) : 0;
        if (!$form_id) {
            wp_send_json_error(['message' => 'Missing form ID']);
        }

        $form_data = $wpdb->get_var($wpdb->prepare("SELECT form_data FROM $table WHERE form_id = %d", $form_id));

        if (!$form_data) {
            wp_send_json_error(['message' => 'Form not found']);
        }

        wp_send_json_success(['form_data' => json_decode($form_data, true)]);


        
    }


     /**
     * Return WooCommerce products via AJAX
     */
    public function get_products() {

   
       
        check_ajax_referer('ppxo_form_nonce', 'nonce');

        if (!class_exists('WC_Product')) {
            wp_send_json_error('WooCommerce not active');
        }

        $products = wc_get_products([
            'limit'  => 100,
            'status' => 'publish',
        ]);



        error_log('Fetched ' . count($products) . ' products via AJAX.');


        $data = [];

        foreach ($products as $product) {
            $data[] = [
                'id'    => $product->get_id(),
                'title' => $product->get_name(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') ?: wc_placeholder_img_src(),
            ];
        }

        wp_send_json_success($data);
    }






    /**
     * Unified Deletion Handler (Single & Batch)
     */
    public function ajax_handle_deletion() {
        // 1. Security Check
        check_ajax_referer('ppxo_dashboard_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized access.']);
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'ppxo_forms';
        
        // 2. Parse IDs (Works for single integer or array)
        $ids = isset($_POST['ids']) ? $_POST['ids'] : [];
        if (!is_array($ids)) {
            $ids = [intval($ids)];
        } else {
            $ids = array_map('intval', $ids);
        }

        if (empty($ids)) {
            wp_send_json_error(['message' => 'No items selected for deletion.']);
        }

        // 3. Database Execution
        $format = implode(',', array_fill(0, count($ids), '%d'));
        $query  = $wpdb->prepare("DELETE FROM $table_name WHERE form_id IN ($format)", $ids);
        $deleted = $wpdb->query($query);

        if ($deleted !== false) {
            wp_send_json_success([
                'message' => sprintf('%d items deleted successfully.', count($ids)),
                'deleted_ids' => $ids
            ]);
        } else {
            wp_send_json_error(['message' => 'Database error occurred.']);
        }
    }





    public function ajax_save_settings() {
    check_ajax_referer('ppxo_settings_nonce', 'nonce');

    if (!current_user_can('manage_options')) {
        wp_send_json_error();
    }

    // List of expected keys
    $keys = ['enable_plugin', 'load_conditionally', 'show_price_labels', 'display_style', 'total_price_box', 'debug_mode'];
    $data_to_save = [];

    foreach ($keys as $key) {
        // Checkboxes only send a value if they are checked
        $data_to_save[$key] = isset($_POST[$key]) ? 'on' : 'off';
        
        // Handle dropdown specifically if needed
        if($key === 'display_style') {
            $data_to_save[$key] = sanitize_text_field($_POST[$key]);
        }
    }

    update_option('ppxo_settings', $data_to_save);
    wp_send_json_success();
}
}