<?php
const KOTLINSKIDEV_ANIMATED_WEBP_META_KEY   = '_kotlinskidev_animated_webp';
const KOTLINSKIDEV_ANIMATED_WEBP_HEAD_BYTES = 512;

function kotlinskidev_webp_head_is_animated( string $head ): bool {
	if ( strlen( $head ) < 12 || 'RIFF' !== substr( $head, 0, 4 ) || 'WEBP' !== substr( $head, 8, 4 ) ) {
		return false;
	}
	if ( 'VP8X' === substr( $head, 12, 4 ) && strlen( $head ) > 20 && ( ord( $head[20] ) & 0x02 ) === 0x02 ) {
		return true;
	}
	return false !== strpos( $head, 'ANIM' );
}

function kotlinskidev_webp_file_is_animated( string $path ): bool {
	if ( '' === $path || ! is_readable( $path ) ) {
		return false;
	}
	$head = file_get_contents( $path, false, null, 0, KOTLINSKIDEV_ANIMATED_WEBP_HEAD_BYTES );
	return false !== $head && kotlinskidev_webp_head_is_animated( $head );
}

function kotlinskidev_attachment_is_animated_webp( int $attachment_id, string $path = '' ): bool {
	if ( $attachment_id > 0 ) {
		$cached = get_post_meta( $attachment_id, KOTLINSKIDEV_ANIMATED_WEBP_META_KEY, true );
		if ( '1' === $cached || '0' === $cached ) {
			return '1' === $cached;
		}
	}
	if ( '' === $path && $attachment_id > 0 ) {
		$file = get_attached_file( $attachment_id );
		$path = is_string( $file ) ? $file : '';
	}
	if ( '' === $path || 'webp' !== strtolower( pathinfo( $path, PATHINFO_EXTENSION ) ) ) {
		return false;
	}
	$animated = kotlinskidev_webp_file_is_animated( $path );
	if ( $attachment_id > 0 && is_readable( $path ) ) {
		update_post_meta( $attachment_id, KOTLINSKIDEV_ANIMATED_WEBP_META_KEY, $animated ? '1' : '0' );
	}
	return $animated;
}

function kotlinskidev_animated_webp_skip_sizes( $sizes, $image_meta = array(), $attachment_id = 0 ) {
	$relative = is_array( $image_meta ) ? (string) ( $image_meta['file'] ?? '' ) : '';
	if ( '' === $relative ) {
		return $sizes;
	}
	$uploads = wp_get_upload_dir();
	$path    = trailingslashit( (string) ( $uploads['basedir'] ?? '' ) ) . $relative;
	return kotlinskidev_attachment_is_animated_webp( (int) $attachment_id, $path ) ? array() : $sizes;
}
add_filter( 'intermediate_image_sizes_advanced', 'kotlinskidev_animated_webp_skip_sizes', 10, 3 );

function kotlinskidev_animated_webp_skip_scaling( $threshold, $imagesize = array(), $file = '', $attachment_id = 0 ) {
	return kotlinskidev_attachment_is_animated_webp( (int) $attachment_id, (string) $file ) ? false : $threshold;
}
add_filter( 'big_image_size_threshold', 'kotlinskidev_animated_webp_skip_scaling', 10, 4 );

function kotlinskidev_animated_webp_drop_srcset( $sources, $size_array = array(), $image_src = '', $image_meta = array(), $attachment_id = 0 ) {
	return kotlinskidev_attachment_is_animated_webp( (int) $attachment_id ) ? false : $sources;
}
add_filter( 'wp_calculate_image_srcset', 'kotlinskidev_animated_webp_drop_srcset', 10, 5 );
