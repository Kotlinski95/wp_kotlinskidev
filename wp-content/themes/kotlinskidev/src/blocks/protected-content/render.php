<?php
$content         = $attributes['content'] ?? '';
$use_protection  = ! empty( $attributes['useProtection'] );
$protection_type = $attributes['protectionType'] ?? 'email';
$tag_name        = $attributes['tagName'] ?? 'p';

if ( $content === '' ) {
	return;
}

$allowed_tags = [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div' ];
if ( ! in_array( $tag_name, $allowed_tags, true ) ) {
	$tag_name = 'p';
}

if ( ! $use_protection ) {
	$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => 'protected-content' ] );
	echo '<' . $tag_name . ' ' . $wrapper_attrs . '>' . wp_kses_post( $content ) . '</' . $tag_name . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $tag_name is validated against a fixed whitelist above; $wrapper_attrs is get_block_wrapper_attributes() output
	return;
}

$strip_tag_types = [ 'email', 'phone' ];
$plain_content   = in_array( $protection_type, $strip_tag_types, true ) ? wp_strip_all_tags( $content ) : $content;
$encrypted     = kotlinskidev_encrypt_content( $plain_content );
$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => 'protected-content protected-content--' . sanitize_html_class( $protection_type ),
] );

echo '<' . $tag_name . ' ' . $wrapper_attrs // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $tag_name is validated against a fixed whitelist above; $wrapper_attrs is get_block_wrapper_attributes() output
	. ' data-protected="true" data-protection-type="' . esc_attr( $protection_type ) . '"'
	. ' data-original-content="' . esc_attr( $encrypted ) . '"></' . $tag_name . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $tag_name is validated against a fixed whitelist above
