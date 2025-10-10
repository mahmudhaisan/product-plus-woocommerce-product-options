<?php

namespace PPXO\Includes;

defined('ABSPATH') || exit;

/**
 * PSR-4 Autoloader for PPXO namespace
 */
class Autoloader {

    /**
     * Register the autoloader with SPL
     */
    public static function init() {
        spl_autoload_register([__CLASS__, 'autoload']);
    }

    /**
     * Autoload callback function
     *
     * @param string $class Fully qualified class name
     */
    public static function autoload($class) {
        // Only process classes from our PPXO namespace
        if (strpos($class, 'PPXO\\') !== 0) return;

        // Convert namespace to file path
        $class = str_replace('PPXO\\', '', $class);
        $class = str_replace('\\', '/', $class);

        // Construct full path to the class file
        $file  = plugin_dir_path(__DIR__) . '../src/PPXO/' . $class . '.php';

        // Load the class file if it exists
        if (file_exists($file)) {
            require_once $file;
        }
    }
}
