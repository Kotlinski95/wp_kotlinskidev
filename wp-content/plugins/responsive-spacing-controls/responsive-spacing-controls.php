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

// Inject mobile spacing classes on frontend and in editor preview
add_filter('render_block', function($block_content, $block) {
    if (empty($block['attrs']['mobilePadding']) && empty($block['attrs']['mobileMargin'])) {
        return $block_content;
    }
    $classes = [];
    foreach (['Padding' => 'pt', 'Margin' => 'mg'] as $type => $prefix) {
        if (!empty($block['attrs']["mobile{$type}"]) && is_array($block['attrs']["mobile{$type}"])) {
            foreach (['top', 'right', 'bottom', 'left'] as $side) {
                $val = $block['attrs']["mobile{$type}"][$side] ?? '';
                if ($val) {
                    $classes[] = "mobile-{$prefix}-{$side}-" . preg_replace('/[^a-zA-Z0-9]/', '', $val);
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

// Add settings page for mobile breakpoint
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
    register_setting('responsive_spacing_controls_options', 'responsive_spacing_controls_breakpoint', [
        'type' => 'string',
        'default' => '768px',
        'sanitize_callback' => function($value) {
            return preg_match('/^\\d+(px|em|rem)$/', $value) ? $value : '768px';
        }
    ]);
    add_settings_section(
        'responsive_spacing_controls_section',
        'Mobile Breakpoint',
        null,
        'responsive-spacing-controls'
    );
    add_settings_field(
        'responsive_spacing_controls_breakpoint',
        'Mobile Breakpoint (e.g. 600px, 40em)',
        function() {
            $value = esc_attr(get_option('responsive_spacing_controls_breakpoint', '768px'));
            echo "<input type='text' name='responsive_spacing_controls_breakpoint' value='$value' />";
        },
        'responsive-spacing-controls',
        'responsive_spacing_controls_section'
    );
});

// Output custom mobile breakpoint CSS in editor and frontend, wrapping external CSS classes
function responsive_spacing_controls_output_breakpoint_css() {
    $breakpoint = get_option('responsive_spacing_controls_breakpoint', '768px');
    $css_path = plugin_dir_path(__FILE__) . 'build/responsive-spacing-controls.css';
    if (file_exists($css_path)) {
        $css = file_get_contents($css_path);
        // Extract only the mobile classes (everything after .components-panel__body)
        $pattern = '/\/\* Mobile spacing classes.*?\*\//s';
        if (preg_match($pattern, $css, $matches, PREG_OFFSET_CAPTURE)) {
            $start = $matches[0][1] + strlen($matches[0][0]);
            $mobile_css = substr($css, $start);
        } else {
            $mobile_css = $css;
        }
        echo '<style id="responsive-spacing-controls-breakpoint">@media (max-width: ' . esc_attr($breakpoint) . ") {\n$mobile_css\n}</style>";
    }
}
add_action('admin_head', 'responsive_spacing_controls_output_breakpoint_css');
add_action('wp_head', 'responsive_spacing_controls_output_breakpoint_css');
