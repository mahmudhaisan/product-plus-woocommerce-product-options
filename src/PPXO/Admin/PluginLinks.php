<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class PluginLinks {
    public function register() {
        add_filter('plugin_action_links_' . plugin_basename(PPXO_PLUGIN_FILE), [$this, 'plugin_settings_link']);
    }

   
    /**
     * Add settings link to plugin action links
     */
    public function plugin_settings_link($links)
    {
        $url = admin_url('admin.php?page=ppxo-global-form');
        $settings_link = '<a href="' . esc_url($url) . '">' . __('Global Form', 'ppxo') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

}
