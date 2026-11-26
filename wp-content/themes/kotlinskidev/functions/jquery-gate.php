<?php
const KOTLINSKIDEV_JQUERY_HANDLES = array( 'jquery', 'jquery-core', 'jquery-migrate' );

function kotlinskidev_script_requires_handle( object $scripts, string $handle, string $required, array $visited = array() ): bool
{
    if ( isset( $visited[ $handle ] ) || ! isset( $scripts->registered[ $handle ] ) ) {
        return false;
    }

    $visited[ $handle ] = true;

    foreach ( (array) $scripts->registered[ $handle ]->deps as $dependency ) {
        if ( $dependency === $required || kotlinskidev_script_requires_handle( $scripts, $dependency, $required, $visited ) ) {
            return true;
        }
    }

    return false;
}

function kotlinskidev_queued_handles_requiring( object $scripts, string $required, array $skipped_handles = array() ): array
{
    $dependents = array();

    foreach ( (array) $scripts->queue as $handle ) {
        if ( in_array( $handle, KOTLINSKIDEV_JQUERY_HANDLES, true ) ) {
            continue;
        }

        if ( kotlinskidev_script_requires_handle( $scripts, $handle, $required, array_fill_keys( $skipped_handles, true ) ) ) {
            $dependents[] = $handle;
        }
    }

    return $dependents;
}

function kotlinskidev_get_jquery_dependents( ?object $scripts = null ): array
{
    $scripts ??= wp_scripts();

    return array_values( (array) apply_filters( 'kotlinskidev_jquery_dependents', kotlinskidev_queued_handles_requiring( $scripts, 'jquery' ) ) );
}

function kotlinskidev_is_jquery_gate_exempt_request(): bool
{
    return is_admin() || is_customize_preview() || current_user_can( 'manage_options' );
}

function kotlinskidev_drop_unneeded_jquery_migrate( object $scripts ): void
{
    if ( ! isset( $scripts->registered['jquery'] ) || array() !== kotlinskidev_queued_handles_requiring( $scripts, 'jquery-migrate', array( 'jquery' ) ) ) {
        return;
    }

    $scripts->registered['jquery']->deps = array_values( array_diff( (array) $scripts->registered['jquery']->deps, array( 'jquery-migrate' ) ) );
}

function kotlinskidev_gate_jquery(): void
{
    if ( kotlinskidev_is_jquery_gate_exempt_request() ) {
        return;
    }

    if ( array() === kotlinskidev_get_jquery_dependents() ) {
        wp_deregister_script( 'jquery' );
        return;
    }

    kotlinskidev_drop_unneeded_jquery_migrate( wp_scripts() );
}
add_action( 'wp_enqueue_scripts', 'kotlinskidev_gate_jquery', 999 );
add_action( 'wp_print_scripts', 'kotlinskidev_gate_jquery', 1 );
