<?php
/*
Plugin Name: Responsive Spacing Controls
Description: Adds responsive margin and padding controls to the block editor (mobile, tablet, desktop).
Version: 1.0.0
Author: Adrian Kotlinski
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
        file_exists(plugin_dir_path(__FILE__) . 'build/index.js') ? filemtime(plugin_dir_path(__FILE__) . 'build/index.js') : '1.0.0',
        true
    );
    if (is_admin()) {
        wp_enqueue_style(
            'responsive-spacing-controls',
            plugins_url('build/index.css', __FILE__),
            array(),
            file_exists(plugin_dir_path(__FILE__) . 'build/index.css') ? filemtime(plugin_dir_path(__FILE__) . 'build/index.css') : '1.0.0'
        );

        // Enqueue dynamic responsive spacing CSS for the block editor
        wp_add_inline_style('responsive-spacing-controls', responsive_spacing_controls_generate_css());

        // Pass breakpoint settings to JavaScript
        $breakpoints = array(
            'desktop' => get_option('responsive_spacing_controls_desktop_breakpoint', '1024px'),
            'tablet' => get_option('responsive_spacing_controls_tablet_breakpoint', '768px'),
            'mobile' => get_option('responsive_spacing_controls_mobile_breakpoint', '480px')
        );
        wp_localize_script('responsive-spacing-controls', 'spacingBreakpoints', $breakpoints);

        // Add inline script to handle live editor updates
        wp_add_inline_script('responsive-spacing-controls', '
            // Function to generate class name from spacing value
            function generateSpacingClassName(prefix, type, side, value) {
                if (!value || value === "0px") return "";
                const classSuffix = value.replace(",", ".").replace(".", "dot").replace(/[^a-zA-Z0-9]/g, "");
                return prefix + "-" + type + "-" + side + "-" + classSuffix;
            }
            
            // Function to inject CSS for new spacing values
            function injectSpacingCSS(value) {
                if (!value || value === "0px") return;
                
                const classSuffix = value.replace(",", ".").replace(".", "dot").replace(/[^a-zA-Z0-9]/g, "");
                const cssValue = value.replace(",", ".");
                
                // Check if CSS already exists for this value
                const existingStyle = document.getElementById("spacing-" + classSuffix);
                if (existingStyle) return;
                
                // Get breakpoint values from WordPress settings
                const mobileBreakpoint = spacingBreakpoints.mobile || "480px";
                const tabletBreakpoint = spacingBreakpoints.tablet || "768px";
                const desktopBreakpoint = spacingBreakpoints.desktop || "1024px";
                
                // Parse numeric values from breakpoints for calculations
                const mobileMax = parseInt(mobileBreakpoint) - 1;
                const tabletMin = parseInt(mobileBreakpoint);
                const tabletMax = parseInt(desktopBreakpoint) - 1;
                const desktopMin = parseInt(desktopBreakpoint);
                
                // Create CSS for this specific value using dynamic breakpoints
                const css = `
                    /* Mobile only (0 to ${mobileMax}px) */
                    @media (max-width: ${mobileMax}px) {
                        .mobile-pt-top-${classSuffix} { padding-top: ${cssValue} !important; }
                        .mobile-pt-right-${classSuffix} { padding-right: ${cssValue} !important; }
                        .mobile-pt-bottom-${classSuffix} { padding-bottom: ${cssValue} !important; }
                        .mobile-pt-left-${classSuffix} { padding-left: ${cssValue} !important; }
                        .mobile-mg-top-${classSuffix} { margin-top: ${cssValue} !important; }
                        .mobile-mg-right-${classSuffix} { margin-right: ${cssValue} !important; }
                        .mobile-mg-bottom-${classSuffix} { margin-bottom: ${cssValue} !important; }
                        .mobile-mg-left-${classSuffix} { margin-left: ${cssValue} !important; }
                    }
                    
                    /* Tablet only (${tabletMin}px to ${tabletMax}px) */
                    @media (min-width: ${tabletMin}px) and (max-width: ${tabletMax}px) {
                        .tablet-pt-top-${classSuffix} { padding-top: ${cssValue} !important; }
                        .tablet-pt-right-${classSuffix} { padding-right: ${cssValue} !important; }
                        .tablet-pt-bottom-${classSuffix} { padding-bottom: ${cssValue} !important; }
                        .tablet-pt-left-${classSuffix} { padding-left: ${cssValue} !important; }
                        .tablet-mg-top-${classSuffix} { margin-top: ${cssValue} !important; }
                        .tablet-mg-right-${classSuffix} { margin-right: ${cssValue} !important; }
                        .tablet-mg-bottom-${classSuffix} { margin-bottom: ${cssValue} !important; }
                        .tablet-mg-left-${classSuffix} { margin-left: ${cssValue} !important; }
                    }
                    
                    /* Desktop only (${desktopMin}px and up) */
                    @media (min-width: ${desktopMin}px) {
                        .desktop-pt-top-${classSuffix} { padding-top: ${cssValue} !important; }
                        .desktop-pt-right-${classSuffix} { padding-right: ${cssValue} !important; }
                        .desktop-pt-bottom-${classSuffix} { padding-bottom: ${cssValue} !important; }
                        .desktop-pt-left-${classSuffix} { padding-left: ${cssValue} !important; }
                        .desktop-mg-top-${classSuffix} { margin-top: ${cssValue} !important; }
                        .desktop-mg-right-${classSuffix} { margin-right: ${cssValue} !important; }
                        .desktop-mg-bottom-${classSuffix} { margin-bottom: ${cssValue} !important; }
                        .desktop-mg-left-${classSuffix} { margin-left: ${cssValue} !important; }
                    }
                `;
                
                // Inject the CSS
                const styleElement = document.createElement("style");
                styleElement.id = "spacing-" + classSuffix;
                styleElement.textContent = css;
                document.head.appendChild(styleElement);
            }
            
            // Function to find the actual block element in editor
            function findBlockElement(clientId) {
                // Try multiple selectors that WordPress might use
                const selectors = [
                    `[data-block="${clientId}"]`,
                    `#block-${clientId}`,
                    `.wp-block[data-block="${clientId}"]`,
                    `[data-client-id="${clientId}"]`,
                    `.block-editor-block-list__block[data-client-id="${clientId}"]`
                ];
                
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        return element;
                    }
                }
                
                // If none found, try to find by walking the DOM
                const allBlocks = document.querySelectorAll(".wp-block, .block-editor-block-list__block");
                for (const block of allBlocks) {
                    if (block.getAttribute("data-block") === clientId || 
                        block.getAttribute("data-client-id") === clientId ||
                        block.id === `block-${clientId}`) {
                        return block;
                    }
                }
                
                console.warn("Could not find block element for clientId:", clientId);
                return null;
            }
            
            // Function to apply spacing classes to block element in editor
            function applySpacingClassesToEditor(clientId, attributes) {
                
                const blockElement = findBlockElement(clientId);
                if (!blockElement) {
                    console.warn("Block element not found for:", clientId);
                    return;
                }
                
                
                // Remove existing spacing classes
                const existingClasses = blockElement.className.split(" ");
                const filteredClasses = existingClasses.filter(cls => {
                    const isSpacingClass = /^(desktop|tablet|mobile)-(pt|mg)-(top|right|bottom|left)-/.test(cls);
                    return !isSpacingClass;
                });
                
                // Generate new spacing classes and inject CSS for new values
                const newClasses = [];
                const spacingTypes = [
                    {prefix: "desktop", data: attributes.desktopPadding, type: "pt"},
                    {prefix: "desktop", data: attributes.desktopMargin, type: "mg"},
                    {prefix: "tablet", data: attributes.tabletPadding, type: "pt"},
                    {prefix: "tablet", data: attributes.tabletMargin, type: "mg"},
                    {prefix: "mobile", data: attributes.mobilePadding, type: "pt"},
                    {prefix: "mobile", data: attributes.mobileMargin, type: "mg"}
                ];
                
                spacingTypes.forEach(({prefix, data, type}) => {
                    if (data && typeof data === "object") {
                        ["top", "right", "bottom", "left"].forEach(side => {
                            if (data[side] && data[side] !== "0px") {
                                // Inject CSS for this value if it doesn not exist
                                injectSpacingCSS(data[side]);
                                
                                const className = generateSpacingClassName(prefix, type, side, data[side]);
                                if (className) {
                                    newClasses.push(className);
                                }
                            }
                        });
                    }
                });
                
                // Apply new classes
                const finalClasses = [...filteredClasses, ...newClasses].join(" ");
                blockElement.className = finalClasses;
            }
            
            // Enhanced hook into block updates
            wp.hooks.addAction("blocks.updateBlock", "responsive-spacing-controls/update-editor-classes", function(clientId, updates) {
                
                if (updates.attributes) {
                    const hasSpacingUpdates = Object.keys(updates.attributes).some(key => 
                        key.includes("Padding") || key.includes("Margin")
                    );
                    
                    if (hasSpacingUpdates) {
                        
                        // Try multiple timings to ensure DOM is ready
                        [10, 50, 100, 200].forEach(delay => {
                            setTimeout(() => {
                                const block = wp.data.select("core/block-editor").getBlock(clientId);
                                if (block) {
                                    applySpacingClassesToEditor(clientId, block.attributes);
                                }
                            }, delay);
                        });
                    }
                }
            });
            
            // Also hook into selection changes to apply classes when blocks are selected
            wp.data.subscribe(() => {
                const selectedBlockClientId = wp.data.select("core/block-editor").getSelectedBlockClientId();
                if (selectedBlockClientId) {
                    const block = wp.data.select("core/block-editor").getBlock(selectedBlockClientId);
                    if (block && (block.attributes.desktopPadding || block.attributes.tabletPadding || 
                                  block.attributes.mobilePadding || block.attributes.desktopMargin || 
                                  block.attributes.tabletMargin || block.attributes.mobileMargin)) {
                        setTimeout(() => {
                            applySpacingClassesToEditor(selectedBlockClientId, block.attributes);
                        }, 50);
                    }
                }
            });
            
            // Listen for viewport/device type changes in the editor
            let currentDeviceType = null;
            wp.data.subscribe(() => {
                // Try different selectors for device type detection
                let deviceType = null;
                
                try {
                    // Try core/edit-post first (Gutenberg/Block Editor)
                    if (wp.data.select("core/edit-post") && wp.data.select("core/edit-post").__experimentalGetPreviewDeviceType) {
                        deviceType = wp.data.select("core/edit-post").__experimentalGetPreviewDeviceType();
                    }
                    // Fallback to core/editor
                    else if (wp.data.select("core/editor") && wp.data.select("core/editor").__experimentalGetPreviewDeviceType) {
                        deviceType = wp.data.select("core/editor").__experimentalGetPreviewDeviceType();
                    }
                    // Another fallback method
                    else if (wp.data.select("core/edit-site") && wp.data.select("core/edit-site").__experimentalGetPreviewDeviceType) {
                        deviceType = wp.data.select("core/edit-site").__experimentalGetPreviewDeviceType();
                    }
                } catch (error) {
                    // If all selectors fail, try to detect device type from viewport width
                    const viewportWidth = window.innerWidth;
                    const mobileBreakpoint = parseInt(spacingBreakpoints.mobile) || 480;
                    const desktopBreakpoint = parseInt(spacingBreakpoints.desktop) || 1024;
                    
                    if (viewportWidth < mobileBreakpoint) {
                        deviceType = "Mobile";
                    } else if (viewportWidth < desktopBreakpoint) {
                        deviceType = "Tablet";
                    } else {
                        deviceType = "Desktop";
                    }
                }
                
                if (deviceType && deviceType !== currentDeviceType) {
                    currentDeviceType = deviceType;
                    
                    // Re-apply spacing classes to all blocks with responsive spacing
                    setTimeout(() => {
                        const allBlocks = wp.data.select("core/block-editor").getBlocks();
                        
                        function processBlocks(blocks) {
                            blocks.forEach(block => {
                                if (block.attributes && (block.attributes.desktopPadding || block.attributes.tabletPadding || 
                                                          block.attributes.mobilePadding || block.attributes.desktopMargin || 
                                                          block.attributes.tabletMargin || block.attributes.mobileMargin)) {
                                    applySpacingClassesToEditor(block.clientId, block.attributes);
                                }
                                
                                // Process inner blocks recursively
                                if (block.innerBlocks && block.innerBlocks.length > 0) {
                                    processBlocks(block.innerBlocks);
                                }
                            });
                        }
                        
                        processBlocks(allBlocks);
                    }, 100);
                }
            });

        ');
    }
}
add_action('enqueue_block_editor_assets', 'responsive_spacing_controls_enqueue_editor_assets');

