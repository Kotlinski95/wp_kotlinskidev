<?php
// Include theme setup functions
require_once get_template_directory() . '/functions/theme-setup.php';

// Include script and style enqueue functions
require_once get_template_directory() . '/functions/enqueue-scripts.php';

// Include customizer settings and functions
require_once get_template_directory() . '/functions/customizer.php';

// Include seo customizer settings and functions
// require_once get_template_directory() . '/functions/seo-customizer.php';

// Include logo functions
require_once get_template_directory() . '/functions/site-identity.php';

// Include maintenance settings and functions
require_once get_template_directory() . '/functions/maintenance.php';

// Include menu functions
require_once get_template_directory() . '/functions/menus.php';

// Load custom block patterns
require_once get_template_directory() . '/functions/patterns.php';

// Load tailwind CSS
require_once get_template_directory() . '/functions/tailwind.php';

// Load custom login page - can also be handled via plugin
// require_once get_template_directory() . '/functions/login.php';

// ======== Shortcodes ========

// Load scroll to top
require_once get_template_directory() . '/functions/scroll-top-top.php';

// Copyrights
require_once get_template_directory() . '/functions/copyrights.php';

// Language switcher
require_once get_template_directory() . '/functions/language-switcher.php';

// Theme switcher
require_once get_template_directory() . '/functions/theme-switcher.php';

// Theme switcher
require_once get_template_directory() . '/functions/navigation.php';


add_filter('nocache_headers', function ($headers) {
    unset($headers['Cache-Control']);
    $headers['Cache-Control'] = 'public, max-age=31536000';
    return $headers;
});

function kotlinskidev_load_textdomain() {

    load_theme_textdomain('kotlinskidev', get_template_directory() . '/languages');

}

add_action('after_setup_theme', 'kotlinskidev_load_textdomain');
?>