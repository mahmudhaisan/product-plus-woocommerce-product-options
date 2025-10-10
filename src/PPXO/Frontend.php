<?php

namespace PPXO;

defined('ABSPATH') || exit;

/**
 * Frontend class for rendering custom fields on the single product page
 */
class Frontend {

    public function __construct() {
        // Hook custom fields before the Add to Cart button
        add_action('woocommerce_before_add_to_cart_button', [$this, 'render_custom_fields']);
    }

    /**
     * Render custom input fields on the product page
     */
    public function render_custom_fields() {
        echo '<div class="ppxo-extra-option">';
        echo '<label for="ppxo_extra">' . esc_html__('Extra Option:', 'ppxo') . '</label> ';
        echo '<input type="text" id="ppxo_extra" name="ppxo_extra" placeholder="' . esc_attr__('Enter custom value', 'ppxo') . '" />';
        echo '</div>';
    }
}
