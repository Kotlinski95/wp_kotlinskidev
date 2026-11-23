<?php
function kotlinskidev_nav_bar_sections( WP_Post $nav_post ): array {
	$bar_items  = [];
	$bar_extras = [];

	foreach ( parse_blocks( $nav_post->post_content ) as $bar_block ) {
		if ( empty( $bar_block['blockName'] ) ) {
			continue;
		}
		if ( $bar_block['blockName'] !== 'core/navigation-link' ) {
			$bar_extras[] = render_block( $bar_block );
			continue;
		}
		$bar_label = $bar_block['attrs']['label'] ?? '';
		if ( $bar_label === '' ) {
			continue;
		}
		$bar_items[] = [
			'label'      => $bar_label,
			'url'        => $bar_block['attrs']['url'] ?? '#',
			'icon_id'    => (int) ( $bar_block['attrs']['navIconId'] ?? 0 ),
			'class_name' => $bar_block['attrs']['className'] ?? '',
		];
	}

	return [ 'items' => $bar_items, 'extras' => $bar_extras ];
}

function kotlinskidev_nav_bar_item_classes( string $class_name ): array {
	$bar_classes = array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $class_name, -1, PREG_SPLIT_NO_EMPTY ) ) );
	array_unshift( $bar_classes, 'menu-item' );
	return $bar_classes;
}

function kotlinskidev_render_nav_bar_item( array $bar_item ): string {
	$bar_icon          = kotlinskidev_inline_nav_icon( $bar_item['icon_id'] );
	$bar_classes       = kotlinskidev_nav_bar_item_classes( $bar_item['class_name'] );
	$bar_current_attrs = function_exists( 'kotlinskidev_is_current_request_link' ) && kotlinskidev_is_current_request_link( $bar_item['url'] )
		? ' class="kt-link-current" aria-current="page"'
		: '';

	$markup = '<li class="' . esc_attr( implode( ' ', $bar_classes ) ) . '"><a href="' . esc_url( $bar_item['url'] ) . '"' . $bar_current_attrs . '>';
	if ( $bar_icon !== '' ) {
		$markup .= '<span class="mobile-menu-icon">' . $bar_icon . '</span>';
	}
	$markup .= '<span class="mobile-menu-text">' . esc_html( $bar_item['label'] ) . '</span>';
	return $markup . '</a></li>';
}

function kotlinskidev_nav_bar_style_attribute( array $attributes ): string {
	$bar_solid_background = function_exists( 'kotlinskidev_mobile_nav_solid_background_value' )
		? kotlinskidev_mobile_nav_solid_background_value( (string) ( $attributes['barSolidBackground'] ?? '' ) )
		: '';
	return $bar_solid_background !== '' ? ' style="--kt-mobile-nav-solid-bg:' . esc_attr( $bar_solid_background ) . '"' : '';
}

function kotlinskidev_nav_bar_markup( array $attributes, array $sections ): string {
	$markup  = '<nav id="mobile-footer-menu" class="mobile-footer-nav"' . kotlinskidev_nav_bar_style_attribute( $attributes ) . ' aria-label="' . esc_attr__( 'Mobile navigation', 'kotlinskidev' ) . '">';
	$markup .= '<div class="mobile-fixed-nav"><ul class="mobile-footer-menu-items">';
	foreach ( $sections['items'] as $bar_item ) {
		$markup .= kotlinskidev_render_nav_bar_item( $bar_item );
	}
	foreach ( $sections['extras'] as $bar_extra ) {
		$markup .= '<li class="menu-item menu-item--extra">' . $bar_extra . '</li>';
	}
	return $markup . '</ul></div></nav>';
}

function kotlinskidev_render_navigation_bar( array $attributes, WP_Post $nav_post ): string {
	$sections = kotlinskidev_nav_bar_sections( $nav_post );

	if ( empty( $sections['items'] ) && empty( $sections['extras'] ) ) {
		return '';
	}

	$defer_bar  = function_exists( 'kotlinskidev_app_shell_can_defer_nav' ) && kotlinskidev_app_shell_can_defer_nav();
	$bar_markup = kotlinskidev_nav_bar_markup( $attributes, $sections );
	if ( $defer_bar ) {
		kotlinskidev_app_shell_defer_nav( $bar_markup );
		return '';
	}
	return $bar_markup;
}
