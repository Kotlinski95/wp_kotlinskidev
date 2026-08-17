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
?>

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"1.25rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-bottom:1.25rem">
    
    <!-- wp:html -->
    <div style="text-align:center;">
        <h1 style="color:var(--wp--preset--color--foreground-alt);font-weight:800;font-size:2.5rem;margin-bottom:0.625rem;">
            <?php echo esc_html($category_name); ?>
        </h1>
        
        <?php if ($category_description) : ?>
            <p style="color:var(--wp--preset--color--foreground-alt);font-size:1.125rem;margin-bottom:0.9375rem;">
                <?php echo esc_html($category_description); ?>
            </p>
        <?php endif; ?>
        
        <div style="display:flex;justify-content:center;align-items:center;gap:1.25rem;margin-bottom:1.875rem;">
            <span class="link-dark-variant-support kt-gradient-text" style="font-weight:600;">
                <?php echo absint($post_count) . ' ' . ($post_count === 1 ? esc_html__('Article', 'kotlinskidev') : esc_html__('Articles', 'kotlinskidev')); ?>
            </span>
            <span style="color:var(--wp--preset--color--foreground-alt);">•</span>
            
            <?php if (!empty($custom_links)) : ?>
                <?php foreach ($custom_links as $index => $link) : ?>
                    <?php if ($index > 0) : ?>
                        <span style="color:var(--wp--preset--color--foreground-alt);">•</span>
                    <?php endif; ?>
                    <a href="<?php echo esc_url($link['url']); ?>" style="text-decoration:none;" class="link-dark-variant-support kt-gradient-text">
                        <?php echo esc_html($link['text']); ?>
                    </a>
                <?php endforeach; ?>
            <?php else : ?>
                <a href="<?php echo esc_url(home_url('/blog-topics/')); ?>" style="text-decoration:none;" class="link-dark-variant-support kt-gradient-text">
                    ← <?php esc_html_e('All Topics', 'kotlinskidev'); ?>
                </a>
            <?php endif; ?>
        </div>
        
        <?php if ($custom_content) : ?>
            <div style="margin-top:1.875rem;padding:1.25rem;background:var(--wp--preset--color--light-shade);border-radius:0.75rem;border:0.0625rem solid var(--wp--preset--color--border-color);">
                <?php echo wp_kses_post($custom_content); ?>
            </div>
        <?php endif; ?>
    </div>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->