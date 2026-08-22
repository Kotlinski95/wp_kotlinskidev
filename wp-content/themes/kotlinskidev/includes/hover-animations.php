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

function kotlinskidev_valid_hover_animations() {
    return [
        'hover-jump',
        'hover-jump-subtle',
        'hover-jump-smooth',
        'hover-jump-strong',
        'hover-jump-shadow',
        'hover-scale',
        'hover-fade',
        'hover-rotate',
        'hover-bounce',
        'constant-bounce',
        'constant-bounce-subtle',
        'constant-bounce-strong',
        'constant-bounce-fast',
    ];
}

/**
 * Add hover animation classes to frontend blocks
 * This ensures the classes are preserved on the frontend
 */
function kotlinskidev_render_block_with_hover_animation($block_content, $block) {
    if (empty($block_content) || trim($block_content) === '') {
        return $block_content;
    }

    $attrs = $block['attrs'] ?? [];
    $valid_animations = kotlinskidev_valid_hover_animations();

    $primary = (string) ( $attrs['hoverAnimation'] ?? '' );
    $extra = is_array( $attrs['hoverAnimationExtra'] ?? null ) ? $attrs['hoverAnimationExtra'] : [];
    $opacity_enabled = ! empty( $attrs['hoverOpacityEnabled'] );

    $classes = array_values( array_unique( array_filter(
        array_merge( [ $primary ], $extra ),
        fn( $value ) => in_array( $value, $valid_animations, true )
    ) ) );

    if ( $opacity_enabled ) {
        $classes[] = 'has-hover-opacity';
    }

    if ( empty( $classes ) ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag() ) {
        return $block_content;
    }

    $existing_class = $processor->get_attribute( 'class' );
    $existing_class = is_string( $existing_class ) ? $existing_class . ' ' : '';
    $processor->set_attribute( 'class', trim( $existing_class . implode( ' ', $classes ) ) );

    return $processor->get_updated_html();
}
add_filter('render_block', 'kotlinskidev_render_block_with_hover_animation', 10, 2);
