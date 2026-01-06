<?php

namespace PPXO;

defined('ABSPATH') || exit;

/**
 * Core singleton class that bootstraps the plugin
 */
class Init
{
    /**
     * Singleton instance
     *
     * @var Init|null
     */
    private static $instance = null;

    /**
     * The main plugin file path
     *
     * @var string
     */
    private $plugin_file;

    /**
     * Get or create the singleton instance
     *
     * @param string $plugin_file The main plugin file path.
     * @return Init
     */
    public static function get_instance($plugin_file)
    {
        if (!self::$instance) {
            self::$instance = new self($plugin_file);
        }
        return self::$instance;
    }

    /**
     * Private constructor to prevent multiple instances
     */
    private function __construct($plugin_file)
    {
        $this->plugin_file = $plugin_file;
        $this->define_constants();

        // Register activation hook to verify WooCommerce dependency
register_activation_hook(PPXO_PLUGIN_FILE, [$this, 'activate']);

        // Initialize plugin once all plugins are loaded
        add_action('plugins_loaded', [$this, 'run']);

        // Register frontend and admin assets
        add_action('wp_enqueue_scripts', [$this, 'register_assets']);
        add_action('admin_enqueue_scripts', [$this, 'register_assets']);
    }

    /**
     * Define useful plugin constants
     */
    private function define_constants()
    {



        define('PPXO_VERSION', '1.0.1');
        define('PPXO_PLUGIN_FILE', $this->plugin_file);
        define('PPXO_PLUGIN_DIR', plugin_dir_path($this->plugin_file));
        define('PPXO_PLUGIN_URL', plugin_dir_url($this->plugin_file));
        define('PPXO_ASSETS', PPXO_PLUGIN_URL . 'assets');

       
    }

    /**
     * Runs on plugin activation
     * Checks if WooCommerce is active, otherwise deactivates plugin with message
     */
    public function activate()
    {
        // Check WooCommerce dependency
        if (!class_exists('WooCommerce')) {
            deactivate_plugins(plugin_basename(__FILE__));
            wp_die(
                __('Product Plus requires WooCommerce to be installed and activated.', 'ppxo'),
                'Plugin Dependency Error',
                ['back_link' => true]
            );
        }

        // Store plugin version
        update_option('ppxo_version', PPXO_VERSION);

        // Create custom forms table
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
     * Initialize plugin classes based on context (admin or frontend)
     */
    public function run()
    {
        if (!class_exists('WooCommerce')) {
            return;
        }

        if (is_admin()) {
            new Admin();
        } else {
            new Frontend();
        }
    }

    /**
     * Register frontend and admin scripts and styles
     */
    public function register_assets()
    {
        wp_register_style('ppxo-style', PPXO_ASSETS . '/css/frontend.css', [], PPXO_VERSION);
        wp_register_script('ppxo-script', PPXO_ASSETS . '/js/frontend.js', ['jquery'], PPXO_VERSION, true);
    }
}
