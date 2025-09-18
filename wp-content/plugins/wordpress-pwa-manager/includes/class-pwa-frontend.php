<?php

class WP_PWA_Manager_Frontend {
    
    public function __construct() {
        add_action('wp_footer', array($this, 'add_pwa_scripts'));
        add_action('init', array($this, 'handle_offline_page'));
    }
    
    public function handle_offline_page() {
        add_rewrite_rule('^offline/?$', 'index.php?wp_pwa_offline=1', 'top');
        add_filter('query_vars', array($this, 'add_query_vars'));
        add_action('template_redirect', array($this, 'serve_offline_page'));
    }
    
    public function add_query_vars($vars) {
        $vars[] = 'wp_pwa_offline';
        return $vars;
    }
    
    public function serve_offline_page() {
        if (get_query_var('wp_pwa_offline')) {
            $this->display_offline_page();
            exit;
        }
    }
    
    private function display_offline_page() {
        $settings = WP_PWA_Manager_Settings::get_all_settings();
        
        get_header();
        ?>
        <div class="wp-pwa-offline-page">
            <div class="wp-pwa-offline-content">
                <h1><?php echo esc_html($settings['offline_page_title']); ?></h1>
                <p><?php echo esc_html($settings['offline_page_message']); ?></p>
                <button onclick="window.location.reload();" class="wp-pwa-retry-button">
                    <?php esc_html_e('Try Again', 'wordpress-pwa-manager'); ?>
                </button>
            </div>
        </div>
        <style>
        .wp-pwa-offline-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            text-align: center;
            padding: 2rem;
        }
        .wp-pwa-offline-content h1 {
            color: <?php echo esc_attr($settings['theme_color']); ?>;
            margin-bottom: 1rem;
        }
        .wp-pwa-retry-button {
            background: <?php echo esc_attr($settings['theme_color']); ?>;
            color: <?php echo esc_attr($settings['background_color']); ?>;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            margin-top: 1rem;
        }
        .wp-pwa-retry-button:hover {
            opacity: 0.8;
        }
        </style>
        <?php
        get_footer();
    }
    
    public function add_pwa_scripts() {
        // Service worker registration is handled by the compiled frontend.js file
        // which includes additional PWA features like install prompts, update handling, etc.
    }
}
