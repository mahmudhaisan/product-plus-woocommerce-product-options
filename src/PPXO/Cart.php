<?php

namespace PPXO;

defined('ABSPATH') || exit;

/**
 * Cart class for handling extra product option data during cart interactions
 */
class Cart {

    public function __construct() {
        // Hook into WooCommerce to handle custom option values in cart
        add_filter('woocommerce_add_cart_item_data', [$this, 'add_cart_item_data'], 10, 2);
        add_filter('woocommerce_get_item_data', [$this, 'display_cart_item_data'], 10, 2);
        add_filter('woocommerce_add_to_cart_validation', [$this, 'validate_custom_fields'], 10, 3);
    }

    /**
     * Add custom field data to the cart item
     */
    public function add_cart_item_data($cart_item_data, $product_id) {
        if (isset($_POST['ppxo_extra'])) {
            $cart_item_data['ppxo_extra'] = sanitize_text_field($_POST['ppxo_extra']);
        }
        return $cart_item_data;
    }

    /**
     * Display custom data in the cart and checkout pages
     */
    public function display_cart_item_data($item_data, $cart_item) {
        if (isset($cart_item['ppxo_extra'])) {
            $item_data[] = [
                'key'     => __('Extra Option', 'ppxo'),
                'value'   => wc_clean($cart_item['ppxo_extra']),
                'display' => '',
            ];
        }
        return $item_data;
    }

    /**
     * Optional: Validate custom field input before adding to cart
     */
    public function validate_custom_fields($passed, $product_id, $quantity) {
        // Example: ensure field is not empty
        if (isset($_POST['ppxo_extra']) && empty(trim($_POST['ppxo_extra']))) {
            wc_add_notice(__('Please fill in the extra option field.', 'ppxo'), 'error');
            return false;
        }

        return $passed;
    }
}
