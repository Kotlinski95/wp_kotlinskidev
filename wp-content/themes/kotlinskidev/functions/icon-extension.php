<?php
function kotlinskidev_apply_icon_extension( string $block_content, array $block ): string {
	if ( ! in_array( $block['blockName'] ?? '', [ 'kotlinskidev/button', 'kotlinskidev/nav-link', 'core/button', 'core/navigation-link', 'core/navigation-submenu' ], true ) ) {
		return $block_content;
	}

	$icon_id = absint( $block['attrs']['iconId'] ?? 0 );
	if ( ! $icon_id ) {
		return $block_content;
	}

	$svg = kotlinskidev_inline_nav_icon( $icon_id );
	if ( '' === $svg ) {
		return $block_content;
	}

	$icon_html = '<span class="kt-icon kt-icon--inline">' . $svg . '</span>';

	return preg_replace_callback(
		'/<(?:a|button)\b[^>]*>/i',
		function ( array $matches ) use ( $icon_html ) {
			return $matches[0] . $icon_html;
		},
		$block_content,
		1
	);
}
add_filter( 'render_block', 'kotlinskidev_apply_icon_extension', 10, 2 );
