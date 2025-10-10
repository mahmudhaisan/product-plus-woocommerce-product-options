<?php

namespace PPXO;

defined('ABSPATH') || exit;

/**
 * Assets class for registering and enqueuing frontend scripts and styles
 */
class Assets {

    public function __construct() {
        // Hook into the frontend asset loading
        add_action('wp_enqueue_scripts', [$this, 'enqueue']);
    }

    /**
     * Enqueue plugin styles and scripts on the frontend
     */
    public function enqueue() {
        // Assumes styles and scripts are registered in Init or earlier
        wp_enqueue_style('ppxo-style');
        wp_enqueue_script('ppxo-script');
    }
}
