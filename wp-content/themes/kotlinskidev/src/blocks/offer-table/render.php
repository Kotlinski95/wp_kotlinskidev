<?php
if ( ! function_exists( 'kotlinskidev_offer_get' ) || ! function_exists( 'kotlinskidev_offer_format' ) ) {
	return;
}

$kotlinskidev_offer_table_key = sanitize_key( (string) ( $attributes['offerKey'] ?? '' ) );
if ( '' === $kotlinskidev_offer_table_key ) {
	return;
}

$kotlinskidev_offer_table_lang = function_exists( 'pll_current_language' ) ? (string) pll_current_language() : substr( get_locale(), 0, 2 );
$kotlinskidev_offer_table_data = kotlinskidev_offer_get( $kotlinskidev_offer_table_key, $kotlinskidev_offer_table_lang );

if ( ! is_array( $kotlinskidev_offer_table_data ) || empty( $kotlinskidev_offer_table_data['variants'] ) ) {
	return;
}

$kotlinskidev_offer_table_currency = (string) ( $kotlinskidev_offer_table_data['currency'] ?? '' );
$kotlinskidev_offer_table_show_all = is_user_logged_in() && current_user_can( 'edit_posts' );
$kotlinskidev_offer_table_hidden   = ! empty( $kotlinskidev_offer_table_data['is_placeholder'] ) && ! $kotlinskidev_offer_table_show_all;
$kotlinskidev_offer_table_rows     = [];

foreach ( $kotlinskidev_offer_table_data['variants'] as $kotlinskidev_offer_table_variant ) {
	if ( ! is_array( $kotlinskidev_offer_table_variant ) ) {
		continue;
	}
	$kotlinskidev_offer_table_rows[] = [
		'label'    => kotlinskidev_offer_format( $kotlinskidev_offer_table_variant, 'label', $kotlinskidev_offer_table_currency ),
		'price'    => $kotlinskidev_offer_table_hidden ? __( 'Price on request', 'kotlinskidev' ) : kotlinskidev_offer_format( $kotlinskidev_offer_table_variant, 'price', $kotlinskidev_offer_table_currency ),
		'duration' => $kotlinskidev_offer_table_hidden ? __( 'Timeline agreed individually', 'kotlinskidev' ) : kotlinskidev_offer_format( $kotlinskidev_offer_table_variant, 'duration', $kotlinskidev_offer_table_currency ),
		'included' => kotlinskidev_offer_format( $kotlinskidev_offer_table_variant, 'included', $kotlinskidev_offer_table_currency ),
	];
}

if ( empty( $kotlinskidev_offer_table_rows ) ) {
	return;
}

$kotlinskidev_offer_table_placeholder = ! empty( $kotlinskidev_offer_table_data['is_placeholder'] );
$kotlinskidev_offer_table_price_class = ( $kotlinskidev_offer_table_placeholder && $kotlinskidev_offer_table_show_all ) ? ' kt-offer--placeholder' : '';
$kotlinskidev_offer_table_wrapper     = get_block_wrapper_attributes( [ 'class' => 'wp-block-table' ] );

$kotlinskidev_offer_table_has_included = '' !== implode( '', array_column( $kotlinskidev_offer_table_rows, 'included' ) );
?>
<figure <?php echo $kotlinskidev_offer_table_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() self-escapes ?>>
	<table class="has-fixed-layout kt-offer-table">
		<thead>
			<tr>
				<th scope="col"><?php esc_html_e( 'Package', 'kotlinskidev' ); ?></th>
				<th scope="col"><?php esc_html_e( 'Price', 'kotlinskidev' ); ?></th>
				<th scope="col"><?php esc_html_e( 'Timeline', 'kotlinskidev' ); ?></th>
				<?php if ( $kotlinskidev_offer_table_has_included ) : ?>
					<th scope="col"><?php esc_html_e( 'Included', 'kotlinskidev' ); ?></th>
				<?php endif; ?>
			</tr>
		</thead>
		<tbody>
			<?php foreach ( $kotlinskidev_offer_table_rows as $kotlinskidev_offer_table_row ) : ?>
				<tr>
					<th scope="row"><?php echo esc_html( $kotlinskidev_offer_table_row['label'] ); ?></th>
					<td><span class="kt-offer<?php echo esc_attr( $kotlinskidev_offer_table_price_class ); ?>"><?php echo esc_html( $kotlinskidev_offer_table_row['price'] ); ?></span></td>
					<td><?php echo esc_html( $kotlinskidev_offer_table_row['duration'] ); ?></td>
					<?php if ( $kotlinskidev_offer_table_has_included ) : ?>
						<td><?php echo esc_html( $kotlinskidev_offer_table_row['included'] ); ?></td>
					<?php endif; ?>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</figure>
