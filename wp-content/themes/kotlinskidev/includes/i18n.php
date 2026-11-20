<?php

if (!defined('ABSPATH')) {
    exit;
}

define('KOTLINSKIDEV_TEXT_DOMAIN', 'kotlinskidev');
define('KOTLINSKIDEV_LOCALIZE_SCRIPTS_LATE_PRIORITY', 999);

function kotlinskidev_i18n_init() {
    add_action('after_setup_theme', 'kotlinskidev_load_theme_textdomain');
    add_action('wp_enqueue_scripts', 'kotlinskidev_localize_scripts', KOTLINSKIDEV_LOCALIZE_SCRIPTS_LATE_PRIORITY);
}

function kotlinskidev_load_theme_textdomain() {
    load_theme_textdomain(
        KOTLINSKIDEV_TEXT_DOMAIN,
        get_template_directory() . '/languages'
    );
}

function kotlinskidev_localize_scripts() {

    if (!is_textdomain_loaded(KOTLINSKIDEV_TEXT_DOMAIN)) {
        kotlinskidev_load_theme_textdomain();
    }

    $candidate_script_handles = [
        'wp-typescript',
        'kotlinskidev-banner-carousel',
        'kotlinskidev-main',
        'theme-scripts',
        'main-js'
    ];

    foreach ($candidate_script_handles as $handle) {
        if (wp_script_is($handle, 'enqueued') || wp_script_is($handle, 'registered')) {
            wp_localize_script($handle, 'i18n', kotlinskidev_get_all_translations());
            break;
        }
    }
}

function kotlinskidev_get_all_translations() {
    return [
        'navigation' => kotlinskidev_get_navigation_translations(),
        'forms' => kotlinskidev_get_forms_translations(),
        'general' => kotlinskidev_get_general_translations(),
        'accessibility' => kotlinskidev_get_accessibility_translations(),
        'cookieConsent' => kotlinskidev_get_cookie_consent_translations(),
        'lightbox' => kotlinskidev_get_lightbox_translations(),
        'scrollAnimations' => kotlinskidev_get_scroll_animations_translations(),
        'themeSwitcher' => kotlinskidev_get_theme_switcher_translations(),
    ];
}

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

function kotlinskidev_get_forms_translations() {
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

function kotlinskidev_get_accessibility_translations() {
    return [
        'skip_to_content' => __('Skip to main content', KOTLINSKIDEV_TEXT_DOMAIN),
        'scroll_to_top' => __('Scroll to top', KOTLINSKIDEV_TEXT_DOMAIN),
        'external_link' => __('External link', KOTLINSKIDEV_TEXT_DOMAIN),
        'new_window' => __('Opens in new window', KOTLINSKIDEV_TEXT_DOMAIN),
        'download' => __('Download file', KOTLINSKIDEV_TEXT_DOMAIN),
        'video_paused' => __('Video paused (Reduced motion mode)', KOTLINSKIDEV_TEXT_DOMAIN),
        'play_anyway' => __('Play anyway', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

function kotlinskidev_get_cookie_consent_translations() {
    return [
        'message' => __('This website uses cookies to ensure you get the best experience on our website.', KOTLINSKIDEV_TEXT_DOMAIN),
        'accept' => __('Accept', KOTLINSKIDEV_TEXT_DOMAIN),
        'decline' => __('Decline', KOTLINSKIDEV_TEXT_DOMAIN),
        'learn_more' => __('Learn more', KOTLINSKIDEV_TEXT_DOMAIN),
        'settings' => __('Cookie Settings', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

function kotlinskidev_get_lightbox_translations() {
    return [
        'close' => __('Close lightbox', KOTLINSKIDEV_TEXT_DOMAIN),
        'next' => __('Next image', KOTLINSKIDEV_TEXT_DOMAIN),
        'prev' => __('Previous image', KOTLINSKIDEV_TEXT_DOMAIN),
        'loading' => __('Loading image...', KOTLINSKIDEV_TEXT_DOMAIN),
        'counter' => __('%1$d of %2$d', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

function kotlinskidev_get_scroll_animations_translations() {
    return [
        'reveal' => __('Content revealed', KOTLINSKIDEV_TEXT_DOMAIN),
        'animated' => __('Animation triggered', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

function kotlinskidev_get_theme_switcher_translations() {
    return [
        'lightMode' => __('Switch between dark and light mode (currently light mode)', KOTLINSKIDEV_TEXT_DOMAIN),
        'darkMode' => __('Switch between dark and light mode (currently dark mode)', KOTLINSKIDEV_TEXT_DOMAIN),
    ];
}

function kotlinskidev_get_translations_group($group) {
    $function_name = 'kotlinskidev_get_' . $group . '_translations';
    if (function_exists($function_name)) {
        return $function_name();
    }
    return null;
}

function kotlinskidev_get_string($group, $key, $default = '') {
    $translations = kotlinskidev_get_translations_group($group);
    if (!$translations) {
        return $default;
    }

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

function kotlinskidev__($group, $key, $default = '') {
    return kotlinskidev_get_string($group, $key, $default);
}

function kotlinskidev_e($group, $key, $default = '') {
    echo esc_html(kotlinskidev_get_string($group, $key, $default));
}

kotlinskidev_i18n_init();
