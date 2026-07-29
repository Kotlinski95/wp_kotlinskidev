<?php
$label    = ( $attributes['label'] ?? '' ) !== '' ? $attributes['label'] : __( 'Search', 'kotlinskidev' );
$panel_id = 'kt-search-modal-' . wp_unique_id();
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
		<span class="kt-search-panel__label"><?php echo esc_html( $label ); ?></span>
	</button>
	<div
		class="kt-search-panel__modal"
		id="<?php echo esc_attr( $panel_id ); ?>"
		aria-hidden="true"
		role="dialog"
		aria-label="<?php echo esc_attr( $label ); ?>"
	>
		<div class="kt-search-panel__modal-inner">
			<?php echo $content; ?>
		</div>
	</div>
	<div class="kt-search-panel__backdrop" aria-hidden="true"></div>
</div>
