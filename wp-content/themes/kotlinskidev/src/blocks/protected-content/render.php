<?php
if ( ! function_exists( 'kotlinskidev_protected_content_apply_custom_colors' ) ) {
	function kotlinskidev_protected_content_apply_custom_colors( string $wrapper_attrs, array $attributes ): string {
		$custom_text_color = $attributes['style']['color']['text'] ?? '';
		$custom_bg_color   = $attributes['style']['color']['background'] ?? '';

		$extra_style = '';
		if ( '' !== $custom_text_color ) {
			$extra_style .= 'color:' . esc_attr( $custom_text_color ) . ';';
		}
		if ( '' !== $custom_bg_color ) {
			$extra_style .= 'background-color:' . esc_attr( $custom_bg_color ) . ';';
		}

		if ( '' === $extra_style ) {
			return $wrapper_attrs;
		}

		if ( false !== strpos( $wrapper_attrs, 'style="' ) ) {
			return preg_replace_callback(
				'/style="([^"]*)"/',
				function ( array $matches ) use ( $extra_style ): string {
					$existing  = $matches[1];
					$separator = ( '' !== $existing && ! str_ends_with( $existing, ';' ) ) ? ';' : '';
					return 'style="' . $existing . $separator . $extra_style . '"';
				},
				$wrapper_attrs,
				1
			);
		}

		return $wrapper_attrs . ' style="' . $extra_style . '"';
	}
}

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
	$wrapper_attrs = kotlinskidev_protected_content_apply_custom_colors( $wrapper_attrs, $attributes );
	echo '<' . $tag_name . ' ' . $wrapper_attrs . '>' . wp_kses_post( $content ) . '</' . $tag_name . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $tag_name is validated against a fixed whitelist above; $wrapper_attrs is get_block_wrapper_attributes() output plus our own esc_attr()'d color declarations
	return;
}

$strip_tag_types = [ 'email', 'phone' ];
$plain_content   = in_array( $protection_type, $strip_tag_types, true ) ? wp_strip_all_tags( $content ) : $content;
$encrypted     = kotlinskidev_encrypt_content( $plain_content );
$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => 'protected-content protected-content--' . sanitize_html_class( $protection_type ),
] );
$wrapper_attrs = kotlinskidev_protected_content_apply_custom_colors( $wrapper_attrs, $attributes );

echo '<' . $tag_name . ' ' . $wrapper_attrs // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $tag_name is validated against a fixed whitelist above; $wrapper_attrs is get_block_wrapper_attributes() output plus our own esc_attr()'d color declarations
	. ' data-protected="true" data-protection-type="' . esc_attr( $protection_type ) . '"'
	. ' data-original-content="' . esc_attr( $encrypted ) . '"></' . $tag_name . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $tag_name is validated against a fixed whitelist above
