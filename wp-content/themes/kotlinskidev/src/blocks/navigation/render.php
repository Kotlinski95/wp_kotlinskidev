<?php
$menu_slug    = $attributes['menuSlug'] ?? '';
$overlay_menu = $attributes['overlayMenu'] ?? 'never';

if ( empty( $menu_slug ) ) {
	return;
}

$nav_post = get_page_by_path( $menu_slug, OBJECT, 'wp_navigation' );

if ( ! $nav_post instanceof WP_Post ) {
	return;
}

$nav_id = $nav_post->ID;

if ( function_exists( 'pll_get_post' ) ) {
	$translated_id = pll_get_post( $nav_id );
	if ( $translated_id ) {
		$nav_id = $translated_id;
	}
}

if ( $overlay_menu !== 'never' ) {
	echo '<div ' . get_block_wrapper_attributes() . '>' . render_block( [
		'blockName'    => 'core/navigation',
		'attrs'        => [
			'ref'         => $nav_id,
			'overlayMenu' => $overlay_menu,
		],
		'innerBlocks'  => [],
		'innerHTML'    => '',
		'innerContent' => [],
	] ) . '</div>';
	return;
}

if ( ! function_exists( 'kotlinskidev_parse_nav_blocks' ) ) {
	function kotlinskidev_parse_nav_blocks( array $blocks ): array {
		$items = [];
		foreach ( $blocks as $block ) {
			if ( $block['blockName'] === 'kotlinskidev/simple-grid' ) {
				$attrs         = $block['attrs'];
				$inner_content = render_block( $block );
				$items[]       = [
					'label'         => $attrs['label'] ?? __( 'Menu', 'kotlinskidev' ),
					'url'           => '#',
					'children'      => [],
					'panel_content' => $inner_content,
				];
				continue;
			}
			if ( in_array( $block['blockName'], [ 'kotlinskidev/search-panel', 'kotlinskidev/nav-search-panel' ], true ) ) {
				$attrs         = $block['attrs'];
				$inner_content = implode( '', array_map( 'render_block', $block['innerBlocks'] ?? [] ) );
				$items[]       = [
					'label'         => $attrs['label'] ?? __( 'Search', 'kotlinskidev' ),
					'url'           => '#',
					'children'      => [],
					'panel_content' => $inner_content,
				];
				continue;
			}
			if ( ! in_array( $block['blockName'], [ 'core/navigation-link', 'core/navigation-submenu' ], true ) ) {
				continue;
			}
			$attrs        = $block['attrs'];
			$inner_blocks = $block['innerBlocks'] ?? [];
			$nav_children = [];
			$panel_blocks = [];
			foreach ( $inner_blocks as $inner ) {
				if ( in_array( $inner['blockName'], [ 'core/navigation-link', 'core/navigation-submenu' ], true ) ) {
					$nav_children[] = $inner;
				} else {
					$panel_blocks[] = $inner;
				}
			}
			$item = [
				'label'    => $attrs['label'] ?? '',
				'url'      => $attrs['url'] ?? '#',
				'children' => kotlinskidev_parse_nav_blocks( $nav_children ),
			];
			if ( ! empty( $panel_blocks ) ) {
				$item['panel_content'] = implode( '', array_map( 'render_block', $panel_blocks ) );
			}
			$items[] = $item;
		}
		return $items;
	}
}

if ( ! function_exists( 'kotlinskidev_render_nav_extras' ) ) {
	function kotlinskidev_render_nav_extras( array $blocks ): string {
		$skip   = [ 'core/navigation-link', 'core/navigation-submenu', 'kotlinskidev/search-panel', 'kotlinskidev/nav-search-panel', 'kotlinskidev/nav-popular-pages', 'kotlinskidev/simple-grid' ];
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

$post = get_post( $nav_id );
if ( ! $post instanceof WP_Post ) {
	return;
}

$raw_blocks    = parse_blocks( $post->post_content );
$items         = kotlinskidev_parse_nav_blocks( $raw_blocks );
$extras        = kotlinskidev_render_nav_extras( $raw_blocks );
$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => 'kt-mega-nav' ] );

