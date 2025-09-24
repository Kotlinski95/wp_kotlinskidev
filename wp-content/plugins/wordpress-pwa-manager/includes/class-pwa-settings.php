<?php

class WP_PWA_Manager_Settings {
    
    const OPTION_GROUP = 'wp_pwa_manager_settings';
    
    public static function get_all_settings() {
        return array(
            'pwa_enabled' => get_option('wp_pwa_enabled', true),
            'app_name' => get_option('wp_pwa_app_name', get_bloginfo('name')),
            'app_short_name' => get_option('wp_pwa_app_short_name', get_bloginfo('name')),
            'app_description' => get_option('wp_pwa_app_description', get_bloginfo('description')),
            'theme_color' => get_option('wp_pwa_theme_color', '#000000'),
            'background_color' => get_option('wp_pwa_background_color', '#ffffff'),
            'display' => get_option('wp_pwa_display', 'standalone'),
            'orientation' => get_option('wp_pwa_orientation', 'any'),
            'start_url' => get_option('wp_pwa_start_url', '/'),
            'scope' => get_option('wp_pwa_scope', '/'),
            'icon_192' => get_option('wp_pwa_icon_192', ''),
            'icon_512' => get_option('wp_pwa_icon_512', ''),
            'install_prompt_enabled' => get_option('wp_pwa_install_prompt_enabled', true),
            'install_prompt_text' => get_option('wp_pwa_install_prompt_text', 'Install this app for a better experience!'),
            'install_prompt_button_text' => get_option('wp_pwa_install_prompt_button_text', 'Install'),
            'install_prompt_dismiss_text' => get_option('wp_pwa_install_prompt_dismiss_text', 'Maybe later'),
            'offline_page_enabled' => get_option('wp_pwa_offline_page_enabled', true),
            'offline_page_title' => get_option('wp_pwa_offline_page_title', 'You are offline'),
            'offline_page_message' => get_option('wp_pwa_offline_page_message', 'Please check your internet connection and try again.'),
            'offline_page_use_custom_template' => get_option('wp_pwa_offline_page_use_custom_template', false),
            'offline_page_template' => get_option('wp_pwa_offline_page_template', ''),
            'offline_page_template_source' => get_option('wp_pwa_offline_page_template_source', 'plugin'),
            'cache_strategy' => get_option('wp_pwa_cache_strategy', 'cache_first'),
            'cache_max_entries' => (int) get_option('wp_pwa_cache_max_entries', 50),
            'cache_max_age' => (int) get_option('wp_pwa_cache_max_age', 30),
            'push_notifications_enabled' => get_option('wp_pwa_push_notifications_enabled', false),
            'vapid_public_key' => get_option('wp_pwa_vapid_public_key', ''),
            'vapid_private_key' => get_option('wp_pwa_vapid_private_key', ''),
            'update_prompt_enabled' => get_option('wp_pwa_update_prompt_enabled', true),
            'update_prompt_text' => get_option('wp_pwa_update_prompt_text', 'A new version is available!'),
            'update_prompt_button_text' => get_option('wp_pwa_update_prompt_button_text', 'Update'),
        );
    }
    
    public static function get_setting($key, $default = null) {
        $all_settings = self::get_all_settings();
        return isset($all_settings[$key]) ? $all_settings[$key] : $default;
    }
    
    public static function set_default_options() {
        $defaults = array(
            'wp_pwa_enabled' => true,
            'wp_pwa_app_name' => get_bloginfo('name'),
            'wp_pwa_app_short_name' => get_bloginfo('name'),
            'wp_pwa_app_description' => get_bloginfo('description'),
            'wp_pwa_theme_color' => '#000000',
            'wp_pwa_background_color' => '#ffffff',
            'wp_pwa_display' => 'standalone',
            'wp_pwa_orientation' => 'any',
            'wp_pwa_start_url' => '/',
            'wp_pwa_scope' => '/',
            'wp_pwa_install_prompt_enabled' => true,
            'wp_pwa_install_prompt_text' => 'Install this app for a better experience!',
            'wp_pwa_install_prompt_button_text' => 'Install',
            'wp_pwa_install_prompt_dismiss_text' => 'Maybe later',
            'wp_pwa_offline_page_enabled' => true,
            'wp_pwa_offline_page_title' => 'You are offline',
            'wp_pwa_offline_page_message' => 'Please check your internet connection and try again.',
            'wp_pwa_offline_page_use_custom_template' => false,
            'wp_pwa_offline_page_template' => '',
            'wp_pwa_offline_page_template_source' => 'plugin',
            'wp_pwa_cache_strategy' => 'cache_first',
            'wp_pwa_cache_max_entries' => 50,
            'wp_pwa_cache_max_age' => 30,
            'wp_pwa_push_notifications_enabled' => false,
            'wp_pwa_update_prompt_enabled' => true,
            'wp_pwa_update_prompt_text' => 'A new version is available!',
            'wp_pwa_update_prompt_button_text' => 'Update',
        );
        
        foreach ($defaults as $option_name => $default_value) {
            if (get_option($option_name) === false) {
                add_option($option_name, $default_value);
            }
        }
    }
    
