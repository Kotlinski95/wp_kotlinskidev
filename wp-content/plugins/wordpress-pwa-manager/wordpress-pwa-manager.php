<?php
/**
 * Plugin Name: WordPress PWA Manager
 * Plugin URI: https://adriankotlinski.com
 * Description: Complete PWA functionality with admin settings for colors, offline cache, installation prompts, icons, and more.
 * Version: 1.0.0
 * Author: Adrian Kotlinski
 * License: GPL v2 or later
 * Text Domain: wordpress-pwa-manager
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WP_PWA_MANAGER_VERSION', '1.0.0');
define('WP_PWA_MANAGER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WP_PWA_MANAGER_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('WP_PWA_MANAGER_PLUGIN_BASENAME', plugin_basename(__FILE__));

// --- Functional replacements for main plugin logic ---

// Include required files
require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/pwa-admin.php';
require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/pwa-frontend.php';
require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/pwa-manifest.php';
require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/pwa-service-worker.php';
require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/pwa-settings.php';

function wp_pwa_manager_init() {
    // Load text domain
    load_plugin_textdomain('wordpress-pwa-manager', false, dirname(plugin_basename(__FILE__)) . '/languages');

    // Check if PWA is enabled
    $pwa_enabled = wp_pwa_manager_get_setting('enabled', true);

    // Always load admin for settings
    wp_pwa_manager_admin_init();

    if ($pwa_enabled) {
        wp_pwa_manager_frontend_init();
        wp_pwa_manager_manifest_init();
        wp_pwa_manager_service_worker_init();
    }
}
add_action('init', 'wp_pwa_manager_init');

function wp_pwa_manager_enqueue_frontend_assets() {
    if (is_admin() || 
        $GLOBALS['pagenow'] === 'wp-login.php' ||
        (defined('WP_ADMIN') && WP_ADMIN) ||
        (function_exists('is_customize_preview') && is_customize_preview())) {
        return;
    }

    $pwa_enabled = wp_pwa_manager_get_setting('enabled', true);

    if ($pwa_enabled) {
        wp_enqueue_script(
            'wp-pwa-manager-frontend',
            WP_PWA_MANAGER_PLUGIN_URL . 'build/frontend.js',
            array(),
            WP_PWA_MANAGER_VERSION,
            true
        );

        wp_enqueue_style(
            'wp-pwa-manager-frontend',
            WP_PWA_MANAGER_PLUGIN_URL . 'build/frontend.css',
            array(),
            WP_PWA_MANAGER_VERSION
        );

        $settings = wp_pwa_manager_get_all_settings();
        wp_localize_script('wp-pwa-manager-frontend', 'wpPwaManager', array(
            'settings' => $settings,
            'swUrl' => home_url('/sw.js'),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wp_pwa_manager_nonce'),
            'i18n' => array(
                'installPromptTitle' => __('Install App', 'wordpress-pwa-manager'),
                'installPromptText' => __('Install this app on your device for a better experience and quick access.', 'wordpress-pwa-manager'),
                'installPromptInstall' => __('Install', 'wordpress-pwa-manager'),
                'installPromptLater' => __('Ask me later', 'wordpress-pwa-manager'),
                'installPromptDismiss' => __('No thanks', 'wordpress-pwa-manager'),
                'updatePromptTitle' => __('Update Available', 'wordpress-pwa-manager'),
                'updatePromptText' => __('A new version of this app is available. Update now for the latest features and improvements.', 'wordpress-pwa-manager'),
                'updatePromptUpdate' => __('Update Now', 'wordpress-pwa-manager'),
                'updatePromptLater' => __('Later', 'wordpress-pwa-manager'),
                'connectionOnline' => __('Back online', 'wordpress-pwa-manager'),
                'connectionOffline' => __('You are offline', 'wordpress-pwa-manager'),
            )
        ));
    }
}
add_action('wp_enqueue_scripts', 'wp_pwa_manager_enqueue_frontend_assets');

function wp_pwa_manager_enqueue_admin_assets($hook) {
    if ('settings_page_wp-pwa-manager' === $hook) {
        wp_enqueue_script(
            'wp-pwa-manager-admin',
            WP_PWA_MANAGER_PLUGIN_URL . 'build/admin.js',
            array('wp-element', 'wp-components', 'wp-api-fetch'),
            WP_PWA_MANAGER_VERSION,
            true
        );

        wp_set_script_translations('wp-pwa-manager-admin', 'wordpress-pwa-manager', WP_PWA_MANAGER_PLUGIN_PATH . 'languages');

        wp_enqueue_style(
            'wp-pwa-manager-admin',
            WP_PWA_MANAGER_PLUGIN_URL . 'build/admin.css',
            array('wp-components'),
            WP_PWA_MANAGER_VERSION
        );

        wp_localize_script('wp-pwa-manager-admin', 'wpPwaManagerAdmin', array(
            'restUrl' => rest_url('wp-pwa-manager/v1/'),
            'nonce' => wp_create_nonce('wp_rest')
        ));
    }
}
add_action('admin_enqueue_scripts', 'wp_pwa_manager_enqueue_admin_assets');

function wp_pwa_manager_activate() {
    // Include required files if not already included
    if (!function_exists('wp_pwa_manager_get_setting')) {
        require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/pwa-settings.php';
    }
    // Set default options
    wp_pwa_manager_set_default_options();
    // Add rewrite rules manually during activation
    add_rewrite_rule('^sw\.js$', 'index.php?wp_pwa_sw=1', 'top');
    add_rewrite_rule('^manifest\.json$', 'index.php?wp_pwa_manifest=1', 'top');
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'wp_pwa_manager_activate');

function wp_pwa_manager_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'wp_pwa_manager_deactivate');
