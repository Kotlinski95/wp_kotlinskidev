<?php
$min_height         = absint( $attributes['minHeight'] ?? 80 );
$show_arrows        = (bool) ( $attributes['showArrows'] ?? true );
$show_pagination    = (bool) ( $attributes['showPagination'] ?? true );
$arrows_position    = sanitize_key( $attributes['arrowsPosition'] ?? 'sides' );
$nav_color          = sanitize_text_field( $attributes['navColor'] ?? '' );
$nav_color_hover    = (bool) ( $attributes['navColorOnHover'] ?? false );
$nav_placement      = sanitize_key( $attributes['navPlacement'] ?? 'inside' );
$transition_effect  = sanitize_key( $attributes['transitionEffect'] ?? 'slide' );

$effective_placement = $arrows_position === 'sides' ? 'inside' : $nav_placement;

$settings = wp_json_encode( [
	'showArrows'       => $show_arrows,
	'showPagination'   => $show_pagination,
	'loop'             => (bool) ( $attributes['loop'] ?? true ),
	'draggable'        => (bool) ( $attributes['draggable'] ?? true ),
	'autoplay'         => (bool) ( $attributes['autoplay'] ?? false ),
	'autoplayDelay'    => absint( $attributes['autoplayDelay'] ?? 5000 ),
	'lazyLoad'         => (bool) ( $attributes['lazyLoad'] ?? false ),
	'arrowsPosition'   => $arrows_position,
	'navColor'         => $nav_color,
	'navColorOnHover'  => $nav_color_hover,
	'navPlacement'     => $nav_placement,
	'transitionEffect' => $transition_effect,
] ) ?: '{}';

$slides_html = '';
foreach ( $block->inner_blocks as $i => $slide_block ) {
	$slide_block->attributes['slideIndex'] = $i;
	$slides_html .= $slide_block->render();
}

$inline_style = '--hero-min-height: calc(' . $min_height . 'svh - var(--admin-bar-offset, 0px))';

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'hero-carousel',
	'style' => $inline_style,
] );

$nav_class = 'carousel-nav carousel-nav--' . esc_attr( $arrows_position );
if ( $effective_placement === 'outside' ) {
	$nav_class .= ' carousel-nav--outside';
}
$counter  = $arrows_position !== 'sides' ? '<span class="carousel-nav__counter"></span>' : '';
$nav_html = '<div class="' . $nav_class . '"><div class="swiper-button-prev"></div>' . $counter . '<div class="swiper-button-next"></div></div>';

ob_start();
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<div class="swiper hero-carousel__swiper" data-carousel-settings="<?php echo esc_attr( $settings ); ?>">
		<div class="swiper-wrapper">
			<?php echo $slides_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from $slide_block->render(), WP core's own self-escaping block render pipeline ?>
		</div>
		<?php if ( $show_arrows && $effective_placement === 'inside' ) : ?>
			<?php echo $nav_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from static markup plus esc_attr()-wrapped values only ?>
		<?php endif; ?>
		<?php if ( $show_pagination && $effective_placement === 'inside' && $arrows_position === 'sides' ) : ?>
			<div class="swiper-pagination"></div>
		<?php endif; ?>
	</div>
	<?php if ( $show_arrows && $effective_placement === 'outside' ) : ?>
		<?php echo $nav_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from static markup plus esc_attr()-wrapped values only ?>
	<?php endif; ?>
</div>
<?php
$block_html = ob_get_clean();

if ( $nav_color ) {
	$prop      = $nav_color_hover ? '--carousel-nav-color-hover' : '--carousel-nav-color';
	$processor = new WP_HTML_Tag_Processor( $block_html );
	if ( $processor->next_tag() ) {
		$existing_style = trim( (string) ( $processor->get_attribute( 'style' ) ?? '' ) );
		$existing_style = '' !== $existing_style ? rtrim( $existing_style, ';' ) . '; ' : '';
		$processor->set_attribute( 'style', $existing_style . $prop . ': ' . $nav_color );
		$block_html = $processor->get_updated_html();
	}
}

echo $block_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from static markup plus esc_attr()-wrapped values only, style attribute escaped by WP_HTML_Tag_Processor
