<?php
/*
Plugin Name: Responsive Spacing Controls
Description: Adds responsive margin and padding controls to the block editor (mobile, tablet, desktop).
Version: 1.0.0
Author: Your Name
*/

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

function responsive_spacing_controls_enqueue_editor_assets()
{
    wp_enqueue_script(
        'responsive-spacing-controls',
        plugins_url('build/index.js', __FILE__),
        array('wp-blocks', 'wp-element', 'wp-edit-post', 'wp-components', 'wp-compose', 'wp-hooks', 'wp-i18n', 'wp-editor', 'wp-block-editor'),
        filemtime(plugin_dir_path(__FILE__) . 'build/index.js'),
        true
    );
    if (is_admin()) {
        wp_enqueue_style(
        'responsive-spacing-controls',
            plugins_url('build/index.css', __FILE__),
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'build/index.css'),
        );
    }
}
add_action('enqueue_block_editor_assets', 'responsive_spacing_controls_enqueue_editor_assets');

function responsive_spacing_controls_enqueue_frontend_assets()
{
    wp_enqueue_style(
        'responsive-spacing-controls-style',
        plugins_url('build/responsive-spacing-controls.css', __FILE__),
        array(),
        filemtime(plugin_dir_path(__FILE__) . 'build/responsive-spacing-controls.css')
    );
}
add_action('wp_enqueue_scripts', 'responsive_spacing_controls_enqueue_frontend_assets');

// Inject responsive spacing classes on frontend and in editor preview
add_filter('render_block', function($block_content, $block) {
    // Check if any responsive spacing attributes exist
    $hasSpacing = false;
    $breakpoints = ['desktop', 'tablet', 'mobile'];
    $types = ['Padding', 'Margin'];
    
    foreach ($breakpoints as $breakpoint) {
        foreach ($types as $type) {
            if (!empty($block['attrs']["{$breakpoint}{$type}"])) {
                $hasSpacing = true;
                break 2;
            }
        }
    }
    
    if (!$hasSpacing) {
        return $block_content;
    }
    
    $classes = [];
    
    // Generate classes for all breakpoints
    foreach ($breakpoints as $breakpoint) {
        foreach (['Padding' => 'pt', 'Margin' => 'mg'] as $type => $prefix) {
            $attr_key = "{$breakpoint}{$type}";
            if (!empty($block['attrs'][$attr_key]) && is_array($block['attrs'][$attr_key])) {
                foreach (['top', 'right', 'bottom', 'left'] as $side) {
                    $val = $block['attrs'][$attr_key][$side] ?? '';
                    if ($val && $val !== '0px') {
                        // Use same class naming as CSS generation (replace . with 'dot')
                        $class_suffix = preg_replace('/[^a-zA-Z0-9]/', '', str_replace('.', 'dot', $val));
                        $classes[] = "{$breakpoint}-{$prefix}-{$side}-{$class_suffix}";
                    }
                }
            }
        }
    }
    
    if ($classes) {
        $block_content = preg_replace(
            '/(<[^>]+class=")([^"]*)"/',
            '$1$2 ' . implode(' ', $classes) . '"',
            $block_content,
            1
        );
    }
    return $block_content;
}, 10, 2);

// Add settings page for responsive breakpoints
add_action('admin_menu', function() {
    add_options_page(
        'Responsive Spacing Controls',
        'Responsive Spacing',
        'manage_options',
        'responsive-spacing-controls',
        'responsive_spacing_controls_settings_page'
    );
});

