<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class RegisterCPT {


    public function register() {
    
        add_action('init', [$this, 'register_form_cpt']);
    }

   
    /**
     * Register Form Custom Post Type
     */
    public function register_form_cpt()
    {
        $labels = array(
            'name' => __('Global Forms', 'ppxo'),
            'singular_name' => __('Global Form', 'ppxo'),
            'menu_name' => __('Global Forms', 'ppxo'),
            'name_admin_bar' => __('Global Form', 'ppxo'),
            'add_new' => __('Add New', 'ppxo'),
            'add_new_item' => __('Add New Global Form', 'ppxo'),
            'new_item' => __('New Global Form', 'ppxo'),
            'edit_item' => __('Edit Global Form', 'ppxo'),
            'view_item' => __('View Global Form', 'ppxo'),
            'all_items' => __('All Global Forms', 'ppxo'),
            'search_items' => __('Search Global Forms', 'ppxo'),
            'not_found' => __('No global forms found.', 'ppxo'),
            'not_found_in_trash' => __('No global forms found in Trash.', 'ppxo')
        );

        $args = array(
            'labels' => $labels,
            'public' => false,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => false, // <— now it has its own menu
            'query_var' => true,
            'capability_type' => 'post',
            'has_archive' => false,
            'hierarchical' => false,
            'menu_position' => 25,
            'supports' => array('title'),
            'menu_icon' => 'dashicons-forms'
        );

        register_post_type('ppxo_form', $args);
    }

}
