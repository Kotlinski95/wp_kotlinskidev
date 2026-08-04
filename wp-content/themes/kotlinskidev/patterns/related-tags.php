<?php
/**
 * Title: Related Tags
 * Slug: kotlinskidev/related-tags
 * Categories: blog, kotlinskidev/blog
 */
$current_tag = get_queried_object();
// Get other popular tags (excluding current one)
$related_tags = get_tags(array(
    'exclude' => array($current_tag->term_id),
    'orderby' => 'count',
    'order' => 'DESC',
    'number' => 8,
    'hide_empty' => true
));
?>
<!-- wp:group {"style":{"spacing":{"margin":{"top":"1.25rem"},"padding":{"top":"1.25rem"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-top:1.25rem;padding-top:1.25rem;">
    
    <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h3 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Related Tags', 'kotlinskidev'); ?></h3>
    <!-- /wp:heading -->
    
    <?php if (!empty($related_tags)) : ?>
    <!-- wp:html -->
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.9375rem; margin-top: 1.25rem;">
        <?php foreach ($related_tags as $tag) : 
            $tag_link = get_tag_link($tag->term_id);
            
            // Get latest post from this tag for additional info
            $latest_post = get_posts(array(
                'tag_id' => $tag->term_id,
                'posts_per_page' => 1,
                'post_status' => 'publish'
            ));
            
            $last_updated = '';
            if (!empty($latest_post)) {
                $last_updated = human_time_diff(get_the_time('U', $latest_post[0]->ID), current_time('timestamp')) . ' ago';
            }
        ?>
        <div style="text-align:center;padding:0.9375rem;border:0.125rem solid var(--wp--preset--color--border-color);border-radius:0.75rem;background:var(--wp--preset--color--light-shade);transition:transform 0.3s ease;hover:transform:translateY(-0.125rem);min-width:12.5rem;">
            <div style="margin-bottom:0.5rem;">
                <span class="kt-gradient-pill" style="padding:0.375rem 0.75rem;border-radius:0.9375rem;font-size:0.875rem;font-weight:600;">
                    #<?php echo esc_html($tag->name); ?>
                </span>
            </div>
            
            <p class="link-dark-variant-support kt-gradient-text" style="font-size:0.875rem;margin:0.3125rem 0;">
                <?php echo $tag->count; ?> <?php echo $tag->count === 1 ? esc_html__('article', 'kotlinskidev') : esc_html__('articles', 'kotlinskidev'); ?>
            </p>
            
            <?php if ($last_updated) : ?>
                <p style="color:var(--wp--preset--color--foreground-alt);font-size:0.75rem;margin:0.3125rem 0;">
                    <?php printf(esc_html__('Updated %s', 'kotlinskidev'), $last_updated); ?>
                </p>
            <?php endif; ?>
            
            <div style="margin-top:0.9375rem;">
                <a href="<?php echo esc_url($tag_link); ?>" class="search-link">
                    <?php esc_html_e('View Articles', 'kotlinskidev'); ?>
                </a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
    
    <?php else : ?>
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="padding-top:1.25rem;padding-bottom:1.25rem">
        <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
        <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('No other tags available yet.', 'kotlinskidev'); ?></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <?php endif; ?>
</div>
<!-- /wp:group -->