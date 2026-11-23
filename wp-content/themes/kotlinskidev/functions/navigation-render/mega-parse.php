<?php
const KOTLINSKIDEV_NAV_SEARCH_PANEL_BLOCKS   = [ 'kotlinskidev/search-panel', 'kotlinskidev/nav-search-panel' ];
const KOTLINSKIDEV_NAV_LANGUAGE_PANEL_BLOCKS = [ 'kotlinskidev/language-panel', 'kotlinskidev/nav-language-panel' ];
const KOTLINSKIDEV_NAV_LINK_BLOCKS           = [ 'core/navigation-link', 'core/navigation-submenu' ];

function kotlinskidev_nav_grid_item( array $block ): array {
	$attrs         = $block['attrs'];
	$inner_content = render_block( $block );
	return [
		'label'         => $attrs['label'] ?? __( 'Menu', 'kotlinskidev' ),
		'url'           => '#',
		'children'      => [],
		'panel_content' => $inner_content,
	];
}

function kotlinskidev_nav_search_item( array $block ): array {
	$attrs         = $block['attrs'];
	$inner_content = implode( '', array_map( 'render_block', $block['innerBlocks'] ?? [] ) );
	$inner_content = kotlinskidev_stagger_reveal_items(
		$inner_content,
		$attrs['navRevealAnimation'] ?? '',
		[ 'wp-block-search', 'kt-popular-pages__title', 'kt-popular-pages__item' ]
	);
	$sp_fs         = kotlinskidev_nav_link_styles( $attrs );
	return [
		'label'           => $attrs['label'] ?? '',
		'aria_label'      => ( $attrs['label'] ?? '' ) !== '' ? $attrs['label'] : __( 'Search', 'kotlinskidev' ),
		'url'             => '#',
		'children'        => [],
		'panel_content'   => $inner_content,
		'nav_icon_id'     => (int) ( $attrs['navIconId'] ?? 0 ),
		'font_size_style' => $sp_fs['style'],
		'font_size_class' => $sp_fs['class'],
		'is_utility'      => true,
	];
}

function kotlinskidev_nav_language_label( array $attrs, ?array $language ): string {
	$label = $attrs['label'] ?? '';
	if ( $label === '' && $language !== null ) {
		$label = ( $attrs['labelStyle'] ?? 'short' ) === 'full'
			? (string) ( $language['name'] ?? '' )
			: strtoupper( (string) ( $language['slug'] ?? '' ) );
	}
	if ( $label === '' ) {
		$label = __( 'Language', 'kotlinskidev' );
	}
	return $label;
}

function kotlinskidev_nav_language_item( array $block ): ?array {
	$attrs         = $block['attrs'];
	$inner_content = implode( '', array_map( 'render_block', $block['innerBlocks'] ?? [] ) );
	if ( $inner_content === '' ) {
		return null;
	}
	$inner_content = kotlinskidev_stagger_reveal_items(
		$inner_content,
		$attrs['navRevealAnimation'] ?? '',
		[ 'wp-block-navigation-item' ]
	);
	$lp_fs    = kotlinskidev_nav_link_styles( $attrs );
	$lp_lang  = kotlinskidev_pll_current_language_data();
	$lp_label = kotlinskidev_nav_language_label( $attrs, $lp_lang );
	$lp_flag  = ( $attrs['showFlag'] ?? true ) && $lp_lang !== null
		? (string) ( $lp_lang['flag'] ?? '' )
		: '';
	return [
		'label'           => $lp_label,
		'url'             => '#',
		'children'        => [],
		'panel_content'   => '<ul class="kt-lang-panel__list" role="list">' . $inner_content . '</ul>',
		'nav_icon_id'     => (int) ( $attrs['navIconId'] ?? 0 ),
		'flag'            => $lp_flag,
		'font_size_style' => $lp_fs['style'],
		'font_size_class' => $lp_fs['class'],
		'indicator'       => [
			'show'    => $attrs['showIndicator'] ?? true,
			'icon_id' => (int) ( $attrs['indicatorIconId'] ?? 0 ),
			'effect'  => $attrs['indicatorEffect'] ?? 'rotate',
		],
		'is_utility'      => true,
	];
}

