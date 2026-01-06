<?php

namespace PPXO\Admin;

defined('ABSPATH') || exit;

class SaveFormData
{
    private $table_name;

    public function __construct()
    {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'ppxo_forms';
    }

    public function register()
    {
        // Create database table on plugin activation
        register_activation_hook(PPXO_PLUGIN_FILE, [$this, 'create_table']);

        // Save when post is updated
        add_action('save_post_ppxo_form', [$this, 'save'], 20, 2);

        // Load form data into JS
        add_filter('ppxo_load_form_data', [$this, 'load']);
    }

    /**
     * Create table for storing form JSON
     */
    public function create_table()
    {
        global $wpdb;

        $charset = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$this->table_name} (
            form_id BIGINT UNSIGNED NOT NULL,
            form_data LONGTEXT NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (form_id)
        ) $charset;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    /**
     * Save form JSON into DB
     */
    public function save($post_id)
    {
        if (!isset($_POST['ppxo_form_data_json'])) {
            return;
        }

        global $wpdb;

        $json = wp_unslash($_POST['ppxo_form_data_json']);

        $wpdb->replace(
            $this->table_name,
            [
                'form_id'   => $post_id,
                'form_data' => $json,
                'updated_at'=> current_time('mysql')
            ],
            ['%d', '%s', '%s']
        );
    }

    /**
     * Load JSON for a form
     */
    public function load($post_id)
    {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare("SELECT form_data FROM {$this->table_name} WHERE form_id = %d", $post_id),
            ARRAY_A
        );

        if (!$row) {
            return json_encode(['fields' => []]);
        }

        return $row['form_data'];
    }
}
