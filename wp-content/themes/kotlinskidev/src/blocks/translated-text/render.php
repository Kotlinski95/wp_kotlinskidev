<?php
$kotlinskidev_translated_text_allowed_tags = [ 'p', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a' ];
$kotlinskidev_translated_text_tag_name     = $attributes['tagName'] ?? 'p';
if ( ! in_array( $kotlinskidev_translated_text_tag_name, $kotlinskidev_translated_text_allowed_tags, true ) ) {
	$kotlinskidev_translated_text_tag_name = 'p';
}

$kotlinskidev_translated_text_fallback       = $attributes['fallbackText'] ?? '';
$kotlinskidev_translated_text_string_name    = trim( (string) ( $attributes['stringName'] ?? '' ) );
$kotlinskidev_translated_text_href_source    = $attributes['href'] ?? '';
$kotlinskidev_translated_text_linked_post_id = absint( $attributes['linkedPostId'] ?? 0 );

if ( '' === $kotlinskidev_translated_text_fallback ) {
	return;
}

$kotlinskidev_translated_text_content = ( '' !== $kotlinskidev_translated_text_string_name && function_exists( 'pll__' ) )
	? pll__( $kotlinskidev_translated_text_fallback )
	: $kotlinskidev_translated_text_fallback;

$kotlinskidev_translated_text_content = wp_kses( $kotlinskidev_translated_text_content, [] );

$kotlinskidev_translated_text_href_attr = '';
if ( 'a' === $kotlinskidev_translated_text_tag_name && $kotlinskidev_translated_text_linked_post_id > 0 ) {
	$kotlinskidev_translated_text_linked_url = get_permalink( kotlinskidev_resolve_translatable_post_id( $kotlinskidev_translated_text_linked_post_id ) );

	if ( $kotlinskidev_translated_text_linked_url ) {
		$kotlinskidev_translated_text_href_attr = ' href="' . esc_url( $kotlinskidev_translated_text_linked_url ) . '"';
	}
} elseif ( 'a' === $kotlinskidev_translated_text_tag_name && '' !== $kotlinskidev_translated_text_href_source ) {
	$kotlinskidev_translated_text_href = ( '' !== $kotlinskidev_translated_text_string_name && function_exists( 'pll__' ) )
		? pll__( $kotlinskidev_translated_text_href_source )
		: $kotlinskidev_translated_text_href_source;

	$kotlinskidev_translated_text_href_attr = ' href="' . esc_url( $kotlinskidev_translated_text_href ) . '"';
}

$kotlinskidev_translated_text_wrapper_attrs = get_block_wrapper_attributes(
	'a' === $kotlinskidev_translated_text_tag_name ? [ 'class' => 'wp-block-button__link wp-element-button' ] : []
);
?>
<<?php echo esc_html( $kotlinskidev_translated_text_tag_name ) . $kotlinskidev_translated_text_href_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- tag name esc_html()'d, href esc_url()'d above ?> <?php echo $kotlinskidev_translated_text_wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() self-escapes ?>><?php echo $kotlinskidev_translated_text_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized via wp_kses() with no allowed tags above ?></<?php echo esc_html( $kotlinskidev_translated_text_tag_name ); ?>>
