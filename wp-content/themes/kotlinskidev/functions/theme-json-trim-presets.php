<?php
add_filter( 'wp_theme_json_data_default', 'kotlinskidev_trim_default_theme_json_presets' );

function kotlinskidev_unused_default_shadow_slugs(): array {
	return (array) apply_filters( 'kotlinskidev_unused_default_shadow_slugs', array( 'deep', 'sharp', 'outlined', 'crisp' ) );
}

function kotlinskidev_trim_default_theme_json_presets( WP_Theme_JSON_Data $theme_json ): WP_Theme_JSON_Data {
	$data = $theme_json->get_data();

	foreach ( array( 'palette', 'gradients', 'duotone' ) as $color_preset ) {
		if ( isset( $data['settings']['color'][ $color_preset ] ) && is_array( $data['settings']['color'][ $color_preset ] ) ) {
			$data['settings']['color'][ $color_preset ] = array_map(
				static fn (): array => array(),
				$data['settings']['color'][ $color_preset ]
			);
		}
	}

	$shadow_presets = $data['settings']['shadow']['presets'] ?? null;
	if ( is_array( $shadow_presets ) ) {
		$unused_slugs = kotlinskidev_unused_default_shadow_slugs();

		$data['settings']['shadow']['presets'] = array_map(
			static fn ( $origin_presets ): array => is_array( $origin_presets )
				? array_values(
					array_filter(
						$origin_presets,
						static fn ( $preset ): bool => ! is_array( $preset ) || ! in_array( $preset['slug'] ?? '', $unused_slugs, true )
					)
				)
				: array(),
			$shadow_presets
		);
	}

	return $theme_json->update_with( $data );
}
