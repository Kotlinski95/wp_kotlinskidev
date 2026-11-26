<?php

if (!function_exists('kotlinskidev_admin_protection_settings')) {
    function kotlinskidev_admin_protection_settings()
    {
        add_options_page(
            __('Content Protection', 'kotlinskidev'),
            __('Content Protection', 'kotlinskidev'),
            'manage_options',
            'kotlinskidev-protection',
            'kotlinskidev_protection_settings_page'
        );
    }
    add_action('admin_menu', 'kotlinskidev_admin_protection_settings');
}
