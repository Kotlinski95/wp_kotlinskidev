<?php
function kotlinskidev_nav_reveal_blocks(): array {
	return [
		'core/navigation-link',
		'core/navigation-submenu',
		'kotlinskidev/nav-link',
		'kotlinskidev/nav-banner',
		'kotlinskidev/nav-image',
		'kotlinskidev/nav-paragraph',
		'kotlinskidev/nav-search-panel',
		'kotlinskidev/nav-language-panel',
		'kotlinskidev/nav-popular-pages',
		'kotlinskidev/button',
		'kotlinskidev/social-section',
	];
}

function kotlinskidev_nav_reveal_class_and_style( array $attrs ): array {
	$animation = $attrs['navRevealAnimation'] ?? '';
	if ( '' === $animation ) {
		return [ 'class' => '', 'style' => '' ];
	}

	$classes = [ sanitize_html_class( $animation ) ];
	$translate = $attrs['navRevealTranslate'] ?? '';
	if ( '' !== $translate ) {
		$classes[] = sanitize_html_class( $translate );
	}

	$delay = (int) ( $attrs['navRevealDelay'] ?? 0 );
	$style = $delay > 0 ? '--reveal-delay:' . $delay . 'ms;' : '';

	return [ 'class' => implode( ' ', $classes ), 'style' => $style ];
}

function kotlinskidev_stagger_reveal_items( string $html, string $animation, array $class_markers, int $step = 60 ): string {
	if ( '' === $animation || '' === $html || empty( $class_markers ) ) {
		return $html;
	}

	$animation_class = sanitize_html_class( $animation );
	$processor = new WP_HTML_Tag_Processor( $html );
	$index = 0;

	while ( $processor->next_tag() ) {
		$existing_class = (string) ( $processor->get_attribute( 'class' ) ?? '' );
		if ( '' === $existing_class ) {
			continue;
		}

		$tokens = preg_split( '/\s+/', $existing_class );
		if ( empty( array_intersect( $class_markers, $tokens ) ) ) {
			continue;
		}

		$processor->set_attribute( 'class', trim( $existing_class . ' ' . $animation_class ) );

		$delay = $index * $step;
		if ( $delay > 0 ) {
			$existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
			$existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
			$processor->set_attribute( 'style', $existing_style . '--reveal-delay:' . $delay . 'ms;' );
		}

		$index++;
	}

	return $processor->get_updated_html();
}

function kotlinskidev_apply_nav_reveal_attrs( string $block_content, array $block ): string {
	if ( ! in_array( $block['blockName'] ?? '', kotlinskidev_nav_reveal_blocks(), true ) ) {
		return $block_content;
	}

	$reveal = kotlinskidev_nav_reveal_class_and_style( $block['attrs'] ?? [] );
	if ( '' === $reveal['class'] || '' === $block_content ) {
		return $block_content;
	}

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( ! $processor->next_tag() ) {
		return $block_content;
	}

	$existing_class = (string) ( $processor->get_attribute( 'class' ) ?? '' );
	$processor->set_attribute( 'class', trim( $existing_class . ' ' . $reveal['class'] ) );

	if ( '' !== $reveal['style'] ) {
		$existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
		$existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . ';' : '';
		$processor->set_attribute( 'style', $existing_style . $reveal['style'] );
	}

	return $processor->get_updated_html();
}
add_filter( 'render_block', 'kotlinskidev_apply_nav_reveal_attrs', 10, 2 );
