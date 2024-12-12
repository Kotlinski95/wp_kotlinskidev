<?php
function defer_global_css()
{
    // Enqueue the global stylesheet with media="print" to prevent it from blocking render
    wp_enqueue_style('global-style', get_template_directory_uri() . '/build/main.css', [], null, 'print');

    // Add a filter to change the media attribute to "all" after loading
    add_filter('style_loader_tag', 'defer_css_media_attribute', 10, 2);
}
add_action('wp_enqueue_scripts', 'defer_global_css');

function defer_css_media_attribute($html, $handle)
{
    // Check if it's the global stylesheet
    if ('global-style' === $handle) {
        // Modify the link tag to use "media=print" initially
        $html = str_replace("rel='stylesheet'", "rel='stylesheet' media='print'", $html);

        // Add an onload event to change the media attribute to "all" after the page is loaded
        $html = str_replace("media='print'", "media='print' onload=\"this.media='all'\"", $html);
    }
    return $html;
}



// Preload critical.css for faster rendering
function preload_critical_css()
{
    wp_enqueue_style('preload-style', get_template_directory_uri() . '/build/critical.css', false, null);
    add_filter('style_loader_tag',  'preload_filter', 10, 2);
    function preload_filter($html, $handle)
    {
        if (strcmp($handle, 'preload-style') == 0) {
            $html = str_replace("rel='stylesheet'", "rel='preload' as='style' onload='this.rel=\"stylesheet\"'", $html);
        }
        return $html;
    }
}
add_action('wp_head', 'preload_critical_css', 1);
