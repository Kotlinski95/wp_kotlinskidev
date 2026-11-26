<?php
const KOTLINSKIDEV_SVG_INLINE_MAX_BYTES = 4096;
const KOTLINSKIDEV_SVG_DISALLOWED_TAGS  = array( 'script', 'foreignobject', 'iframe', 'embed', 'object', 'link', 'meta', 'base', 'style' );
const KOTLINSKIDEV_SVG_URL_ATTRIBUTES   = array( 'href', 'xlink:href', 'src' );

add_filter( 'upload_mimes', 'kotlinskidev_allow_svg_uploads' );
add_filter( 'wp_get_attachment_image', 'kotlinskidev_inline_svg_image', 10, 2 );
add_filter( 'render_block_core/image', 'kotlinskidev_inline_svg_image_block', 10, 2 );
add_filter( 'wp_generate_attachment_metadata', 'kotlinskidev_add_svg_dimensions', 10, 2 );
add_action( 'add_attachment', 'kotlinskidev_ensure_svg_xmlns' );
add_action( 'edit_attachment', 'kotlinskidev_clear_svg_cache' );
add_action( 'delete_attachment', 'kotlinskidev_clear_svg_cache' );

function kotlinskidev_add_svg_xmlns( string $raw ): string {
	if ( 1 === preg_match( '/<svg\b[^>]*\sxmlns\s*=/i', $raw ) ) {
		return $raw;
	}

	return (string) preg_replace( '/<svg\b/i', '<svg xmlns="http://www.w3.org/2000/svg"', $raw, 1 );
}

function kotlinskidev_existing_attachment_file( int $attachment_id ): string {
	$svg_path = get_attached_file( $attachment_id );
	if ( ! $svg_path || ! file_exists( $svg_path ) ) {
		return '';
	}

	return $svg_path;
}

