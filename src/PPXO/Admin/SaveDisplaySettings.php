<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class SaveDisplaySettings {
    public function register() {
        add_action('save_post_ppxo_form', [$this, 'save_display_settings_meta']);
    }

    public function save_display_settings_meta($post_id) {
        // Save selected hook
        $hook = isset($_POST['ppxo_hook']) ? sanitize_text_field($_POST['ppxo_hook']) : '';

        if (!empty($hook)) {
            update_post_meta($post_id, '_ppxo_hook', $hook);
        }

        // Save selected products
        $new_products = isset($_POST['ppxo_products']) ? array_map('intval', $_POST['ppxo_products']) : [];
        $old_products = get_post_meta($post_id, '_ppxo_products', true) ?: [];

        update_post_meta($post_id, '_ppxo_products', $new_products);

        // Add/update global form for selected products
        foreach ($new_products as $product_id) {
            $forms = get_post_meta($product_id, '_ppxo_attached_forms', true) ?: [];

            $forms[$post_id] = [
                'type' => 'global',
                'hook' => $hook
            ];

            update_post_meta($product_id, '_ppxo_attached_forms', $forms);
        }

        // Remove form from unselected products
        $removed_products = array_diff($old_products, $new_products);
        foreach ($removed_products as $product_id) {
            $forms = get_post_meta($product_id, '_ppxo_attached_forms', true) ?: [];
            if (isset($forms[$post_id])) {
                unset($forms[$post_id]);
                update_post_meta($product_id, '_ppxo_attached_forms', $forms);
            }
        }
    }
}
