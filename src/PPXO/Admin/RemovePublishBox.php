<?php

namespace PPXO\Admin;

defined('ABSPATH') || exit;

class RemovePublishBox
{
    public function register()
    {
        add_action('add_meta_boxes', [$this, 'remove_default_publish_box']);
    }

    public function remove_default_publish_box()
    {
        remove_meta_box('submitdiv', 'ppxo_form', 'side'); // Replace 'ppxo_form' with your CPT slug
    }
}
