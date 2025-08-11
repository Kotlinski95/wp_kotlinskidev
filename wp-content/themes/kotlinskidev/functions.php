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

// Navigation
require_once get_template_directory() . '/functions/navigation.php';

// Banner carousel
require_once get_template_directory() . '/functions/banner-slider.php';

// Load search page block styles fix
require_once get_template_directory() . '/functions/search-page-styles.php';

// Hover animations
require_once get_template_directory() . '/inc/hover-animations.php';

// Dynamic footer functionality
require_once get_template_directory() . '/functions/dynamic-footer.php';

// Video poster cover block
require_once get_template_directory() . '/functions/video-poster.php';

// Cover image classes for lazy loading control
require_once get_template_directory() . '/functions/cover-image-classes.php';

// Additional theme filters
require_once get_template_directory() . '/functions/filters.php';

// Additional theme actions
require_once get_template_directory() . '/functions/actions.php';

// Article query manager for CMS control
require_once get_template_directory() . '/functions/article-query-manager.php';

// Blog topic management system
require_once get_template_directory() . '/functions/blog-topic-manager.php';

function kotlinskidev_load_textdomain()
{

    load_theme_textdomain('kotlinskidev', get_template_directory() . '/languages');
}

add_action('after_setup_theme', 'kotlinskidev_load_textdomain');