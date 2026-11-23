<?php
function kotlinskidev_navigation_overlay_classes( array $attributes, array $nav_classes ): array {
	if ( ( $attributes['visibility'] ?? 'all' ) !== 'mobile' ) {
		$nav_classes[] = 'kt-hamburger-desktop';
	}
	if ( ( $attributes['overlaySlide'] ?? 'right' ) === 'left' ) {
		$nav_classes[] = 'kt-nav-slide-left';
	}
	if ( ( $attributes['hamburgerLineAlign'] ?? 'right' ) === 'left' ) {
		$nav_classes[] = 'kt-hamburger-line-left';
	}
	if ( ! empty( $attributes['showHamburgerBorder'] ) ) {
		$nav_classes[] = 'kt-hamburger-border';
	}
	if ( ! empty( $attributes['hideAccordionDividers'] ) ) {
		$nav_classes[] = 'kt-hamburger-no-dividers';
	}
	return $nav_classes;
}

function kotlinskidev_render_navigation_overlay( array $attributes, int $nav_id, array $nav_classes ): string {
	$wrapper_attributes = get_block_wrapper_attributes( [ 'class' => implode( ' ', kotlinskidev_navigation_overlay_classes( $attributes, $nav_classes ) ) ] );

	return '<div ' . $wrapper_attributes . '>' . render_block( [
		'blockName'    => 'core/navigation',
		'attrs'        => [
			'ref'         => $nav_id,
			'overlayMenu' => $attributes['overlayMenu'] ?? 'never',
		],
		'innerBlocks'  => [],
		'innerHTML'    => '',
		'innerContent' => [],
	] ) . '</div>';
}
