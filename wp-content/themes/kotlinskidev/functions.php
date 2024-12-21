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

require_once get_template_directory() . '/functions/language-switcher.php';

// Load custom block patterns
require_once get_template_directory() . '/functions/patterns.php';

// Load tailwind CSS
require_once get_template_directory() . '/functions/tailwind.php';

add_filter('nocache_headers', function ($headers) {
    unset($headers['Cache-Control']);
    $headers['Cache-Control'] = 'public, max-age=31536000';
    return $headers;
});

function get_localized_url($path)
{
    $lang_param = get_query_var('lang'); // Get the current 'lang' query variable.
    $base_url = home_url($path); // Construct the base URL with the provided path.

    // Add 'lang' parameter if it exists in the current URL.
    if (!empty($lang_param)) {
        return esc_url(add_query_arg('lang', $lang_param, $base_url));
    }

    // Return the plain URL if 'lang' does not exist.
    return esc_url($base_url);
}

?>