<?php
$kotlinskidev_button_text            = $attributes['text'] ?? '';
$kotlinskidev_button_url             = $attributes['url'] ?? '';
$kotlinskidev_button_use_inner_blocks = ! empty( $attributes['useInnerBlocks'] );

if ( ! $kotlinskidev_button_use_inner_blocks && ( $kotlinskidev_button_url === '' || $kotlinskidev_button_text === '' ) ) {
	return;
}

if ( $kotlinskidev_button_use_inner_blocks && trim( $content ?? '' ) === '' ) {
	return;
}

$kotlinskidev_button_child_provides_own_link = $kotlinskidev_button_use_inner_blocks && $kotlinskidev_button_url === '';
$kotlinskidev_button_tag                     = $kotlinskidev_button_child_provides_own_link ? 'span' : 'a';

$kotlinskidev_button_new_tab  = ! empty( $attributes['opensInNewTab'] );
$kotlinskidev_button_border_w = isset( $attributes['borderWidth'] ) ? (float) $attributes['borderWidth'] : 2;

$kotlinskidev_button_rel_tokens = array_filter( preg_split( '/\s+/', $attributes['rel'] ?? '', -1, PREG_SPLIT_NO_EMPTY ) );
if ( $kotlinskidev_button_new_tab ) {
	$kotlinskidev_button_rel_tokens[] = 'noopener';
	$kotlinskidev_button_rel_tokens[] = 'noreferrer';
}
$kotlinskidev_button_rel_tokens = array_unique( $kotlinskidev_button_rel_tokens );

$kotlinskidev_button_pick = function ( string $color, string $gradient ): string {
	return $gradient !== '' ? $gradient : $color;
};

$kotlinskidev_button_hover_text_color       = $kotlinskidev_button_pick( $attributes['hoverTextColor'] ?? '', $attributes['hoverTextGradient'] ?? '' );
$kotlinskidev_button_glow_spotlight_flat_color_only = (string) ( $attributes['hoverTextColor'] ?? '' );

$kotlinskidev_button_link_vars = [
	'--kt-btn-bg'           => $kotlinskidev_button_pick( $attributes['backgroundColor'] ?? '', $attributes['backgroundGradient'] ?? '' ),
	'--kt-btn-hover-bg'     => $kotlinskidev_button_pick( $attributes['hoverBackgroundColor'] ?? '', $attributes['hoverBackgroundGradient'] ?? '' ),
	'--kt-btn-border'       => $kotlinskidev_button_pick( $attributes['borderColor'] ?? '', $attributes['borderGradient'] ?? '' ),
	'--kt-btn-hover-border' => $kotlinskidev_button_pick( $attributes['hoverBorderColor'] ?? '', $attributes['hoverBorderGradient'] ?? '' ),
	'--kt-btn-border-width' => $kotlinskidev_button_border_w . 'px',
	'--kt-btn-hover-color'  => $kotlinskidev_button_hover_text_color,
	'--kt-glow-spotlight-color' => $kotlinskidev_button_glow_spotlight_flat_color_only,
];

$kotlinskidev_button_label_vars = [
	'--kt-btn-color'       => $kotlinskidev_button_pick( $attributes['textColor'] ?? '', $attributes['textGradient'] ?? '' ),
	'--kt-btn-hover-color' => $kotlinskidev_button_hover_text_color,
];

$kotlinskidev_button_build_style = function ( array $vars ): string {
	$style = '';
	foreach ( $vars as $name => $value ) {
		if ( $value === '' ) {
			continue;
		}
		$style .= $name . ':' . $value . ';';
	}
	return $style;
};

$kotlinskidev_button_link_style  = $kotlinskidev_button_build_style( $kotlinskidev_button_link_vars );
$kotlinskidev_button_label_style = $kotlinskidev_button_build_style( $kotlinskidev_button_label_vars );

$kotlinskidev_button_link_class = 'kt-button__link'
	. ( ! empty( $attributes['hoverEnhancedGlow'] ) ? ' has-enhanced-hover-glow' : '' )
	. ( '' !== ( $attributes['hoverTextGradient'] ?? '' ) ? ' has-kt-btn-hover-gradient' : '' );
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'kt-button' ] ); ?>>
	<<?php echo $kotlinskidev_button_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $kotlinskidev_button_tag is a fixed 'a'/'span' literal set above ?>

		class="<?php echo esc_attr( $kotlinskidev_button_link_class ); ?>"
		<?php echo 'a' === $kotlinskidev_button_tag ? 'href="' . esc_url( $kotlinskidev_button_url ) . '"' : ''; ?>
		<?php echo $kotlinskidev_button_link_style !== '' ? 'style="' . esc_attr( $kotlinskidev_button_link_style ) . '"' : ''; ?>
		<?php echo ( 'a' === $kotlinskidev_button_tag && $kotlinskidev_button_new_tab ) ? ' target="_blank"' : ''; ?>
		<?php echo ( 'a' === $kotlinskidev_button_tag && ! empty( $kotlinskidev_button_rel_tokens ) ) ? ' rel="' . esc_attr( implode( ' ', $kotlinskidev_button_rel_tokens ) ) . '"' : ''; ?>
	>
		<span
			class="kt-button__label"
			<?php echo $kotlinskidev_button_label_style !== '' ? 'style="' . esc_attr( $kotlinskidev_button_label_style ) . '"' : ''; ?>
		><?php echo $kotlinskidev_button_use_inner_blocks ? $content : wp_kses_post( $kotlinskidev_button_text ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $content is WP core's own already-rendered, self-escaping inner-blocks HTML ?></span>
	</<?php echo $kotlinskidev_button_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $kotlinskidev_button_tag is a fixed 'a'/'span' literal set above ?>>
</div>
