<?php
/**
 * Title: Other Topics Grid
 * Slug: kotlinskidev/other-topics
 * Categories: blog, kotlinskidev/blog, themeslug/custom
 */
$current_category = get_queried_object();
// Get other categories (excluding current one)
$other_categories = get_categories(array(
    'hide_empty' => true,
    'exclude' => array(1, $current_category->term_id), // Exclude "Uncategorized" and current category
    'number' => 4,
    'orderby' => 'count',
    'order' => 'DESC'
));
?>
<!-- wp:group {"style":{"spacing":{"margin":{"top":"1.25rem"},"padding":{"top":"1.25rem"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-top:1.25rem;padding-top:1.25rem;">
    
    <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h3 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Other Topics', 'kotlinskidev'); ?></h3>
    <!-- /wp:heading -->
    
    <?php if (!empty($other_categories)) : ?>
    <!-- wp:html -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 0.9375rem; margin-top: 1.25rem;">
        <?php foreach ($other_categories as $category) : 
            $category_link = get_category_link($category->term_id);
            $extended_description = kotlinskidev_get_category_description($category->term_id);
            
            // Get latest post from this category for featured image and info
            $latest_post = get_posts(array(
                'category' => $category->term_id,
                'posts_per_page' => 1,
                'post_status' => 'publish'
            ));
            
            $featured_image = '';
            $last_updated = '';
            if (!empty($latest_post)) {
                if (has_post_thumbnail($latest_post[0]->ID)) {
                    $featured_image = get_the_post_thumbnail_url($latest_post[0]->ID, 'medium');
                }
                $last_updated = human_time_diff(get_the_time('U', $latest_post[0]->ID), current_time('timestamp')) . ' ago';
            }
        ?>
        <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0.125rem;border-radius:1.25rem;padding:0.9375rem;transition:transform 0.3s ease;display:flex;flex-direction:column;height:100%;box-shadow:var(--wp--preset--shadow--natural);">
            
            <?php if ($featured_image) : ?>
            <div style="margin-bottom:1.25rem;flex-shrink:0;">
                <a href="<?php echo esc_url($category_link); ?>">
                <img src="<?php echo esc_url($featured_image); ?>" 
                     alt="<?php echo esc_attr($category->name); ?>" 
                     style="width:100%;height:11.25rem;object-fit:contain;border-radius:1rem;" />
                </a>
            </div>
            <?php endif; ?>
            
            <div style="text-align:center;flex-grow:1;display:flex;flex-direction:column;">
            <h4 style="margin-bottom:0.9375rem;font-size:1.25rem;font-weight:700;flex-shrink:0;">
                <a href="<?php echo esc_url($category_link); ?>" 
                   style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                <?php echo esc_html($category->name); ?>
                </a>
            </h4>
            
            <?php if ($extended_description) : ?>
                <p style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.25rem;line-height:1.5;flex-grow:1;">
                <?php echo esc_html($extended_description); ?>
                </p>
            <?php endif; ?>
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;font-size:0.875rem;flex-shrink:0;">
                <span class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);font-weight:600;">
                <?php echo $category->count; ?> <?php echo $category->count === 1 ? esc_html__('article', 'kotlinskidev') : esc_html__('articles', 'kotlinskidev'); ?>
                </span>
                <?php if ($last_updated) : ?>
                <span style="color:var(--wp--preset--color--foreground-alt);">
                    <?php printf(esc_html__('Updated %s', 'kotlinskidev'), $last_updated); ?>
                </span>
                <?php endif; ?>
            </div>
            
            <div style="margin-top:auto;flex-shrink:0;">
                <a href="<?php echo esc_url($category_link); ?>" 
                   class="search-link"
                   style="background:linear-gradient(135deg, var(--wp--preset--color--primary) 0%, rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.8) 100%);color:white;border:none;padding:0.625rem 1.5rem;border-radius:0.75rem;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:inline-flex;align-items:center;gap:0.5rem;box-shadow:0 0.25rem 0.75rem rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.25), 0 0.125rem 0.25rem rgba(0, 0, 0, 0.08);text-transform:none;letter-spacing:0.025em;outline:none;text-decoration:none;line-height:1.4;">
                <?php printf(esc_html__('Explore %s', 'kotlinskidev'), esc_html($category->name)); ?>
                </a>
            </div>
            </div>
            
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
    
    <?php else : ?>
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"2.5rem","bottom":"2.5rem"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="padding-top:2.5rem;padding-bottom:2.5rem">
        <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
        <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('No other topics available yet.', 'kotlinskidev'); ?></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <?php endif; ?>
    
</div>
<!-- /wp:group -->