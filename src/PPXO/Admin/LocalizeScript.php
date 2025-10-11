<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class LocalizeScript {
    public function register() {
        add_action('admin_enqueue_scripts', [$this, 'localize_admin_script']);
    }

   
    /**
     * Localize admin script for AJAX
     */
    public function localize_admin_script($hook)
    {
        $current_screen = get_current_screen();

        if (
            $current_screen
            && $current_screen->post_type === 'ppxo_form'
            && ($hook === 'post.php' || $hook === 'post-new.php')
        ) {

            $post_id = 0;

            if (isset($_GET['post'])) {
                $post_id = intval($_GET['post']);
            } elseif (isset($_POST['post_ID'])) {
                $post_id = intval($_POST['post_ID']);
            } elseif (!empty($GLOBALS['post']->ID)) {
                $post_id = intval($GLOBALS['post']->ID);
            }

            wp_localize_script('ppxo-admin-script', 'ppxo_admin', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('ppxo_form_nonce'),
                'post_id'  => $post_id,
            ));
        }
    }
}
