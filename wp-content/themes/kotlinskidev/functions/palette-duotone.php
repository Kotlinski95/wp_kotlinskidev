<?php

function kotlinskidev_is_valid_duotone_slug( mixed $slug ): bool {
	return is_string( $slug ) && 1 === preg_match( '/^[a-z0-9-]{1,64}$/', $slug );
}

function kotlinskidev_palette_duotones(): array {
	$defaults = [
		'duotone-primary'      => [
			'shadow'    => 'contrast',
			'highlight' => 'primary',
			'label'     => __( 'Duotone · Primary', 'kotlinskidev' ),
		],
		'duotone-primary-solid' => [
			'shadow'    => 'primary',
			'highlight' => 'primary',
			'label'     => __( 'Primary colour (solid)', 'kotlinskidev' ),
		],
		'duotone-primary-soft' => [
			'shadow'    => 'primary',
			'highlight' => 'surface',
			'label'     => __( 'Duotone · Primary soft', 'kotlinskidev' ),
		],
		'duotone-foreground'   => [
			'shadow'    => 'foreground',
			'highlight' => 'surface',
			'label'     => __( 'Duotone · Foreground', 'kotlinskidev' ),
		],
	];

	$registry = apply_filters( 'kotlinskidev_palette_duotones', $defaults );
	if ( ! is_array( $registry ) ) {
		return [];
	}

	$clean = [];
	foreach ( $registry as $slug => $preset ) {
		if ( ! kotlinskidev_is_valid_duotone_slug( $slug ) || ! is_array( $preset ) ) {
			continue;
		}
		if ( ! kotlinskidev_is_valid_duotone_slug( $preset['shadow'] ?? null ) || ! kotlinskidev_is_valid_duotone_slug( $preset['highlight'] ?? null ) ) {
			continue;
		}
		$entry = [
			'shadow'    => $preset['shadow'],
			'highlight' => $preset['highlight'],
		];
		if ( isset( $preset['label'] ) && is_string( $preset['label'] ) && '' !== $preset['label'] ) {
			$entry['label'] = $preset['label'];
		}
		$clean[ $slug ] = $entry;
	}

	return $clean;
}

function kotlinskidev_palette_duotone_labels(): array {
	$labels = [];
	foreach ( kotlinskidev_palette_duotones() as $slug => $preset ) {
		if ( isset( $preset['label'] ) ) {
			$labels[ $slug ] = $preset['label'];
		}
	}

	return $labels;
}

function kotlinskidev_palette_duotone_filter_markup( string $slug, array $preset ): string {
	$id        = esc_attr( 'kt-' . $slug );
	$highlight = esc_attr( 'flood-color:var(--wp--preset--color--' . $preset['highlight'] . ')' );
	$shadow    = esc_attr( 'flood-color:var(--wp--preset--color--' . $preset['shadow'] . ')' );

	return '<filter id="' . $id . '" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">'
		. '<feColorMatrix in="SourceGraphic" type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0" result="gray"/>'
		. '<feColorMatrix in="gray" type="matrix" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0" result="inv"/>'
		. '<feFlood style="' . $highlight . '" result="hi"/>'
		. '<feFlood style="' . $shadow . '" result="lo"/>'
		. '<feBlend in="gray" in2="hi" mode="multiply" result="a"/>'
		. '<feBlend in="inv" in2="lo" mode="multiply" result="b"/>'
		. '<feComposite in="a" in2="b" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="duo"/>'
		. '<feComposite in="duo" in2="SourceAlpha" operator="in"/>'
		. '</filter>';
}

function kotlinskidev_palette_duotone_svg(): string {
	$presets = kotlinskidev_palette_duotones();
	if ( empty( $presets ) ) {
		return '';
	}

	$filters = '';
	foreach ( $presets as $slug => $preset ) {
		$filters .= kotlinskidev_palette_duotone_filter_markup( $slug, $preset );
	}

	return '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true" focusable="false" data-kt-palette-duotones="1"><defs>' . $filters . '</defs></svg>';
}

function kotlinskidev_render_palette_duotone_svg(): void {
	echo kotlinskidev_palette_duotone_svg(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- every dynamic value is escaped with esc_attr() inside the builders
}
add_action( 'wp_body_open', 'kotlinskidev_render_palette_duotone_svg' );

function kotlinskidev_localize_palette_duotones(): void {
	wp_localize_script(
		'kotlinskidev-editor-only',
		'kotlinskidevPaletteDuotones',
		[
			'svg'    => kotlinskidev_palette_duotone_svg(),
			'labels' => kotlinskidev_palette_duotone_labels(),
		]
	);
}
add_action( 'enqueue_block_editor_assets', 'kotlinskidev_localize_palette_duotones', 20 );
