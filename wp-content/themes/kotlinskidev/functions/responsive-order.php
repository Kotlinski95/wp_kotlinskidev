<?php
/**
 * Responsive Order Block Extension
 * Adds responsive order controls to all WordPress blocks
 */

// Add responsive order attributes to block render
function kotlinskidev_add_responsive_order_attributes($block_content, $block) {
    // Skip if no responsive order attributes
    if (!isset($block['attrs']['responsiveOrder'])) {
        return $block_content;
    }

    $responsive_order = $block['attrs']['responsiveOrder'];
    $classes = [];

    // Generate CSS classes for each breakpoint (values -1 to 20)
    if (isset($responsive_order['desktop']) && $responsive_order['desktop'] >= -1 && $responsive_order['desktop'] <= 20 && $responsive_order['desktop'] != 0) {
        $classes[] = 'order-desktop-' . $responsive_order['desktop'];
    }
    if (isset($responsive_order['tablet']) && $responsive_order['tablet'] >= -1 && $responsive_order['tablet'] <= 20 && $responsive_order['tablet'] != 0) {
        $classes[] = 'order-tablet-' . $responsive_order['tablet'];
    }
    if (isset($responsive_order['mobile']) && $responsive_order['mobile'] >= -1 && $responsive_order['mobile'] <= 20 && $responsive_order['mobile'] != 0) {
        $classes[] = 'order-mobile-' . $responsive_order['mobile'];
    }

    // Add classes to the block wrapper if we have any order classes
    if (!empty($classes)) {
        $class_string = implode(' ', $classes);
        
        // Find the first opening tag and merge our classes into its class attribute
        $new_content = preg_replace(
            '/^(\s*<[^>]+class="[^"]*)"/',
            '$1 ' . esc_attr($class_string) . '"',
            $block_content
        );

        // If no class attribute exists, add one
        if (strpos($block_content, 'class=') === false) {
            $new_content = preg_replace(
                '/^(\s*)(<[^>]+)(>)/',
                '$1$2 class="' . esc_attr($class_string) . '"$3',
                $block_content
            );
        }
        
        return $new_content;
    }

    return $block_content;
}
add_filter('render_block', 'kotlinskidev_add_responsive_order_attributes', 10, 2);

/**
 * Enqueue responsive order block editor assets
 */
function kotlinskidev_enqueue_responsive_order_assets() {
    if (!is_admin()) {
        return;
    }

    wp_enqueue_script(
        'kotlinskidev-responsive-order-controls',
        get_template_directory_uri() . '/src/blocks/responsive-order/index.tsx',
        array(
            'wp-blocks',
            'wp-element',
            'wp-block-editor',
            'wp-components',
            'wp-i18n',
            'wp-hooks',
            'wp-compose'
        ),
        filemtime(get_template_directory() . '/src/blocks/responsive-order/index.tsx'),
        true
    );

    // Make script translatable
    wp_set_script_translations(
        'kotlinskidev-responsive-order-controls',
        'kotlinskidev',
        get_template_directory() . '/languages'
    );
}
add_action('enqueue_block_editor_assets', 'kotlinskidev_enqueue_responsive_order_assets');
