<?php
$kotlinskidev_nav_link_label = $attributes['label'] ?? '';
$kotlinskidev_nav_link_url   = $attributes['url'] ?? '';

if ( $kotlinskidev_nav_link_label === '' || $kotlinskidev_nav_link_url === '' ) {
	return;
}

$kotlinskidev_nav_link_opens_new_tab = ! empty( $attributes['opensInNewTab'] );
$kotlinskidev_nav_link_description   = $attributes['description'] ?? '';
$kotlinskidev_nav_link_color         = $attributes['textColor'] ?? '';
$kotlinskidev_nav_link_gradient      = $attributes['textGradient'] ?? '';
$kotlinskidev_nav_link_text_style    = '';

$kotlinskidev_nav_link_rel_tokens = array_filter( preg_split( '/\s+/', $attributes['rel'] ?? '', -1, PREG_SPLIT_NO_EMPTY ) );
if ( $kotlinskidev_nav_link_opens_new_tab ) {
	$kotlinskidev_nav_link_rel_tokens[] = 'noopener';
	$kotlinskidev_nav_link_rel_tokens[] = 'noreferrer';
}
$kotlinskidev_nav_link_rel_tokens = array_unique( $kotlinskidev_nav_link_rel_tokens );

$kotlinskidev_nav_link_is_placeholder = $kotlinskidev_nav_link_url === '#';

$kotlinskidev_nav_link_attrs = [ 'class' => 'kt-nav-link' ];
if ( ! empty( $kotlinskidev_nav_link_rel_tokens ) ) {
	$kotlinskidev_nav_link_attrs['rel'] = implode( ' ', $kotlinskidev_nav_link_rel_tokens );
}
if ( $kotlinskidev_nav_link_is_placeholder ) {
	$kotlinskidev_nav_link_attrs['style']         = 'pointer-events:none';
	$kotlinskidev_nav_link_attrs['aria-disabled'] = 'true';
	$kotlinskidev_nav_link_attrs['tabindex']      = '-1';
}

if ( $kotlinskidev_nav_link_gradient !== '' ) {
	$kotlinskidev_nav_link_text_style = 'background-image:' . $kotlinskidev_nav_link_gradient . ';background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:transparent';
} elseif ( $kotlinskidev_nav_link_color !== '' ) {
	$kotlinskidev_nav_link_text_style = 'color:' . $kotlinskidev_nav_link_color;
}

$kotlinskidev_nav_link_label_html = $kotlinskidev_nav_link_text_style !== ''
	? '<span style="' . esc_attr( $kotlinskidev_nav_link_text_style ) . '">' . wp_kses_post( $kotlinskidev_nav_link_label ) . '</span>'
	: wp_kses_post( $kotlinskidev_nav_link_label );

$kotlinskidev_nav_link_description_html = $kotlinskidev_nav_link_description !== ''
	? '<span class="wp-block-navigation-item__description">' . esc_html( $kotlinskidev_nav_link_description ) . '</span>'
	: '';
?>
<a <?php echo get_block_wrapper_attributes( $kotlinskidev_nav_link_attrs ); ?> href="<?php echo esc_url( $kotlinskidev_nav_link_url ); ?>"<?php echo $kotlinskidev_nav_link_opens_new_tab ? ' target="_blank"' : ''; ?>><?php echo $kotlinskidev_nav_link_label_html . $kotlinskidev_nav_link_description_html; ?></a>
