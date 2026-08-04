<?php
$autoplay          = empty( $attributes['autoplay'] ) ? false : $attributes['autoplay'];
$autoplay_time     = empty( $attributes['autoplayTime'] ) ? 5 : $attributes['autoplayTime'];
$smooth_transition = empty( $attributes['smoothTransition'] ) ? false : $attributes['smoothTransition'];
$navigation        = empty( $attributes['navigation'] ) ? false : $attributes['navigation'];
$pagination        = empty( $attributes['pagination'] ) ? false : $attributes['pagination'];
$slides_per_view    = empty( $attributes['slidesPerView'] ) ? 1 : $attributes['slidesPerView'];
$slides_per_mobile   = empty( $attributes['slidesPerMobile'] ) ? 1 : $attributes['slidesPerMobile'];
$slides_per_tablet   = empty( $attributes['slidesPerTablet'] ) ? 1 : $attributes['slidesPerTablet'];
$slides_per_desktop  = empty( $attributes['slidesPerDesktop'] ) ? 1 : $attributes['slidesPerDesktop'];
$loop              = empty( $attributes['loop'] ) ? false : $attributes['loop'];
$scrollbar         = empty( $attributes['scrollbar'] ) ? false : $attributes['scrollbar'];
$mousewheel        = empty( $attributes['mousewheel'] ) ? false : $attributes['mousewheel'];
$keyboard          = empty( $attributes['keyboard'] ) ? true : $attributes['keyboard'];
$space_between      = isset( $attributes['spaceBetween'] ) ? (int) $attributes['spaceBetween'] : 16;

$swiper_settings = array(
    'autoplay'         => $autoplay,
    'autoplayTime'     => $autoplay_time,
    'smoothTransition' => $smooth_transition,
    'navigation'       => $navigation,
    'pagination'       => $pagination,
    'slidesPerView'    => $slides_per_view,
    'slidesPerMobile'  => $slides_per_mobile,
    'slidesPerTablet'  => $slides_per_tablet,
    'slidesPerDesktop' => $slides_per_desktop,
    'loop'             => $loop,
    'scrollbar'        => $scrollbar,
    'mousewheel'       => $mousewheel,
    'keyboard'         => $keyboard,
    'spaceBetween'     => $space_between,
);

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'swiper' ) );
?>
<div <?php echo wp_kses_data( $wrapper_attributes ); ?> data-swiper="<?php echo esc_attr( wp_json_encode( $swiper_settings ) ); ?>">
	<div class="swiper-wrapper">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
</div>
