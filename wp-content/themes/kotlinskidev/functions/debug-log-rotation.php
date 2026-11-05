<?php
function kotlinskidev_debug_log_path(): string {
    return WP_CONTENT_DIR . '/debug.log';
}

function kotlinskidev_maybe_rotate_debug_log(): void {
    if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
        return;
    }

    if ( get_transient( 'kotlinskidev_debug_log_rotation_checked' ) ) {
        return;
    }
    set_transient( 'kotlinskidev_debug_log_rotation_checked', true, 5 * MINUTE_IN_SECONDS );

    $log_path = kotlinskidev_debug_log_path();
    if ( ! file_exists( $log_path ) || ! is_writable( $log_path ) ) {
        return;
    }

    if ( filesize( $log_path ) <= 5 * MB_IN_BYTES ) {
        return;
    }

    file_put_contents( $log_path, '' );
}
add_action( 'init', 'kotlinskidev_maybe_rotate_debug_log' );
