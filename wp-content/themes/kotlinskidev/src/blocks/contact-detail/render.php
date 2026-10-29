<?php
$kotlinskidev_contact_detail_allowed_fields = [ 'address', 'phone', 'email', 'hours' ];
$kotlinskidev_contact_detail_field          = $attributes['field'] ?? 'email';
if ( ! in_array( $kotlinskidev_contact_detail_field, $kotlinskidev_contact_detail_allowed_fields, true ) ) {
	$kotlinskidev_contact_detail_field = 'email';
}

$kotlinskidev_contact_detail_info  = kotlinskidev_get_contact_info();
$kotlinskidev_contact_detail_value = $kotlinskidev_contact_detail_info[ $kotlinskidev_contact_detail_field ];

if ( '' === $kotlinskidev_contact_detail_value ) {
	return;
}

$kotlinskidev_contact_detail_labels = [
	'address' => __( 'Address', 'kotlinskidev' ),
	'phone'   => __( 'Phone', 'kotlinskidev' ),
	'email'   => __( 'Email', 'kotlinskidev' ),
	'hours'   => __( 'Hours', 'kotlinskidev' ),
];

$kotlinskidev_contact_detail_is_protected = in_array( $kotlinskidev_contact_detail_field, [ 'phone', 'email' ], true );
?>
<span <?php echo get_block_wrapper_attributes(); ?>>
	<?php if ( ! empty( $attributes['showLabel'] ) ) : ?>
	<span class="kt-contact-detail__label"><?php echo esc_html( $kotlinskidev_contact_detail_labels[ $kotlinskidev_contact_detail_field ] ); ?>: </span>
	<?php endif; ?>
	<?php if ( $kotlinskidev_contact_detail_is_protected ) : ?>
		<?php echo kotlinskidev_render_protected_contact_field( $kotlinskidev_contact_detail_value, $kotlinskidev_contact_detail_field ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_protected_contact_field() esc_attr()'s both the encrypted payload and the type ?>
	<?php else : ?>
		<?php echo esc_html( $kotlinskidev_contact_detail_value ); ?>
	<?php endif; ?>
</span>
