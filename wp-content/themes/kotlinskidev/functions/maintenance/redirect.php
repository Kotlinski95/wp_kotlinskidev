<?php
function maintenance_redirect()
{
    $maintenance_mode_enabled = get_option('maintenance_mode_enabled', false);

    if ($maintenance_mode_enabled && !is_admin() && $GLOBALS['pagenow'] === 'wp-login.php') {
        return;
    }

    if (
        $maintenance_mode_enabled &&
        !current_user_can('edit_themes') &&
        !is_user_logged_in()
    ) {
        generate_maintenance_page();
        exit();
    }
}
add_action('init', 'maintenance_redirect');
