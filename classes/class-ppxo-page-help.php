<?php

defined( 'ABSPATH' ) || exit;

/**
 * Help & Documentation Page
 */
class PPXO_Page_Help {

	/**
	 * Render documentation page
	 */
	public function render() {
		?>
		<div class="wrap">
			<h1><?php echo esc_html__( 'Help & Documentation', 'ppxo' ); ?></h1>
			<p><?php echo esc_html__( 'Find usage guides and support resources here.', 'ppxo' ); ?></p>
		</div>
		<?php
	}
}
