<?php
$attach_to_bottom = $attributes['attachToBottom'] ?? true;

if ( trim( $content ) === '' ) {
	return;
}

$icon_width  = is_array( $attributes['iconWidth'] ?? null ) ? $attributes['iconWidth'] : [];
$icon_height = is_array( $attributes['iconHeight'] ?? null ) ? $attributes['iconHeight'] : [];
$item_gap    = is_array( $attributes['itemGap'] ?? null ) ? $attributes['itemGap'] : [];

$sanitized_width  = [];
$sanitized_height = [];
$sanitized_gap    = [];

foreach ( [ 'desktop', 'tablet', 'mobile' ] as $device ) {
	$width = kotlinskidev_sanitize_css_length( (string) ( $icon_width[ $device ] ?? '' ) );
	if ( '' !== $width ) {
		$sanitized_width[ $device ] = $width;
	}

	$height = kotlinskidev_sanitize_css_length( (string) ( $icon_height[ $device ] ?? '' ) );
	if ( '' !== $height ) {
		$sanitized_height[ $device ] = $height;
	}

	$gap = kotlinskidev_sanitize_css_length( (string) ( $item_gap[ $device ] ?? '' ) );
	if ( '' !== $gap ) {
		$sanitized_gap[ $device ] = $gap;
	}
}

$css          = '';
$unique_class = '';

if ( $sanitized_width || $sanitized_height || $sanitized_gap ) {
	$unique_class = 'kt-social-icons-' . substr( md5( wp_json_encode( [ $sanitized_width, $sanitized_height, $sanitized_gap ] ) ), 0, 10 );

	if ( $sanitized_width || $sanitized_height ) {
		$css .= kotlinskidev_build_scoped_responsive_css(
			".{$unique_class} .social-menu-items .kt-social-item--icon a",
			[
				'width'  => $sanitized_width,
				'height' => $sanitized_height,
			]
		);
	}

	if ( $sanitized_gap ) {
		$css .= kotlinskidev_build_scoped_responsive_css(
			".{$unique_class} .social-menu-items",
			[ 'gap' => $sanitized_gap ]
		);
	}
}

$wrapper_attributes = get_block_wrapper_attributes( [
	'class' => trim( 'social-navigation social-menu-container' . ( $attach_to_bottom ? '' : ' social-menu-container--inline' ) . ( $unique_class ? " {$unique_class}" : '' ) ),
] );
?>
<nav <?php echo $wrapper_attributes; ?> aria-label="<?php esc_attr_e( 'Social media', 'kotlinskidev' ); ?>">
	<?php if ( '' !== $css ) : ?><style><?php echo $css; ?></style><?php endif; ?>
	<ul class="social-menu-items"><?php echo $content; ?></ul>
</nav>
