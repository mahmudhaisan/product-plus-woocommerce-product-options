<?php

namespace PPXO;

use PPXO\Admin\{
    RegisterCPT,
    AdminMenu,
    EnqueueAssets,
    PluginLinks,
    MetaBoxes,
    SaveDisplaySettings,
    SaveFormData,
    FormPreview,
    AjaxHandler,
    LocalizeScript,
    MenuHighlight,
    RemovePublishBox,
    CustomMessages
};

defined('ABSPATH') || exit;

class Admin
{
    // Make properties static for global access
    public static $current_form_data = array();
    public static $post_type = 'ppxo_form';

    public function __construct()
    {
        // Each file below keeps your original methods
        (new RegisterCPT())->register();
        (new AdminMenu())->register();
        (new EnqueueAssets())->register();
        (new PluginLinks())->register();
        (new MetaBoxes())->register();
        (new SaveDisplaySettings())->register();
        (new SaveFormData())->register();
        (new FormPreview())->register();
        (new AjaxHandler())->register();
        (new LocalizeScript())->register();
        (new MenuHighlight())->register();
        // (new RemovePublishBox())->register();
        (new CustomMessages())->register();
    }
}
