<?php
/**
 * Slider block
 *
 * @var array     $attributes Block attributes.
 * @var string    $content    Block default content.
 * @var \WP_Block $block      Block instance.
 *
 * @package wpe/slider-block
 */

$autoplay   = empty( $attributes['autoplay'] ) ? false : $attributes['autoplay'];
$autoplayTime  = empty( $attributes['autoplayTime'] ) ? 5 : $attributes['autoplayTime'];
$navigation = empty( $attributes['navigation'] ) ? false : $attributes['navigation'];
$pagination = empty( $attributes['pagination'] ) ? false : $attributes['pagination'];
$slidesPerView = empty( $attributes['slidesPerView'] ) ? 1 : $attributes['slidesPerView'];
$slidesPerMobile = empty( $attributes['slidesPerMobile'] ) ? 1 : $attributes['slidesPerMobile'];
$slidesPerTablet = empty( $attributes['slidesPerTablet'] ) ? 1 : $attributes['slidesPerTablet'];
$slidesPerDesktop = empty( $attributes['slidesPerDesktop'] ) ? 1 : $attributes['slidesPerDesktop'];
$loop = empty( $attributes['loop'] ) ? false : $attributes['loop'];
$scrollbar = empty( $attributes['scrollbar'] ) ? false : $attributes['scrollbar'];

$swiper_attr = array(
	'autoplay'   => $autoplay,
	'autoplayTime' => $autoplayTime,
	'navigation' => $navigation,
	'pagination' => $pagination,
	'slidesPerView' => $slidesPerView,
	'slidesPerMobile' => $slidesPerMobile,
	'slidesPerTablet' => $slidesPerTablet,
	'slidesPerDesktop' => $slidesPerDesktop,
	'loop'       => $loop,
	'scrollbar'  => $scrollbar,
);
$swiper_attr = htmlspecialchars( wp_json_encode( $swiper_attr ) );

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'swiper',
	)
);
?>

<div <?php echo wp_kses_data( $wrapper_attributes ) . 'data-swiper="' . esc_attr( $swiper_attr ) . '"'; ?>>

	<div class="swiper-wrapper">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>

</div><!-- .swiper -->
