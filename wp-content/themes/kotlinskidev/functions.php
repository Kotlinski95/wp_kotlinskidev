<?php
// Include theme setup functions
require_once get_template_directory() . '/functions/theme-setup.php';

// Cache manager — must load before any file that reads/writes transients
require_once get_template_directory() . '/functions/cache.php';

// Include internationalization functions
require_once get_template_directory() . '/includes/i18n.php';

// Register custom blocks via block.json
require_once get_template_directory() . '/functions/blocks.php';

// Text shadow style support for any block with native shadow support
require_once get_template_directory() . '/functions/text-shadow-support.php';

// Include script and style enqueue functions
require_once get_template_directory() . '/functions/enqueue-scripts.php';

// Admin bar style overrides — loaded only when the bar is visible
require_once get_template_directory() . '/functions/admin-bar-styles.php';

// Include customizer settings and functions
require_once get_template_directory() . '/functions/customizer.php';

// Include seo customizer settings and functions
// require_once get_template_directory() . '/functions/seo-customizer.php';

// Include logo functions
require_once get_template_directory() . '/functions/site-identity.php';

require_once get_template_directory() . '/functions/image-link-accessibility.php';

// Include maintenance settings and functions
require_once get_template_directory() . '/functions/maintenance.php';

// Load custom block patterns
require_once get_template_directory() . '/functions/patterns.php';

// Load responsive breakpoints helper
require_once get_template_directory() . '/functions/breakpoints.php';

// Load responsive order controls
require_once get_template_directory() . '/functions/responsive-order.php';

// Load protected content functionality
require_once get_template_directory() . '/functions/protection-helpers.php';

// Allow theme.json CSS custom properties inside gradient() values through wp_kses_post()
require_once get_template_directory() . '/functions/safe-css-gradient-vars.php';

// Load responsive display controls
require_once get_template_directory() . '/functions/responsive-display.php';

// Load responsive width controls
require_once get_template_directory() . '/functions/responsive-width.php';

// Load responsive spacing controls
require_once get_template_directory() . '/functions/responsive-spacing.php';

// Load responsive font size controls
require_once get_template_directory() . '/functions/responsive-font-size.php';

// Load contact form submission handler
require_once get_template_directory() . '/functions/contact-form.php';

// Load link hover effects controls
require_once get_template_directory() . '/functions/link-hover-effects.php';

// Load Facebook Pixel / Google Analytics tracking scripts
require_once get_template_directory() . '/functions/tracking-scripts.php';

// Load parallax frontend support
require_once get_template_directory() . '/includes/parallax-frontend.php';

// Load custom login page
require_once get_template_directory() . '/functions/login.php';

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

// Page loader
require_once get_template_directory() . '/functions/page-loader.php';


// Banner carousel
require_once get_template_directory() . '/functions/banner-slider.php';

// Load search page block styles fix
require_once get_template_directory() . '/functions/search-page-styles.php';

// Hover animations
require_once get_template_directory() . '/includes/hover-animations.php';

// Video poster cover block
require_once get_template_directory() . '/functions/video-poster.php';

// Cover video poster preload for performance optimization
require_once get_template_directory() . '/functions/cover-video-preload.php';

// Cover image classes for lazy loading control
require_once get_template_directory() . '/functions/cover-image-classes.php';

// Polylang accessibility fixes
require_once get_template_directory() . '/functions/polylang-accessibility.php';

// SVG gradient defs for icon fill effects
require_once get_template_directory() . '/functions/svg-gradient-defs.php';

// Polylang-translatable post types (wp_navigation, wp_block) and slug-based translated post resolution
require_once get_template_directory() . '/functions/polylang-content-resolution.php';

// SVG upload support and inline rendering
require_once get_template_directory() . '/functions/svg-support.php';

// Admin settings page (must load before disable-comments so the option is registered)
require_once get_template_directory() . '/functions/settings-page.php';

// Disable comments site-wide
require_once get_template_directory() . '/functions/disable-comments.php';

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