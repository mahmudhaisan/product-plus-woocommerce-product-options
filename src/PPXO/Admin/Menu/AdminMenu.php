<?php

namespace PPXO\Admin\Menu;

defined('ABSPATH') || exit;

/**
 * Handles admin menu registration for Product Plus.
 */
class AdminMenu
{

	/**
	 * Register admin menu hook.
	 *
	 * @return void
	 */
	public function register()
	{
		// Add admin menu
		add_action('admin_menu', [$this, 'add_admin_menu']);

		// Hide WP admin menu on specific pages
		add_action('admin_head', [$this, 'hide_wp_admin_menu']);

		// Ensure main menu stays highlighted
		add_filter('parent_file', [$this, 'modify_menu_urls']);

		// Highlight the correct submenu based on current tab/page
		// add_filter('submenu_file', [$this, 'highlight_submenu']);

		    add_filter('submenu_file', [$this, 'set_current_submenu']);

	}

	/**
	 * Add plugin menus and submenus.
	 *
	 * @return void
	 */

	public function add_admin_menu()
	{
		// Main menu
		add_menu_page(
			esc_html__('Product Plus', 'ppxo'),
			esc_html__('Product Plus', 'ppxo'),
			'manage_options',
			'ppxo-main',
			[$this, 'render_main_page'],
			'dashicons-admin-generic',
			56
		);

		// Dashboard submenu (first item)
		add_submenu_page(
			'ppxo-main',
			esc_html__('Dashboard', 'ppxo'), // Page title
			esc_html__('Dashboard', 'ppxo'), // Submenu label
			'manage_options',
			'ppxo-main&tab=dashboard',
			[$this, 'render_main_page']
		);

		// Add New Option submenu (separate page)
		add_submenu_page(
			'ppxo-main',
			esc_html__('Add New Option', 'ppxo'),
			esc_html__('Add New Option', 'ppxo'),
			'manage_options',
			'ppxo-options',
			[$this, 'render_options_page']
		);

		// Options List submenu (tab on main page)
		add_submenu_page(
			'ppxo-main',
			esc_html__('Options List', 'ppxo'),
			esc_html__('Options List', 'ppxo'),
			'manage_options',
			'ppxo-main&tab=options_list',
			[$this, 'render_main_page']
		);

		// Settings submenu (tab on main page)
		add_submenu_page(
			'ppxo-main',
			esc_html__('Settings', 'ppxo'),
			esc_html__('Settings', 'ppxo'),
			'manage_options',
			'ppxo-main&tab=settings',
			[$this, 'render_main_page']
		);

		// Help submenu (tab on main page)
		add_submenu_page(
			'ppxo-main',
			esc_html__('Help', 'ppxo'),
			esc_html__('Help', 'ppxo'),
			'manage_options',
			'ppxo-main&tab=help',
			[$this, 'render_main_page']
		);

		// Remove the duplicate first submenu (WP default)
		global $submenu;
		if (isset($submenu['ppxo-main'][0])) {
			unset($submenu['ppxo-main'][0]);
		}
	}




	/**
	 * Render the main dashboard page.
	 *
	 * @return void
	 */
	public function render_main_page()
	{
		if (class_exists('PPXO_Page_Main')) {
			$page = new \PPXO_Page_Main();
			$page->render();
		}
	}

	/**
	 * Render the options/settings page.
	 *
	 * @return void
	 */
	public function render_options_page()
	{
		if (class_exists('PPXO_Page_Global')) {

			$page = new \PPXO_Page_Global();
			$page->render();
		}
	}




	public function add_body_class($classes)
	{
		$screen = get_current_screen();
		if ($screen->id === 'toplevel_page_ppxo-main') {
			$classes .= ' ppxo-page-main';
		}
		return $classes;
	}



	/**
	 * Hides WP admin menu on specific plugin pages.
	 */
	public function hide_wp_admin_menu()
	{

		// Only run inside wp-admin
		if (! is_admin()) {
			return;
		}

		// Only continue if ?page= exists
		if (empty($_GET['page'])) {
			return;
		}

		// Target the pages where you want blank canvas
		$blank_pages = ['ppxo-options'];

		if (! in_array($_GET['page'], $blank_pages, true)) {
			return;
		}

?>
		<style>
			/* Hide WP admin left side menu */
			#adminmenu,
			#adminmenuwrap,
			#adminmenuback {
				display: none !important;
			}

			/* Remove WP left space */
			#wpcontent,
			#wpfooter {
				margin-left: 0 !important;
				padding-left: 0 !important;
			}

			/* Optional: hide admin bar */
			/*#wpadminbar { display:none !important; }
        html.wp-toolbar { padding-top:0 !important; }*/

			/* Remove screen options + help */
			#screen-meta-links {
				display: none !important;
			}
		</style>
<?php
	}



	/**
	 * Modify menu URLs to add query parameters.
	 */
	public function modify_menu_urls($parent_file)
	{
		global $plugin_page, $submenu;


		// Only modify our plugin's menu
		if (isset($submenu['ppxo-main'])) {
			foreach ($submenu['ppxo-main'] as &$item) {

				// Target the Options page			echo 23;
				if ($item[2] === 'ppxo-options') {
					// Add query parameters
					$item[2] = add_query_arg(
						array(
							'action' => 'new'
						),
						'admin.php?page=ppxo-options'
					);
				}
			}
		}

		return $parent_file;
	}





	/**
 * Highlight active submenu item
 *
 * @param string $submenu_file
 * @return string
 */

/**
 * Set the correct submenu as active
 */
public function set_current_submenu($submenu_file)
{
    if (!isset($_GET['page'])) {
        return $submenu_file;
    }

    $page = $_GET['page'];

    switch ($page) {
        case 'ppxo-main':
            $tab = $_GET['tab'] ?? 'dashboard'; // default to dashboard
            $submenu_file = 'ppxo-main&tab=' . $tab;
            break;

        case 'ppxo-options':
            $submenu_file = 'ppxo-options';
            break;
    }

    return $submenu_file;
}
}
