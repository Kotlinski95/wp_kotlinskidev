<?php
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

function kotlinskidev_ensure_svg_xmlns( int $attachment_id ): void {
	if ( 'image/svg+xml' !== get_post_mime_type( $attachment_id ) ) {
		return;
	}

	$svg_path = get_attached_file( $attachment_id );
	if ( ! $svg_path || ! file_exists( $svg_path ) ) {
		return;
	}

	$raw = file_get_contents( $svg_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	if ( ! $raw ) {
		return;
	}

	$patched = kotlinskidev_add_svg_xmlns( $raw );
	if ( $patched !== $raw ) {
		file_put_contents( $svg_path, $patched ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
	}
}

function kotlinskidev_get_svg_dimensions( string $svg_path ): ?array {
	$raw = file_get_contents( $svg_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

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

	$svg_path = get_attached_file( $attachment_id );
	if ( ! $svg_path || ! file_exists( $svg_path ) ) {
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

	$has_aspect_ratio_style = false !== stripos( $style, 'aspect-ratio' );

	if ( $has_aspect_ratio_style ) {
		$style = (string) preg_replace( '/(?:aspect-ratio|width|height)\s*:\s*[^;]+;?/i', '', $style );
		$style = rtrim( $style, ';' ) . ';width:100%;height:100%';
	}

	if ( $has_aspect_ratio_style && false === stripos( $style, 'display' ) ) {
		$style = rtrim( $style, ';' ) . ';display:block';
	}

	$width = '';
	if ( ! $has_aspect_ratio_style && preg_match( '/\bwidth=["\']([^"\']*)["\']/', $img_html, $matches ) ) {
		$width = $matches[1];
	}

	$height = '';
	if ( ! $has_aspect_ratio_style && preg_match( '/\bheight=["\']([^"\']*)["\']/', $img_html, $matches ) ) {
		$height = $matches[1];
	}

	if ( $has_aspect_ratio_style ) {
		$svg = (string) preg_replace_callback(
			'/^(<svg\b[^>]*?)>/i',
			static function ( array $matches ): string {
				return preg_replace( '/\s(?:width|height)=["\'][^"\']*["\']/i', '', $matches[1] ) . '>';
			},
			$svg,
			1
		);
	}

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

	$html = preg_replace( '/<img\b[^>]*>/i', $inlined, $html, 1 );

	if ( preg_match( '/\bstyle=["\']([^"\']*aspect-ratio\s*:\s*[^;"\']+)[^"\']*["\']/i', $img_html, $ratio_match )
		&& preg_match( '/aspect-ratio\s*:\s*([^;]+)/i', $ratio_match[1], $ratio_value )
		&& preg_match( '/<figure\b[^>]*>.*?<\/figure>/is', $html, $figure_match )
		&& preg_match( '/^<figure\b[^>]*>/i', $figure_match[0], $figure_open_match ) ) {
		$ratio        = trim( $ratio_value[1] );
		$figure_full  = $figure_match[0];
		$figure_open  = $figure_open_match[0];

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

function kotlinskidev_clear_svg_cache( int $attachment_id ): void {
	if ( 'image/svg+xml' === get_post_mime_type( $attachment_id ) ) {
		delete_transient( 'kotlinskidev_svg_' . $attachment_id );
	}
}
