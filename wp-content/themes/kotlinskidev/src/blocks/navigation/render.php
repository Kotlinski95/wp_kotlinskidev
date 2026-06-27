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

if ( ! function_exists( 'kotlinskidev_inline_nav_icon' ) ) {
	function kotlinskidev_inline_nav_icon( int $id ): string {
		if ( ! $id ) {
			return '';
		}
		$file = get_attached_file( $id );
		if ( ! $file || 'svg' !== strtolower( pathinfo( $file, PATHINFO_EXTENSION ) ) ) {
			return '';
		}
		$svg = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( ! $svg ) {
			return '';
		}
		$svg = preg_replace( '/ fill="[^"]*"/i', '', $svg );
		return preg_replace( '/<svg(\s)/i', '<svg aria-hidden="true" focusable="false" fill="currentColor"$1', $svg, 1 );
	}
}

if ( ! function_exists( 'kotlinskidev_nav_link_styles' ) ) {
	function kotlinskidev_nav_link_styles( array $attrs ): array {
		$parts = [];
		$class = '';
		$typo  = $attrs['style']['typography'] ?? [];
		$color = $attrs['style']['color'] ?? [];

		if ( ! empty( $typo['fontSize'] ) ) {
			$parts[] = 'font-size:' . $typo['fontSize'];
		} elseif ( ! empty( $attrs['fontSize'] ) ) {
			$class .= ' has-' . sanitize_html_class( $attrs['fontSize'] ) . '-font-size';
		}
		foreach ( [ 'lineHeight' => 'line-height', 'fontStyle' => 'font-style', 'fontWeight' => 'font-weight', 'letterSpacing' => 'letter-spacing', 'textDecoration' => 'text-decoration', 'textTransform' => 'text-transform' ] as $attr => $prop ) {
			if ( ! empty( $typo[ $attr ] ) ) {
				$parts[] = $prop . ':' . $typo[ $attr ];
			}
		}
		if ( ! empty( $color['text'] ) ) {
			$parts[] = 'color:' . $color['text'];
		} elseif ( ! empty( $attrs['textColor'] ) ) {
			$class .= ' has-text-color has-' . sanitize_html_class( $attrs['textColor'] ) . '-color';
		}

		return [ 'style' => $parts ? implode( ';', $parts ) . ';' : '', 'class' => $class ];
	}
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
				$sp_fs         = kotlinskidev_nav_link_styles( $attrs );
				$items[]       = [
					'label'           => $attrs['label'] ?? __( 'Search', 'kotlinskidev' ),
					'url'             => '#',
					'children'        => [],
					'panel_content'   => $inner_content,
					'nav_icon_id'     => (int) ( $attrs['navIconId'] ?? 0 ),
					'font_size_style' => $sp_fs['style'],
					'font_size_class' => $sp_fs['class'],
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
			$nl_fs = kotlinskidev_nav_link_styles( $attrs );
			$item  = [
				'label'           => $attrs['label'] ?? '',
				'url'             => $attrs['url'] ?? '#',
				'children'        => kotlinskidev_parse_nav_blocks( $nav_children ),
				'nav_icon_id'     => (int) ( $attrs['navIconId'] ?? 0 ),
				'font_size_style' => $nl_fs['style'],
				'font_size_class' => $nl_fs['class'],
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
$link_navigates = ! empty( $attributes['linkNavigatesOnClick'] );
$extra_attrs    = [ 'class' => 'kt-mega-nav' ];
if ( $link_navigates ) {
	$extra_attrs['data-link-navigates'] = 'true';
}
$wrapper_attrs = get_block_wrapper_attributes( $extra_attrs );

foreach ( $items as $idx => &$item ) {
	$item['panel_slug'] = sanitize_title( $item['label'] ) ?: 'panel-' . $idx;
	if ( isset( $item['panel_content'] ) ) {
		$item['panel_hero'] = '';
		$item['has_panel']  = true;
		continue;
	}
	$item['panel_hero'] = kotlinskidev_mega_panel_template_part( $item['panel_slug'] );
	$item['has_panel']  = ! empty( $item['children'] ) || ! empty( $item['panel_hero'] );
}
unset( $item );

static $kt_nav_icon_grads = false;
if ( ! $kt_nav_icon_grads ) {
	$kt_nav_icon_grads = true;
	echo '<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden" xmlns="http://www.w3.org/2000/svg"><defs>'
		. '<linearGradient id="kt-icon-grad-dark" x1="1" y1="0" x2="0" y2="0" gradientUnits="objectBoundingBox">'
		. '<stop offset="0%" stop-color="rgb(184,150,255)"/>'
		. '<stop offset="60%" stop-color="rgb(0,246,255)"/>'
		. '<stop offset="100%" stop-color="rgb(0,255,240)"/>'
		. '</linearGradient>'
		. '<linearGradient id="kt-icon-grad-light" x1="1" y1="0" x2="0" y2="0" gradientUnits="objectBoundingBox">'
		. '<stop offset="0%" stop-color="rgb(132,83,210)"/>'
		. '<stop offset="60%" stop-color="rgb(0,71,255)"/>'
		. '<stop offset="100%" stop-color="rgb(0,120,194)"/>'
		. '</linearGradient>'
		. '</defs></svg>';
}

ob_start();
?>
<div <?php echo $wrapper_attrs; ?>>
	<nav class="kt-mega-nav__bar" aria-label="<?php esc_attr_e( 'Main navigation', 'kotlinskidev' ); ?>">
		<ul class="kt-mega-nav__list" role="list">
			<?php foreach ( $items as $item ) : ?>
			<li class="kt-mega-nav__item<?php echo $item['has_panel'] ? ' has-children' : ''; ?>"
				<?php echo $item['has_panel'] ? 'data-panel="' . esc_attr( $item['panel_slug'] ) . '"' : ''; ?>>
				<?php
				$nav_icon_svg = kotlinskidev_inline_nav_icon( (int) ( $item['nav_icon_id'] ?? 0 ) );
				$nav_label    = $item['label'] ?? '';
				?>
				<a class="kt-mega-nav__link<?php echo $nav_icon_svg ? ' kt-mega-nav__link--icon' : ''; ?><?php echo $item['font_size_class'] ?? ''; ?> custom-color"
					href="<?php echo esc_url( $item['url'] ); ?>"
					<?php if ( ! empty( $item['font_size_style'] ) ) : ?>style="<?php echo esc_attr( $item['font_size_style'] ); ?>"<?php endif; ?>
					<?php if ( $nav_icon_svg && $nav_label === '' ) : ?>aria-label="<?php echo esc_attr( $item['label'] ); ?>"<?php endif; ?>>
					<?php if ( $nav_label !== '' ) : ?>
					<span class="kt-mega-nav__link-label"><?php echo esc_html( $nav_label ); ?></span>
					<?php endif; ?>
					<?php if ( $nav_icon_svg ) : ?>
					<?php echo $nav_icon_svg; ?>
					<?php endif; ?>
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
