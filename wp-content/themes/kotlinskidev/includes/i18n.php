<?php
/**
 * Internationalization (i18n) Manager
 * Handles all theme translations and localization for JavaScript
 * 
 * This file manages all translatable strings for the kotlinskidev theme,
 * making them available to both PHP and JavaScript contexts.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Theme text domain constant
 */
define('KOTLINSKIDEV_TEXT_DOMAIN', 'kotlinskidev');

/**
 * Initialize i18n functionality
 */
function kotlinskidev_i18n_init() {
    add_action('after_setup_theme', 'kotlinskidev_load_theme_textdomain');
    add_action('wp_enqueue_scripts', 'kotlinskidev_localize_scripts', 999); // Run with very late priority to ensure locale is loaded
}

/**
 * Load theme text domain for translations
 */
function kotlinskidev_load_theme_textdomain() {
    // Force load with current locale
    $locale = determine_locale();
    load_theme_textdomain(
        KOTLINSKIDEV_TEXT_DOMAIN,
        get_template_directory() . '/languages'
    );
    
    // Debug: Log what locale we're trying to load
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('KotlinskiDev: Loading textdomain for locale: ' . $locale);
        error_log('KotlinskiDev: Textdomain loaded: ' . (is_textdomain_loaded(KOTLINSKIDEV_TEXT_DOMAIN) ? 'YES' : 'NO'));
    }
}

/**
 * Localize scripts with translations
 */
function kotlinskidev_localize_scripts() {
    
    // Ensure textdomain is loaded before localizing
    if (!is_textdomain_loaded(KOTLINSKIDEV_TEXT_DOMAIN)) {
        kotlinskidev_load_theme_textdomain();
    }
    
    // Get the actual script handles from your theme
    $script_handles = [
        'wp-typescript',
        'kotlinskidev-banner-carousel',
        'kotlinskidev-main', // Keep as fallback
        'theme-scripts',     // Keep as fallback
        'main-js'           // Keep as fallback
    ];
    
    $localized = false;
    foreach ($script_handles as $handle) {
        if (wp_script_is($handle, 'enqueued') || wp_script_is($handle, 'registered')) {
            $translations = kotlinskidev_get_all_translations();
            wp_localize_script($handle, 'i18n', $translations);
            $localized = true;
            
            // Debug: Log what translations are being sent to JavaScript
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('KotlinskiDev i18n: Localized to script handle: ' . $handle);
                error_log('KotlinskiDev i18n: Sample translation - "Toggle navigation menu": ' . $translations['navigation']['menu']['toggle']);
                error_log('KotlinskiDev i18n: Sample translation - "This field is required.": ' . $translations['forms']['validation']['required']);
            }
            
            break; // Only localize once
        }
    }
    
    // Debug: Log current locale to help troubleshooting
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('KotlinskiDev i18n: Current locale is ' . get_locale());
    }
}

/**
 * Get all translations for JavaScript
 * 
 * @return array All translation groups
 */
function kotlinskidev_get_all_translations() {
    return [
        'navigation' => kotlinskidev_get_navigation_translations(),
        'forms' => kotlinskidev_get_form_translations(),
        'general' => kotlinskidev_get_general_translations(),
        'accessibility' => kotlinskidev_get_accessibility_translations(),
        'cookieConsent' => kotlinskidev_get_cookie_consent_translations(),
        'lightbox' => kotlinskidev_get_lightbox_translations(),
        'scrollAnimations' => kotlinskidev_get_scroll_animations_translations(),
        'themeSwitcher' => kotlinskidev_get_theme_switcher_translations(),
    ];
}

/**
 * Navigation translations
 * 
 * @return array Navigation translations
 */
function kotlinskidev_get_navigation_translations() {
    return [
        'menu' => [
            'toggle' => __('Toggle navigation menu', KOTLINSKIDEV_TEXT_DOMAIN),
            'close' => __('Close menu', KOTLINSKIDEV_TEXT_DOMAIN),
            'open' => __('Open menu', KOTLINSKIDEV_TEXT_DOMAIN),
        ],
        'breadcrumbs' => [
            'home' => __('Home', KOTLINSKIDEV_TEXT_DOMAIN),
            'you_are_here' => __('You are here:', KOTLINSKIDEV_TEXT_DOMAIN),
        ],
        'pagination' => [
            'prev' => __('Previous', KOTLINSKIDEV_TEXT_DOMAIN),
            'next' => __('Next', KOTLINSKIDEV_TEXT_DOMAIN),
            'page' => __('Page', KOTLINSKIDEV_TEXT_DOMAIN),
            'of' => __('of', KOTLINSKIDEV_TEXT_DOMAIN),
        ]
    ];
}

/**
 * Form translations
 * 
 * @return array Form translations
 */
function kotlinskidev_get_form_translations() {
    return [
        'validation' => [
            'required' => __('This field is required.', KOTLINSKIDEV_TEXT_DOMAIN),
            'email_invalid' => __('Please enter a valid email address.', KOTLINSKIDEV_TEXT_DOMAIN),
            'min_length' => __('Minimum length is %d characters.', KOTLINSKIDEV_TEXT_DOMAIN),
            'max_length' => __('Maximum length is %d characters.', KOTLINSKIDEV_TEXT_DOMAIN),
        ],
        'messages' => [
            'sending' => __('Sending...', KOTLINSKIDEV_TEXT_DOMAIN),
            'success' => __('Message sent successfully!', KOTLINSKIDEV_TEXT_DOMAIN),
            'error' => __('An error occurred. Please try again.', KOTLINSKIDEV_TEXT_DOMAIN),
        ],
        'buttons' => [
            'submit' => __('Submit', KOTLINSKIDEV_TEXT_DOMAIN),
            'send' => __('Send', KOTLINSKIDEV_TEXT_DOMAIN),
            'cancel' => __('Cancel', KOTLINSKIDEV_TEXT_DOMAIN),
            'save' => __('Save', KOTLINSKIDEV_TEXT_DOMAIN),
        ]
    ];
}

