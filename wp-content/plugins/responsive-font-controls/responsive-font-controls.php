<?php
/**
 * Plugin Name: Responsive Font Controls
 * Description: Adds responsive font size controls to WordPress blocks, allowing different font sizes for mobile, tablet, and desktop.
 * Version: 1.0.0
 * Author: Adrian Kotlinski
 * Text Domain: responsive-font-controls
 */
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ResponsiveFontControls
{

    public function __construct()
    {
        add_action('init', array($this, 'init'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_editor_assets'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'settings_init'));
    }

    public function init()
    {
        // Register block supports for responsive font controls
        add_filter('block_type_metadata', array($this, 'add_responsive_font_supports'));
        add_filter('render_block', array($this, 'render_responsive_font_styles'), 10, 2);
    }

    public function add_admin_menu()
    {
        add_options_page(
            __('Responsive Font Controls', 'responsive-font-controls'),
            __('Responsive Font Controls', 'responsive-font-controls'),
            'manage_options',
            'responsive-font-controls',
            array($this, 'options_page')
        );
    }

    public function settings_init()
    {
        register_setting('responsive_font_controls', 'responsive_font_controls_settings');

        add_settings_section(
            'responsive_font_controls_breakpoints_section',
            __('Responsive Breakpoints', 'responsive-font-controls'),
            array($this, 'breakpoints_section_callback'),
            'responsive_font_controls'
        );

        add_settings_field(
            'tablet_breakpoint',
            __('Tablet Breakpoint (px)', 'responsive-font-controls'),
            array($this, 'tablet_breakpoint_render'),
            'responsive_font_controls',
            'responsive_font_controls_breakpoints_section'
        );

        add_settings_field(
            'desktop_breakpoint',
            __('Desktop Breakpoint (px)', 'responsive-font-controls'),
            array($this, 'desktop_breakpoint_render'),
            'responsive_font_controls',
            'responsive_font_controls_breakpoints_section'
        );
    }

    public function breakpoints_section_callback()
    {
        echo __('Configure the breakpoints for responsive font sizes. These values determine when the font sizes switch between mobile, tablet, and desktop.', 'responsive-font-controls');
    }

    public function tablet_breakpoint_render()
    {
        $options = get_option('responsive_font_controls_settings', array());
        $tablet_breakpoint = isset($options['tablet_breakpoint']) ? $options['tablet_breakpoint'] : '768';
?>
        <input type='number' name='responsive_font_controls_settings[tablet_breakpoint]' value='<?php echo esc_attr($tablet_breakpoint); ?>' min='300' max='2000' />
        <p class="description"><?php _e('Minimum width for tablet view (default: 768px)', 'responsive-font-controls'); ?></p>
    <?php
    }

    public function desktop_breakpoint_render()
    {
        $options = get_option('responsive_font_controls_settings', array());
        $desktop_breakpoint = isset($options['desktop_breakpoint']) ? $options['desktop_breakpoint'] : '1024';
    ?>
        <input type='number' name='responsive_font_controls_settings[desktop_breakpoint]' value='<?php echo esc_attr($desktop_breakpoint); ?>' min='500' max='2000' />
        <p class="description"><?php _e('Minimum width for desktop view (default: 1024px)', 'responsive-font-controls'); ?></p>
    <?php
    }

    public function options_page()
    {
    ?>
        <div class="wrap">
            <h1><?php _e('Responsive Font Controls Settings', 'responsive-font-controls'); ?></h1>
            <form action='options.php' method='post'>
                <?php
                settings_fields('responsive_font_controls');
                do_settings_sections('responsive_font_controls');
                submit_button();
                ?>
            </form>

            <div class="card" style="margin-top: 20px;">
                <h2><?php _e('How to Use', 'responsive-font-controls'); ?></h2>
                <p><?php _e('1. Edit any block that supports typography (headings, paragraphs, etc.)', 'responsive-font-controls'); ?></p>
                <p><?php _e('2. In the block inspector panel, look for "Responsive Font Size"', 'responsive-font-controls'); ?></p>
                <p><?php _e('3. Set different font sizes for mobile, tablet, and desktop', 'responsive-font-controls'); ?></p>
                <p><?php _e('4. Leave a field empty to use the default font size for that breakpoint', 'responsive-font-controls'); ?></p>
            </div>
        </div>
<?php
    }

    public function enqueue_editor_assets()
    {
        wp_enqueue_script(
            'responsive-font-controls-editor',
            plugin_dir_url(__FILE__) . 'build/index.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
            '1.0.0',
            true
        );

        // Pass plugin settings to JavaScript
        $options = get_option('responsive_font_controls_settings', array());
        $tablet_breakpoint = isset($options['tablet_breakpoint']) ? $options['tablet_breakpoint'] : '768';
        $desktop_breakpoint = isset($options['desktop_breakpoint']) ? $options['desktop_breakpoint'] : '1024';

        wp_localize_script(
            'responsive-font-controls-editor',
            'responsiveFontControlsSettings',
            array(
                'tabletBreakpoint' => $tablet_breakpoint,
                'desktopBreakpoint' => $desktop_breakpoint
            )
        );

        wp_enqueue_style(
            'responsive-font-controls-editor',
            plugin_dir_url(__FILE__) . 'build/index.css',
            array(),
            '1.0.0'
        );

        // Add editor preview functionality
        if (is_admin()) {
            wp_add_inline_script('responsive-font-controls-editor', '
                function injectFontSizeCSS(value) {
                    let styleId = "responsive-font-size-preview-" + value.replace(/[^a-zA-Z0-9]/g, "-");
                    let existingStyle = document.getElementById(styleId);
                    if (existingStyle) {
                        existingStyle.remove();
                    }
                    
                    if (value && value !== "remove") {
                        const style = document.createElement("style");
                        style.id = styleId;
                        style.textContent = value;
                        document.head.appendChild(style);
                    }
                }
                
                // Function to find the actual block element in editor
                function findBlockElement(clientId) {
                    // Try multiple selectors to find the block
                    const selectors = [
                        `[data-block="${clientId}"]`,
                        `#block-${clientId}`,
                        `.wp-block[data-block="${clientId}"]`,
                        `.block-editor-block-list__block[data-block="${clientId}"]`
                    ];
                    
                    for (const selector of selectors) {
                        const element = document.querySelector(selector);
                        if (element) return element;
                    }
                    
                    // Fallback: search through all blocks
                    const allBlocks = document.querySelectorAll(".wp-block, .block-editor-block-list__block");
                    for (const block of allBlocks) {
                        if (block.getAttribute("data-block") === clientId) {
                            return block;
                        }
                    }
                    
                    console.warn("Could not find block element for clientId:", clientId);
                    return null;
                }
                
                // Function to apply font size classes to block element in editor
                function applyFontSizeClassesToEditor(clientId, attributes) {
                    const blockElement = findBlockElement(clientId);
                    if (!blockElement) {
                        return;
                    }
                    
                    // Remove existing font size classes
                    const existingClasses = blockElement.className.split(" ");
                    const filteredClasses = existingClasses.filter(cls => {
                        return !cls.startsWith("responsive-font-");
                    });
                    
                    // Generate new font size classes and inject CSS for new values
                    const newClasses = [];
                    const fontSizeData = attributes.responsiveFontSize;
                    
                    if (fontSizeData && typeof fontSizeData === "object") {
                        const breakpoints = {
                            mobile: ' . $tablet_breakpoint . ' - 1,
                            tablet: ' . $tablet_breakpoint . ',
                            desktop: ' . $desktop_breakpoint . '
                        };
                        
                        Object.keys(fontSizeData).forEach(device => {
                            if (["mobile", "tablet", "desktop"].includes(device) && fontSizeData[device]) {
                                const fontSize = fontSizeData[device];
                                const className = `responsive-font-${device}-${fontSize.replace(/[^a-zA-Z0-9]/g, "")}`;
                                newClasses.push(className);
                                
                                // Generate CSS for this font size
                                let css = "";
                                if (device === "mobile") {
                                    css = `@media (max-width: ${breakpoints.mobile}px) { .${className} { font-size: ${fontSize} !important; } }`;
                                } else if (device === "tablet") {
                                    css = `@media (min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px) { .${className} { font-size: ${fontSize} !important; } }`;
                                } else if (device === "desktop") {
                                    css = `@media (min-width: ${breakpoints.desktop}px) { .${className} { font-size: ${fontSize} !important; } }`;
                                }
                                
                                injectFontSizeCSS(css);
                            }
                        });
                    }
                    
                    // Apply new classes
                    const finalClasses = [...filteredClasses, ...newClasses].join(" ");
                    blockElement.className = finalClasses;
                }
                
                // Hook into block updates
                wp.hooks.addAction("blocks.updateBlock", "responsive-font-controls/update-editor-classes", function(clientId, updates) {
                    if (updates.attributes && updates.attributes.responsiveFontSize) {
                        setTimeout(() => {
                            const block = wp.data.select("core/block-editor").getBlock(clientId);
                            if (block) {
                                applyFontSizeClassesToEditor(clientId, block.attributes);
                            }
                        }, 50);
                    }
                });
                
                // Also hook into selection changes to apply classes when blocks are selected
                wp.data.subscribe(() => {
                    const selectedBlockClientId = wp.data.select("core/block-editor").getSelectedBlockClientId();
                    if (selectedBlockClientId) {
                        const block = wp.data.select("core/block-editor").getBlock(selectedBlockClientId);
                        if (block && block.attributes.responsiveFontSize) {
                            setTimeout(() => {
                                applyFontSizeClassesToEditor(selectedBlockClientId, block.attributes);
                            }, 50);
                        }
                    }
                });
            ');
        }
    }

    public function enqueue_frontend_assets()
    {
        wp_enqueue_style(
            'responsive-font-controls-frontend',
            plugin_dir_url(__FILE__) . 'build/responsive-font-controls.css',
            array(),
            '1.0.0'
        );
    }

    public function add_responsive_font_supports($metadata)
    {
        // Add responsive font support to blocks that support typography
        if (isset($metadata['supports']['typography'])) {
            $metadata['supports']['responsiveFontSize'] = true;
        }
        return $metadata;
    }

    public function render_responsive_font_styles($block_content, $block)
    {
        // Debug: Log what we're receiving
        error_log('Block name: ' . ($block['blockName'] ?? 'unknown'));
        error_log('Block attrs: ' . print_r($block['attrs'] ?? array(), true));

        if (!isset($block['attrs']['responsiveFontSize'])) {
            return $block_content;
        }

        $font_sizes = $block['attrs']['responsiveFontSize'];

        // Debug: Log font sizes
        error_log('Font sizes: ' . print_r($font_sizes, true));

        // Check if we actually have any font sizes set
        $has_mobile = !empty($font_sizes['mobile']);
        $has_tablet = !empty($font_sizes['tablet']);
        $has_desktop = !empty($font_sizes['desktop']);

        if (!$has_mobile && !$has_tablet && !$has_desktop) {
            error_log('No font sizes set, skipping...');
            return $block_content;
        }

        $block_id = 'responsive-font-' . wp_unique_id();

        // Add unique class to the block
        $updated_content = $this->add_class_to_block($block_content, $block_id);

        // Generate responsive CSS
        $responsive_styles = $this->generate_responsive_font_css($block_id, $font_sizes);

        // Debug: Log generated CSS
        error_log('Generated CSS: ' . $responsive_styles);

        if (!empty($responsive_styles)) {
            $updated_content = '<style>' . $responsive_styles . '</style>' . $updated_content;
        }

        // Debug: Log final content
        error_log('Final content: ' . $updated_content);

        return $updated_content;
    }

    private function add_class_to_block($content, $class)
    {
        // Use WP_HTML_Tag_Processor for more reliable class addition
        if (class_exists('WP_HTML_Tag_Processor')) {
            $processor = new WP_HTML_Tag_Processor($content);
            if ($processor->next_tag()) {
                $processor->add_class($class);
                return $processor->get_updated_html();
            }
        }

        // Fallback method for older WordPress versions
        // Check if the element already has a class attribute
        if (preg_match('/^<([^>\s]+)([^>]*)\sclass="([^"]*)"([^>]*)>/', $content, $matches)) {
            // Element has existing classes - add our class to them
            $existing_classes = $matches[3];
            $new_classes = $existing_classes . ' ' . $class;
            return preg_replace('/^<([^>\s]+)([^>]*)\sclass="([^"]*)"([^>]*)>/', '<$1$2 class="' . $new_classes . '"$4>', $content, 1);
        } else {
            // Element has no class attribute - add one
            return preg_replace('/^<([^>\s]+)([^>]*)>/', '<$1$2 class="' . $class . '">', $content, 1);
        }
    }

    private function generate_responsive_font_css($selector, $font_sizes)
    {
        $css = '';
        $options = get_option('responsive_font_controls_settings', array());
        $tablet_breakpoint = isset($options['tablet_breakpoint']) ? $options['tablet_breakpoint'] : '768';
        $desktop_breakpoint = isset($options['desktop_breakpoint']) ? $options['desktop_breakpoint'] : '1024';

        // Mobile (up to tablet breakpoint - 1px)
        if (isset($font_sizes['mobile']) && !empty($font_sizes['mobile'])) {
            $css .= "@media (max-width: " . ($tablet_breakpoint - 1) . "px) { .{$selector} { font-size: {$font_sizes['mobile']} !important; } }\n";
        }

        // Tablet (from tablet breakpoint to desktop breakpoint - 1px)
        if (isset($font_sizes['tablet']) && !empty($font_sizes['tablet'])) {
            $css .= "@media (min-width: {$tablet_breakpoint}px) and (max-width: " . ($desktop_breakpoint - 1) . "px) { .{$selector} { font-size: {$font_sizes['tablet']} !important; } }\n";
        }

        // Desktop (from desktop breakpoint and up)
        if (isset($font_sizes['desktop']) && !empty($font_sizes['desktop'])) {
            $css .= "@media (min-width: {$desktop_breakpoint}px) { .{$selector} { font-size: {$font_sizes['desktop']} !important; } }\n";
        }

        return $css;
    }
}
new ResponsiveFontControls();