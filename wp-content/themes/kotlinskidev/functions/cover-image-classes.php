<?php
/**
 * Add classes to cover block images for lazy loading control
 */
function add_cover_image_classes($output, $block)
{
    // Only process cover and image blocks
    if ($block['blockName'] !== 'core/cover' && $block['blockName'] !== 'core/image') {
        return $output;
    }

    // Check if this specific block should skip lazy loading
    $skip_lazy = isset($block['attrs']['kotlinskidevSkipLazy']) && $block['attrs']['kotlinskidevSkipLazy'];
    
    if ($skip_lazy) {
        // Get the configurable class name from theme options
        $lazy_class = get_theme_mod('kotlinskidev_lazy_loading_class', 'skip-lazy');
        
        // Add the class to exclude from lazy loading to any img tag
        $output = preg_replace(
            '/(<img[^>]*class="[^"]*)(")/',
            '$1 ' . esc_attr($lazy_class) . '$2',
            $output
        );
    }

    return $output;
}
add_filter('render_block', 'add_cover_image_classes', 10, 2);

/**
 * Add custom attributes to core/cover block without re-registering
 */
function add_cover_block_attributes() {
    // Don't re-register the block, just add support for our custom attribute
    // The TypeScript will handle adding the attribute to the block editor
    
    // This is handled by the TypeScript in cover-lazy-loading/index.tsx
    // which uses the blocks.registerBlockType filter to add the attribute
}
add_action('init', 'add_cover_block_attributes');
