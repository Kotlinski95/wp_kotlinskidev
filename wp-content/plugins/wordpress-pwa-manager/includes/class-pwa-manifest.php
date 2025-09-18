<?php

class WP_PWA_Manager_Manifest {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_head', array($this, 'add_manifest_link'));
        
        // Hook into settings updates to regenerate manifest
        add_action('update_option', array($this, 'maybe_regenerate_manifest'), 10, 3);
    }
    
    public function init() {
        // Always ensure manifest file is current
        $this->ensure_manifest_file();
    }
    
    public function maybe_regenerate_manifest($option_name, $old_value, $new_value) {
        // Check if a PWA-related option was updated
        if (strpos($option_name, 'wp_pwa_') === 0) {
            $this->generate_manifest_file();
        }
    }
    
    public function ensure_manifest_file() {
        $manifest_file = ABSPATH . 'manifest.json';
        
        // Check if file exists and is recent (less than 24 hours old)
        if (file_exists($manifest_file)) {
            $file_time = filemtime($manifest_file);
            $settings_hash = $this->get_settings_hash();
            $stored_hash = get_option('wp_pwa_manifest_hash', '');
            
            // Regenerate if settings have changed
            if ($settings_hash !== $stored_hash) {
                $this->generate_manifest_file();
                update_option('wp_pwa_manifest_hash', $settings_hash);
            }
        } else {
            // File doesn't exist, create it
            $this->generate_manifest_file();
            update_option('wp_pwa_manifest_hash', $this->get_settings_hash());
        }
    }
    
    private function get_settings_hash() {
        $settings = WP_PWA_Manager_Settings::get_all_settings();
        
        // Only hash settings that affect the manifest
        $manifest_settings = array(
            'app_name' => $settings['app_name'],
            'app_short_name' => $settings['app_short_name'],
            'app_description' => $settings['app_description'],
            'start_url' => $settings['start_url'],
            'scope' => $settings['scope'],
            'display' => $settings['display'],
            'orientation' => $settings['orientation'],
            'theme_color' => $settings['theme_color'],
            'background_color' => $settings['background_color'],
            'icon_192' => $settings['icon_192'],
            'icon_512' => $settings['icon_512'],
        );
        
        return md5(serialize($manifest_settings));
    }
    
    public function add_manifest_link() {
        $settings = WP_PWA_Manager_Settings::get_all_settings();
        
        echo '<link rel="manifest" href="' . esc_url(home_url('/manifest.json')) . '">' . "\n";
        echo '<meta name="theme-color" content="' . esc_attr($settings['theme_color']) . '">' . "\n";
        echo '<meta name="mobile-web-app-capable" content="yes">' . "\n";
        echo '<meta name="apple-mobile-web-app-capable" content="yes">' . "\n";
        echo '<meta name="apple-mobile-web-app-status-bar-style" content="default">' . "\n";
        echo '<meta name="apple-mobile-web-app-title" content="' . esc_attr($settings['app_short_name']) . '">' . "\n";
        
        // Add apple touch icons
        if (!empty($settings['icon_192'])) {
            echo '<link rel="apple-touch-icon" sizes="192x192" href="' . esc_url($settings['icon_192']) . '">' . "\n";
        } else {
            echo '<link rel="apple-touch-icon" sizes="192x192" href="' . esc_url(WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-192x192.png') . '">' . "\n";
        }
        
        if (!empty($settings['icon_512'])) {
            echo '<link rel="apple-touch-icon" sizes="512x512" href="' . esc_url($settings['icon_512']) . '">' . "\n";
        } else {
            echo '<link rel="apple-touch-icon" sizes="512x512" href="' . esc_url(WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-512x512.png') . '">' . "\n";
        }
    }
    
    public function generate_manifest_file() {
        $manifest_data = $this->generate_manifest();
        $manifest_json = json_encode($manifest_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        
        $manifest_file = ABSPATH . 'manifest.json';
        
        // Write the manifest file
        $result = file_put_contents($manifest_file, $manifest_json);
        
        if ($result === false) {
            error_log('PWA Manager: Failed to write manifest.json file');
        }
        
        return $result !== false;
    }
    
    private function generate_manifest() {
        $settings = WP_PWA_Manager_Settings::get_all_settings();
        
        $manifest = array(
            'name' => $settings['app_name'],
            'short_name' => $settings['app_short_name'],
            'description' => $settings['app_description'],
            'start_url' => $settings['start_url'],
            'scope' => $settings['scope'],
            'display' => $settings['display'],
            'orientation' => $settings['orientation'],
            'theme_color' => $settings['theme_color'],
            'background_color' => $settings['background_color'],
            'icons' => array()
        );
        
        // Add icons if they exist
        if (!empty($settings['icon_192'])) {
            $manifest['icons'][] = array(
                'src' => $settings['icon_192'],
                'sizes' => '192x192',
                'type' => 'image/png',
                'purpose' => 'any maskable'
            );
        } else {
            // Use fallback icon
            $manifest['icons'][] = array(
                'src' => WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-192x192.png',
                'sizes' => '192x192',
                'type' => 'image/png',
                'purpose' => 'any maskable'
            );
        }
        
        if (!empty($settings['icon_512'])) {
            $manifest['icons'][] = array(
                'src' => $settings['icon_512'],
                'sizes' => '512x512',
                'type' => 'image/png',
                'purpose' => 'any maskable'
            );
        } else {
            // Use fallback icon
            $manifest['icons'][] = array(
                'src' => WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-512x512.png',
                'sizes' => '512x512',
                'type' => 'image/png',
                'purpose' => 'any maskable'
            );
        }
        
        // Add default categories
        $manifest['categories'] = array('productivity', 'utilities');
        
        // Add language
        $manifest['lang'] = get_locale();
        
        return $manifest;
    }
}
