<?php

defined('ABSPATH') || exit;

class PPXO_Page_Main_copy
{

    /**
     * Render full admin page
     */
    public function render()
    {
        $nonce = wp_create_nonce('ppxo_admin_nonce');
        $ver   = PPXO_VERSION;

        // Theme
        $theme = get_option('ppxo_admin_theme', 'ppxo-theme-purple');
        $dark  = get_option('ppxo_dark_mode', false) ? 'ppxo-dark' : '';

?>
        <div
            id="ppxo-app"
            class="ppxo-root <?php echo esc_attr($theme . ' ' . $dark); ?>"
            data-nonce="<?php echo esc_attr($nonce); ?>"
            data-version="<?php echo esc_attr($ver); ?>"
            role="application"
            aria-label="Product Plus Dashboard">

            <!-- HEADER -->
            <header class="ppxo-header">
                <div class="ppxo-brand">
                    <img
                        class="ppxo-logo"
                        src="<?php echo esc_url(PPXO_PLUGIN_URL . 'assets/img/logo.png'); ?>"
                        alt="Product Plus" />
                  
                  
                        <!-- NAVIGATION -->
                    <nav class="ppxo-nav" role="tablist" aria-label="Product Plus Main Tabs">

                        <a
                            href="<?php echo admin_url('admin.php?page=ppxo-options&action=new'); ?>"
                            class="ppxo-tab-option"
                            aria-selected="true">
                            <i class="fa fa-plus-circle"></i>
                            Create New Option Group
                        </a>


                        <button class="ppxo-tab" role="tab" aria-selected="true" data-tab="dashboard">
                            <i class="fa fa-tachometer"></i> Dashboard
                        </button>
                        <button class="ppxo-tab" role="tab" aria-selected="false" data-tab="options">
                            <i class="fa fa-th-large"></i> Options Manager
                        </button>
                        <button class="ppxo-tab" role="tab" aria-selected="false" data-tab="analytics">
                            <i class="fa fa-chart-line"></i> Analytics
                        </button>
                        <button class="ppxo-tab" role="tab" aria-selected="false" data-tab="settings">
                            <i class="fa fa-cog"></i> Settings
                        </button>
                        <button class="ppxo-tab" role="tab" aria-selected="false" data-tab="integrations">
                            <i class="fa fa-plug"></i> Integrations
                        </button>
                        <button class="ppxo-tab" role="tab" aria-selected="false" data-tab="help">
                            <i class="fa fa-life-ring"></i> Help
                        </button>

                    </nav>
                </div>

                <div class="ppxo-header-actions">




                    <div class="ppxo-controls">
                        <button
                            id="ppxo-toggle-theme"
                            class="ppxo-btn ppxo-btn-ghost"
                            aria-pressed="false"
                            title="Toggle dark mode">
                            <i class="fa fa-adjust"></i>
                        </button>

                        <button
                            id="ppxo-upgrade-pro"
                            class="ppxo-btn ppxo-btn-primary"
                            title="Upgrade to Pro">
                            <i class="fa fa-lock"></i>
                            Upgrade to Pro
                        </button>

                    </div>
                </div>
            </header>



            <!-- MAIN CONTENT -->
            <main class="ppxo-main">


                <section id="ppxo-tab-dashboard" class="ppxo-tab-panel" role="tabpanel" aria-hidden="false" data-loaded="true">
                    <?php $this->render_dashboard_tab(); ?>
                </section>

                <section id="ppxo-tab-options" class="ppxo-tab-panel" role="tabpanel" aria-hidden="true" data-loaded="false">
                    <?php $this->render_options_tab(); ?>
                </section>

                <section id="ppxo-tab-analytics" class="ppxo-tab-panel" role="tabpanel" aria-hidden="true" data-loaded="false">
                    <?php $this->render_analytics_tab(); ?>
                </section>

                <section id="ppxo-tab-settings" class="ppxo-tab-panel" role="tabpanel" aria-hidden="true" data-loaded="false">
                    <?php $this->render_settings_tab(); ?>
                </section>

                <section id="ppxo-tab-integrations" class="ppxo-tab-panel" role="tabpanel" aria-hidden="true" data-loaded="false">
                    <?php $this->render_integrations_tab(); ?>
                </section>

                <section id="ppxo-tab-help" class="ppxo-tab-panel" role="tabpanel" aria-hidden="true" data-loaded="false">
                    <?php $this->render_help_tab(); ?>
                </section>

            </main>

            <!-- FOOTER -->
            <footer class="ppxo-footer">
                <div>Made with ♥ by
                    <a href="https://wpagain.com" target="_blank" rel="noopener">
                        wpagain.com
                    </a>
                </div>
                <div class="ppxo-version">v<?php echo esc_html($ver); ?></div>
            </footer>

        </div>
    <?php
    }