function responsive_spacing_controls_enqueue_frontend_assets()
{
    wp_enqueue_style(
        'responsive-spacing-controls-style',
        plugins_url('build/responsive-spacing-controls.css', __FILE__),
        array(),
        file_exists(plugin_dir_path(__FILE__) . 'build/responsive-spacing-controls.css') ? filemtime(plugin_dir_path(__FILE__) . 'build/responsive-spacing-controls.css') : '1.0.0'
    );

    // Also enqueue dynamic responsive spacing CSS for the frontend
    wp_add_inline_style('responsive-spacing-controls-style', responsive_spacing_controls_generate_css());
}
add_action('wp_enqueue_scripts', 'responsive_spacing_controls_enqueue_frontend_assets');

// Inject responsive spacing classes on frontend and in editor preview
add_filter('render_block', function ($block_content, $block) {
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
        // Check if classes already exist to prevent duplicates
        $existing_classes = '';
        if (preg_match('/class="([^"]*)"/', $block_content, $matches)) {
            $existing_classes = $matches[1];
        }

        // Filter out classes that already exist
        $new_classes = [];
        foreach ($classes as $class) {
            if (strpos($existing_classes, $class) === false) {
                $new_classes[] = $class;
            }
        }

        if (!empty($new_classes)) {
            $block_content = preg_replace(
                '/(<[^>]+class=")([^"]*)"/',
                '$1$2 ' . implode(' ', $new_classes) . '"',
                $block_content,
                1
            );
        }
    }
    return $block_content;
}, 10, 2);

