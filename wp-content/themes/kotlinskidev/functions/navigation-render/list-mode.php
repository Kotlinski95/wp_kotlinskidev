<?php
if ( ! function_exists( 'kotlinskidev_render_nav_list_group' ) ) {
	function kotlinskidev_render_nav_list_group( string $heading, array $items ): string {
		ob_start();
		echo '<div class="kt-nav-list__group">';
		if ( $heading !== '' ) {
			echo '<h3 class="kt-nav-list__title">' . esc_html( $heading ) . '</h3>';
		}
		echo '<ul class="kt-nav-list__items" role="list">';
		foreach ( $items as $item ) {
			echo '<li class="kt-nav-list__item"><a class="kt-nav-list__link" href="' . esc_url( $item['url'] ) . '">' . esc_html( $item['label'] ) . '</a></li>';
		}
		echo '</ul></div>';
		return ob_get_clean();
	}
}

function kotlinskidev_nav_list_submenu_items( array $submenu_block ): array {
	$group_items = [];
	foreach ( $submenu_block['innerBlocks'] ?? [] as $child_block ) {
		if ( $child_block['blockName'] !== 'core/navigation-link' ) {
			continue;
		}
		$child_label = $child_block['attrs']['label'] ?? '';
		if ( $child_label === '' ) {
			continue;
		}
		$group_items[] = [
			'label' => $child_label,
			'url'   => $child_block['attrs']['url'] ?? '#',
		];
	}
	return $group_items;
}

function kotlinskidev_nav_list_loose_item( array $link_block ): ?array {
	$loose_label = $link_block['attrs']['label'] ?? '';
	if ( $loose_label === '' ) {
		return null;
	}
	return [
		'label' => $loose_label,
		'url'   => $link_block['attrs']['url'] ?? '#',
	];
}

function kotlinskidev_render_nav_list_grid_group( array $grid_block ): string {
	$grid_heading = $grid_block['attrs']['label'] ?? '';
	$grid_content = render_block( $grid_block );
	ob_start();
	echo '<div class="kt-nav-list__group">';
	if ( $grid_heading !== '' ) {
		echo '<h3 class="kt-nav-list__title">' . esc_html( $grid_heading ) . '</h3>';
	}
	echo $grid_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $grid_content is render_block() output, WP core's own self-escaping block render pipeline
	echo '</div>';
	return ob_get_clean();
}

function kotlinskidev_nav_list_sections( WP_Post $nav_post ): array {
	$columns     = [];
	$loose_items = [];
	$extras      = [];

	foreach ( parse_blocks( $nav_post->post_content ) as $list_block ) {
		if ( empty( $list_block['blockName'] ) ) {
			continue;
		}

		if ( $list_block['blockName'] === 'core/navigation-submenu' ) {
			$group_items = kotlinskidev_nav_list_submenu_items( $list_block );
			if ( ! empty( $group_items ) ) {
				$columns[] = kotlinskidev_render_nav_list_group( $list_block['attrs']['label'] ?? '', $group_items );
			}
			continue;
		}

		if ( $list_block['blockName'] === 'core/navigation-link' ) {
			$loose_item = kotlinskidev_nav_list_loose_item( $list_block );
			if ( $loose_item !== null ) {
				$loose_items[] = $loose_item;
			}
			continue;
		}

		if ( $list_block['blockName'] === 'kotlinskidev/simple-grid' ) {
			$columns[] = kotlinskidev_render_nav_list_grid_group( $list_block );
			continue;
		}

		$extras[] = render_block( $list_block );
	}

	if ( ! empty( $loose_items ) ) {
		$columns[] = kotlinskidev_render_nav_list_group( empty( $columns ) ? get_the_title( $nav_post ) : '', $loose_items );
	}

	return [ 'columns' => $columns, 'extras' => $extras ];
}

function kotlinskidev_render_navigation_list( WP_Post $nav_post, array $nav_classes ): string {
	$sections = kotlinskidev_nav_list_sections( $nav_post );
	$columns  = $sections['columns'];
	$extras   = $sections['extras'];

	if ( empty( $columns ) && empty( $extras ) ) {
		return '';
	}

	$list_wrapper_attrs = get_block_wrapper_attributes( [
		'class' => trim( 'kt-nav-list ' . implode( ' ', $nav_classes ) ),
	] );

	$markup = '<div ' . $list_wrapper_attrs . '>';
	if ( ! empty( $columns ) ) {
		$markup .= '<div class="kt-nav-list__columns" style="--kt-nav-list-cols:' . count( $columns ) . '">' . implode( '', $columns ) . '</div>';
	}
	if ( ! empty( $extras ) ) {
		$markup .= '<div class="kt-nav-list__extras">' . implode( '', $extras ) . '</div>';
	}
	return $markup . '</div>';
}
