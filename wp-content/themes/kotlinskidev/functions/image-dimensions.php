<?php
const KOTLINSKIDEV_SVG_MAX_BYTES = 262144;

function kotlinskidev_image_dimensions_skip_context(): bool {
	if ( is_admin() || is_feed() ) {
		return true;
	}
	return defined( 'REST_REQUEST' ) && REST_REQUEST;
}

function kotlinskidev_svg_dimensions( string $path ): ?array {
	if ( '' === $path || ! is_readable( $path ) ) {
		return null;
	}
	$head = file_get_contents( $path, false, null, 0, KOTLINSKIDEV_SVG_MAX_BYTES );
	if ( false === $head || 1 !== preg_match( '/<svg\b[^>]*>/i', $head, $tag ) ) {
		return null;
	}
	$read_length = static function ( string $name ) use ( $tag ): float {
		if ( 1 === preg_match( '/\s' . $name . '\s*=\s*["\']\s*([0-9]*\.?[0-9]+)\s*(?:px)?\s*["\']/i', $tag[0], $m ) ) {
			return (float) $m[1];
		}
		return 0.0;
	};
	$width  = $read_length( 'width' );
	$height = $read_length( 'height' );
	if ( $width <= 0 || $height <= 0 ) {
		if ( 1 !== preg_match( '/\sviewBox\s*=\s*["\']\s*[-0-9.]+[\s,]+[-0-9.]+[\s,]+([0-9]*\.?[0-9]+)[\s,]+([0-9]*\.?[0-9]+)\s*["\']/i', $tag[0], $m ) ) {
			return null;
		}
		$width  = (float) $m[1];
		$height = (float) $m[2];
	}
	if ( $width <= 0 || $height <= 0 ) {
		return null;
	}
	return [ (int) round( $width ), (int) round( $height ) ];
}

function kotlinskidev_attachment_dimensions( int $attachment_id, string $size = '' ): ?array {
	if ( $attachment_id <= 0 ) {
		return null;
	}
	if ( 'image/svg+xml' === get_post_mime_type( $attachment_id ) ) {
		$file = get_attached_file( $attachment_id );
		return kotlinskidev_svg_dimensions( is_string( $file ) ? $file : '' );
	}
	if ( '' !== $size ) {
		$src = wp_get_attachment_image_src( $attachment_id, $size );
		if ( is_array( $src ) && ! empty( $src[1] ) && ! empty( $src[2] ) ) {
			return [ (int) $src[1], (int) $src[2] ];
		}
	}
	$meta = wp_get_attachment_metadata( $attachment_id );
	if ( is_array( $meta ) && ! empty( $meta['width'] ) && ! empty( $meta['height'] ) ) {
		return [ (int) $meta['width'], (int) $meta['height'] ];
	}
	return null;
}

function kotlinskidev_uploads_file_dimensions( string $url ): ?array {
	$uploads = wp_get_upload_dir();
	$baseurl = (string) ( $uploads['baseurl'] ?? '' );
	$basedir = (string) ( $uploads['basedir'] ?? '' );
	if ( '' === $baseurl || '' === $basedir || 0 !== strpos( $url, $baseurl . '/' ) ) {
		return null;
	}
	$relative = (string) wp_parse_url( substr( $url, strlen( $baseurl ) + 1 ), PHP_URL_PATH );
	if ( '' === $relative || false !== strpos( $relative, '..' ) || 1 === preg_match( '/\.svg$/i', $relative ) ) {
		return null;
	}
	$size = @getimagesize( $basedir . '/' . $relative );
	if ( ! is_array( $size ) || empty( $size[0] ) || empty( $size[1] ) ) {
		return null;
	}
	return [ (int) $size[0], (int) $size[1] ];
}

function kotlinskidev_attachment_dimensions_for_url( string $url ): ?array {
	static $memo = [];
	if ( '' === $url ) {
		return null;
	}
	if ( array_key_exists( $url, $memo ) ) {
		return $memo[ $url ];
	}
	$memo[ $url ] = null;
	$id           = (int) attachment_url_to_postid( $url );
	if ( $id <= 0 ) {
		$memo[ $url ] = kotlinskidev_uploads_file_dimensions( $url );
		return $memo[ $url ];
	}
	$meta = wp_get_attachment_metadata( $id );
	$base = basename( (string) wp_parse_url( $url, PHP_URL_PATH ) );
	if ( is_array( $meta ) && ! empty( $meta['sizes'] ) && is_array( $meta['sizes'] ) ) {
		foreach ( $meta['sizes'] as $size_data ) {
			if ( ( $size_data['file'] ?? '' ) === $base && ! empty( $size_data['width'] ) && ! empty( $size_data['height'] ) ) {
				$memo[ $url ] = [ (int) $size_data['width'], (int) $size_data['height'] ];
				return $memo[ $url ];
			}
		}
	}
	$memo[ $url ] = kotlinskidev_attachment_dimensions( $id );
	return $memo[ $url ];
}

function kotlinskidev_fill_core_image_dimensions( string $block_content, array $block = [] ): string {
	if ( kotlinskidev_image_dimensions_skip_context() || false === strpos( $block_content, '<img' ) ) {
		return $block_content;
	}
	return (string) preg_replace_callback(
		'/<img\b[^>]*>/i',
		static function ( array $match ): string {
			$tag = $match[0];
			if ( 1 === preg_match( '/\swidth\s*=/i', $tag ) || 1 === preg_match( '/\sheight\s*=/i', $tag ) ) {
				return $tag;
			}
			if ( 1 !== preg_match( '/\bwp-image-(\d+)\b/', $tag, $id_match ) ) {
				return $tag;
			}
			$size = 1 === preg_match( '/\bsize-([a-z0-9_-]+)\b/i', $tag, $size_match ) ? $size_match[1] : '';
			$dims = kotlinskidev_attachment_dimensions( (int) $id_match[1], $size );
			if ( null === $dims ) {
				return $tag;
			}
			return (string) preg_replace( '/^<img\b/i', '<img width="' . (int) $dims[0] . '" height="' . (int) $dims[1] . '"', $tag, 1 );
		},
		$block_content
	);
}
add_filter( 'render_block_core/image', 'kotlinskidev_fill_core_image_dimensions', 20, 2 );

function kotlinskidev_language_flag_dimensions(): array {
	return [ 48, 30 ];
}

function kotlinskidev_fill_language_flag_dimensions( string $block_content, array $block = [] ): string {
	if ( kotlinskidev_image_dimensions_skip_context() || false === strpos( $block_content, '/polylang/' ) ) {
		return $block_content;
	}
	list( $width, $height ) = kotlinskidev_language_flag_dimensions();
	return (string) preg_replace_callback(
		'/<img\b[^>]*\ssrc="[^"]*\/polylang\/[a-z]{2,3}(?:_[A-Za-z]{2})?\.png"[^>]*>/i',
		static function ( array $match ) use ( $width, $height ): string {
			$tag = $match[0];
			if ( 1 === preg_match( '/\swidth\s*=/i', $tag ) || 1 === preg_match( '/\sheight\s*=/i', $tag ) ) {
				return $tag;
			}
			return (string) preg_replace( '/^<img\b/i', '<img width="' . $width . '" height="' . $height . '"', $tag, 1 );
		},
		$block_content
	);
}
add_filter( 'render_block_polylang/navigation-language-switcher', 'kotlinskidev_fill_language_flag_dimensions', 20, 2 );
add_filter( 'render_block_polylang/language-switcher', 'kotlinskidev_fill_language_flag_dimensions', 20, 2 );