function kotlinskidev_nav_link_item( array $block ): array {
	$attrs        = $block['attrs'];
	$inner_blocks = $block['innerBlocks'] ?? [];
	$nav_children = [];
	$panel_blocks = [];
	foreach ( $inner_blocks as $inner ) {
		if ( in_array( $inner['blockName'], KOTLINSKIDEV_NAV_LINK_BLOCKS, true ) ) {
			$nav_children[] = $inner;
		} else {
			$panel_blocks[] = $inner;
		}
	}
	$nl_fs     = kotlinskidev_nav_link_styles( $attrs );
	$nl_reveal = kotlinskidev_nav_reveal_attrs( $attrs );
	$item      = [
		'label'           => $attrs['label'] ?? '',
		'url'             => $attrs['url'] ?? '#',
		'children'        => kotlinskidev_parse_nav_blocks( $nav_children ),
		'nav_icon_id'     => (int) ( $attrs['navIconId'] ?? 0 ),
		'font_size_style' => $nl_fs['style'],
		'font_size_class' => $nl_fs['class'],
		'reveal_class'    => $nl_reveal['class'],
		'reveal_style'    => $nl_reveal['style'],
	];
	if ( ! empty( $panel_blocks ) ) {
		$item['panel_content'] = implode( '', array_map( 'render_block', $panel_blocks ) );
	}
	return $item;
}

function kotlinskidev_parse_nav_block( array $block ): ?array {
	if ( $block['blockName'] === 'kotlinskidev/simple-grid' ) {
		return kotlinskidev_nav_grid_item( $block );
	}
	if ( in_array( $block['blockName'], KOTLINSKIDEV_NAV_SEARCH_PANEL_BLOCKS, true ) ) {
		return kotlinskidev_nav_search_item( $block );
	}
	if ( in_array( $block['blockName'], KOTLINSKIDEV_NAV_LANGUAGE_PANEL_BLOCKS, true ) ) {
		return kotlinskidev_nav_language_item( $block );
	}
	if ( ! in_array( $block['blockName'], KOTLINSKIDEV_NAV_LINK_BLOCKS, true ) ) {
		return null;
	}
	return kotlinskidev_nav_link_item( $block );
}

if ( ! function_exists( 'kotlinskidev_parse_nav_blocks' ) ) {
	function kotlinskidev_parse_nav_blocks( array $blocks ): array {
		$items = [];
		foreach ( $blocks as $block ) {
			$item = kotlinskidev_parse_nav_block( $block );
			if ( $item !== null ) {
				$items[] = $item;
			}
		}
		return $items;
	}
}

if ( ! function_exists( 'kotlinskidev_render_nav_extras' ) ) {
	function kotlinskidev_render_nav_extras( array $blocks ): string {
		$skip   = [ 'core/navigation-link', 'core/navigation-submenu', 'kotlinskidev/search-panel', 'kotlinskidev/nav-search-panel', 'kotlinskidev/language-panel', 'kotlinskidev/nav-language-panel', 'kotlinskidev/nav-popular-pages', 'kotlinskidev/simple-grid' ];
		$output = '';
		foreach ( $blocks as $block ) {
			if ( empty( $block['blockName'] ) || in_array( $block['blockName'], $skip, true ) ) {
				continue;
			}
			$output .= render_block( $block );
		}
		return $output;
	}
}

if ( ! function_exists( 'kotlinskidev_mega_panel_template_part' ) ) {
	function kotlinskidev_mega_panel_template_part( string $slug ): string {
		$template_id = get_stylesheet() . '//mega-menu-' . $slug;
		$template    = get_block_template( $template_id, 'wp_template_part' );
		if ( ! $template instanceof WP_Block_Template || empty( $template->content ) ) {
			return '';
		}
		return do_blocks( $template->content );
	}
}