/**
 * General UI translations
 * 
 * @return array General translations
 */
function kotlinskidev_get_general_translations() {
    return [
        'loading' => __('Loading...', KOTLINSKIDEV_TEXT_DOMAIN),
        'error' => __('Error', KOTLINSKIDEV_TEXT_DOMAIN),
        'success' => __('Success', KOTLINSKIDEV_TEXT_DOMAIN),
        'warning' => __('Warning', KOTLINSKIDEV_TEXT_DOMAIN),
        'info' => __('Information', KOTLINSKIDEV_TEXT_DOMAIN),
        'close' => __('Close', KOTLINSKIDEV_TEXT_DOMAIN),
        'read_more' => __('Read more', KOTLINSKIDEV_TEXT_DOMAIN),
        'read_less' => __('Read less', KOTLINSKIDEV_TEXT_DOMAIN),
        'show_more' => __('Show more', KOTLINSKIDEV_TEXT_DOMAIN),
        'show_less' => __('Show less', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

/**
 * Accessibility translations
 * 
 * @return array Accessibility translations
 */
function kotlinskidev_get_accessibility_translations() {
    return [
        'skip_to_content' => __('Skip to main content', KOTLINSKIDEV_TEXT_DOMAIN),
        'scroll_to_top' => __('Scroll to top', KOTLINSKIDEV_TEXT_DOMAIN),
        'external_link' => __('External link', KOTLINSKIDEV_TEXT_DOMAIN),
        'new_window' => __('Opens in new window', KOTLINSKIDEV_TEXT_DOMAIN),
        'download' => __('Download file', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

/**
 * Cookie Consent translations
 * 
 * @return array Cookie consent translations
 */
function kotlinskidev_get_cookie_consent_translations() {
    return [
        'message' => __('This website uses cookies to ensure you get the best experience on our website.', KOTLINSKIDEV_TEXT_DOMAIN),
        'accept' => __('Accept', KOTLINSKIDEV_TEXT_DOMAIN),
        'decline' => __('Decline', KOTLINSKIDEV_TEXT_DOMAIN),
        'learn_more' => __('Learn more', KOTLINSKIDEV_TEXT_DOMAIN),
        'settings' => __('Cookie Settings', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

/**
 * Lightbox translations
 * 
 * @return array Lightbox translations
 */
function kotlinskidev_get_lightbox_translations() {
    return [
        'close' => __('Close lightbox', KOTLINSKIDEV_TEXT_DOMAIN),
        'next' => __('Next image', KOTLINSKIDEV_TEXT_DOMAIN),
        'prev' => __('Previous image', KOTLINSKIDEV_TEXT_DOMAIN),
        'loading' => __('Loading image...', KOTLINSKIDEV_TEXT_DOMAIN),
        'counter' => __('%1$d of %2$d', KOTLINSKIDEV_TEXT_DOMAIN), // "1 of 5"
    ];
}

/**
 * Scroll Animations translations
 * 
 * @return array Scroll animations translations
 */
function kotlinskidev_get_scroll_animations_translations() {
    return [
        'reveal' => __('Content revealed', KOTLINSKIDEV_TEXT_DOMAIN),
        'animated' => __('Animation triggered', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

/**
 * Theme Switcher translations
 * 
 * @return array Theme switcher translations
 */
function kotlinskidev_get_theme_switcher_translations() {
    return [
        'lightMode' => __('Switch between dark and light mode (currently light mode)', KOTLINSKIDEV_TEXT_DOMAIN),
        'darkMode' => __('Switch between dark and light mode (currently dark mode)', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

/**
 * Get specific translation group
 * 
 * @param string $group Translation group name
 * @return array|null Translation group or null if not found
 */
function kotlinskidev_get_translations_group($group) {
    $function_name = 'kotlinskidev_get_' . $group . '_translations';
    if (function_exists($function_name)) {
        return $function_name();
    }
    return null;
}

/**
 * Get a specific translation string
 * 
 * @param string $group Translation group
 * @param string $key Translation key (supports dot notation)
 * @param mixed $default Default value if not found
 * @return mixed Translation string or default
 */
function kotlinskidev_get_string($group, $key, $default = '') {
    $translations = kotlinskidev_get_translations_group($group);
    if (!$translations) {
        return $default;
    }
    
    // Support dot notation (e.g., 'offline.message')
    $keys = explode('.', $key);
    $value = $translations;
    
    foreach ($keys as $k) {
        if (isset($value[$k])) {
            $value = $value[$k];
        } else {
            return $default;
        }
    }
    
    return $value;
}

/**
 * Helper function to translate strings in PHP context
 * 
 * @param string $group Translation group
 * @param string $key Translation key
 * @param mixed $default Default value
 * @return mixed Translated string
 */
function kotlinskidev__($group, $key, $default = '') {
    return kotlinskidev_get_string($group, $key, $default);
}

/**
 * Echo translated string
 * 
 * @param string $group Translation group
 * @param string $key Translation key
 * @param mixed $default Default value
 */
function kotlinskidev_e($group, $key, $default = '') {
    echo kotlinskidev_get_string($group, $key, $default);
}

// Initialize the i18n system
kotlinskidev_i18n_init();
