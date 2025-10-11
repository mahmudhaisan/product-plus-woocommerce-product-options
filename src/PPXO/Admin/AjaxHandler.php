<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class AjaxHandler {
    public function register() {
        add_action('wp_ajax_ppxo_save_form', [$this, 'handle_ajax_save_form']);
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

}
