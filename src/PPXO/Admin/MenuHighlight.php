<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class MenuHighlight {
    public function register() {
        add_filter('parent_file', [$this, 'set_cpt_parent_menu']);
        add_filter('submenu_file', [$this, 'set_cpt_submenu']);
    }

    /**
     * Force CPT menu to stay expanded on edit screens
     */
    public function set_cpt_parent_menu($parent_file)
    {
        global $current_screen, $post;

        // Make sure we're on the right CPT (works for post-new.php and post.php)
        if ($current_screen->post_type === \PPXO\Admin::$post_type) {
    $parent_file = 'ppxo-main';
}


        return $parent_file;
    }

  
    /**
     * Force correct submenu highlight
     */
    public function set_cpt_submenu($submenu_file)
    {
        global $current_screen;

        if ($current_screen->post_type === 'ppxo_form') {
            if ($current_screen->base === 'post' && isset($_GET['action']) && $_GET['action'] === 'edit') {
                // Editing form → highlight Forms submenu
                $submenu_file = 'edit.php?post_type=ppxo_form';
            } elseif ($current_screen->base === 'post' && $current_screen->action === 'add') {
                // Adding new form → highlight Add New submenu
                $submenu_file = 'post-new.php?post_type=ppxo_form';
            } elseif ($current_screen->base === 'post-new') {
                // Add New Form page
                $submenu_file = 'post-new.php?post_type=ppxo_form';
            } else {
                // Default listing
                $submenu_file = 'edit.php?post_type=ppxo_form';
            }
        }


        return $submenu_file;
    }
}