    /* --------------------------------------------------------------
        TAB CONTENT RENDERING
    -------------------------------------------------------------- */

    /** Dashboard */
    private function render_dashboard_tab()
    {
    ?>
        <div class="ppxo-dashboard-wrap">

            <!-- HERO SECTION -->
            <div class="ppxo-hero">
                <div class="ppxo-hero-text">
                    <h2>Welcome to Product Plus</h2>
                    <p>Build smarter product add-ons, conditional logic, and dynamic fields with an intuitive workflow.</p>
                </div>

            </div>



            <div class="ppxo-dashboard-layout">

                <div class="ppxo-hero">

                    <!-- LEFT: HERO TEXT -->
                    <div class="ppxo-hero-text">
                        <h1>Build Better Product Options</h1>
                        <p>
                            Create advanced option groups, conditional logic, and dynamic pricing
                            without touching code. Product Plus gives you full control over how
                            customers customize your products.
                        </p>

                        <a
                            href="<?php echo admin_url('admin.php?page=ppxo-options&action=new'); ?>"
                            class="ppxo-btn-primary ppxo-hero-btn"
                            aria-selected="true">
                            <i class="fa fa-plus-circle"></i>
                            Create New Option Group
                        </a>

                    </div>

                    <!-- RIGHT: HERO IMAGE -->
                    <div class="ppxo-hero-image">
                        <img
                            src="<?php echo esc_url(PPXO_PLUGIN_URL . 'assets/img/dashboard-hero.png'); ?>"
                            alt="Product Plus Illustration">
                    </div>

                </div>


                <!-- SIDEBAR (30%) -->
                <div class="ppxo-sidebar">

                    <!-- RESOURCES -->
                    <div class="ppxo-card ppxo-sidebar-block ppxo-resources">
                        <h3><i class="fa fa-book"></i> Resources</h3>
                        <ul class="ppxo-list ppxo-list-links">
                            <li><a target="_blank" href="https://wpagain.com/docs"><i class="fa fa-file-alt"></i> Documentation</a></li>
                            <li><a target="_blank" href="https://wpagain.com/tutorials"><i class="fa fa-video"></i> Video Tutorials</a></li>
                            <li><a target="_blank" href="https://wpagain.com/snippets"><i class="fa fa-code"></i> Developer Snippets</a></li>
                            <li><a target="_blank" href="https://wpagain.com/blog"><i class="fa fa-lightbulb"></i> Tips & Best Practices</a></li>
                        </ul>
                    </div>

                    <!-- SUPPORT & COMMUNITY -->
                    <div class="ppxo-card ppxo-sidebar-block ppxo-support">
                        <h3><i class="fa fa-life-ring"></i> Support & Community</h3>

                        <ul class="ppxo-list ppxo-list-links">
                            <li><a target="_blank" href="https://wpagain.com/support"><i class="fa fa-envelope-open"></i> Contact Support</a></li>
                            <li><a target="_blank" href="https://wpagain.com/community"><i class="fa fa-users"></i> Join Community Group</a></li>
                            <li><a target="_blank" href="https://wpagain.com/report"><i class="fa fa-bug"></i> Report an Issue</a></li>
                        </ul>
                    </div>

                   

                    <!-- SYSTEM STATUS -->
                    <div class="ppxo-card ppxo-sidebar-block ppxo-status">

                        <h3><i class="fa fa-info-circle"></i> System Status</h3>

                        <ul class="ppxo-status-list">

                            <li>
                                <span>WordPress Version</span>
                                <strong><?php echo esc_html(get_bloginfo('version')); ?></strong>
                            </li>

                            <li>
                                <span>PHP Version</span>
                                <strong><?php echo esc_html(phpversion()); ?></strong>
                            </li>

                            <li>
                                <span>WooCommerce</span>
                                <strong>
                                    <?php echo class_exists('WooCommerce')
                                        ? esc_html(WC()->version)
                                        : 'Not Installed'; ?>
                                </strong>
                            </li>

                            <li>
                                <span>Product Plus Version</span>
                                <strong><?php echo esc_html(PPXO_VERSION); ?></strong>
                            </li>

                            <li>
                                <span>Memory Limit</span>
                                <strong><?php echo esc_html(WP_MEMORY_LIMIT); ?></strong>
                            </li>

                        </ul>
                    </div>

                     <!-- REVIEWS -->
                    <div class="ppxo-card ppxo-sidebar-block ppxo-reviews">
                        <h3><i class="fa fa-star"></i> Love Product Plus?</h3>
                        <p>Your feedback helps us grow and deliver better features.</p>

                        <a
                            target="_blank"
                            href="https://wordpress.org/plugins/product-plus/"
                            class="ppxo-btn ppxo-btn-primary ppxo-full">
                            <i class="fa fa-star"></i> Leave a Review
                        </a>
                    </div>

                </div>


            </div>




        </div>

    <?php
    }