function kotlinskidev_read_svg_file( string $svg_path ): string|false {
	return file_get_contents( $svg_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
}

function kotlinskidev_ensure_svg_xmlns( int $attachment_id ): void {
	if ( 'image/svg+xml' !== get_post_mime_type( $attachment_id ) ) {
		return;
	}

	$svg_path = kotlinskidev_existing_attachment_file( $attachment_id );
	if ( '' === $svg_path ) {
		return;
	}

	$raw = kotlinskidev_read_svg_file( $svg_path );
	if ( ! $raw ) {
		return;
	}

	$patched = kotlinskidev_add_svg_xmlns( $raw );
	if ( $patched !== $raw ) {
		file_put_contents( $svg_path, $patched ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
	}
}

function kotlinskidev_get_svg_dimensions( string $svg_path ): ?array {
	$raw = kotlinskidev_read_svg_file( $svg_path );

	if ( ! $raw ) {
		return null;
	}

	if ( preg_match( '/\swidth="([\d.]+)(?:px)?"/i', $raw, $width_match )
		&& preg_match( '/\sheight="([\d.]+)(?:px)?"/i', $raw, $height_match ) ) {
		return array(
			'width'  => (int) round( (float) $width_match[1] ),
			'height' => (int) round( (float) $height_match[1] ),
		);
	}

	if ( preg_match( '/\sviewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/i', $raw, $matches ) ) {
		return array(
			'width'  => (int) round( (float) $matches[1] ),
			'height' => (int) round( (float) $matches[2] ),
		);
	}

	return null;
}

function kotlinskidev_add_svg_dimensions( array $metadata, int $attachment_id ): array {
	if ( 'image/svg+xml' !== get_post_mime_type( $attachment_id ) ) {
		return $metadata;
	}

	$svg_path = kotlinskidev_existing_attachment_file( $attachment_id );
	if ( '' === $svg_path ) {
		return $metadata;
	}

	$dimensions = kotlinskidev_get_svg_dimensions( $svg_path );
	if ( $dimensions ) {
		$metadata['width']  = $dimensions['width'];
		$metadata['height'] = $dimensions['height'];
	}

	return $metadata;
}

function kotlinskidev_allow_svg_uploads( array $mimes ): array {
	$mimes['svg']  = 'image/svg+xml';
	$mimes['svgz'] = 'image/svg+xml';
	return $mimes;
}

function kotlinskidev_svg_cache_key( int $attachment_id ): string {
	return 'kotlinskidev_svg_v2_' . $attachment_id;
}

function kotlinskidev_legacy_svg_cache_key( int $attachment_id ): string {
	return 'kotlinskidev_svg_' . $attachment_id;
}

function kotlinskidev_is_front_end_render(): bool {
	if ( is_admin() || wp_doing_ajax() || is_feed() ) {
		return false;
	}

	return ! ( defined( 'REST_REQUEST' ) && REST_REQUEST );
}

function kotlinskidev_should_inline_svg( string $svg ): bool {
	$should_inline = false !== stripos( $svg, 'currentColor' ) || strlen( $svg ) <= KOTLINSKIDEV_SVG_INLINE_MAX_BYTES;

	return (bool) apply_filters( 'kotlinskidev_should_inline_svg', $should_inline, $svg );
}

function kotlinskidev_load_svg_content( int $attachment_id ): string {
	$cache_key = kotlinskidev_svg_cache_key( $attachment_id );
	$svg       = get_transient( $cache_key );

	if ( false !== $svg ) {
		return $svg;
	}

	delete_transient( kotlinskidev_legacy_svg_cache_key( $attachment_id ) );

	$svg_path = kotlinskidev_existing_attachment_file( $attachment_id );
	if ( '' === $svg_path ) {
		return '';
	}

	$raw = kotlinskidev_read_svg_file( $svg_path );
	if ( ! $raw ) {
		return '';
	}

	$svg = kotlinskidev_sanitize_svg( $raw );

	set_transient( $cache_key, $svg, WEEK_IN_SECONDS );

	return $svg;
}

function kotlinskidev_parse_svg_document( string $raw ): ?DOMDocument {
	$previous_error_setting = libxml_use_internal_errors( true );

	$dom    = new DOMDocument();
	$loaded = $dom->loadXML( $raw, LIBXML_NONET );

	libxml_clear_errors();
	libxml_use_internal_errors( $previous_error_setting );

	if ( ! $loaded || ! $dom->documentElement || 'svg' !== strtolower( $dom->documentElement->localName ) ) {
		return null;
	}

	return $dom;
}

function kotlinskidev_remove_disallowed_svg_elements( DOMXPath $xpath ): void {
	foreach ( KOTLINSKIDEV_SVG_DISALLOWED_TAGS as $tag ) {
		$nodes = $xpath->query( "//*[translate(local-name(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='{$tag}']" );
		foreach ( $nodes as $node ) {
			$node->parentNode->removeChild( $node );
		}
	}
}

function kotlinskidev_is_unsafe_svg_url( string $attr_value ): bool {
	$normalized   = strtolower( preg_replace( '/\s+/', '', $attr_value ) );
	$is_fragment  = 0 === strpos( $attr_value, '#' );
	$is_safe_data = 0 === strpos( $normalized, 'data:image/' );

	return ! $is_fragment && ! $is_safe_data;
}

function kotlinskidev_is_unsafe_svg_attribute( DOMAttr $attribute ): bool {
	$attr_name  = strtolower( $attribute->nodeName );
	$attr_value = trim( $attribute->nodeValue );

	if ( 0 === strpos( $attr_name, 'on' ) ) {
		return true;
	}

	return in_array( $attr_name, KOTLINSKIDEV_SVG_URL_ATTRIBUTES, true ) && kotlinskidev_is_unsafe_svg_url( $attr_value );
}

function kotlinskidev_remove_unsafe_svg_attributes( DOMXPath $xpath ): void {
	foreach ( $xpath->query( '//*' ) as $element ) {
		if ( ! $element->hasAttributes() ) {
			continue;
		}

		$attributes_to_remove = array();

		foreach ( $element->attributes as $attribute ) {
			if ( kotlinskidev_is_unsafe_svg_attribute( $attribute ) ) {
				$attributes_to_remove[] = $attribute->nodeName;
			}
		}

		foreach ( $attributes_to_remove as $attr_name ) {
			$element->removeAttribute( $attr_name );
		}
	}
}

function kotlinskidev_sanitize_svg( string $raw ): string {
	if ( '' === trim( $raw ) ) {
		return '';
	}

	$dom = kotlinskidev_parse_svg_document( $raw );
	if ( null === $dom ) {
		return '';
	}

	$xpath = new DOMXPath( $dom );

	kotlinskidev_remove_disallowed_svg_elements( $xpath );
	kotlinskidev_remove_unsafe_svg_attributes( $xpath );

	return trim( $dom->saveXML( $dom->documentElement ) );
}

function kotlinskidev_img_tag_attribute( string $img_html, string $attribute_name ): string {
	if ( preg_match( '/\b' . $attribute_name . '=["\']([^"\']*)["\']/', $img_html, $matches ) ) {
		return $matches[1];
	}

	return '';
}

function kotlinskidev_fit_style_to_aspect_ratio( string $style ): string {
	$style = (string) preg_replace( '/(?:aspect-ratio|width|height)\s*:\s*[^;]+;?/i', '', $style );
	$style = rtrim( $style, ';' ) . ';width:100%;height:100%';

	if ( false === stripos( $style, 'display' ) ) {
		$style = rtrim( $style, ';' ) . ';display:block';
	}

	return $style;
}

function kotlinskidev_strip_svg_root_dimensions( string $svg ): string {
	return (string) preg_replace_callback(
		'/^(<svg\b[^>]*?)>/i',
		static function ( array $matches ): string {
			return preg_replace( '/\s(?:width|height)=["\'][^"\']*["\']/i', '', $matches[1] ) . '>';
		},
		$svg,
		1
	);
}

function kotlinskidev_svg_extra_attributes( string $class, string $style, string $width, string $height ): string {
	$extra_attrs = 'aria-hidden="true" focusable="false"';
	if ( $class ) {
		$extra_attrs .= sprintf( ' class="%s"', esc_attr( $class ) );
	}
	if ( $style ) {
		$extra_attrs .= sprintf( ' style="%s"', esc_attr( $style ) );
	}
	if ( $width ) {
		$extra_attrs .= sprintf( ' width="%s"', esc_attr( $width ) );
	}
	if ( $height ) {
		$extra_attrs .= sprintf( ' height="%s"', esc_attr( $height ) );
	}

	return $extra_attrs;
}

function kotlinskidev_build_inline_svg( string $svg, string $img_html, int $attachment_id = 0 ): string {
	$class = kotlinskidev_img_tag_attribute( $img_html, 'class' );
	$style = kotlinskidev_img_tag_attribute( $img_html, 'style' );
	$width  = '';
	$height = '';

	$has_aspect_ratio_style = false !== stripos( $style, 'aspect-ratio' );

	if ( $has_aspect_ratio_style ) {
		$style = kotlinskidev_fit_style_to_aspect_ratio( $style );
		$svg   = kotlinskidev_strip_svg_root_dimensions( $svg );
	} else {
		$width  = kotlinskidev_img_tag_attribute( $img_html, 'width' );
		$height = kotlinskidev_img_tag_attribute( $img_html, 'height' );
	}

	$extra_attrs = kotlinskidev_svg_extra_attributes( $class, $style, $width, $height );
	$inline      = preg_replace( '/<svg\b/', '<svg ' . $extra_attrs, $svg, 1 );

	if ( $attachment_id > 0 && function_exists( 'kotlinskidev_svg_sprite_reference' ) ) {
		$reference = kotlinskidev_svg_sprite_reference( $attachment_id, $inline );
		if ( null !== $reference ) {
			return $reference;
		}
	}

	return $inline;
}

function kotlinskidev_inlinable_svg_content( int $attachment_id ): string {
	$svg = kotlinskidev_load_svg_content( $attachment_id );
	if ( ! $svg ) {
		return '';
	}

	if ( kotlinskidev_is_front_end_render() && ! kotlinskidev_should_inline_svg( $svg ) ) {
		return '';
	}

	return $svg;
}

function kotlinskidev_inline_svg_image( string $html, int $attachment_id ): string {
	if ( 'image/svg+xml' !== get_post_mime_type( $attachment_id ) ) {
		return $html;
	}

	$svg = kotlinskidev_inlinable_svg_content( $attachment_id );
	if ( '' === $svg ) {
		return $html;
	}

	return kotlinskidev_build_inline_svg( $svg, $html, $attachment_id );
}

function kotlinskidev_wrap_figure_with_aspect_ratio( string $html, string $img_html ): string {
	if ( preg_match( '/\bstyle=["\']([^"\']*aspect-ratio\s*:\s*[^;"\']+)[^"\']*["\']/i', $img_html, $ratio_match )
		&& preg_match( '/aspect-ratio\s*:\s*([^;]+)/i', $ratio_match[1], $ratio_value )
		&& preg_match( '/<figure\b[^>]*>.*?<\/figure>/is', $html, $figure_match )
		&& preg_match( '/^<figure\b[^>]*>/i', $figure_match[0], $figure_open_match ) ) {
		$ratio       = trim( $ratio_value[1] );
		$figure_full = $figure_match[0];
		$figure_open = $figure_open_match[0];

		if ( preg_match( '/\sstyle=["\']([^"\']*)["\']/', $figure_open, $style_match ) ) {
			$existing_style      = rtrim( $style_match[1], ';' );
			$new_style           = $existing_style . ";aspect-ratio:{$ratio};overflow:hidden";
			$figure_open_patched = str_replace( $style_match[0], sprintf( ' style="%s"', esc_attr( $new_style ) ), $figure_open );
		} else {
			$figure_open_patched = substr_replace( $figure_open, sprintf( ' style="aspect-ratio:%s;overflow:hidden"', esc_attr( $ratio ) ), strpos( $figure_open, '>' ), 0 );
		}

		$patched_figure = substr_replace( $figure_full, $figure_open_patched, 0, strlen( $figure_open ) );

		$html = str_replace( $figure_full, '<div style="width:100%">' . $patched_figure . '</div>', $html );
	}

	return $html;
}

function kotlinskidev_inline_svg_image_block( string $html, array $block ): string {
	$attachment_id = absint( $block['attrs']['id'] ?? 0 );
	if ( ! $attachment_id || 'image/svg+xml' !== get_post_mime_type( $attachment_id ) ) {
		return $html;
	}

	$svg = kotlinskidev_inlinable_svg_content( $attachment_id );
	if ( '' === $svg ) {
		return $html;
	}

	$img_html = '';
	if ( preg_match( '/<img\b[^>]*>/i', $html, $matches ) ) {
		$img_html = $matches[0];
	}

	$inlined = kotlinskidev_build_inline_svg( $svg, $img_html, $attachment_id );

	$html = preg_replace( '/<img\b[^>]*>/i', $inlined, $html, 1 );

	return kotlinskidev_wrap_figure_with_aspect_ratio( $html, $img_html );
}

function kotlinskidev_clear_svg_cache( int $attachment_id ): void {
	if ( 'image/svg+xml' === get_post_mime_type( $attachment_id ) ) {
		delete_transient( kotlinskidev_svg_cache_key( $attachment_id ) );
		delete_transient( kotlinskidev_legacy_svg_cache_key( $attachment_id ) );
	}
}
