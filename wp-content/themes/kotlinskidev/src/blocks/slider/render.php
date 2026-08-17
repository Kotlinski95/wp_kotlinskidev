<?php
$autoplay          = empty( $attributes['autoplay'] ) ? false : $attributes['autoplay'];
$autoplay_time     = empty( $attributes['autoplayTime'] ) ? 5 : $attributes['autoplayTime'];
$smooth_transition = empty( $attributes['smoothTransition'] ) ? false : $attributes['smoothTransition'];
$continuous_autoplay = empty( $attributes['continuousAutoplay'] ) ? false : $attributes['continuousAutoplay'];
$navigation        = empty( $attributes['navigation'] ) ? false : $attributes['navigation'];
$pagination        = empty( $attributes['pagination'] ) ? false : $attributes['pagination'];
$show_progress     = empty( $attributes['showProgress'] ) ? false : $attributes['showProgress'];
$slides_per_view    = empty( $attributes['slidesPerView'] ) ? 1 : $attributes['slidesPerView'];
$slides_per_mobile   = empty( $attributes['slidesPerMobile'] ) ? 1 : $attributes['slidesPerMobile'];
$slides_per_tablet   = empty( $attributes['slidesPerTablet'] ) ? 1 : $attributes['slidesPerTablet'];
$slides_per_desktop  = empty( $attributes['slidesPerDesktop'] ) ? 1 : $attributes['slidesPerDesktop'];
$loop              = empty( $attributes['loop'] ) ? false : $attributes['loop'];
$draggable         = isset( $attributes['draggable'] ) ? (bool) $attributes['draggable'] : true;
$scrollbar         = empty( $attributes['scrollbar'] ) ? false : $attributes['scrollbar'];
$mousewheel        = empty( $attributes['mousewheel'] ) ? false : $attributes['mousewheel'];
$keyboard          = isset( $attributes['keyboard'] ) ? (bool) $attributes['keyboard'] : true;
$space_between      = isset( $attributes['spaceBetween'] ) ? (int) $attributes['spaceBetween'] : 16;
$center_slides     = empty( $attributes['centerSlides'] ) ? false : $attributes['centerSlides'];
$peek              = isset( $attributes['peek'] ) ? min( 40, max( 0, (int) $attributes['peek'] ) ) : 20;
$slide_max_width_raw = $attributes['slideMaxWidth'] ?? '900px';
$slide_max_width_raw = is_numeric( $slide_max_width_raw ) ? $slide_max_width_raw . 'px' : $slide_max_width_raw;
$slide_max_width   = kotlinskidev_sanitize_css_length( (string) $slide_max_width_raw );
if ( '' === $slide_max_width ) {
    $slide_max_width = '900px';
}
$pagination_placement = sanitize_key( $attributes['paginationPlacement'] ?? 'outside' );
$show_progress_circle = $show_progress && $autoplay && ! $continuous_autoplay;
$progress_gradient_id = $show_progress_circle ? wp_unique_id( 'kt-slider-progress-' ) : '';

$swiper_settings = array(
    'autoplay'         => $autoplay,
    'autoplayTime'     => $autoplay_time,
    'smoothTransition' => $smooth_transition,
    'continuousAutoplay' => $continuous_autoplay,
    'navigation'       => $navigation,
    'pagination'       => $pagination,
    'slidesPerView'    => $slides_per_view,
    'slidesPerMobile'  => $slides_per_mobile,
    'slidesPerTablet'  => $slides_per_tablet,
    'slidesPerDesktop' => $slides_per_desktop,
    'loop'             => $loop,
    'draggable'        => $draggable,
    'scrollbar'        => $scrollbar,
    'mousewheel'       => $mousewheel,
    'keyboard'         => $keyboard,
    'spaceBetween'     => $space_between,
    'centerSlides'     => $center_slides,
);

$wrapper_class = 'swiper' . ( $center_slides ? ' has-center-slides' : '' );
$wrapper_style = $center_slides
    ? '--kt-slider-slide-width: ' . ( 100 - ( $peek * 2 ) ) . '%; --kt-slider-slide-max-width: ' . $slide_max_width
    : '';

$wrapper_attributes = get_block_wrapper_attributes( array(
    'class' => $wrapper_class,
    'style' => $wrapper_style,
) );
?>
<div <?php echo wp_kses_data( $wrapper_attributes ); ?> data-swiper="<?php echo esc_attr( wp_json_encode( $swiper_settings ) ); ?>">
	<div class="swiper-wrapper">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
	<?php if ( $pagination && ! $scrollbar ) : ?>
		<div class="swiper-pagination<?php echo 'outside' === $pagination_placement ? ' kt-pagination-outside' : ''; ?>"></div>
	<?php endif; ?>
	<?php if ( $show_progress_circle ) : ?>
		<div class="swiper-progress" aria-hidden="true">
			<svg viewBox="0 0 36 36">
				<defs>
					<linearGradient id="<?php echo esc_attr( $progress_gradient_id ); ?>" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" class="swiper-progress-gradient-start" />
						<stop offset="100%" class="swiper-progress-gradient-end" />
					</linearGradient>
				</defs>
				<circle class="swiper-progress-track" cx="18" cy="18" r="16" />
				<circle
					class="swiper-progress-fill"
					cx="18"
					cy="18"
					r="16"
					stroke="url(#<?php echo esc_attr( $progress_gradient_id ); ?>)"
				/>
			</svg>
		</div>
	<?php endif; ?>
</div>
