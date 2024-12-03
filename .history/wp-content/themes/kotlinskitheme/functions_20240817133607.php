<?php
// Include theme setup functions
require_once get_template_directory() . '/functions/theme-setup.php';

// Include script and style enqueue functions
require_once get_template_directory() . '/functions/enqueue-scripts.php';

// Include customizer settings and functions
require_once get_template_directory() . '/functions/customizer.php';

// Include seo customizer settings and functions
// require_once get_template_directory() . '/functions/seo-customizer.php';

// Include maintenance settings and functions
require_once get_template_directory() . '/functions/maintenance.php';


// function wp_maintenance_mode() {
//     if ( !current_user_can('edit_themes') || !is_user_logged_in() ) {
//         wp_die('<h1>Site Under Maintenance</h1><p>We are currently performing some maintenance. Please check back soon.</p>', 'Maintenance Mode');
//     }
// }
// add_action('get_header', 'wp_maintenance_mode');

// function wp_maintenance_mode() {
//     // Check if maintenance mode is enabled
//     $maintenance_mode_enabled = get_option('maintenance_mode_enabled', false);

//     // If maintenance mode is enabled and user is not logged in or does not have the correct capability
//     if ($maintenance_mode_enabled && !current_user_can('edit_themes') && !is_user_logged_in()) {
//         wp_redirect(home_url('/maintenance.php'));
//         exit;
//     }
// }
// add_action('template_redirect', 'wp_maintenance_mode');

function maintenance_redirect(){
        // Check if maintenance mode is enabled
    $maintenance_mode_enabled = get_option('maintenance_mode_enabled', false);
        // If maintenance mode is enabled and user is not logged in or does not have the correct capability
    if ($maintenance_mode_enabled && !current_user_can('edit_themes') && !is_user_logged_in()) {
        wp_redirect( site_url( 'maintenance.html' ), 503 );
        exit();
    }
}
add_action( 'init', 'maintenance_redirect' );
?>