    public static function update_setting($key, $value) {
        $option_name = 'wp_pwa_' . $key;
        return update_option($option_name, $value);
    }
    
    public static function get_default_offline_template() {
        return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=3.0, user-scalable=no, viewport-fit=cover, target-densitydpi=device-dpi">
    <title>{{OFFLINE_TITLE}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .offline-container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        
        .offline-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 30px;
            background: #f1f1f1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 28px;
            font-weight: 300;
        }
        
        p {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
            font-size: 16px;
        }
        
        .retry-btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 14px 28px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: transform 0.2s, box-shadow 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .retry-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .retry-btn:active {
            transform: translateY(0);
        }
        
        @media (max-width: 480px) {
            .offline-container {
                padding: 30px 20px;
            }
            
            h1 {
                font-size: 24px;
            }
            
            .offline-icon {
                width: 60px;
                height: 60px;
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1>{{OFFLINE_TITLE}}</h1>
        <p>{{OFFLINE_MESSAGE}}</p>
        <button class="retry-btn" onclick="location.reload()">Try Again</button>
    </div>
</body>
</html>';
    }
    
    public static function process_offline_template($template, $settings) {
        $placeholders = array(
            '{{OFFLINE_TITLE}}' => $settings['offline_page_title'],
            '{{OFFLINE_MESSAGE}}' => $settings['offline_page_message'],
            '{{APP_NAME}}' => $settings['app_name'],
            '{{THEME_COLOR}}' => $settings['theme_color'],
            '{{BACKGROUND_COLOR}}' => $settings['background_color'],
            '{{HOME_URL}}' => home_url('/'),
            '{{SITE_NAME}}' => get_bloginfo('name'),
            '{{SITE_DESCRIPTION}}' => get_bloginfo('description')
        );
        
        return str_replace(array_keys($placeholders), array_values($placeholders), $template);
    }
    
    /**
     * Get the offline template from theme file or plugin settings
     */
    public static function get_offline_template() {
        $settings = self::get_all_settings();
        
        if (!$settings['offline_page_use_custom_template']) {
            // Use default template if custom template is disabled
            return self::get_default_offline_template();
        }
        
        if ($settings['offline_page_template_source'] === 'theme') {
            return self::get_theme_offline_template();
        }
        
        // Use plugin settings template
        return $settings['offline_page_template'] ?: self::get_default_offline_template();
    }
    
    /**
     * Get offline template from active theme directory
     */
    public static function get_theme_offline_template() {
        $theme_template_path = get_template_directory() . '/offline.html';
        
        // Check if file exists and is readable
        if (file_exists($theme_template_path) && is_readable($theme_template_path)) {
            $content = file_get_contents($theme_template_path);
            if ($content !== false) {
                return $content;
            }
        }
        
        // Fallback to default template if theme file doesn't exist or can't be read
        return self::get_default_offline_template();
    }
    
    /**
     * Check if theme offline template file exists
     */
    public static function theme_offline_template_exists() {
        $theme_template_path = get_template_directory() . '/offline.html';
        return file_exists($theme_template_path) && is_readable($theme_template_path);
    }
    
    /**
     * Get the processed offline template ready for use
     */
    public static function get_processed_offline_template() {
        $template = self::get_offline_template();
        $settings = self::get_all_settings();
        return self::process_offline_template($template, $settings);
    }
}
