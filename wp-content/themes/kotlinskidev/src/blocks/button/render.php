<?php
$kotlinskidev_button_text = $attributes['text'] ?? '';
$kotlinskidev_button_url  = $attributes['url'] ?? '';

if ( $kotlinskidev_button_text === '' || $kotlinskidev_button_url === '' ) {
	return;
}

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

$kotlinskidev_button_link_vars = [
	'--kt-btn-bg'           => $kotlinskidev_button_pick( $attributes['backgroundColor'] ?? '', $attributes['backgroundGradient'] ?? '' ),
	'--kt-btn-hover-bg'     => $kotlinskidev_button_pick( $attributes['hoverBackgroundColor'] ?? '', $attributes['hoverBackgroundGradient'] ?? '' ),
	'--kt-btn-border'       => $kotlinskidev_button_pick( $attributes['borderColor'] ?? '', $attributes['borderGradient'] ?? '' ),
	'--kt-btn-hover-border' => $kotlinskidev_button_pick( $attributes['hoverBorderColor'] ?? '', $attributes['hoverBorderGradient'] ?? '' ),
	'--kt-btn-border-width' => $kotlinskidev_button_border_w . 'px',
];

$kotlinskidev_button_label_vars = [
	'--kt-btn-color'       => $kotlinskidev_button_pick( $attributes['textColor'] ?? '', $attributes['textGradient'] ?? '' ),
	'--kt-btn-hover-color' => $kotlinskidev_button_pick( $attributes['hoverTextColor'] ?? '', $attributes['hoverTextGradient'] ?? '' ),
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
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'kt-button' ] ); ?>>
	<a
		class="kt-button__link"
		href="<?php echo esc_url( $kotlinskidev_button_url ); ?>"
		<?php echo $kotlinskidev_button_link_style !== '' ? 'style="' . esc_attr( $kotlinskidev_button_link_style ) . '"' : ''; ?>
		<?php echo $kotlinskidev_button_new_tab ? ' target="_blank"' : ''; ?>
		<?php echo ! empty( $kotlinskidev_button_rel_tokens ) ? ' rel="' . esc_attr( implode( ' ', $kotlinskidev_button_rel_tokens ) ) . '"' : ''; ?>
	>
		<span
			class="kt-button__label"
			<?php echo $kotlinskidev_button_label_style !== '' ? 'style="' . esc_attr( $kotlinskidev_button_label_style ) . '"' : ''; ?>
		><?php echo wp_kses_post( $kotlinskidev_button_text ); ?></span>
	</a>
</div>
