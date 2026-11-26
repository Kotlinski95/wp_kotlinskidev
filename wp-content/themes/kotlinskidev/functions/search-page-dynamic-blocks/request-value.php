<?php
function kotlinskidev_search_request_value( string $parameter ): string {
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search filter selection, no state change
    return isset($_GET[$parameter]) ? sanitize_text_field(wp_unslash($_GET[$parameter])) : '';
}
