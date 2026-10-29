<?php
$featured         = ! empty( $attributes['featured'] );
$badge_font_size  = (string) ( $attributes['badgeFontSize'] ?? '' );
$badge_text_color = (string) ( $attributes['badgeTextColor'] ?? '' );
$badge_gradient   = (string) ( $attributes['badgeGradient'] ?? '' );

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'pricing-card' . ( $featured ? ' pricing-card--featured' : '' ),
] );

$badge_style = '';
if ( '' !== $badge_font_size ) {
	$badge_style .= 'font-size:' . esc_attr( $badge_font_size ) . ';';
}
if ( '' !== $badge_gradient ) {
	$badge_style .= 'background-image:' . esc_attr( $badge_gradient ) . ';background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:transparent;';
} elseif ( '' !== $badge_text_color ) {
	$badge_style .= 'color:' . esc_attr( $badge_text_color ) . ';';
}
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>>
	<?php if ( $featured ) : ?>
		<span class="pricing-card__badge"<?php echo '' !== $badge_style ? ' style="' . $badge_style . '"' : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $badge_style built entirely from esc_attr()'d parts above ?>><?php esc_html_e( 'Most popular', 'kotlinskidev' ); ?></span>
	<?php endif; ?>
	<div class="pricing-card__body">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is the block's already-rendered InnerBlocks HTML from WP core's own self-escaping block render pipeline ?>
	</div>
</div>
