<?php
function kotlinskidev_theme_json_button_style_variant_names(): array {
    $theme_json = json_decode( (string) file_get_contents( get_template_directory() . '/theme.json' ), true );

    return array_keys( $theme_json['styles']['blocks']['core/button']['variations'] ?? [] );
}

function kotlinskidev_register_button_style_variants(): void {
    $gradient_outline_variants = [
        'gradient-outline',
        'gradient-outline-light',
        'gradient-outline-dark',
        'gradient-outline-adaptive',
        'gradient-outline-adaptive-contrast',
    ];

    $names = array_unique( array_merge( $gradient_outline_variants, kotlinskidev_theme_json_button_style_variant_names() ) );

    foreach ( $names as $name ) {
        register_block_style(
            'core/button',
            [
                'name'  => $name,
                'label' => ucwords( str_replace( '-', ' ', $name ) ),
            ]
        );
    }
}
add_action( 'init', 'kotlinskidev_register_button_style_variants' );
