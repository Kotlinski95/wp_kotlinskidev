<?php
/**
 * Control lazy loading directly for cover and image blocks
 */
function control_block_lazy_loading($output, $block)
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
        
        // Remove any lazy loading attributes and force eager loading
        $output = preg_replace_callback(
            '/<img([^>]*)>/i',
            function($matches) use ($lazy_class) {
                $img_attributes = $matches[1];
                
                // Remove any existing lazy loading attributes
                $img_attributes = preg_replace('/\s*loading=["\'][^"\']*["\']/', '', $img_attributes);
                $img_attributes = preg_replace('/\s*data-lazy-src=["\'][^"\']*["\']/', '', $img_attributes);
                $img_attributes = preg_replace('/\s*data-src=["\'][^"\']*["\']/', '', $img_attributes);
                $img_attributes = preg_replace('/\s*data-lazy=["\'][^"\']*["\']/', '', $img_attributes);
                
                // Force eager loading
                $img_attributes .= ' loading="eager"';
                
                // Add both the configurable skip-lazy class AND the debug class
                $classes_to_add = array($lazy_class, 'no-lazy-loading');
                
                if (strpos($img_attributes, 'class=') !== false) {
                    // Add to existing class attribute
                    $img_attributes = preg_replace('/class="([^"]*)"/', 'class="$1 ' . implode(' ', $classes_to_add) . '"', $img_attributes);
                } else {
                    // Create new class attribute
                    $img_attributes .= ' class="' . implode(' ', $classes_to_add) . '"';
                }
                
                return '<img' . $img_attributes . '>';
            },
            $output
        );
    }

    return $output;
}
add_filter('render_block', 'control_block_lazy_loading', 10, 2);

/**
 * Also disable WordPress native lazy loading for these blocks
 */
function disable_wp_lazy_loading_for_blocks($value, $image, $context) {
    // Check if we're in a block context and should skip lazy loading
    if (doing_filter('render_block')) {
        global $current_block_skip_lazy;
        if ($current_block_skip_lazy) {
            return 'eager'; // Force eager loading
        }
    }
    
    return $value;
}
add_filter('wp_img_tag_add_loading_attr', 'disable_wp_lazy_loading_for_blocks', 10, 3);

/**
 * Set global flag when processing blocks that should skip lazy loading
 */
function set_lazy_loading_context($output, $block) {
    global $current_block_skip_lazy;
    
    // Only process cover and image blocks
    if ($block['blockName'] !== 'core/cover' && $block['blockName'] !== 'core/image') {
        return $output;
    }
    
    // Set global flag if this block should skip lazy loading
    $current_block_skip_lazy = isset($block['attrs']['kotlinskidevSkipLazy']) && $block['attrs']['kotlinskidevSkipLazy'];
    
    return $output;
}
add_filter('render_block', 'set_lazy_loading_context', 5, 2);

/**
 * JavaScript fallback to remove any remaining lazy loading
 */
function add_lazy_loading_override_script() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Find all images with no-lazy-loading class and ensure they're not lazy loaded
        document.querySelectorAll('img.no-lazy-loading').forEach(function(img) {
            // Remove any lazy loading attributes that might have been added by plugins
            img.removeAttribute('data-lazy-src');
            img.removeAttribute('data-src');
            img.removeAttribute('data-lazy');
            img.removeAttribute('data-smush-lazy');
            
            // Force loading to eager
            img.setAttribute('loading', 'eager');
            
            // If the image has a data-src (lazy loading), move it to src immediately
            if (img.hasAttribute('data-src') && !img.src) {
                img.src = img.getAttribute('data-src');
            }
        });
    });
    </script>
    <?php
}
add_action('wp_footer', 'add_lazy_loading_override_script');

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
