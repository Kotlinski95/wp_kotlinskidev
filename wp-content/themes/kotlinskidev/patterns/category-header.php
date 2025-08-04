<?php
/**
 * Title: Category Header
 * Slug: kotlinskidev/category-header
 * Categories: blog, kotlinskidev/blog, themeslug/custom
 */
$current_category = get_queried_object();
$category_name = $current_category->name;
$category_description = kotlinskidev_get_category_description($current_category->term_id);
$post_count = $current_category->count;
$custom_content = kotlinskidev_get_category_custom_content($current_category->term_id);
$custom_links = kotlinskidev_get_category_custom_links($current_category->term_id);

// Generate breadcrumbs using CMS settings
$locale = get_locale();
$breadcrumb_settings = kotlinskidev_get_breadcrumb_settings($locale);

$breadcrumbs = array();
$breadcrumbs[] = '<a href="' . esc_url(home_url('/')) . '" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">' . esc_html($breadcrumb_settings['home_text']) . '</a>';
$breadcrumbs[] = '<a href="' . esc_url($breadcrumb_settings['topics_url']) . '" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">' . esc_html($breadcrumb_settings['topics_text']) . '</a>';
$breadcrumbs[] = '<span style="color:var(--wp--preset--color--foreground-alt);">' . esc_html($category_name) . '</span>';
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
        <h1 style="color:var(--wp--preset--color--foreground-alt);font-weight:800;font-size:2.5rem;margin-bottom:10px;">
            <?php echo esc_html($category_name); ?>
        </h1>
        
        <?php if ($category_description) : ?>
            <p style="color:var(--wp--preset--color--foreground-alt);font-size:1.125rem;margin-bottom:15px;">
                <?php echo esc_html($category_description); ?>
            </p>
        <?php endif; ?>
        
        <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:15px;">
            <span class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);font-weight:600;">
                <?php echo $post_count . ' ' . ($post_count === 1 ? esc_html__('Article', 'kotlinskidev') : esc_html__('Articles', 'kotlinskidev')); ?>
            </span>
            <span style="color:var(--wp--preset--color--foreground-alt);">•</span>
            
            <?php if (!empty($custom_links)) : ?>
                <?php foreach ($custom_links as $index => $link) : ?>
                    <?php if ($index > 0) : ?>
                        <span style="color:var(--wp--preset--color--foreground-alt);">•</span>
                    <?php endif; ?>
                    <a href="<?php echo esc_url($link['url']); ?>" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">
                        <?php echo esc_html($link['text']); ?>
                    </a>
                <?php endforeach; ?>
            <?php else : ?>
                <a href="<?php echo esc_url(home_url('/blog-topics/')); ?>" style="color:var(--wp--preset--color--primary);text-decoration:none;" class="link-dark-variant-support">
                    ← <?php esc_html_e('All Topics', 'kotlinskidev'); ?>
                </a>
            <?php endif; ?>
        </div>
        
        <?php if ($custom_content) : ?>
            <div style="margin-top:30px;padding:20px;background:var(--wp--preset--color--light-shade);border-radius:12px;border:1px solid var(--wp--preset--color--border-color);">
                <?php echo wp_kses_post($custom_content); ?>
            </div>
        <?php endif; ?>
    </div>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->