<?php
function mytheme_setup()
{
    add_theme_support('custom-logo', array(
        'width'       => 200, // Adjust width as needed
        'height'      => 100, // Adjust height as needed
        'flex-width'  => true,
        'flex-height' => true,
    ));
}
add_action('after_setup_theme', 'mytheme_setup');

add_filter( 'render_block_core/site-logo', 'kotlinskidev_add_site_logo_aria_label' );

function kotlinskidev_add_site_logo_aria_label( string $block_content ): string {
	if ( strpos( $block_content, 'custom-logo-link' ) === false || strpos( $block_content, 'aria-label' ) !== false ) {
		return $block_content;
	}
	$label = sprintf( __( '%s home', 'kotlinskidev' ), get_bloginfo( 'name' ) );
	return preg_replace( '/class="[^"]*\bcustom-logo-link\b[^"]*"/', 'aria-label="' . esc_attr( $label ) . '" $0', $block_content, 1 );
}