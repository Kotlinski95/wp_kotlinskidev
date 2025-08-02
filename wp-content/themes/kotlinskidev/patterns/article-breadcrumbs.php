<?php
/**
 * Title: Article Breadcrumbs
 * Slug: kotlinskidev/article-breadcrumbs
 * Categories: header, kotlinskidev/header
 */

// Generate breadcrumbs using CMS settings
$locale = get_locale();
$breadcrumb_settings = kotlinskidev_get_breadcrumb_settings($locale);

$breadcrumbs = array();
$breadcrumbs[] = '<a href="' . esc_url(home_url('/')) . '" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">' . esc_html($breadcrumb_settings['home_text']) . '</a>';
$breadcrumbs[] = '<a href="' . esc_url($breadcrumb_settings['topics_url']) . '" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">' . esc_html($breadcrumb_settings['topics_text']) . '</a>';

// Add category link for single posts
if (is_single() && get_post_type() === 'post') {
    $categories = get_the_category();
    if (!empty($categories)) {
        $category = $categories[0]; // Use the first category
        $breadcrumbs[] = '<a href="' . esc_url(get_category_link($category->term_id)) . '" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">' . esc_html($category->name) . '</a>';
    }
    
    // Add current article title (non-clickable)
    $breadcrumbs[] = '<span style="color:var(--wp--preset--color--foreground-alt);">' . esc_html(get_the_title()) . '</span>';
}
?>

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"15px","top":"8px"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group" style="margin-bottom:15px;margin-top:8px;">
    <!-- wp:html -->
    <nav class="kotlinskidev-breadcrumbs" style="font-size:14px;color:var(--wp--preset--color--foreground-alt);">
        <?php echo implode(' <span style="margin:0 8px;color:var(--wp--preset--color--foreground-alt);">→</span> ', $breadcrumbs); ?>
    </nav>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->
