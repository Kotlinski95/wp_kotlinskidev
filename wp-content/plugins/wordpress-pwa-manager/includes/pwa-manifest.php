<?php

// Functional replacements for WP_PWA_Manager_Manifest

function wp_pwa_manager_manifest_init() {
    add_action('init', 'wp_pwa_manager_manifest_ensure_file');
    add_action('wp_head', 'wp_pwa_manager_add_manifest_link');
    add_action('update_option', 'wp_pwa_manager_maybe_regenerate_manifest', 10, 3);
}

function wp_pwa_manager_manifest_ensure_file() {
    $manifest_file = ABSPATH . 'manifest.json';
    if (file_exists($manifest_file)) {
        $settings_hash = wp_pwa_manager_manifest_get_settings_hash();
        $stored_hash = get_option('wp_pwa_manifest_hash', '');
        if ($settings_hash !== $stored_hash) {
            wp_pwa_manager_generate_manifest_file();
            update_option('wp_pwa_manifest_hash', $settings_hash);
        }
    } else {
        wp_pwa_manager_generate_manifest_file();
        update_option('wp_pwa_manifest_hash', wp_pwa_manager_manifest_get_settings_hash());
    }
}

function wp_pwa_manager_maybe_regenerate_manifest($option_name, $old_value, $new_value) {
    if (strpos($option_name, 'wp_pwa_') === 0) {
        wp_pwa_manager_generate_manifest_file();
    }
}

function wp_pwa_manager_manifest_get_settings_hash() {
    $settings = wp_pwa_manager_get_all_settings();
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

function wp_pwa_manager_add_manifest_link() {
    $settings = wp_pwa_manager_get_all_settings();
    echo '<link rel="manifest" href="' . esc_url(home_url('/manifest.json')) . '">' . "\n";
    echo '<meta name="theme-color" content="' . esc_attr($settings['theme_color']) . '">' . "\n";
    echo '<meta name="mobile-web-app-capable" content="yes">' . "\n";
    echo '<meta name="apple-mobile-web-app-capable" content="yes">' . "\n";
    echo '<meta name="apple-mobile-web-app-status-bar-style" content="default">' . "\n";
    echo '<meta name="apple-mobile-web-app-title" content="' . esc_attr($settings['app_short_name']) . '">' . "\n";
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

function wp_pwa_manager_generate_manifest_file() {
    $manifest_data = wp_pwa_manager_generate_manifest();
    $manifest_json = json_encode($manifest_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    $manifest_file = ABSPATH . 'manifest.json';
    $result = file_put_contents($manifest_file, $manifest_json);
    return $result !== false;
}

function wp_pwa_manager_generate_manifest() {
    $settings = wp_pwa_manager_get_all_settings();
    return array(
        'name' => $settings['app_name'],
        'short_name' => $settings['app_short_name'],
        'description' => $settings['app_description'],
        'start_url' => $settings['start_url'],
        'scope' => $settings['scope'],
        'display' => $settings['display'],
        'orientation' => $settings['orientation'],
        'background_color' => $settings['background_color'],
        'theme_color' => $settings['theme_color'],
        'icons' => array(
            array(
                'src' => !empty($settings['icon_192']) ? $settings['icon_192'] : WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-192x192.png',
                'sizes' => '192x192',
                'type' => 'image/png',
            ),
            array(
                'src' => !empty($settings['icon_512']) ? $settings['icon_512'] : WP_PWA_MANAGER_PLUGIN_URL . 'assets/icons/icon-512x512.png',
                'sizes' => '512x512',
                'type' => 'image/png',
            ),
        ),
    );
}
