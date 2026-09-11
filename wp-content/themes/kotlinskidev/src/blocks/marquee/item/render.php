<?php
$label       = sanitize_text_field( $attributes['label'] ?? '' );
$icon_url    = esc_url( $attributes['navIconUrl'] ?? '' );
$description = sanitize_textarea_field( $attributes['description'] ?? '' );
$doc_url     = esc_url( $attributes['docUrl'] ?? '' );

if ( '' === $label ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => 'kt-marquee__item swiper-slide',
] );
?>
<button
	type="button"
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- return value of get_block_wrapper_attributes(), already esc_attr()'d internally ?>
	data-kt-modal-target="kt-modal-marquee"
	data-marquee-label="<?php echo esc_attr( $label ); ?>"
	data-marquee-description="<?php echo esc_attr( $description ); ?>"
	data-marquee-doc-url="<?php echo esc_attr( $doc_url ); ?>"
>
	<?php if ( '' !== $icon_url ) : ?>
		<img src="<?php echo esc_url( $icon_url ); ?>" alt="" class="kt-marquee__icon" loading="lazy" />
	<?php endif; ?>
	<span class="kt-marquee__label"><?php echo esc_html( $label ); ?></span>
</button>
