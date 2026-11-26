<?php

if (!function_exists('kotlinskidev_save_protection_settings_from_request')) {
    function kotlinskidev_save_protection_settings_from_request()
    {
        if (!isset($_POST['submit'])) {
            return;
        }

        if (!isset($_POST['kotlinskidev_protection_settings_nonce']) ||
            !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['kotlinskidev_protection_settings_nonce'])), 'kotlinskidev_protection_settings_action')) {
            wp_die(esc_html__('Security check failed', 'kotlinskidev'));
        }

        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to change these settings', 'kotlinskidev'));
        }

        update_option('kotlinskidev_auto_protect_emails', isset($_POST['auto_protect_emails']));
        update_option('kotlinskidev_auto_protect_phones', isset($_POST['auto_protect_phones']));
        update_option('kotlinskidev_key_storage_method', isset($_POST['key_storage_method']) ? sanitize_text_field(wp_unslash($_POST['key_storage_method'])) : 'database');
        echo '<div class="notice notice-success"><p>' . esc_html__('Settings saved!', 'kotlinskidev') . '</p></div>';
    }
}

if (!function_exists('kotlinskidev_protection_settings_page')) {
    function kotlinskidev_protection_settings_page()
    {
        kotlinskidev_save_protection_settings_from_request();

        $auto_protect_emails = get_option('kotlinskidev_auto_protect_emails', false);
        $auto_protect_phones = get_option('kotlinskidev_auto_protect_phones', false);
        $key_storage_method = get_option('kotlinskidev_key_storage_method', 'database');
        $keys = kotlinskidev_get_or_create_keys();
        $keys_exist = !empty($keys['private_key']) && !empty($keys['public_key']);
        $using_wp_config = defined('KOTLINSKIDEV_PRIVATE_KEY') && defined('KOTLINSKIDEV_PUBLIC_KEY');
        $needs_wp_config_setup = $key_storage_method === 'wp_config' && !$using_wp_config;
?>
        <div class="wrap">
            <h1><?php esc_html_e('Content Protection Settings', 'kotlinskidev'); ?></h1>

            <form method="post" action="">
                <?php wp_nonce_field('kotlinskidev_protection_settings_action', 'kotlinskidev_protection_settings_nonce'); ?>
                <?php kotlinskidev_render_protection_auto_protect_fields($auto_protect_emails, $auto_protect_phones); ?>
                <?php kotlinskidev_render_protection_encryption_fields($keys_exist, $using_wp_config, $key_storage_method); ?>

                <?php submit_button(); ?>
            </form>

            <?php if ($needs_wp_config_setup): ?>
                <?php kotlinskidev_render_protection_wp_config_notice(); ?>
            <?php endif; ?>

            <?php kotlinskidev_render_protection_settings_script($needs_wp_config_setup); ?>

            <?php kotlinskidev_render_protection_usage_examples(); ?>
        </div>
<?php
    }
}
