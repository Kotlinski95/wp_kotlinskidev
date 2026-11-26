<?php

if (!function_exists('kotlinskidev_ajax_regenerate_keys')) {
    function kotlinskidev_ajax_regenerate_keys()
    {
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }

        $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';
        if (!wp_verify_nonce($nonce, 'kotlinskidev_admin_nonce')) {
            wp_die('Security check failed');
        }

        $keys = kotlinskidev_generate_rsa_keys();
        if ($keys) {
            $storage_method = get_option('kotlinskidev_key_storage_method', 'database');

            if ($storage_method === 'database') {
                update_option('kotlinskidev_private_key', $keys['private_key']);
                update_option('kotlinskidev_public_key', $keys['public_key']);
            }

            wp_send_json_success('Keys regenerated successfully');
        } else {
            wp_send_json_error('Failed to generate new keys');
        }
    }
    add_action('wp_ajax_kotlinskidev_regenerate_keys', 'kotlinskidev_ajax_regenerate_keys');
}

if (!function_exists('kotlinskidev_ajax_get_wp_config_constants')) {
    function kotlinskidev_ajax_get_wp_config_constants()
    {
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }

        $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';
        if (!wp_verify_nonce($nonce, 'kotlinskidev_admin_nonce')) {
            wp_die('Security check failed');
        }

        $keys = kotlinskidev_generate_rsa_keys();
        if ($keys) {
            $constants = "// Content Protection Encryption Keys\n";
            $constants .= "// Add these constants to your wp-config.php file for secure key storage\n";
            $constants .= "define('KOTLINSKIDEV_PRIVATE_KEY', '" . addslashes($keys['private_key']) . "');\n";
            $constants .= "define('KOTLINSKIDEV_PUBLIC_KEY', '" . addslashes($keys['public_key']) . "');\n";

            wp_send_json_success($constants);
        } else {
            wp_send_json_error('Failed to generate new keys');
        }
    }
    add_action('wp_ajax_kotlinskidev_get_wp_config_constants', 'kotlinskidev_ajax_get_wp_config_constants');
}
