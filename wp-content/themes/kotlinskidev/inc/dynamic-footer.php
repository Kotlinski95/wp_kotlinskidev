<?php
/**
 * Dynamic Footer Template Part Selector
 * This file hooks into WordPress to dynamically select the appropriate footer
 */
// Hook into the template part rendering
add_filter('render_block_core/template-part', 'kotlinskidev_dynamic_footer_template_part', 10, 2);
function kotlinskidev_dynamic_footer_template_part($block_content, $block) {
    // Only apply to footer template parts with our dynamic slug
    if (isset($block['attrs']['slug']) && $block['attrs']['slug'] === 'footer-dynamic') {
        
        // Determine the correct footer template part based on current URL/locale
        $current_url = $_SERVER['REQUEST_URI'] ?? '';
        $footer_slug = 'footer'; // default
        
        // Check if we're on a Polish page
        if (preg_match('#^/pl/#', $current_url) || get_locale() === 'pl_PL') {
            $footer_slug = 'footer-pl';
        }
        
        // Create the template part block with the dynamic slug
        $template_part_block = array(
            'blockName' => 'core/template-part',
            'attrs' => array(
                'slug' => $footer_slug,
                'theme' => 'kotlinskidev',
                'area' => 'footer'
            ),
            'innerHTML' => '',
            'innerContent' => array()
        );
        
        return render_block($template_part_block);
    }
    
    return $block_content;
}