// Add settings page for responsive breakpoints
add_action('admin_menu', function () {
    add_options_page(
        'Responsive Spacing Controls',
        'Responsive Spacing',
        'manage_options',
        'responsive-spacing-controls',
        'responsive_spacing_controls_settings_page'
    );
});

function responsive_spacing_controls_settings_page()
{
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

add_action('admin_init', function () {
    register_setting('responsive_spacing_controls_options', 'responsive_spacing_controls_desktop_breakpoint', [
        'type' => 'string',
        'default' => '1024px',
        'sanitize_callback' => function ($value) {
            return preg_match('/^\d+(\.\d+)?(px|em|rem)$/', $value) ? $value : '1024px';
        }
    ]);

    register_setting('responsive_spacing_controls_options', 'responsive_spacing_controls_tablet_breakpoint', [
        'type' => 'string',
        'default' => '768px',
        'sanitize_callback' => function ($value) {
            return preg_match('/^\d+(\.\d+)?(px|em|rem)$/', $value) ? $value : '768px';
        }
    ]);

    register_setting('responsive_spacing_controls_options', 'responsive_spacing_controls_mobile_breakpoint', [
        'type' => 'string',
        'default' => '480px',
        'sanitize_callback' => function ($value) {
            return preg_match('/^\d+(\.\d+)?(px|em|rem)$/', $value) ? $value : '480px';
        }
    ]);

    add_settings_section(
        'responsive_spacing_controls_section',
        'Responsive Breakpoints',
        function () {
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
        function () {
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
        function () {
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
        function () {
            $value = esc_attr(get_option('responsive_spacing_controls_mobile_breakpoint', '480px'));
            echo "<input type='text' name='responsive_spacing_controls_mobile_breakpoint' value='$value' />";
            echo "<p class='description'>Mobile styles apply below this width. Example: 480px, 30em</p>";
        },
        'responsive-spacing-controls',
        'responsive_spacing_controls_section'
    );
});

// Generate responsive spacing CSS
function responsive_spacing_controls_generate_css()
{
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
        AND (post_content LIKE '%Padding%' OR post_content LIKE '%Margin%')
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

    // Add common default values including the ones you're using
    $default_values = [
        '0px',
        '0.125rem',
        '0.25rem',
        '0.5rem',
        '1rem',
        '2rem',
        '4rem',
        '8rem',
        '1px',
        '2px',
        '4px',
        '8px',
        '12px',
        '16px',
        '20px',
        '24px',
        '32px',
        '35px',
        '40px',
        '48px',
        '64px',
        '25px',
        '22.5px',
        '5.5rem',
        '1.1rem',
        '6.5rem',
        '1.3rem' // Add your specific values
    ];

    $all_values = array_unique(array_merge($used_values, $default_values));

    $css = '';

    // Function to create safe class name from value (MUST match the render_block logic)
    $create_class_name = function ($value) {
        // This MUST match exactly what's in render_block filter
        return preg_replace('/[^a-zA-Z0-9]/', '', str_replace('.', 'dot', $value));
    };

    // Function to normalize spacing value for CSS output
    $normalize_css_value = function ($value) {
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

    return $css;
}

// Output custom responsive breakpoint CSS in editor and frontend
function responsive_spacing_controls_output_breakpoint_css()
{
    echo '<style id="responsive-spacing-controls-breakpoints">' . responsive_spacing_controls_generate_css() . '</style>';
}
// Removed duplicate CSS output - now using wp_add_inline_style instead

// Debug function to see generated CSS (remove after debugging)
function responsive_spacing_controls_debug_css()
{
    if (is_admin() && current_user_can('manage_options') && isset($_GET['debug_spacing_css'])) {
        echo '<pre style="background: #f1f1f1; padding: 20px; margin: 20px; font-size: 12px; overflow: auto; max-height: 500px;">';
        echo 'Generated CSS for Responsive Spacing Controls:' . "\n\n";
        echo esc_html(responsive_spacing_controls_generate_css());
        echo '</pre>';
    }
}
add_action('admin_notices', 'responsive_spacing_controls_debug_css');