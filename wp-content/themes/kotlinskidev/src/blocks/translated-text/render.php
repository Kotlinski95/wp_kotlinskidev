<?php
$kotlinskidev_translated_text_allowed_tags = [ 'p', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a' ];
$kotlinskidev_translated_text_tag_name     = $attributes['tagName'] ?? 'p';
if ( ! in_array( $kotlinskidev_translated_text_tag_name, $kotlinskidev_translated_text_allowed_tags, true ) ) {
	$kotlinskidev_translated_text_tag_name = 'p';
}

$kotlinskidev_translated_text_fallback    = $attributes['fallbackText'] ?? '';
$kotlinskidev_translated_text_string_name = trim( (string) ( $attributes['stringName'] ?? '' ) );
$kotlinskidev_translated_text_href_source = $attributes['href'] ?? '';

if ( '' === $kotlinskidev_translated_text_fallback ) {
	return;
}

$kotlinskidev_translated_text_content = ( '' !== $kotlinskidev_translated_text_string_name && function_exists( 'pll__' ) )
	? pll__( $kotlinskidev_translated_text_fallback )
	: $kotlinskidev_translated_text_fallback;

$kotlinskidev_translated_text_content = wp_kses( $kotlinskidev_translated_text_content, [] );

$kotlinskidev_translated_text_href_attr = '';
if ( 'a' === $kotlinskidev_translated_text_tag_name && '' !== $kotlinskidev_translated_text_href_source ) {
	$kotlinskidev_translated_text_href = ( '' !== $kotlinskidev_translated_text_string_name && function_exists( 'pll__' ) )
		? pll__( $kotlinskidev_translated_text_href_source )
		: $kotlinskidev_translated_text_href_source;

	$kotlinskidev_translated_text_href_attr = ' href="' . esc_url( $kotlinskidev_translated_text_href ) . '"';
}
?>
<<?php echo esc_html( $kotlinskidev_translated_text_tag_name ) . $kotlinskidev_translated_text_href_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- tag name esc_html()'d, href esc_url()'d above ?> <?php echo get_block_wrapper_attributes(); ?>><?php echo $kotlinskidev_translated_text_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized via wp_kses() with no allowed tags above ?></<?php echo esc_html( $kotlinskidev_translated_text_tag_name ); ?>>
