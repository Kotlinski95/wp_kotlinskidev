<?php
add_action( 'wp_head', 'kotlinskidev_print_responsive_styles', 2 );

function kotlinskidev_responsive_style_registry( string $class = '', string $css = '', bool $mark_printed = false ): array
{
    static $pending = [];
    static $printed = [];

    if ( '' !== $class && ! isset( $pending[ $class ] ) && ! isset( $printed[ $class ] ) ) {
        $pending[ $class ] = $css;
    }

    $snapshot = [
        'pending' => $pending,
        'printed' => $printed,
    ];

    if ( $mark_printed ) {
        $printed = $printed + $pending;
        $pending = [];
    }

    return $snapshot;
}

function kotlinskidev_append_responsive_style( string $html, string $class, string $css ): string
{
    if ( kotlinskidev_is_front_end_render() && ! did_action( 'wp_head' ) ) {
        kotlinskidev_responsive_style_registry( $class, $css );

        return $html;
    }

    $registry = kotlinskidev_responsive_style_registry();
    if ( isset( $registry['printed'][ $class ] ) ) {
        return $html;
    }

    return $html . '<style>' . $css . '</style>';
}

function kotlinskidev_print_responsive_styles(): void
{
    $registry = kotlinskidev_responsive_style_registry( '', '', true );
    if ( empty( $registry['pending'] ) ) {
        return;
    }

    echo '<style id="kt-responsive-styles">' . implode( '', $registry['pending'] ) . '</style>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CSS built from regex-validated lengths in kotlinskidev_collect_responsive_*()
}
