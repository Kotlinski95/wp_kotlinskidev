<?php
/**
 * Cover Video Poster Preload
 * Adds preload links for cover block video poster images when lazy loading is disabled
 */

/**
 * Extract poster images from cover blocks that have lazy loading disabled
 */
function get_cover_video_poster_preloads() {
    global $post;
    
    if (!$post || !has_blocks($post->post_content)) {
        return [];
    }
    
    // Cache the result to avoid re-parsing on the same request
    static $cached_poster_urls = null;
    static $cached_post_id = null;
    
    if ($cached_post_id === $post->ID && $cached_poster_urls !== null) {
        return $cached_poster_urls;
    }
    
    $blocks = parse_blocks($post->post_content);
    $poster_urls = [];
    
    foreach ($blocks as $block) {
        $block_poster_urls = extract_poster_from_block($block);
        if (is_array($block_poster_urls) && !empty($block_poster_urls)) {
            $poster_urls = array_merge($poster_urls, $block_poster_urls);
        }
    }
    
    $cached_poster_urls = array_unique($poster_urls);
    $cached_post_id = $post->ID;
    
    return $cached_poster_urls;
}

/**
 * Recursively extract poster URLs from blocks and their inner blocks
 */
function extract_poster_from_block($block) {
    $poster_urls = [];
    
    // Check if this is a cover block with video and lazy loading disabled
    if (
        $block['blockName'] === 'core/cover' &&
        isset($block['attrs']['backgroundType']) && 
        $block['attrs']['backgroundType'] === 'video' &&
        isset($block['attrs']['kotlinskidevSkipLazy']) && 
        $block['attrs']['kotlinskidevSkipLazy'] === true
    ) {
        
        // Get poster image URL
        $poster_url = null;
        
        // First, check if there's a poster attribute in the block
        if (isset($block['attrs']['poster'])) {
            $poster_url = $block['attrs']['poster'];
        }
        // Otherwise, get the featured image of the video attachment (same logic as video-poster.php)
        elseif (isset($block['attrs']['id'])) {
            $poster_url = get_the_post_thumbnail_url($block['attrs']['id']);
        }
        
        if ($poster_url) {
            $poster_urls[] = $poster_url;
        }
    }
    
    // Recursively check inner blocks
    if (isset($block['innerBlocks']) && is_array($block['innerBlocks'])) {
        foreach ($block['innerBlocks'] as $inner_block) {
            $inner_poster = extract_poster_from_block($inner_block);
            if ($inner_poster) {
                $poster_urls = array_merge($poster_urls, (array)$inner_poster);
            }
        }
    }
    
    return $poster_urls;
}

/**
 * Add preload links for cover video posters to the document head
 */
function add_cover_video_poster_preloads() {
    $poster_urls = get_cover_video_poster_preloads();
    
    foreach ($poster_urls as $poster_url) {
        echo '<link rel="preload" as="image" href="' . esc_url($poster_url) . '" fetchpriority="high">' . "\n";
    }
}

// Hook into wp_head to add preload links
add_action('wp_head', 'add_cover_video_poster_preloads', 1);
