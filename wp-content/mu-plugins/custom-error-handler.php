<?php
/**
 * Must-Use Plugin: Custom 500 Error Handler
 * This completely overrides WordPress error handling
 */

// Start output buffering immediately to capture all output
ob_start();

// Disable WordPress error handling immediately
add_filter('wp_fatal_error_handler_enabled', '__return_false', 1);
// add_filter('recovery_mode_email', '__return_false', 1);

// Override wp_die function completely
if (!function_exists('wp_die')) {
    function wp_die($message = '', $title = '', $args = array()) {
        kotlinskidev_custom_die_handler($message, $title, $args);
    }
}

// Register shutdown function immediately when this file loads
register_shutdown_function('kotlinskidev_mu_fatal_error_handler');

function kotlinskidev_mu_fatal_error_handler() {
    $error = error_get_last();
    
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        kotlinskidev_show_custom_error_page();
    }
}

function kotlinskidev_custom_die_handler($message = '', $title = '', $args = array()) {
    // Check if this is a 500 error or critical error
    if ((isset($args['response']) && $args['response'] >= 500) || 
        strpos($message, 'critical error') !== false ||
        strpos($message, 'fatal') !== false ||
        strpos($title, 'Fatal') !== false) {
        
        kotlinskidev_show_custom_error_page();
    }
    
    // For non-critical errors, use a minimal default handler
    if (!headers_sent()) {
        http_response_code(isset($args['response']) ? $args['response'] : 500);
    }
    
    echo '<h1>Error</h1><p>' . esc_html($message) . '</p>';
    exit;
}

function kotlinskidev_show_custom_error_page() {
    // Discard ALL previous output completely
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Prevent any further WordPress processing
    if (function_exists('remove_all_actions')) {
        remove_all_actions('wp_die');
        remove_all_actions('wp_fatal_error');
        remove_all_actions('shutdown');
    }
    
    // Set proper headers
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: text/html; charset=UTF-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        header('X-Robots-Tag: noindex');
    }
    
    // Try to load the theme's 500 fallback page
    $theme_path = WP_CONTENT_DIR . '/themes/kotlinskidev/500.html';
    if (file_exists($theme_path)) {
        readfile($theme_path);
        die();
    }
    
    // Ultimate fallback - professional error page
    echo '<!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Server Error - KotlinskiDev</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=3.0, user-scalable=no, viewport-fit=cover, target-densitydpi=device-dpi">
        <meta name="robots" content="noindex, nofollow">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1.25rem;
            }
            .error-container { 
                max-width: 31.25rem; 
                background: white; 
                padding: 2.5rem; 
                border-radius: 0.9375rem; 
                box-shadow: 0 1.25rem 2.5rem rgba(0,0,0,0.1);
                text-align: center;
                animation: fadeIn 0.5s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(1.25rem); }
                to { opacity: 1; transform: translateY(0); }
            }
            .error-icon { 
                font-size: 4rem; 
                margin-bottom: 1.25rem; 
                display: block;
                color: #e74c3c;
            }
            h1 { 
                color: #2c3e50; 
                font-size: 2rem; 
                margin-bottom: 1.25rem; 
                font-weight: 600;
            }
            p { 
                font-size: 1.1rem; 
                margin-bottom: 1.875rem; 
                color: #7f8c8d; 
                line-height: 1.6; 
            }
            .btn { 
                display: inline-block; 
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white; 
                padding: 0.9375rem 1.875rem; 
                text-decoration: none; 
                border-radius: 3.125rem; 
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 0.25rem 0.9375rem rgba(52, 152, 219, 0.3);
            }
            .btn:hover { 
                transform: translateY(-0.125rem);
                box-shadow: 0 0.5rem 1.5625rem rgba(52, 152, 219, 0.4);
            }
            .error-code {
                font-size: 0.9rem;
                color: #bdc3c7;
                margin-top: 1.875rem;
                padding-top: 1.25rem;
                border-top: 1px solid #ecf0f1;
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <span class="error-icon">⚠️</span>
            <h1>Server Error</h1>
            <p>We\'re experiencing technical difficulties. Our team has been notified and is working to resolve this issue as quickly as possible.</p>
            <a href="/" class="btn">Return to Homepage</a>
            <div class="error-code">Error Code: 500 - Internal Server Error</div>
        </div>
    </body>
    </html>';
    die();
}

// Override WordPress die handler as early as possible
add_action('muplugins_loaded', function() {
    // Remove any existing wp_die handlers
    remove_all_filters('wp_die_handler');
    
    // Add our custom handler with maximum priority
    add_filter('wp_die_handler', function() {
        return 'kotlinskidev_custom_die_handler';
    }, PHP_INT_MAX);
}, 1);

// Catch fatal errors in output buffer
register_shutdown_function(function() {
    $output = ob_get_contents();
    
    // Check if WordPress error content is present
    if (strpos($output, 'wp-die-message') !== false || 
        strpos($output, 'critical error') !== false ||
        strpos($output, 'There has been a critical error on this website') !== false) {
        
        // Completely replace the output with our custom error page
        ob_end_clean();
        kotlinskidev_show_custom_error_page();
    }
});
