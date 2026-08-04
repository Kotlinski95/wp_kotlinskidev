<?php
/**
 * Title: Tag Header
 * Slug: kotlinskidev/tag-header
 * Categories: blog, kotlinskidev/blog
 */
$current_tag = get_queried_object();
$tag_name = $current_tag->name;
$tag_description = $current_tag->description;
$post_count = $current_tag->count;
// Generate breadcrumbs using CMS settings
$locale = get_locale();
$breadcrumb_settings = kotlinskidev_get_breadcrumb_settings($locale);
$breadcrumbs = array();
$breadcrumbs[] = '<a href="' . esc_url(home_url('/')) . '" style="text-decoration:none;" class="link-dark-variant-support kt-gradient-text">' . esc_html($breadcrumb_settings['home_text']) . '</a>';
$breadcrumbs[] = '<a href="' . esc_url($breadcrumb_settings['topics_url']) . '" style="text-decoration:none;" class="link-dark-variant-support kt-gradient-text">' . esc_html($breadcrumb_settings['topics_text']) . '</a>';
$breadcrumbs[] = '<span style="color:var(--wp--preset--color--foreground-alt);">' . esc_html__('Tag:', 'kotlinskidev') . ' ' . esc_html($tag_name) . '</span>';
?>
<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"0.9375rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-bottom:0.9375rem">
    <!-- wp:html -->
    <nav class="kotlinskidev-breadcrumbs" style="font-size:0.875rem;color:var(--wp--preset--color--foreground-alt);">
        <?php echo implode(' <span style="margin:0 0.5rem;color:var(--wp--preset--color--foreground-alt);">→</span> ', $breadcrumbs); ?>
    </nav>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"1.25rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-bottom:1.25rem">
    
    <!-- wp:html -->
    <div style="text-align:center;">
        <div class="kt-gradient-pill" style="padding:0.5rem 1rem;border-radius:1.25rem;font-size:0.875rem;font-weight:600;margin-bottom:0.9375rem;">
            #<?php echo esc_html($tag_name); ?>
        </div>
        
        <h1 style="color:var(--wp--preset--color--foreground-alt);font-weight:800;font-size:2.5rem;margin-bottom:0.625rem;">
            <?php printf(esc_html__('Articles tagged with "%s"', 'kotlinskidev'), esc_html($tag_name)); ?>
        </h1>
        
        <?php if ($tag_description) : ?>
            <p style="color:var(--wp--preset--color--foreground-alt);font-size:1.125rem;margin-bottom:0.9375rem;">
                <?php echo esc_html($tag_description); ?>
            </p>
        <?php endif; ?>
        
        <div style="display:flex;justify-content:center;align-items:center;gap:1.25rem;margin-bottom:1.875rem;">
            <span class="link-dark-variant-support kt-gradient-text" style="font-weight:600;">
                <?php echo $post_count . ' ' . ($post_count === 1 ? esc_html__('Article', 'kotlinskidev') : esc_html__('Articles', 'kotlinskidev')); ?>
            </span>
            <span style="color:var(--wp--preset--color--foreground-alt);">•</span>
            <a href="<?php echo esc_url($breadcrumb_settings['topics_url']); ?>" style="text-decoration:none;" class="link-dark-variant-support kt-gradient-text">
                ← <?php esc_html_e('Browse All Topics', 'kotlinskidev'); ?>
            </a>
        </div>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->