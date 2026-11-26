<?php
const KOTLINSKIDEV_CUSTOM_LOGO_WIDTH  = 200;
const KOTLINSKIDEV_CUSTOM_LOGO_HEIGHT = 100;

function mytheme_setup()
{
    add_theme_support('custom-logo', array(
        'width'       => KOTLINSKIDEV_CUSTOM_LOGO_WIDTH,
        'height'      => KOTLINSKIDEV_CUSTOM_LOGO_HEIGHT,
        'flex-width'  => true,
        'flex-height' => true,
    ));
}
add_action('after_setup_theme', 'mytheme_setup');

add_filter( 'render_block_core/site-logo', 'kotlinskidev_add_site_logo_aria_label' );
add_filter( 'get_custom_logo', 'kotlinskidev_add_site_logo_aria_label' );

function kotlinskidev_add_site_logo_aria_label( string $block_content ): string {
	$block_content = (string) preg_replace( '#(<a\b[^>]*\bcustom-logo-link\b[^>]*>.*?)<title>[^<]*</title>#s', '$1', $block_content, 1 );
	if ( 1 !== preg_match( '/<a\b[^>]*\bcustom-logo-link\b[^>]*>/', $block_content, $link ) || strpos( $link[0], 'aria-label' ) !== false ) {
		return $block_content;
	}
	$label        = sprintf( __( '%s home', 'kotlinskidev' ), get_bloginfo( 'name' ) );
	$visible_text = kotlinskidev_get_site_logo_visible_text( $block_content );
	if ( '' !== $visible_text && ! kotlinskidev_label_contains_words( $label, $visible_text ) ) {
		$label = sprintf( __( '%1$s – %2$s home', 'kotlinskidev' ), $visible_text, get_bloginfo( 'name' ) );
	}
	return preg_replace( '/class="[^"]*\bcustom-logo-link\b[^"]*"/', 'aria-label="' . esc_attr( $label ) . '" $0', $block_content, 1 );
}

function kotlinskidev_get_site_logo_visible_text( string $block_content ): string {
	if ( 1 !== preg_match( '#<a\b[^>]*\bcustom-logo-link\b[^>]*>(.*?)</a>#s', $block_content, $anchor ) ) {
		return '';
	}
	preg_match_all( '#<text\b[^>]*>([^<]*)</text>#', $anchor[1], $texts );
	return trim( (string) preg_replace( '/\s+/', ' ', implode( ' ', $texts[1] ) ) );
}

function kotlinskidev_label_contains_words( string $label, string $words ): bool {
	return 1 === preg_match( '/(^|\W)' . preg_quote( strtolower( $words ), '/' ) . '(\W|$)/u', strtolower( $label ) );
}