foreach ( $items as &$item ) {
	$item['panel_slug'] = sanitize_title( $item['label'] );
	if ( isset( $item['panel_content'] ) ) {
		$item['panel_hero'] = '';
		$item['has_panel']  = true;
		continue;
	}
	$item['panel_hero'] = kotlinskidev_mega_panel_template_part( $item['panel_slug'] );
	$item['has_panel']  = ! empty( $item['children'] ) || ! empty( $item['panel_hero'] );
}
unset( $item );

ob_start();
?>
<div <?php echo $wrapper_attrs; ?>>
	<nav class="kt-mega-nav__bar" aria-label="<?php esc_attr_e( 'Main navigation', 'kotlinskidev' ); ?>">
		<ul class="kt-mega-nav__list" role="list">
			<?php foreach ( $items as $item ) : ?>
			<li class="kt-mega-nav__item<?php echo $item['has_panel'] ? ' has-children' : ''; ?>"
				<?php echo $item['has_panel'] ? 'data-panel="' . esc_attr( $item['panel_slug'] ) . '"' : ''; ?>>
				<a class="kt-mega-nav__link" href="<?php echo esc_url( $item['url'] ); ?>">
					<?php echo esc_html( $item['label'] ); ?>
				</a>
			</li>
			<?php endforeach; ?>
		</ul>
		<?php if ( $extras ) : ?>
		<div class="kt-mega-nav__extras"><?php echo $extras; ?></div>
		<?php endif; ?>
	</nav>

	<div class="kt-mega-nav__panels">
		<?php foreach ( $items as $item ) :
			if ( ! $item['has_panel'] ) {
				continue;
			}
			$hero          = $item['panel_hero'];
			$has_children  = ! empty( $item['children'] );
			$panel_content = $item['panel_content'] ?? '';
		?>
		<div class="kt-mega-nav__panel" data-panel="<?php echo esc_attr( $item['panel_slug'] ); ?>"
			role="region" aria-label="<?php echo esc_attr( $item['label'] ); ?>">
			<div class="kt-mega-nav__panel-inner">
				<?php if ( $panel_content ) : ?>
				<div class="kt-mega-nav__panel-hero kt-mega-nav__panel-hero--full">
					<?php echo $panel_content; ?>
				</div>
				<?php elseif ( $hero ) : ?>
				<div class="kt-mega-nav__panel-hero<?php echo ! $has_children ? ' kt-mega-nav__panel-hero--full' : ''; ?>">
					<?php echo $hero; ?>
				</div>
				<?php endif; ?>
				<?php if ( $has_children ) : ?>
				<div class="kt-mega-nav__panel-links" style="--col-count: <?php echo count( $item['children'] ); ?>">
					<?php foreach ( $item['children'] as $child ) : ?>
					<div class="kt-mega-nav__l2">
						<a class="kt-mega-nav__l2-link" href="<?php echo esc_url( $child['url'] ); ?>">
							<?php echo esc_html( $child['label'] ); ?>
						</a>
						<?php if ( ! empty( $child['children'] ) ) : ?>
						<ul class="kt-mega-nav__l3-list" role="list">
							<?php foreach ( $child['children'] as $grandchild ) : ?>
							<li>
								<a class="kt-mega-nav__l3-link" href="<?php echo esc_url( $grandchild['url'] ); ?>">
									<?php echo esc_html( $grandchild['label'] ); ?>
								</a>
							</li>
							<?php endforeach; ?>
						</ul>
						<?php endif; ?>
					</div>
					<?php endforeach; ?>
				</div>
				<?php endif; ?>
			</div>
		</div>
		<?php endforeach; ?>
	</div>

	<div class="kt-mega-nav__backdrop" aria-hidden="true"></div>
</div>
<?php
echo ob_get_clean();
