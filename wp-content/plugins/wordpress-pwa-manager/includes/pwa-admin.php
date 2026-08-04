<?php

// Functional replacements for WP_PWA_Manager_Admin

function wp_pwa_manager_admin_init() {
    add_action('admin_menu', 'wp_pwa_manager_add_admin_menu');
    add_action('rest_api_init', 'wp_pwa_manager_register_rest_routes');
    add_action('admin_enqueue_scripts', 'wp_pwa_manager_enqueue_admin_scripts');
    add_action('admin_init', 'wp_pwa_manager_maybe_flush_rewrite_rules');
}

function wp_pwa_manager_maybe_flush_rewrite_rules() {
    $flushed = get_option('wp_pwa_routes_flushed', false);
    if (!$flushed) {
        flush_rewrite_rules();
        update_option('wp_pwa_routes_flushed', true);
    }
}

function wp_pwa_manager_add_admin_menu() {
    add_options_page(
        __('PWA Manager', 'wordpress-pwa-manager'),
        __('PWA Manager', 'wordpress-pwa-manager'),
        'manage_options',
        'wp-pwa-manager',
        'wp_pwa_manager_admin_page'
    );
}

function wp_pwa_manager_admin_page() {
    echo '<div id="wp-pwa-manager-admin-root"></div>';
}

function wp_pwa_manager_enqueue_admin_scripts($hook) {
    if ($hook !== 'settings_page_wp-pwa-manager') {
        return;
    }
    wp_localize_script('wp-api-fetch', 'wpApiSettings', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
    ));
    wp_enqueue_script('wp-api-fetch');
}

function wp_pwa_manager_register_rest_routes() {
    static $routes_registered = false;
    if (!$routes_registered) {
        $routes_registered = true;
        delete_option('wp_pwa_routes_flushed');
    }
    register_rest_route('wp-pwa-manager/v1', '/settings', array(
        'methods' => 'GET',
        'callback' => 'wp_pwa_manager_rest_get_settings',
        'permission_callback' => 'wp_pwa_manager_rest_check_permissions'
    ));
    register_rest_route('wp-pwa-manager/v1', '/settings', array(
        'methods' => 'POST',
        'callback' => 'wp_pwa_manager_rest_update_settings',
        'permission_callback' => 'wp_pwa_manager_rest_check_permissions',
        'args' => array(
            'settings' => array(
                'required' => true,
                'type' => 'object'
            )
        )
    ));
    register_rest_route('wp-pwa-manager/v1', '/upload-icon', array(
        'methods' => 'POST',
        'callback' => 'wp_pwa_manager_rest_upload_icon',
        'permission_callback' => 'wp_pwa_manager_rest_check_permissions'
    ));
    register_rest_route('wp-pwa-manager/v1', '/offline-template/default', array(
        'methods' => 'GET',
        'callback' => 'wp_pwa_manager_rest_get_default_offline_template',
        'permission_callback' => 'wp_pwa_manager_rest_check_permissions'
    ));
    register_rest_route('wp-pwa-manager/v1', '/offline-template/preview', array(
        'methods' => 'POST',
        'callback' => 'wp_pwa_manager_rest_preview_offline_template',
        'permission_callback' => 'wp_pwa_manager_rest_check_permissions',
        'args' => array(
            'template' => array(
                'required' => false,
                'type' => 'string'
            ),
            'template_source' => array(
                'required' => false,
                'type' => 'string'
            )
        )
    ));
}

function wp_pwa_manager_rest_check_permissions() {
    return current_user_can('manage_options');
}

function wp_pwa_manager_rest_get_settings(WP_REST_Request $request) {
    return rest_ensure_response(wp_pwa_manager_get_all_settings());
}

function wp_pwa_manager_rest_update_settings(WP_REST_Request $request) {
    $settings = $request->get_param('settings');
    
    foreach ($settings as $key => $value) {
        wp_pwa_manager_update_setting($key, $value);
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

function wp_pwa_manager_rest_upload_icon(WP_REST_Request $request) {
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

function wp_pwa_manager_rest_get_default_offline_template(WP_REST_Request $request) {
    return rest_ensure_response(array(
        'success' => true,
        'template' => wp_pwa_manager_get_default_offline_template()
    ));
}

function wp_pwa_manager_rest_preview_offline_template(WP_REST_Request $request) {
    $template = $request->get_param('template');
    $template_source = $request->get_param('template_source');
    $settings = wp_pwa_manager_get_all_settings();
    
    // If template_source is provided and is 'theme', use theme file
    if ($template_source === 'theme') {
        $template = wp_pwa_manager_get_theme_offline_template();
    } else if (!$template) {
        // If no template provided and not using theme, get from settings
        $template = wp_pwa_manager_get_offline_template();
    }
    
    $processed_template = wp_pwa_manager_process_offline_template($template, $settings);
    
    return rest_ensure_response(array(
        'success' => true,
        'processed_template' => $processed_template
    ));
}

function wp_pwa_manager_rest_get_theme_template_status(WP_REST_Request $request) {
    $theme_name = get_template();
    $theme_template_path = get_template_directory() . '/offline.html';
    $file_exists = wp_pwa_manager_theme_offline_template_exists();
    
    return rest_ensure_response(array(
        'success' => true,
        'theme_name' => $theme_name,
        'file_exists' => $file_exists,
        'file_path' => 'wp-content/themes/' . $theme_name . '/offline.html',
        'full_path' => $theme_template_path
    ));
}

add_action('init', 'wp_pwa_manager_admin_init');
