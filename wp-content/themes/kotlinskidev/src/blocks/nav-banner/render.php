<?php
$media_url  = $attributes['mediaUrl'] ?? '';
$alt_text   = $attributes['altText'] ?? '';
$heading    = $attributes['heading'] ?? '';
$desc       = $attributes['description'] ?? '';
$link_url   = $attributes['linkUrl'] ?? '';
$link_label = ! empty( $attributes['linkLabel'] ) ? $attributes['linkLabel'] : __( 'Learn more', 'kotlinskidev' );

$wrapper_attrs = get_block_wrapper_attributes( [ 'class' => 'kt-nav-banner' ] );
?>
<div <?php echo $wrapper_attrs; ?>>
	<?php if ( $media_url ) : ?>
	<figure class="kt-nav-banner__media">
		<?php
		$img = '<img src="' . esc_url( $media_url ) . '" alt="' . esc_attr( $alt_text ) . '" loading="lazy">';
		echo $link_url ? '<a class="kt-nav-banner__media-link" href="' . esc_url( $link_url ) . '">' . $img . '</a>' : $img;
		?>
	</figure>
	<?php endif; ?>
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
