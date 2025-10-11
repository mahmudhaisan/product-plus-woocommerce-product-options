<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class FormPreview {
    public function register() {
        add_action('admin_post_ppxo_form_preview', [$this, 'handle_form_preview']);
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

}
