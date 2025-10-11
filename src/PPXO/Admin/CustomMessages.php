<?php
namespace PPXO\Admin;

defined('ABSPATH') || exit;

class CustomMessages {
    public function register() {
        add_filter('post_updated_messages', [$this, 'custom_form_messages']);
    }

        public function custom_form_messages($messages)
    {
        global $post, $post_ID;

        $messages['ppxo_form'] = [
            0  => '', // Unused. Messages start at index 1.
            1  => __('Form updated.', 'ppxo'),
            2  => __('Custom field updated.', 'ppxo'),
            3  => __('Custom field deleted.', 'ppxo'),
            4  => __('Form updated.', 'ppxo'),
            5  => isset($_GET['revision'])
                ? sprintf(__('Form restored to revision from %s', 'ppxo'), wp_post_revision_title((int) $_GET['revision'], false))
                : false,
            6  => __('Form published.', 'ppxo'),
            7  => __('Form saved.', 'ppxo'),
            8  => __('Form submitted.', 'ppxo'),
            9  => sprintf(
                __('Form scheduled for: <strong>%1$s</strong>.', 'ppxo'),
                date_i18n(__('M j, Y @ G:i', 'ppxo'), strtotime($post->post_date))
            ),
            10 => __('Form draft updated.', 'ppxo')
        ];

        return $messages;
    }
}
