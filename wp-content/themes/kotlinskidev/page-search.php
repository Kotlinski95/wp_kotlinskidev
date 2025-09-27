<?php

/**
 * Template Name: Search Page
 */

// If there's a search query, redirect to WordPress default search
if (isset($_GET['s']) && !empty($_GET['s'])) {
    $search_params = array(
        's' => $_GET['s']
    );
    
    // Only add parameters that have actual values
    if (isset($_GET['search_category']) && !empty($_GET['search_category'])) {
        $search_params['search_category'] = $_GET['search_category'];
    }
    
    if (isset($_GET['search_type']) && !empty($_GET['search_type'])) {
        $search_params['search_type'] = $_GET['search_type'];
    }
    
    // Build clean URL with only populated parameters
    $search_url = home_url('/?' . http_build_query($search_params));
    wp_redirect($search_url);
    exit;
}

get_header();
echo do_blocks('<!-- wp:template-part {"slug":"header","theme":"kotlinskidev","area":"header"} /-->');
?>

<main class="wp-block-group has-background-alt-background-color has-background" style="margin-top:0;margin-bottom:0;padding-top:4.6875rem;padding-right:var(--wp--preset--spacing--40);padding-bottom:0.625rem;padding-left:var(--wp--preset--spacing--40);" tabindex="-1">

    <!-- Search Header Pattern -->
    <?php get_template_part('patterns/search-header'); ?>

    <!-- Search Form Pattern -->
    <?php get_template_part('patterns/search-form'); ?>

    <!-- Popular Content Pattern (shown when no search) -->
    <?php get_template_part('patterns/popular-content'); ?>

</main>

<?php
// Set up footer shortcodes for this page
// global $kotlinskidev_force_footer_shortcodes;
// global $kotlinskidev_footer_shortcodes;

// $kotlinskidev_force_footer_shortcodes = true;
// $kotlinskidev_footer_shortcodes = array(
//     'copyrights' => '[copyrights]',
//     'scroll_to_top' => '[scroll_to_top]',
// );

// Dynamic footer selection based on locale
$locale = get_locale();
if ($locale === 'pl_PL') {
    // Use Polish footer
    echo do_blocks('<!-- wp:template-part {"slug":"footer-pl","theme":"kotlinskidev","area":"footer"} /-->');
} else {
    // Use default (English) footer
    echo do_blocks('<!-- wp:template-part {"slug":"footer","theme":"kotlinskidev","area":"footer"} /-->');
}