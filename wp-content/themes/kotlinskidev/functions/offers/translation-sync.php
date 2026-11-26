<?php
function kotlinskidev_offer_copy_post_metas( array $keys ): array {
	$keys = array_diff( $keys, [ 'variants', 'currency', 'is_placeholder' ] );
	if ( ! in_array( 'offer_key', $keys, true ) ) {
		$keys[] = 'offer_key';
	}
	return array_values( $keys );
}
add_filter( 'pll_copy_post_metas', 'kotlinskidev_offer_copy_post_metas' );
