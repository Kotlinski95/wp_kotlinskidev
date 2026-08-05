<?php
add_filter( 'upload_mimes', 'kotlinskidev_allow_svg_uploads' );
add_filter( 'wp_get_attachment_image', 'kotlinskidev_inline_svg_image', 10, 2 );
add_filter( 'render_block_core/image', 'kotlinskidev_inline_svg_image_block', 10, 2 );
add_action( 'edit_attachment', 'kotlinskidev_clear_svg_cache' );
add_action( 'delete_attachment', 'kotlinskidev_clear_svg_cache' );

function kotlinskidev_allow_svg_uploads( array $mimes ): array {
	$mimes['svg']  = 'image/svg+xml';
	$mimes['svgz'] = 'image/svg+xml';
	return $mimes;
}

function kotlinskidev_load_svg_content( int $attachment_id ): string {
	$cache_key = 'kotlinskidev_svg_' . $attachment_id;
	$svg       = get_transient( $cache_key );

	if ( false !== $svg ) {
		return $svg;
	}

	$svg_path = get_attached_file( $attachment_id );
	if ( ! $svg_path || ! file_exists( $svg_path ) ) {
		return '';
	}

	$raw = file_get_contents( $svg_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	if ( ! $raw ) {
		return '';
	}

	$svg = kotlinskidev_sanitize_svg( $raw );

	set_transient( $cache_key, $svg, WEEK_IN_SECONDS );

	return $svg;
}

function kotlinskidev_sanitize_svg( string $raw ): string {
	if ( '' === trim( $raw ) ) {
		return '';
	}

	$previous_error_setting = libxml_use_internal_errors( true );

	$dom    = new DOMDocument();
	$loaded = $dom->loadXML( $raw, LIBXML_NONET );

	libxml_clear_errors();
	libxml_use_internal_errors( $previous_error_setting );

	if ( ! $loaded || ! $dom->documentElement || 'svg' !== strtolower( $dom->documentElement->localName ) ) {
		return '';
	}

	$disallowed_tags = array( 'script', 'foreignobject', 'iframe', 'embed', 'object', 'link', 'meta', 'base', 'style' );
	$xpath           = new DOMXPath( $dom );

	foreach ( $disallowed_tags as $tag ) {
		$nodes = $xpath->query( "//*[translate(local-name(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='{$tag}']" );
		foreach ( $nodes as $node ) {
			$node->parentNode->removeChild( $node );
		}
	}

	$safe_url_attrs = array( 'href', 'xlink:href', 'src' );

	foreach ( $xpath->query( '//*' ) as $element ) {
		if ( ! $element->hasAttributes() ) {
			continue;
		}

		$attributes_to_remove = array();

		foreach ( $element->attributes as $attribute ) {
			$attr_name  = strtolower( $attribute->nodeName );
			$attr_value = trim( $attribute->nodeValue );

			if ( 0 === strpos( $attr_name, 'on' ) ) {
				$attributes_to_remove[] = $attribute->nodeName;
				continue;
			}

			if ( in_array( $attr_name, $safe_url_attrs, true ) ) {
				$normalized   = strtolower( preg_replace( '/\s+/', '', $attr_value ) );
				$is_fragment  = 0 === strpos( $attr_value, '#' );
				$is_safe_data = 0 === strpos( $normalized, 'data:image/' );

				if ( ! $is_fragment && ! $is_safe_data ) {
					$attributes_to_remove[] = $attribute->nodeName;
				}
			}
		}

		foreach ( $attributes_to_remove as $attr_name ) {
			$element->removeAttribute( $attr_name );
		}
	}

	return trim( $dom->saveXML( $dom->documentElement ) );
}

function kotlinskidev_build_inline_svg( string $svg, string $img_html ): string {
	$class = '';
	if ( preg_match( '/\bclass=["\']([^"\']*)["\']/', $img_html, $matches ) ) {
		$class = $matches[1];
	}

	$style = '';
	if ( preg_match( '/\bstyle=["\']([^"\']*)["\']/', $img_html, $matches ) ) {
		$style = $matches[1];
	}

	$extra_attrs = 'aria-hidden="true" focusable="false"';
	if ( $class ) {
		$extra_attrs .= sprintf( ' class="%s"', esc_attr( $class ) );
	}
	if ( $style ) {
		$extra_attrs .= sprintf( ' style="%s"', esc_attr( $style ) );
	}

	return preg_replace( '/<svg\b/', '<svg ' . $extra_attrs, $svg, 1 );
}

function kotlinskidev_inline_svg_image( string $html, int $attachment_id ): string {
	if ( 'image/svg+xml' !== get_post_mime_type( $attachment_id ) ) {
		return $html;
	}

	$svg = kotlinskidev_load_svg_content( $attachment_id );
	if ( ! $svg ) {
		return $html;
	}

	return kotlinskidev_build_inline_svg( $svg, $html );
}

function kotlinskidev_inline_svg_image_block( string $html, array $block ): string {
	$attachment_id = absint( $block['attrs']['id'] ?? 0 );
	if ( ! $attachment_id || 'image/svg+xml' !== get_post_mime_type( $attachment_id ) ) {
		return $html;
	}

	$svg = kotlinskidev_load_svg_content( $attachment_id );
	if ( ! $svg ) {
		return $html;
	}

	$img_html = '';
	if ( preg_match( '/<img\b[^>]*>/i', $html, $matches ) ) {
		$img_html = $matches[0];
	}

	$inlined = kotlinskidev_build_inline_svg( $svg, $img_html );

	return preg_replace( '/<img\b[^>]*>/i', $inlined, $html, 1 );
}

function kotlinskidev_clear_svg_cache( int $attachment_id ): void {
	if ( 'image/svg+xml' === get_post_mime_type( $attachment_id ) ) {
		delete_transient( 'kotlinskidev_svg_' . $attachment_id );
	}
}
