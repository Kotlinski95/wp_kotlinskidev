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

// Main plugin class
class WordPressPWAManager {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Include required files first
        $this->includes();
        
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // Load text domain
        load_plugin_textdomain('wordpress-pwa-manager', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Include required files
        $this->includes();
        
        // Check if PWA is enabled
        $pwa_enabled = WP_PWA_Manager_Settings::get_setting('enabled', true);
        
        // Initialize components only if PWA is enabled
        new WP_PWA_Manager_Admin(); // Always load admin for settings
        
        if ($pwa_enabled) {
            new WP_PWA_Manager_Frontend();
            new WP_PWA_Manager_Manifest();
            new WP_PWA_Manager_Service_Worker();
        }
    }
    
    private function includes() {
        require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/class-pwa-admin.php';
        require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/class-pwa-frontend.php';
        require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/class-pwa-manifest.php';
        require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/class-pwa-service-worker.php';
        require_once WP_PWA_MANAGER_PLUGIN_PATH . 'includes/class-pwa-settings.php';
    }
    
    public function enqueue_frontend_assets() {
        if (!is_admin()) {
            $pwa_enabled = WP_PWA_Manager_Settings::get_setting('enabled', true);
            
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
                
                // Localize script with settings
                $settings = WP_PWA_Manager_Settings::get_all_settings();
                wp_localize_script('wp-pwa-manager-frontend', 'wpPwaManager', array(
                    'settings' => $settings,
                    'swUrl' => home_url('/sw.js'),
                    'ajaxUrl' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('wp_pwa_manager_nonce'),
                    'i18n' => array(
                        // Install prompt translations
                        'installPromptTitle' => __('Install App', 'wordpress-pwa-manager'),
                        'installPromptText' => __('Install this app on your device for a better experience and quick access.', 'wordpress-pwa-manager'),
                        'installPromptInstall' => __('Install', 'wordpress-pwa-manager'),
                        'installPromptLater' => __('Ask me later', 'wordpress-pwa-manager'),
                        'installPromptDismiss' => __('No thanks', 'wordpress-pwa-manager'),
                        
                        // Update prompt translations
                        'updatePromptTitle' => __('Update Available', 'wordpress-pwa-manager'),
                        'updatePromptText' => __('A new version of this app is available. Update now for the latest features and improvements.', 'wordpress-pwa-manager'),
                        'updatePromptUpdate' => __('Update Now', 'wordpress-pwa-manager'),
                        'updatePromptLater' => __('Later', 'wordpress-pwa-manager'),
                        
                        // Connection status translations
                        'connectionOnline' => __('Back online', 'wordpress-pwa-manager'),
                        'connectionOffline' => __('You are offline', 'wordpress-pwa-manager'),
                    )
                ));
            }
        }
    }
    
    public function enqueue_admin_assets($hook) {
        if ('settings_page_wp-pwa-manager' === $hook) {
            wp_enqueue_script(
                'wp-pwa-manager-admin',
                WP_PWA_MANAGER_PLUGIN_URL . 'build/admin.js',
                array('wp-element', 'wp-components', 'wp-api-fetch'),
                WP_PWA_MANAGER_VERSION,
                true
            );
            
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
    
    public function activate() {
        // Include required files if not already included
        if (!class_exists('WP_PWA_Manager_Settings')) {
            $this->includes();
        }
        
        // Set default options
        WP_PWA_Manager_Settings::set_default_options();
        
        // Add rewrite rules manually during activation
        add_rewrite_rule('^sw\.js$', 'index.php?wp_pwa_sw=1', 'top');
        add_rewrite_rule('^manifest\.json$', 'index.php?wp_pwa_manifest=1', 'top');
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        // Clean up if needed
        flush_rewrite_rules();
    }
}

// Initialize the plugin
WordPressPWAManager::get_instance();
