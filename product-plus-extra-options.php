<?php
/**
 * Plugin Name: Product Plus – Extra Options for WooCommerce
 * Plugin URI: https://wpagain.com/
 * Description: Enhance your WooCommerce products by adding customizable extra product fields and options with advanced pricing logic.
 * Version: 1.0.0
 * Author: Mahmudul Hasan
 * Author URI: https://wpagain.com/
 * Text Domain: ppxo
 * Domain Path: /languages
 */

defined('ABSPATH') || exit;

// Composer autoloader
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
} else {
    wp_die('Autoloader not found. Please run <code>composer install</code>.');
}

// Load non-namespaced admin page classes
foreach ( glob( __DIR__ . '/classes/class-ppxo-*.php' ) as $file ) {
    require_once $file;
}

// Start plugin
function ppxo_start_plugin() {
    return PPXO\Init::get_instance(__FILE__);
}
ppxo_start_plugin();

