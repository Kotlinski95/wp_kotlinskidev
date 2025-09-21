<?php
/**
 * Hover Animation Controls
 * Enqueues hover animation controls for the block editor
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enqueue hover animation controls script
 */
function kotlinskidev_enqueue_hover_animation_controls() {
    // Only load in admin/editor
    if (!is_admin()) {
        return;
    }

    wp_enqueue_script(
        'kotlinskidev-hover-animation-controls',
        get_template_directory_uri() . '/src/blocks/hover-animation-controls/index.tsx',
        array(
            'wp-blocks',
            'wp-element',
            'wp-editor',
            'wp-components',
            'wp-i18n',
            'wp-hooks',
            'wp-compose'
        ),
        filemtime(get_template_directory() . '/src/blocks/hover-animation-controls/index.tsx'),
        true
    );

    // Make script translatable
    wp_set_script_translations(
        'kotlinskidev-hover-animation-controls',
        'kotlinskidev',
        get_template_directory() . '/languages'
    );
}
add_action('enqueue_block_editor_assets', 'kotlinskidev_enqueue_hover_animation_controls');

/**
 * Add hover animation classes to frontend blocks
 * This ensures the classes are preserved on the frontend
 */
function kotlinskidev_render_block_with_hover_animation($block_content, $block) {
    // Skip if no hover animation attribute
    if (!isset($block['attrs']['hoverAnimation']) || empty($block['attrs']['hoverAnimation'])) {
        return $block_content;
    }

    $hover_animation = $block['attrs']['hoverAnimation'];
    
    // Valid hover animation classes (must match your CSS)
    $valid_animations = [
        'hover-jump',
        'hover-jump-subtle', 
        'hover-jump-smooth',
        'hover-jump-strong',
        'hover-jump-shadow',
        'hover-scale',
        'hover-fade',
        'hover-rotate',
        'hover-bounce'
    ];

    // Only proceed if it's a valid animation
    if (!in_array($hover_animation, $valid_animations)) {
        return $block_content;
    }

    // Add the class to the block wrapper
    if (!empty($block_content)) {
        // Find the first HTML tag and add the class to it
        $pattern = '/^(\s*<[^>]+class=["\']([^"\']*)["\'][^>]*>)/';
        if (preg_match($pattern, $block_content, $matches)) {
            $existing_classes = $matches[2];
            $new_classes = trim($existing_classes . ' ' . $hover_animation);
            $new_tag = str_replace('class="' . $existing_classes . '"', 'class="' . $new_classes . '"', $matches[1]);
            $block_content = str_replace($matches[1], $new_tag, $block_content);
        } else {
            // If no class attribute exists, try to add one
            $pattern = '/^(\s*<[^>]+)>/';
            if (preg_match($pattern, $block_content, $matches)) {
                $new_tag = $matches[1] . ' class="' . $hover_animation . '">';
                $block_content = str_replace($matches[0], $new_tag, $block_content);
            }
        }
    }

    return $block_content;
}
add_filter('render_block', 'kotlinskidev_render_block_with_hover_animation', 10, 2);
