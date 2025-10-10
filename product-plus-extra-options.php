<?php
/**
 * Plugin Name: Product Plus – Extra Options for WooCommerce
 * Plugin URI: https://wpagain.com/
 * Description: Enhance your WooCommerce products by adding customizable extra product fields and options with advanced pricing logic. Perfect for product personalization, add-ons, gift options, and more. Supports text inputs, checkboxes, radios, selects, and dynamic pricing adjustments based on user selections. Fully compatible with WooCommerce cart, checkout, and order metadata.
 * Version: 1.0.0
 * Author: Mahmudul Hasan
 * Author URI: https://wpagain.com/
 * Text Domain: ppxo
 * Domain Path: /languages
 */

defined('ABSPATH') || exit;

// Composer autoloader check
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
} else {
    wp_die('Autoloader not found. Please run <code>composer install</code>.');
}

// Function to start the plugin
function ppxo_start_plugin() {

    // Pass the main plugin file path to the Init class
    return PPXO\Init::get_instance(__FILE__);
}

ppxo_start_plugin();