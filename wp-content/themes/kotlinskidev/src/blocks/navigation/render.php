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
			if ( ! in_array( $block['blockName'], [ 'core/navigation-link', 'core/navigation-submenu' ], true ) ) {
				continue;
			}
			$attrs   = $block['attrs'];
			$items[] = [
				'label'    => $attrs['label'] ?? '',
				'url'      => $attrs['url'] ?? '#',
				'children' => kotlinskidev_parse_nav_blocks( $block['innerBlocks'] ?? [] ),
			];
		}
		return $items;
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

$items         = kotlinskidev_parse_nav_blocks( parse_blocks( $post->post_content ) );
$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => 'kt-mega-nav' ] );

ob_start();
?>
<div <?php echo $wrapper_attrs; ?>>
	<nav class="kt-mega-nav__bar" aria-label="<?php esc_attr_e( 'Main navigation', 'kotlinskidev' ); ?>">
		<ul class="kt-mega-nav__list" role="list">
			<?php foreach ( $items as $item ) :
				$has_children = ! empty( $item['children'] );
				$panel_slug   = sanitize_title( $item['label'] );
			?>
			<li class="kt-mega-nav__item<?php echo $has_children ? ' has-children' : ''; ?>"
				<?php echo $has_children ? 'data-panel="' . esc_attr( $panel_slug ) . '"' : ''; ?>>
				<a class="kt-mega-nav__link" href="<?php echo esc_url( $item['url'] ); ?>">
					<?php echo esc_html( $item['label'] ); ?>
				</a>
			</li>
			<?php endforeach; ?>
		</ul>
	</nav>

	<div class="kt-mega-nav__panels">
		<?php foreach ( $items as $item ) :
			if ( empty( $item['children'] ) ) {
				continue;
			}
			$panel_slug = sanitize_title( $item['label'] );
			$hero       = kotlinskidev_mega_panel_template_part( $panel_slug );
		?>
		<div class="kt-mega-nav__panel" data-panel="<?php echo esc_attr( $panel_slug ); ?>"
			role="region" aria-label="<?php echo esc_attr( $item['label'] ); ?>">
			<div class="kt-mega-nav__panel-inner">
				<?php if ( $hero ) : ?>
				<div class="kt-mega-nav__panel-hero">
					<?php echo $hero; ?>
				</div>
				<?php endif; ?>
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
			</div>
		</div>
		<?php endforeach; ?>
	</div>

	<div class="kt-mega-nav__backdrop" aria-hidden="true"></div>
</div>
<?php
echo ob_get_clean();
