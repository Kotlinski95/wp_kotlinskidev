<?php

if (!defined('KOTLINSKIDEV_MAX_DECRYPT_BATCH_SIZE')) {
    define('KOTLINSKIDEV_MAX_DECRYPT_BATCH_SIZE', 50);
}

if (!function_exists('kotlinskidev_ajax_decrypt_content')) {
    function kotlinskidev_ajax_decrypt_content()
    {
        kotlinskidev_set_nocache_headers();

        $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';

        if (!wp_verify_nonce($nonce, 'kotlinskidev_protection_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security token expired. This may be due to page caching. Please refresh the page and try again.', 'kotlinskidev'),
                'error_code' => 'nonce_expired',
                'refresh_required' => true
            ));
        }

        $items = json_decode(wp_unslash($_POST['items'] ?? ''), true); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- decoded JSON items are sanitized per-field below (sanitize_text_field for type, decrypted content is escaped in kotlinskidev_format_decrypted_content)

        if (!is_array($items) || empty($items)) {
            wp_send_json_error(__('No content provided', 'kotlinskidev'));
        }

        if (count($items) > KOTLINSKIDEV_MAX_DECRYPT_BATCH_SIZE) {
            wp_send_json_error(__('Too many items requested', 'kotlinskidev'));
        }

        $results = array();

        foreach ($items as $key => $item) {
            $encrypted_content = trim((string) ($item['content'] ?? ''));
            $protection_type = sanitize_text_field($item['type'] ?? '');

            if (empty($encrypted_content)) {
                $results[$key] = null;
                continue;
            }

            $decrypted_content = kotlinskidev_decrypt_content($encrypted_content);

            $results[$key] = array(
                'content' => kotlinskidev_format_decrypted_content($decrypted_content, $protection_type),
                'raw_content' => $decrypted_content
            );
        }

        wp_send_json_success(array('results' => $results));
    }
    add_action('wp_ajax_kotlinskidev_decrypt_content', 'kotlinskidev_ajax_decrypt_content');
    add_action('wp_ajax_nopriv_kotlinskidev_decrypt_content', 'kotlinskidev_ajax_decrypt_content');
}
