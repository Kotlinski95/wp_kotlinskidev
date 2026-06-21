<?php
$media_url  = $attributes['mediaUrl'] ?? '';
$heading    = $attributes['heading'] ?? '';
$desc       = $attributes['description'] ?? '';
$link_url   = $attributes['linkUrl'] ?? '';
$link_label = ! empty( $attributes['linkLabel'] ) ? $attributes['linkLabel'] : __( 'Learn more', 'kotlinskidev' );
$opacity    = absint( $attributes['overlayOpacity'] ?? 40 ) / 100;

$bg_style = $media_url ? 'background-image:url(' . esc_url( $media_url ) . ');background-size:cover;background-position:center;' : 'background-color:#444;';

$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => 'kt-nav-banner', 'style' => $bg_style ] );
?>
<div <?php echo $wrapper_attrs; ?>>
	<div class="kt-nav-banner__overlay" style="--kt-banner-overlay:<?php echo esc_attr( $opacity ); ?>"></div>
	<div class="kt-nav-banner__content">
		<?php if ( $heading ) : ?>
		<h3 class="kt-nav-banner__heading"><?php echo wp_kses_post( $heading ); ?></h3>
		<?php endif; ?>
		<?php if ( $desc ) : ?>
		<p class="kt-nav-banner__desc"><?php echo wp_kses_post( $desc ); ?></p>
		<?php endif; ?>
		<?php if ( $link_url ) : ?>
		<a class="kt-nav-banner__link" href="<?php echo esc_url( $link_url ); ?>">
			<?php echo esc_html( $link_label ); ?>
		</a>
		<?php endif; ?>
	</div>
</div>
