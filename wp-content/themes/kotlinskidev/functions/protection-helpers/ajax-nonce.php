<?php

if (!function_exists('kotlinskidev_set_nocache_headers')) {
    function kotlinskidev_set_nocache_headers()
    {
        if (!headers_sent()) {
            header('Cache-Control: no-cache, no-store, must-revalidate');
            header('Pragma: no-cache');
            header('Expires: 0');
        }
    }
}

if (!function_exists('kotlinskidev_get_fresh_nonce')) {
    function kotlinskidev_get_fresh_nonce()
    {
        kotlinskidev_set_nocache_headers();

        wp_send_json_success(array(
            'nonce' => wp_create_nonce('kotlinskidev_protection_nonce')
        ));
    }
    add_action('wp_ajax_kotlinskidev_get_fresh_nonce', 'kotlinskidev_get_fresh_nonce');
    add_action('wp_ajax_nopriv_kotlinskidev_get_fresh_nonce', 'kotlinskidev_get_fresh_nonce');
}
