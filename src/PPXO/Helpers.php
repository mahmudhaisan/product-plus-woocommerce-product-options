<?php

namespace PPXO;

defined('ABSPATH') || exit;

/**
 * Utility helper methods used throughout the plugin
 */
class Helpers {

    /**
     * Wrapper for safely getting WordPress options with a default fallback
     *
     * @param string $key     Option name
     * @param mixed  $default Default value if option not found
     * @return mixed
     */
    public static function get_option($key, $default = '') {
        return get_option($key, $default);
    }
}
