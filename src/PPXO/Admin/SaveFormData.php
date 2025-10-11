<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class SaveFormData {
    public function register() {
        add_action('save_post_ppxo_form', [$this, 'save_form_data']);
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

}
