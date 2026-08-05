<?php
if ( ! function_exists( 'pll_the_languages' ) ) {
	return;
}

$kotlinskidev_current_language = kotlinskidev_pll_current_language_data();

if ( $kotlinskidev_current_language === null ) {
	return;
}

$kotlinskidev_lang_label = $attributes['label'] ?? '';
if ( $kotlinskidev_lang_label === '' ) {
	$kotlinskidev_lang_label = ( $attributes['labelStyle'] ?? 'short' ) === 'full'
		? (string) ( $kotlinskidev_current_language['name'] ?? '' )
		: strtoupper( (string) ( $kotlinskidev_current_language['slug'] ?? '' ) );
}
if ( $kotlinskidev_lang_label === '' ) {
	$kotlinskidev_lang_label = __( 'Language', 'kotlinskidev' );
}

$kotlinskidev_lang_flag = ( $attributes['showFlag'] ?? true )
	? (string) ( $kotlinskidev_current_language['flag'] ?? '' )
	: '';

$kotlinskidev_lang_panel_id = 'kt-lang-modal-' . wp_unique_id();

$kotlinskidev_show_indicator   = $attributes['showIndicator'] ?? true;
$kotlinskidev_indicator_effect = $attributes['indicatorEffect'] ?? 'rotate';
$kotlinskidev_indicator_svg    = function_exists( 'kotlinskidev_inline_nav_icon' )
	? kotlinskidev_inline_nav_icon( (int) ( $attributes['indicatorIconId'] ?? 0 ) )
	: '';
$kotlinskidev_indicator_class  = 'kt-lang-panel__indicator';
if ( $kotlinskidev_indicator_effect !== 'none' ) {
	$kotlinskidev_indicator_class .= ' kt-lang-panel__indicator--' . sanitize_html_class( $kotlinskidev_indicator_effect );
}
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'kt-lang-panel' ] ); ?>>
	<button
		class="kt-lang-panel__trigger"
		type="button"
		aria-label="<?php echo esc_attr( sprintf( __( 'Select language, current: %s', 'kotlinskidev' ), $kotlinskidev_lang_label ) ); ?>"
		aria-expanded="false"
		aria-controls="<?php echo esc_attr( $kotlinskidev_lang_panel_id ); ?>"
	>
		<?php if ( $kotlinskidev_lang_flag !== '' ) : ?>
		<img class="kt-lang-panel__flag" src="<?php echo esc_url( $kotlinskidev_lang_flag ); ?>" alt="" width="20" height="15" />
		<?php endif; ?>
		<span class="kt-lang-panel__label"><?php echo esc_html( $kotlinskidev_lang_label ); ?></span>
		<?php if ( $kotlinskidev_show_indicator ) : ?>
		<span class="<?php echo esc_attr( $kotlinskidev_indicator_class ); ?>" aria-hidden="true">
			<?php echo $kotlinskidev_indicator_svg !== '' ? $kotlinskidev_indicator_svg : '<svg class="kt-indicator-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $kotlinskidev_indicator_svg is sanitized via kotlinskidev_load_svg_content()/kotlinskidev_sanitize_svg(); fallback branch is a static SVG literal ?>
		</span>
		<?php endif; ?>
	</button>
	<div
		class="kt-lang-panel__modal"
		id="<?php echo esc_attr( $kotlinskidev_lang_panel_id ); ?>"
		aria-hidden="true"
		role="dialog"
		aria-label="<?php echo esc_attr__( 'Language selection', 'kotlinskidev' ); ?>"
	>
		<div class="kt-lang-panel__modal-inner">
			<ul class="kt-lang-panel__list" role="list">
				<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is the block's already-rendered InnerBlocks HTML from WP core's own self-escaping block render pipeline ?>
			</ul>
		</div>
	</div>
	<div class="kt-lang-panel__backdrop" aria-hidden="true"></div>
</div>
