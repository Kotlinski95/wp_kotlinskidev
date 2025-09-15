<?php

class WP_PWA_Manager_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Flush rewrite rules once to ensure REST API routes are available
        add_action('admin_init', array($this, 'maybe_flush_rewrite_rules'));
    }
    
    public function maybe_flush_rewrite_rules() {
        $flushed = get_option('wp_pwa_routes_flushed', false);
        if (!$flushed) {
            flush_rewrite_rules();
            update_option('wp_pwa_routes_flushed', true);
        }
    }
    
    public function add_admin_menu() {
        add_options_page(
            __('PWA Manager', 'wordpress-pwa-manager'),
            __('PWA Manager', 'wordpress-pwa-manager'),
            'manage_options',
            'wp-pwa-manager',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        echo '<div id="wp-pwa-manager-admin-root"></div>';
    }
    
    public function enqueue_admin_scripts($hook) {
        // Only load on our PWA Manager admin page
        if ($hook !== 'settings_page_wp-pwa-manager') {
            return;
        }
        
        // Enqueue WordPress REST API settings and nonce
        wp_localize_script('wp-api-fetch', 'wpApiSettings', array(
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
        ));
        
        // Make sure wp-api-fetch is available
        wp_enqueue_script('wp-api-fetch');
    }
    
    public function register_rest_routes() {
        // Force flush rewrite rules when routes are registered
        static $routes_registered = false;
        if (!$routes_registered) {
            $routes_registered = true;
            // Clear any cached routes
            delete_option('wp_pwa_routes_flushed');
        }
        
        register_rest_route('wp-pwa-manager/v1', '/settings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_settings'),
            'permission_callback' => array($this, 'check_permissions')
        ));
        
        register_rest_route('wp-pwa-manager/v1', '/settings', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_settings'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'settings' => array(
                    'required' => true,
                    'type' => 'object'
                )
            )
        ));
        
        register_rest_route('wp-pwa-manager/v1', '/upload-icon', array(
            'methods' => 'POST',
            'callback' => array($this, 'upload_icon'),
            'permission_callback' => array($this, 'check_permissions')
        ));
        
        register_rest_route('wp-pwa-manager/v1', '/offline-template/default', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_default_offline_template'),
            'permission_callback' => array($this, 'check_permissions')
        ));
        
        register_rest_route('wp-pwa-manager/v1', '/offline-template/preview', array(
            'methods' => 'POST',
            'callback' => array($this, 'preview_offline_template'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'template' => array(
                    'required' => true,
                    'type' => 'string'
                )
            )
        ));
    }
    
    public function check_permissions() {
        return current_user_can('manage_options');
    }
    
    public function get_settings(WP_REST_Request $request) {
        return rest_ensure_response(WP_PWA_Manager_Settings::get_all_settings());
    }
    
    public function update_settings(WP_REST_Request $request) {
        $settings = $request->get_param('settings');
        
        foreach ($settings as $key => $value) {
            WP_PWA_Manager_Settings::update_setting($key, $value);
        }
        
        // Regenerate manifest file after settings update
        $manifest = new WP_PWA_Manager_Manifest();
        $manifest->generate_manifest_file();
        
        // Regenerate service worker file after settings update
        $service_worker = new WP_PWA_Manager_Service_Worker();
        $service_worker->generate_service_worker_file();
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Settings updated successfully', 'wordpress-pwa-manager')
        ));
    }
    
    public function upload_icon(WP_REST_Request $request) {
        if (!function_exists('wp_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }
        
        $files = $request->get_file_params();
        
        if (empty($files['icon'])) {
            return new WP_Error('no_file', 'No file uploaded', array('status' => 400));
        }
        
        $file = $files['icon'];
        $upload_overrides = array('test_form' => false);
        $movefile = wp_handle_upload($file, $upload_overrides);
        
        if ($movefile && !isset($movefile['error'])) {
            return rest_ensure_response(array(
                'success' => true,
                'url' => $movefile['url'],
                'file' => $movefile['file']
            ));
        } else {
            return new WP_Error('upload_error', $movefile['error'], array('status' => 400));
        }
    }
    
    public function get_default_offline_template(WP_REST_Request $request) {
        return rest_ensure_response(array(
            'success' => true,
            'template' => WP_PWA_Manager_Settings::get_default_offline_template()
        ));
    }
    
    public function preview_offline_template(WP_REST_Request $request) {
        $template = $request->get_param('template');
        $settings = WP_PWA_Manager_Settings::get_all_settings();
        
        $processed_template = WP_PWA_Manager_Settings::process_offline_template($template, $settings);
        
        return rest_ensure_response(array(
            'success' => true,
            'processed_template' => $processed_template
        ));
    }
}
