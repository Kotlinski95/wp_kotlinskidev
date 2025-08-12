<?php
/*
Plugin Name: Text Justify Controls
Description: Adds text justify option to paragraph and heading blocks in the block editor.
Version: 1.0.0
Author: Adrian Kotlinski
*/

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

class TextJustifyControls {
    
    public function __construct() {
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_editor_assets'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_filter('render_block', array($this, 'add_justify_classes'), 10, 2);
    }
    
    public function enqueue_editor_assets() {
        wp_enqueue_script(
            'text-justify-controls',
            plugins_url('build/index.js', __FILE__),
            array('wp-blocks', 'wp-element', 'wp-components', 'wp-compose', 'wp-hooks', 'wp-i18n', 'wp-block-editor'),
            filemtime(plugin_dir_path(__FILE__) . 'build/index.js'),
            true
        );
        
        wp_enqueue_style(
            'text-justify-controls-editor',
            plugins_url('build/index.css', __FILE__),
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'build/index.css')
        );
        
        // Add inline CSS for justify styles
        wp_add_inline_style('text-justify-controls-editor', $this->get_justify_css());
    }
    
    public function enqueue_frontend_assets() {
        wp_enqueue_style(
            'text-justify-controls-frontend',
            plugins_url('build/style-style-index.css', __FILE__),
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'build/style-style-index.css')
        );
        
        // Add inline CSS for justify styles
        wp_add_inline_style('text-justify-controls-frontend', $this->get_justify_css());
    }
    
    public function get_justify_css() {
        return '
        .has-text-align-justify {
            text-align: justify !important;
            text-justify: inter-word;
        }
        
        /* Editor specific styles */
        .block-editor-block-list__layout .has-text-align-justify {
            text-align: justify !important;
            text-justify: inter-word;
        }
        ';
    }
    
    public function add_justify_classes($block_content, $block) {
        // Only process supported blocks
        $supported_blocks = array('core/paragraph', 'core/heading');
        if (!in_array($block['blockName'], $supported_blocks)) {
            return $block_content;
        }
        
        // Check if block has textAlign attribute set to 'justify'
        if (isset($block['attrs']['textAlign']) && $block['attrs']['textAlign'] === 'justify') {
            // Check if the class is already present to avoid duplicates
            if (strpos($block_content, 'has-text-align-justify') !== false) {
                return $block_content;
            }
            
            // Try to add to existing class attribute first
            if (preg_match('/class="([^"]*)"/', $block_content)) {
                $block_content = preg_replace(
                    '/class="([^"]*)"/',
                    'class="$1 has-text-align-justify"',
                    $block_content,
                    1
                );
            } else {
                // If no class attribute exists, add one to the first HTML tag
                $block_content = preg_replace(
                    '/(<[a-zA-Z][^>]*?)>/',
                    '$1 class="has-text-align-justify">',
                    $block_content,
                    1
                );
            }
        }
        
        return $block_content;
    }
}

new TextJustifyControls();
