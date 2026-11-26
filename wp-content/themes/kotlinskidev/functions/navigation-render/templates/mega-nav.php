<div <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<nav class="kt-mega-nav__bar" aria-label="<?php esc_attr_e( 'Main navigation', 'kotlinskidev' ); ?>">
		<ul class="kt-mega-nav__list" role="list">
			<?php foreach ( $items as $item ) : ?>
			<li class="kt-mega-nav__item<?php echo $item['has_panel'] ? ' has-children' : ''; ?><?php echo ! empty( $item['is_utility'] ) ? ' kt-mega-nav__item--utility' : ''; ?>"
				<?php echo $item['has_panel'] ? 'data-panel="' . esc_attr( $item['panel_slug'] ) . '"' : ''; ?>>
				<?php
				$nav_icon_svg = kotlinskidev_inline_nav_icon( (int) ( $item['nav_icon_id'] ?? 0 ) );
				$nav_label    = $item['label'] ?? '';
				?>
				<a class="kt-mega-nav__link<?php echo $nav_icon_svg ? ' kt-mega-nav__link--icon' : ''; ?><?php echo $item['font_size_class'] ?? ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- font_size_class is built exclusively via sanitize_html_class() in kotlinskidev_nav_link_styles() ?> custom-color"
					href="<?php echo esc_url( $item['url'] ); ?>"
					<?php if ( ! empty( $item['font_size_style'] ) ) : ?>style="<?php echo esc_attr( $item['font_size_style'] ); ?>"<?php endif; ?>
					<?php if ( $nav_icon_svg && $nav_label === '' ) : ?>aria-label="<?php echo esc_attr( $item['aria_label'] ?? $item['label'] ); ?>"<?php endif; ?>
					<?php if ( $item['has_panel'] ) : ?>aria-haspopup="true" aria-expanded="false"<?php endif; ?>>
					<?php if ( ! empty( $item['flag'] ) ) : ?>
					<img class="kt-mega-nav__flag" src="<?php echo esc_url( $item['flag'] ); ?>" alt="" width="48" height="30" />
					<?php endif; ?>
					<?php if ( $nav_label !== '' ) : ?>
					<span class="kt-mega-nav__link-label"><?php echo esc_html( $nav_label ); ?></span>
					<?php endif; ?>
					<?php if ( $nav_icon_svg ) : ?>
					<?php echo $nav_icon_svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $nav_icon_svg comes from kotlinskidev_inline_nav_icon(), which reuses the sanitized functions/blocks.php implementation ?>
					<?php endif; ?>
					<?php
					$indicator = $item['indicator'] ?? [];
					if ( $item['has_panel'] && ! empty( $indicator['show'] ) ) :
						$indicator_svg   = kotlinskidev_inline_nav_icon( (int) ( $indicator['icon_id'] ?? 0 ) );
						$indicator_class = 'kt-mega-nav__indicator';
						$indicator_fx    = $indicator['effect'] ?? 'rotate';
						if ( $indicator_fx !== 'none' ) {
							$indicator_class .= ' kt-mega-nav__indicator--' . sanitize_html_class( $indicator_fx );
						}
					?>
					<span class="<?php echo esc_attr( $indicator_class ); ?>" aria-hidden="true">
						<?php echo $indicator_svg !== '' ? $indicator_svg : '<svg class="kt-indicator-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $indicator_svg comes from kotlinskidev_inline_nav_icon(), which reuses the sanitized functions/blocks.php implementation; fallback branch is a static SVG literal ?>
					</span>
					<?php endif; ?>
				</a>
			</li>
			<?php endforeach; ?>
		</ul>
		<span class="kt-mega-nav__glider" aria-hidden="true"></span>
		<?php if ( $extras ) : ?>
		<div class="kt-mega-nav__extras"><?php echo $extras; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $extras is built exclusively from render_block() output via kotlinskidev_render_nav_extras(), WP core's own self-escaping block render pipeline ?></div>
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
					<?php echo $panel_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $panel_content is built exclusively from render_block() output and esc_html()-wrapped labels ?>
				</div>
				<?php elseif ( $hero ) : ?>
				<div class="kt-mega-nav__panel-hero<?php echo ! $has_children ? ' kt-mega-nav__panel-hero--full' : ''; ?>">
					<?php echo $hero; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $hero comes from kotlinskidev_mega_panel_template_part(), which returns do_blocks() output, WP core's own self-escaping block render pipeline ?>
				</div>
				<?php endif; ?>
				<?php if ( $has_children ) : ?>
				<div class="kt-mega-nav__panel-links" style="--col-count: <?php echo count( $item['children'] ); ?>">
					<?php foreach ( $item['children'] as $child ) : ?>
					<div class="kt-mega-nav__l2">
						<a class="kt-mega-nav__l2-link<?php echo ( $child['reveal_class'] ?? '' ) !== '' ? ' ' . esc_attr( $child['reveal_class'] ) : ''; ?>" href="<?php echo esc_url( $child['url'] ); ?>"
							<?php if ( ( $child['reveal_style'] ?? '' ) !== '' ) : ?>style="<?php echo esc_attr( $child['reveal_style'] ); ?>"<?php endif; ?>>
							<?php echo esc_html( $child['label'] ); ?>
						</a>
						<?php if ( ! empty( $child['children'] ) ) : ?>
						<ul class="kt-mega-nav__l3-list" role="list">
							<?php foreach ( $child['children'] as $grandchild ) : ?>
							<li>
								<a class="kt-mega-nav__l3-link<?php echo ( $grandchild['reveal_class'] ?? '' ) !== '' ? ' ' . esc_attr( $grandchild['reveal_class'] ) : ''; ?>" href="<?php echo esc_url( $grandchild['url'] ); ?>"
									<?php if ( ( $grandchild['reveal_style'] ?? '' ) !== '' ) : ?>style="<?php echo esc_attr( $grandchild['reveal_style'] ); ?>"<?php endif; ?>>
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
