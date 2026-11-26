<?php
function add_poster_image_to_cover_video( $output, $block ) {
	$is_cover_video = 'core/cover' === $block['blockName']
		&& isset( $block['attrs']['backgroundType'] )
		&& 'video' === $block['attrs']['backgroundType'];

	if ( ! $is_cover_video || false !== strpos( $output, 'poster=' ) ) {
		return $output;
	}

	$poster_image = get_the_post_thumbnail_url( $block['attrs']['id'] );

	if ( ! $poster_image ) {
		return $output;
	}

	return preg_replace( '/(<video\b[^><]*)>/i', '$1 poster="' . $poster_image . '">', $output );
}
add_filter( 'render_block', 'add_poster_image_to_cover_video', 10, 2 );