    /** Options Manager */
    private function render_options_tab()
    {
    ?>
        <div class="ppxo-options-wrap">
            <h2>Options Manager</h2>
            <p>Manage your extra fields, product options, and configurator items.</p>

            <button class="ppxo-btn ppxo-btn-primary">

                <i class="fa fa-plus-circle"></i> Create New Option Group

            </button>

            <div class="ppxo-card ppxo-mt">
                <h3>Existing Option Groups</h3>
                <ul class="ppxo-list">
                    <li>Basic Fields</li>
                    <li>Rent Hour Addons</li>
                    <li>Color + Size Selection</li>
                </ul>
            </div>
        </div>
    <?php
    }

    /** Analytics */
    private function render_analytics_tab()
    {
    ?>
        <div class="ppxo-analytics-wrap">
            <h2>Analytics</h2>
            <p>Track option usage and customer selection trends.</p>

            <div class="ppxo-card">
                <h3>Coming Soon</h3>
                <p>We are building a clean reporting interface for usage data.</p>
            </div>
        </div>
    <?php
    }

    /** Settings */
    private function render_settings_tab()
    {
    ?>
        <div class="ppxo-settings-wrap">
            <h2>General Settings</h2>

            <div class="ppxo-card">
                <label>
                    <strong>Enable Dark Mode</strong>
                    <input type="checkbox" id="ppxo-dark-setting" />
                </label>

                <label class="ppxo-mt">
                    <strong>Admin Theme Color</strong>
                    <select>
                        <option value="ppxo-theme-purple">Purple</option>
                        <option value="ppxo-theme-blue">Blue</option>
                        <option value="ppxo-theme-green">Green</option>
                    </select>
                </label>
            </div>
        </div>
    <?php
    }

    /** Integrations */
    private function render_integrations_tab()
    {
    ?>
        <div class="ppxo-integrations-wrap">
            <h2>Integrations</h2>
            <p>Connect Product Plus with other plugins and external apps.</p>

            <div class="ppxo-grid-3">
                <div class="ppxo-card">
                    <h3>WooCommerce</h3>
                    <p>Fully connected.</p>
                </div>

                <div class="ppxo-card">
                    <h3>ACF</h3>
                    <p>Supports advanced fields and repeater fields.</p>
                </div>

                <div class="ppxo-card">
                    <h3>REST API</h3>
                    <p>API access for headless and app integrations.</p>
                </div>
            </div>
        </div>
    <?php
    }

    /** Help */
    private function render_help_tab()
    {
    ?>
        <div class="ppxo-help-wrap">
            <h2>Help & Documentation</h2>

            <div class="ppxo-card">
                <p>Need help? Visit our docs, join support or watch tutorials.</p>
                <p>
                    <a class="ppxo-btn ppxo-btn-primary" href="https://wpagain.com" target="_blank">
                        Open Documentation
                    </a>
                </p>
            </div>
        </div>
<?php
    }
}
