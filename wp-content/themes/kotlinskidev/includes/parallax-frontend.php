<?php
/**
 * Parallax Frontend Support
 * 
 * This file handles applying parallax classes to cover blocks on the frontend
 * based on the saved block attributes.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add parallax classes to cover blocks on frontend
 */
function kotlinskidev_render_parallax_cover_block($block_content, $block) {
    // Only process core/cover blocks
    if ($block['blockName'] !== 'core/cover') {
        return $block_content;
    }

    // Check if parallax is enabled for this block
    $enable_parallax = isset($block['attrs']['enableParallax']) ? $block['attrs']['enableParallax'] : false;
    $parallax_speed = isset($block['attrs']['parallaxSpeed']) ? $block['attrs']['parallaxSpeed'] : 0.5;

    // If parallax is not enabled, return unchanged
    if (!$enable_parallax) {
        return $block_content;
    }

    // Use DOMDocument for safe HTML manipulation
    $dom = new DOMDocument('1.0', 'UTF-8');
    $dom->preserveWhiteSpace = false;
    $dom->formatOutput = false;
    
    // Suppress warnings for HTML5 elements and load the content
    libxml_use_internal_errors(true);
    
    // Wrap in a temporary container to ensure proper parsing
    $wrapped_content = '<div>' . $block_content . '</div>';
    $success = $dom->loadHTML('<?xml encoding="UTF-8">' . $wrapped_content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    
    libxml_clear_errors();
    
    if (!$success) {
        return $block_content;
    }

    // Find the first element with class 'wp-block-cover' (this is the main cover block)
    $xpath = new DOMXPath($dom);
    $coverElements = $xpath->query("//div[contains(concat(' ', normalize-space(@class), ' '), ' wp-block-cover ')] | //section[contains(concat(' ', normalize-space(@class), ' '), ' wp-block-cover ')]");
    
    if ($coverElements->length > 0) {
        /** @var DOMElement $coverElement */
        $coverElement = $coverElements->item(0);
        
        // Get existing classes
        $existing_classes = $coverElement->getAttribute('class');
        
        // Only add enable-parallax if it's not already there
        if (strpos($existing_classes, 'enable-parallax') === false) {
            $new_classes = trim($existing_classes . ' enable-parallax');
            $coverElement->setAttribute('class', $new_classes);
        }
        
        // Add data-parallax-speed attribute
        $coverElement->setAttribute('data-parallax-speed', (string)$parallax_speed);
        
        // Get the modified HTML and remove the wrapper
        $modified_html = $dom->saveHTML($dom->documentElement);
        
        // Remove the wrapper div we added
        $modified_html = preg_replace('/^<div>(.*)<\/div>$/s', '$1', $modified_html);
        
        return $modified_html;
    }

    // If no cover element found, return original content
    return $block_content;
}

// Hook into block rendering
add_filter('render_block', 'kotlinskidev_render_parallax_cover_block', 10, 2);

/**
 * Debug function to log block attributes (for development)
 */
function kotlinskidev_debug_parallax_blocks($block_content, $block) {
    if ($block['blockName'] === 'core/cover' && WP_DEBUG) {
        error_log('Parallax Debug - Cover Block Attributes: ' . json_encode($block['attrs']));
    }
    return $block_content;
}

// Uncomment the line below for debugging block attributes
// add_filter('render_block', 'kotlinskidev_debug_parallax_blocks', 5, 2);
