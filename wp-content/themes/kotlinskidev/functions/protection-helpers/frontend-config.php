<?php

if (!function_exists('kotlinskidev_enqueue_protection_scripts')) {
    function kotlinskidev_enqueue_protection_scripts()
    {
        $config = array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('kotlinskidev_protection_nonce'),
            'errorText' => __('Failed to load protected content', 'kotlinskidev'),
            'themeUrl' => get_template_directory_uri(),
        );

        wp_localize_script('wp-typescript', 'kotlinskidevProtectionConfig', $config);

        add_action('wp_ajax_kotlinskidev_decrypt_content', 'kotlinskidev_set_nocache_headers', 1);
        add_action('wp_ajax_nopriv_kotlinskidev_decrypt_content', 'kotlinskidev_set_nocache_headers', 1);
    }
    add_action('wp_enqueue_scripts', 'kotlinskidev_enqueue_protection_scripts');
}

if (!function_exists('kotlinskidev_print_protection_loading_text')) {
    function kotlinskidev_print_protection_loading_text(): void
    {
        $text = __('Loading protected content...', 'kotlinskidev');
        printf(
            '<style id="kt-protected-loading-text">:root{--kt-protected-loading-text:%s}</style>' . "\n",
            wp_json_encode($text, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP)
        );
    }
    add_action('wp_head', 'kotlinskidev_print_protection_loading_text', 5);
}
