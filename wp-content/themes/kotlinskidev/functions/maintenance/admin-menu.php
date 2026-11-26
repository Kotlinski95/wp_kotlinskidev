<?php
function add_maintenance_mode_settings()
{
    add_options_page(
        'Maintenance Mode Settings',
        'Maintenance Mode',
        'manage_options',
        'maintenance-mode',
        'maintenance_mode_settings_page'
    );
}
add_action('admin_menu', 'add_maintenance_mode_settings');

function maintenance_mode_admin_scripts($hook)
{
    if ('settings_page_maintenance-mode' !== $hook) {
        return;
    }

    wp_enqueue_media();
}
add_action('admin_enqueue_scripts', 'maintenance_mode_admin_scripts');
