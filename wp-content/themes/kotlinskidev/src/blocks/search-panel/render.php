<?php
$raw_label = $attributes['label'] ?? '';
$label     = $raw_label !== '' ? $raw_label : __( 'Search', 'kotlinskidev' );
$panel_id  = 'kt-search-modal-' . wp_unique_id();
$reveal    = kotlinskidev_nav_reveal_class_and_style( $attributes );
$staggered_content = kotlinskidev_stagger_reveal_items(
	$content,
	$attributes['navRevealAnimation'] ?? '',
	[ 'wp-block-search', 'kt-popular-pages__title', 'kt-popular-pages__item' ]
);
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'kt-search-panel' ] ); ?>>
	<button
		class="kt-search-panel__trigger"
		type="button"
		aria-label="<?php echo esc_attr( $label ); ?>"
		aria-expanded="false"
		aria-controls="<?php echo esc_attr( $panel_id ); ?>"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
			<circle cx="11" cy="11" r="8"/>
			<path d="m21 21-4.35-4.35"/>
		</svg>
		<?php if ( $raw_label !== '' ) : ?>
			<span class="kt-search-panel__label"><?php echo esc_html( $raw_label ); ?></span>
		<?php endif; ?>
	</button>
	<div
		class="kt-search-panel__modal<?php echo '' !== $reveal['class'] ? ' ' . esc_attr( $reveal['class'] ) : ''; ?>"
		id="<?php echo esc_attr( $panel_id ); ?>"
		aria-hidden="true"
		role="dialog"
		aria-label="<?php echo esc_attr( $label ); ?>"
		<?php if ( '' !== $reveal['style'] ) : ?>style="<?php echo esc_attr( $reveal['style'] ); ?>"<?php endif; ?>
	>
		<div class="kt-search-panel__modal-inner">
			<?php echo $staggered_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- derived from $content, the block's already-rendered InnerBlocks HTML from WP core's own self-escaping block render pipeline, passed through WP_HTML_Tag_Processor only ?>
		</div>
	</div>
	<div class="kt-search-panel__backdrop" aria-hidden="true"></div>
</div>
