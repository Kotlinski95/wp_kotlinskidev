<?php
function kotlinskidev_nav_mega_nav_classes( array $attributes, array $nav_classes ): array {
	if ( ! empty( $attributes['blurInactiveLinks'] ) ) {
		$nav_classes[] = 'kt-mega-nav--blur-siblings';
		if ( ! empty( $attributes['blurIncludeUtility'] ) ) {
			$nav_classes[] = 'kt-mega-nav--blur-include-utility';
		}
	}
	return $nav_classes;
}

function kotlinskidev_nav_mega_wrapper_attributes( array $attributes, array $nav_classes ): string {
	$extra_attrs = [ 'class' => trim( 'kt-mega-nav ' . implode( ' ', $nav_classes ) ) ];
	if ( ! empty( $attributes['blurInactiveLinks'] ) && ! empty( $attributes['blurAmount'] ) ) {
		$extra_attrs['style'] = '--kt-blur-amount:' . $attributes['blurAmount'] . ';';
	}
	if ( ! empty( $attributes['linkNavigatesOnClick'] ) ) {
		$extra_attrs['data-link-navigates'] = 'true';
	}
	return get_block_wrapper_attributes( $extra_attrs );
}

function kotlinskidev_nav_mega_attach_panels( array $items ): array {
	foreach ( $items as $idx => $item ) {
		$item['panel_slug'] = sanitize_title( $item['label'] ) ?: 'panel-' . $idx;
		if ( isset( $item['panel_content'] ) ) {
			$item['panel_hero'] = '';
			$item['has_panel']  = true;
		} else {
			$item['panel_hero'] = kotlinskidev_mega_panel_template_part( $item['panel_slug'] );
			$item['has_panel']  = ! empty( $item['children'] ) || ! empty( $item['panel_hero'] );
		}
		$items[ $idx ] = $item;
	}
	return $items;
}

function kotlinskidev_render_nav_icon_gradient_defs(): string {
	$dark_stops  = kotlinskidev_parse_gradient_stops( kotlinskidev_get_theme_gradient( 'fancy-text-dark' ) );
	$light_stops = kotlinskidev_parse_gradient_stops( kotlinskidev_get_theme_gradient( 'fancy-text-light' ) );

	ob_start();
	kotlinskidev_render_gradient_stops( $dark_stops );
	$dark_markup = ob_get_clean();

	ob_start();
	kotlinskidev_render_gradient_stops( $light_stops );
	$light_markup = ob_get_clean();

	return '<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden" xmlns="http://www.w3.org/2000/svg"><defs>'
		. '<linearGradient id="kt-icon-grad-dark" x1="1" y1="0" x2="0" y2="0" gradientUnits="objectBoundingBox">'
		. $dark_markup
		. '</linearGradient>'
		. '<linearGradient id="kt-icon-grad-light" x1="1" y1="0" x2="0" y2="0" gradientUnits="objectBoundingBox">'
		. $light_markup
		. '</linearGradient>'
		. '</defs></svg>';
}

function kotlinskidev_render_navigation_mega( array $attributes, WP_Post $nav_post, array $nav_classes ): string {
	$post = get_post( $nav_post->ID );
	if ( ! $post instanceof WP_Post ) {
		return '';
	}

	$raw_blocks = parse_blocks( $post->post_content );
	$items      = kotlinskidev_parse_nav_blocks( $raw_blocks );
	$extras     = kotlinskidev_render_nav_extras( $raw_blocks );

	$nav_classes   = kotlinskidev_nav_mega_nav_classes( $attributes, $nav_classes );
	$wrapper_attrs = kotlinskidev_nav_mega_wrapper_attributes( $attributes, $nav_classes );
	$items         = kotlinskidev_nav_mega_attach_panels( $items );
	$gradient_defs = kotlinskidev_render_nav_icon_gradient_defs();

	ob_start();
	include __DIR__ . '/templates/mega-nav.php';
	return $gradient_defs . ob_get_clean();
}