function responsive_spacing_controls_settings_page() {
    ?>
    <div class="wrap">
        <h1>Responsive Spacing Controls Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('responsive_spacing_controls_options');
            do_settings_sections('responsive-spacing-controls');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

add_action('admin_init', function() {
    register_setting('responsive_spacing_controls_options', 'responsive_spacing_controls_desktop_breakpoint', [
        'type' => 'string',
        'default' => '1024px',
        'sanitize_callback' => function($value) {
            return preg_match('/^\d+(\.\d+)?(px|em|rem)$/', $value) ? $value : '1024px';
        }
    ]);
    
    register_setting('responsive_spacing_controls_options', 'responsive_spacing_controls_tablet_breakpoint', [
        'type' => 'string',
        'default' => '768px',
        'sanitize_callback' => function($value) {
            return preg_match('/^\d+(\.\d+)?(px|em|rem)$/', $value) ? $value : '768px';
        }
    ]);
    
    register_setting('responsive_spacing_controls_options', 'responsive_spacing_controls_mobile_breakpoint', [
        'type' => 'string',
        'default' => '480px',
        'sanitize_callback' => function($value) {
            return preg_match('/^\d+(\.\d+)?(px|em|rem)$/', $value) ? $value : '480px';
        }
    ]);
    
    add_settings_section(
        'responsive_spacing_controls_section',
        'Responsive Breakpoints',
        function() {
            echo '<p>Configure the breakpoints for desktop, tablet, and mobile responsive spacing controls.</p>';
            echo '<p><strong>How it works:</strong></p>';
            echo '<ul>';
            echo '<li><strong>Desktop:</strong> Applies at widths above the desktop breakpoint</li>';
            echo '<li><strong>Tablet:</strong> Applies between tablet and desktop breakpoints</li>';
            echo '<li><strong>Mobile:</strong> Applies below the mobile breakpoint</li>';
            echo '</ul>';
        },
        'responsive-spacing-controls'
    );
    
    add_settings_field(
        'responsive_spacing_controls_desktop_breakpoint',
        'Desktop Breakpoint (min-width)',
        function() {
            $value = esc_attr(get_option('responsive_spacing_controls_desktop_breakpoint', '1024px'));
            echo "<input type='text' name='responsive_spacing_controls_desktop_breakpoint' value='$value' />";
            echo "<p class='description'>Desktop styles apply above this width. Example: 1024px, 64em, 1200px</p>";
        },
        'responsive-spacing-controls',
        'responsive_spacing_controls_section'
    );
    
    add_settings_field(
        'responsive_spacing_controls_tablet_breakpoint',
        'Tablet Breakpoint (max-width)',
        function() {
            $value = esc_attr(get_option('responsive_spacing_controls_tablet_breakpoint', '768px'));
            echo "<input type='text' name='responsive_spacing_controls_tablet_breakpoint' value='$value' />";
            echo "<p class='description'>Tablet styles apply between mobile and desktop breakpoints. Example: 768px, 48em</p>";
        },
        'responsive-spacing-controls',
        'responsive_spacing_controls_section'
    );
    
    add_settings_field(
        'responsive_spacing_controls_mobile_breakpoint',
        'Mobile Breakpoint (max-width)',
        function() {
            $value = esc_attr(get_option('responsive_spacing_controls_mobile_breakpoint', '480px'));
            echo "<input type='text' name='responsive_spacing_controls_mobile_breakpoint' value='$value' />";
            echo "<p class='description'>Mobile styles apply below this width. Example: 480px, 30em</p>";
        },
        'responsive-spacing-controls',
        'responsive_spacing_controls_section'
    );
});

// Output custom responsive breakpoint CSS in editor and frontend
function responsive_spacing_controls_output_breakpoint_css() {
    $desktop_breakpoint = get_option('responsive_spacing_controls_desktop_breakpoint', '1024px');
    $tablet_breakpoint = get_option('responsive_spacing_controls_tablet_breakpoint', '768px');
    $mobile_breakpoint = get_option('responsive_spacing_controls_mobile_breakpoint', '480px');
    
    // Get all used spacing values from the database by scanning all posts
    global $wpdb;
    $used_values = [];
    
    // Get all spacing attribute values from post content
    $posts = $wpdb->get_results("
        SELECT post_content 
        FROM {$wpdb->posts} 
        WHERE post_status = 'publish' 
        AND post_content LIKE '%Padding%' 
        OR post_content LIKE '%Margin%'
    ");
    
    // Extract spacing values from block attributes
    foreach ($posts as $post) {
        if (preg_match_all('/"(?:desktop|tablet|mobile)(?:Padding|Margin)":({[^}]+})/', $post->post_content, $matches)) {
            foreach ($matches[1] as $json_attr) {
                $attr = json_decode($json_attr, true);
                if ($attr) {
                    foreach (['top', 'right', 'bottom', 'left'] as $side) {
                        if (!empty($attr[$side]) && $attr[$side] !== '0px') {
                            $used_values[] = $attr[$side];
                        }
                    }
                }
            }
        }
    }
    
    // Add common default values
    $default_values = [
        '0px', '0.125rem', '0.25rem', '0.5rem', '1rem', '2rem', '4rem', '8rem',
        '1px', '2px', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px', '48px', '64px'
    ];
    
    $all_values = array_unique(array_merge($used_values, $default_values));
    
    $css = '';
    
    // Function to create safe class name from value
    $create_class_name = function($value) {
        // Normalize comma decimal separator to dot
        $normalized_value = str_replace(',', '.', $value);
        // Replace decimal point with 'dot' and remove other special chars
        return preg_replace('/[^a-zA-Z0-9]/', '', str_replace('.', 'dot', $normalized_value));
    };
    
    // Function to normalize spacing value for CSS output
    $normalize_css_value = function($value) {
        // Convert comma decimal separator to dot for CSS
        return str_replace(',', '.', $value);
    };
    
    // Mobile styles (base styles - no media query, applies to all screen sizes first)
    foreach ($all_values as $value) {
        $class_suffix = $create_class_name($value);
        $css_value = $normalize_css_value($value);
        $css .= ".mobile-pt-top-{$class_suffix} { padding-top: {$css_value} !important; }\n";
        $css .= ".mobile-pt-right-{$class_suffix} { padding-right: {$css_value} !important; }\n";
        $css .= ".mobile-pt-bottom-{$class_suffix} { padding-bottom: {$css_value} !important; }\n";
        $css .= ".mobile-pt-left-{$class_suffix} { padding-left: {$css_value} !important; }\n";
        $css .= ".mobile-mg-top-{$class_suffix} { margin-top: {$css_value} !important; }\n";
        $css .= ".mobile-mg-right-{$class_suffix} { margin-right: {$css_value} !important; }\n";
        $css .= ".mobile-mg-bottom-{$class_suffix} { margin-bottom: {$css_value} !important; }\n";
        $css .= ".mobile-mg-left-{$class_suffix} { margin-left: {$css_value} !important; }\n";
    }
    
    // Tablet styles (override mobile when screen is wider than mobile breakpoint)
    $css .= "\n@media (min-width: " . ($mobile_breakpoint) . ") and (max-width: " . ($desktop_breakpoint) . ") {\n";
    foreach ($all_values as $value) {
        $class_suffix = $create_class_name($value);
        $css_value = $normalize_css_value($value);
        $css .= "  .tablet-pt-top-{$class_suffix} { padding-top: {$css_value} !important; }\n";
        $css .= "  .tablet-pt-right-{$class_suffix} { padding-right: {$css_value} !important; }\n";
        $css .= "  .tablet-pt-bottom-{$class_suffix} { padding-bottom: {$css_value} !important; }\n";
        $css .= "  .tablet-pt-left-{$class_suffix} { padding-left: {$css_value} !important; }\n";
        $css .= "  .tablet-mg-top-{$class_suffix} { margin-top: {$css_value} !important; }\n";
        $css .= "  .tablet-mg-right-{$class_suffix} { margin-right: {$css_value} !important; }\n";
        $css .= "  .tablet-mg-bottom-{$class_suffix} { margin-bottom: {$css_value} !important; }\n";
        $css .= "  .tablet-mg-left-{$class_suffix} { margin-left: {$css_value} !important; }\n";
    }
    $css .= "}\n";
    
    // Desktop styles (override tablet/mobile when screen is wider than desktop breakpoint)
    $css .= "\n@media (min-width: {$desktop_breakpoint}) {\n";
    foreach ($all_values as $value) {
        $class_suffix = $create_class_name($value);
        $css_value = $normalize_css_value($value);
        $css .= "  .desktop-pt-top-{$class_suffix} { padding-top: {$css_value} !important; }\n";
        $css .= "  .desktop-pt-right-{$class_suffix} { padding-right: {$css_value} !important; }\n";
        $css .= "  .desktop-pt-bottom-{$class_suffix} { padding-bottom: {$css_value} !important; }\n";
        $css .= "  .desktop-pt-left-{$class_suffix} { padding-left: {$css_value} !important; }\n";
        $css .= "  .desktop-mg-top-{$class_suffix} { margin-top: {$css_value} !important; }\n";
        $css .= "  .desktop-mg-right-{$class_suffix} { margin-right: {$css_value} !important; }\n";
        $css .= "  .desktop-mg-bottom-{$class_suffix} { margin-bottom: {$css_value} !important; }\n";
        $css .= "  .desktop-mg-left-{$class_suffix} { margin-left: {$css_value} !important; }\n";
    }
    $css .= "}\n";
    
    echo '<style id="responsive-spacing-controls-breakpoints">' . $css . '</style>';
}
add_action('admin_head', 'responsive_spacing_controls_output_breakpoint_css');
add_action('wp_head', 'responsive_spacing_controls_output_breakpoint_css');
