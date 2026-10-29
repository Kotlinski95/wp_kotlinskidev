<?php
function kotlinskidev_add_icon_library_media_filter( array $post_mime_types ): array {
	$post_mime_types['image/svg+xml'] = [
		__( 'Icons (SVG)', 'kotlinskidev' ),
		__( 'Manage Icons (SVG)', 'kotlinskidev' ),
		_n_noop(
			'Icon (SVG) <span class="count">(%s)</span>',
			'Icons (SVG) <span class="count">(%s)</span>',
			'kotlinskidev'
		),
	];

	return $post_mime_types;
}
add_filter( 'post_mime_types', 'kotlinskidev_add_icon_library_media_filter' );
