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
$breadcrumbs[] = '<a href="' . esc_url(home_url('/')) . '" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">' . esc_html($breadcrumb_settings['home_text']) . '</a>';
$breadcrumbs[] = '<a href="' . esc_url($breadcrumb_settings['topics_url']) . '" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">' . esc_html($breadcrumb_settings['topics_text']) . '</a>';
$breadcrumbs[] = '<span style="color:var(--wp--preset--color--foreground-alt);">' . esc_html__('Tag:', 'kotlinskidev') . ' ' . esc_html($tag_name) . '</span>';
?>

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"15px"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group" style="margin-bottom:15px">
    <!-- wp:html -->
    <nav class="kotlinskidev-breadcrumbs" style="font-size:14px;color:var(--wp--preset--color--foreground-alt);">
        <?php echo implode(' <span style="margin:0 8px;color:var(--wp--preset--color--foreground-alt);">→</span> ', $breadcrumbs); ?>
    </nav>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"20px"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group" style="margin-bottom:20px">
    
    <!-- wp:html -->
    <div style="text-align:center;">
        <div style="display:inline-block;padding:8px 16px;background:var(--wp--preset--color--primary);color:white;border-radius:20px;font-size:14px;font-weight:600;margin-bottom:15px;">
            #<?php echo esc_html($tag_name); ?>
        </div>
        
        <h1 style="color:var(--wp--preset--color--foreground-alt);font-weight:800;font-size:2.5rem;margin-bottom:10px;">
            <?php printf(esc_html__('Articles tagged with "%s"', 'kotlinskidev'), esc_html($tag_name)); ?>
        </h1>
        
        <?php if ($tag_description) : ?>
            <p style="color:var(--wp--preset--color--foreground-alt);font-size:1.125rem;margin-bottom:15px;">
                <?php echo esc_html($tag_description); ?>
            </p>
        <?php endif; ?>
        
        <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:30px;">
            <span class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);font-weight:600;">
                <?php echo $post_count . ' ' . ($post_count === 1 ? esc_html__('Article', 'kotlinskidev') : esc_html__('Articles', 'kotlinskidev')); ?>
            </span>
            <span style="color:var(--wp--preset--color--foreground-alt);">•</span>
            <a href="<?php echo esc_url($breadcrumb_settings['topics_url']); ?>" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">
                ← <?php esc_html_e('Browse All Topics', 'kotlinskidev'); ?>
            </a>
        </div>
    </div>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->
