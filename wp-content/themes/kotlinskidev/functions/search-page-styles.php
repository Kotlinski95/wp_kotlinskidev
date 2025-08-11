<?php

/**
 * Search Page Block Styles Handler
 * 
 * This file contains all the functions related to fixing missing block styles
 * specifically on the search page template (page-search.php).
 * 
 * The search page uses template parts and patterns which can cause WordPress
 * to miss generating proper block styles and inline CSS. These functions
 * ensure all necessary styles are loaded and generated dynamically.
 */

/**
 * Helper function to check if we're on a search page
 * 
 * @return bool True if we're on a search-related page, false otherwise
 */
function kotlinskidev_is_search_page()
{
    // Method 1: Check if it's a search results page
    if (is_search()) {
        return true;
    }
    
    // Method 2: Check for specific page slug/path
    if (is_page() && (get_post_field('post_name') === 'search' || strpos($_SERVER['REQUEST_URI'], '/search/') !== false)) {
        return true;
    }
    
    // Method 3: Check for any page template that contains 'search'
    if (is_page_template() && strpos(get_page_template_slug(), 'search') !== false) {
        return true;
    }
    
    return false;
}

// Ensure core block styles are loaded
function kotlinskidev_enqueue_block_styles()
{
    // Only run on search-related pages
    if (!kotlinskidev_is_search_page()) {
        return;
    }

    // Force enqueue core block library styles
    wp_enqueue_style('wp-block-library');

    // List of common core blocks that might need individual styles
    $common_blocks = array(
        'social-links' => array('core/social-links', 'core/social-link'),
        'cover' => array('core/cover'),
        'button' => array('core/button', 'core/buttons'),
        'image' => array('core/image'),
        'gallery' => array('core/gallery'),
        'video' => array('core/video'),
        'audio' => array('core/audio'),
        'file' => array('core/file'),
        'embed' => array('core/embed'),
        'navigation' => array('core/navigation'),
        'search' => array('core/search'),
        'query' => array('core/query'),
        'post-template' => array('core/post-template'),
        'columns' => array('core/columns'),
        'group' => array('core/group'),
        'media-text' => array('core/media-text'),
        'separator' => array('core/separator'),
        'spacer' => array('core/spacer'),
        'table' => array('core/table'),
        'verse' => array('core/verse'),
        'code' => array('core/code'),
        'preformatted' => array('core/preformatted'),
        'pullquote' => array('core/pullquote'),
        'quote' => array('core/quote'),
        'calendar' => array('core/calendar'),
        'archives' => array('core/archives'),
        'categories' => array('core/categories'),
        'latest-posts' => array('core/latest-posts'),
        'latest-comments' => array('core/latest-comments'),
        'tag-cloud' => array('core/tag-cloud'),
        'rss' => array('core/rss')
    );

    // Check each block type and enqueue styles if needed
    foreach ($common_blocks as $block_style => $block_names) {
        $has_block = false;
        foreach ($block_names as $block_name) {
            if (has_block($block_name)) {
                $has_block = true;
                break;
            }
        }

        if ($has_block) {
            wp_enqueue_style("wp-block-{$block_style}");
        }
    }
}
add_action('wp_enqueue_scripts', 'kotlinskidev_enqueue_block_styles', 20);

// Comprehensive block styles and inline CSS generator
function kotlinskidev_ensure_block_styles()
{
    // Only run on search-related pages
    if (!kotlinskidev_is_search_page()) {
        return;
    }

    // Register core block styles that might be missing
    $core_blocks = array(
        'columns',
        'column',
        'group',
        'social-links',
        'social-link',
        'cover',
        'button',
        'buttons',
        'image',
        'gallery',
        'video',
        'audio',
        'file',
        'embed',
        'navigation',
        'search',
        'spacer',
        'separator',
        'media-text',
        'table',
        'verse',
        'code',
        'preformatted',
        'pullquote',
        'quote',
        'paragraph'
    );

    foreach ($core_blocks as $block) {
        wp_enqueue_style("wp-block-{$block}");
    }

    // Force WordPress to generate block styles for content rendered via template parts
    add_action('wp_footer', function () {
        // Trigger block style generation for any missed blocks
        if (function_exists('wp_add_global_styles_for_blocks')) {
            wp_add_global_styles_for_blocks();
        }

        // Ensure core-block-supports styles are generated
        if (function_exists('wp_enqueue_stored_styles')) {
            wp_enqueue_stored_styles();
        }
    }, 1);
}
add_action('wp_enqueue_scripts', 'kotlinskidev_ensure_block_styles', 30);

// Dynamically generate inline block styles (the proper WordPress way)
function kotlinskidev_generate_dynamic_inline_styles()
{
    // Only run on search-related pages
    if (kotlinskidev_is_search_page()) {

        // Force WordPress to process blocks and generate inline styles
        add_action('wp_footer', function () {

            // Get all rendered content including footer patterns
            $all_content = '';

            // Get main page content
            global $post;
            if ($post && has_blocks($post->post_content)) {
                $all_content .= $post->post_content;
            }

            // Get footer pattern content
            $footer_patterns = array('footer', 'footer-pl');
            foreach ($footer_patterns as $pattern) {
                $pattern_file = get_template_directory() . "/patterns/{$pattern}.php";
                if (file_exists($pattern_file)) {
                    ob_start();
                    include $pattern_file;
                    $pattern_content = ob_get_clean();
                    $all_content .= $pattern_content;
                }
            }

            if (!empty($all_content)) {
                // Parse blocks from all content
                $blocks = parse_blocks($all_content);

                // Process each block to generate its inline styles
                foreach ($blocks as $block) {
                    if (!empty($block['blockName'])) {
                        // Create a WP_Block instance to trigger style generation
                        $wp_block = new WP_Block($block);

                        // This will automatically generate and enqueue inline styles
                        $wp_block->render();
                    }
                }

                // Alternative method: Use WordPress's built-in style generation
                if (function_exists('wp_style_engine_get_stylesheet_from_context')) {
                    $block_styles = wp_style_engine_get_stylesheet_from_context('block-supports');
                    if (!empty($block_styles)) {
                        echo '<style id="wp-block-supports-inline-css">' . $block_styles . '</style>';
                    }
                }
            }
        }, 1);
    }
}
add_action('wp_enqueue_scripts', 'kotlinskidev_generate_dynamic_inline_styles', 35);
