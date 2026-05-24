<?php
// Include theme setup functions
require_once get_template_directory() . '/functions/theme-setup.php';

// Cache manager — must load before any file that reads/writes transients
require_once get_template_directory() . '/functions/cache.php';

// Include internationalization functions
require_once get_template_directory() . '/includes/i18n.php';

// Register custom blocks via block.json
require_once get_template_directory() . '/functions/blocks.php';

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

// Load responsive breakpoints helper
require_once get_template_directory() . '/functions/breakpoints.php';

// Load responsive order controls
require_once get_template_directory() . '/functions/responsive-order.php';

// Load protected content functionality
require_once get_template_directory() . '/functions/protection-helpers.php';

// Load responsive display controls
require_once get_template_directory() . '/functions/responsive-display.php';

// Load parallax frontend support
require_once get_template_directory() . '/includes/parallax-frontend.php';

// Load tailwind CSS
require_once get_template_directory() . '/functions/tailwind.php';

// Load custom login page - can also be handled via plugin
// require_once get_template_directory() . '/functions/login.php';

// ======== Shortcodes ========

// Load scroll to top
require_once get_template_directory() . '/functions/scroll-top-top.php';

// (i18n already loaded above)

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
require_once get_template_directory() . '/includes/hover-animations.php';

// Dynamic footer functionality
require_once get_template_directory() . '/functions/dynamic-footer.php';

// Video poster cover block
require_once get_template_directory() . '/functions/video-poster.php';

// Cover video poster preload for performance optimization
require_once get_template_directory() . '/functions/cover-video-preload.php';

// Cover image classes for lazy loading control
require_once get_template_directory() . '/functions/cover-image-classes.php';

// Polylang accessibility fixes
require_once get_template_directory() . '/functions/polylang-accessibility.php';

// Additional theme filters
require_once get_template_directory() . '/functions/filters.php';

// Additional theme actions
require_once get_template_directory() . '/functions/actions.php';

// Article query manager for CMS control
require_once get_template_directory() . '/functions/article-query-manager.php';

// Blog topic management system
require_once get_template_directory() . '/functions/blog-topic-manager.php';

// Include page view tracking functionality
require_once get_template_directory() . '/functions/page-view-tracking.php';

function kotlinskidev_load_textdomain()
{

    load_theme_textdomain('kotlinskidev', get_template_directory() . '/languages');
}

add_action('after_setup_theme', 'kotlinskidev_load_textdomain');