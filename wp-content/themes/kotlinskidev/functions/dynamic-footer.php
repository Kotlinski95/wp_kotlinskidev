<?php
add_filter('render_block', 'kotlinskidev_dynamic_footer_pattern', 10, 2);
function kotlinskidev_dynamic_footer_pattern($block_content, $block) {
    // Check if this is our dynamic footer pattern
    if (isset($block['blockName']) && $block['blockName'] === 'core/pattern' && 
        isset($block['attrs']['slug']) && $block['attrs']['slug'] === 'kotlinskidev/footer-dynamic') {
        
        // Determine the correct footer template part based on current URL/locale
        $current_url = $_SERVER['REQUEST_URI'] ?? '';
        $footer_slug = 'footer'; // default
        
        // Check if we're on a Polish page
        if (preg_match('#^/pl/#', $current_url) || get_locale() === 'pl_PL') {
            $footer_slug = 'footer-pl';
        }
        
        // Create the template part block with the dynamic slug
        $template_part_block = '<!-- wp:template-part {"slug":"' . esc_attr($footer_slug) . '","theme":"kotlinskidev","area":"footer"} /-->';
        
        // Parse and render the block
        $parsed_blocks = parse_blocks($template_part_block);
        if (!empty($parsed_blocks)) {
            return render_block($parsed_blocks[0]);
        }
    }
    
    return $block_content;
}