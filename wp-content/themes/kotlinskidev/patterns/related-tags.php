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

<!-- wp:group {"style":{"spacing":{"margin":{"top":"20px"},"padding":{"top":"20px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-top:20px;padding-top:20px;">
    
    <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h3 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Related Tags', 'kotlinskidev'); ?></h3>
    <!-- /wp:heading -->
    
    <?php if (!empty($related_tags)) : ?>
    <!-- wp:html -->
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 20px;">
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
        <div style="text-align:center;padding:15px;border:2px solid var(--wp--preset--color--border-color);border-radius:12px;background:var(--wp--preset--color--light-shade);transition:transform 0.3s ease;hover:transform:translateY(-2px);min-width:200px;">
            <div style="margin-bottom:8px;">
                <span style="background:var(--wp--preset--color--primary);color:white;padding:6px 12px;border-radius:15px;font-size:14px;font-weight:600;">
                    #<?php echo esc_html($tag->name); ?>
                </span>
            </div>
            
            <p class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);font-size:14px;margin:5px 0;">
                <?php echo $tag->count; ?> <?php echo $tag->count === 1 ? esc_html__('article', 'kotlinskidev') : esc_html__('articles', 'kotlinskidev'); ?>
            </p>
            
            <?php if ($last_updated) : ?>
                <p style="color:var(--wp--preset--color--foreground-alt);font-size:12px;margin:5px 0;">
                    <?php printf(esc_html__('Updated %s', 'kotlinskidev'), $last_updated); ?>
                </p>
            <?php endif; ?>
            
            <div style="margin-top:15px;">
                <a href="<?php echo esc_url($tag_link); ?>" class="link-dark-variant-support"
                   style="background:transparent;color:var(--wp--preset--color--primary);border:1px solid var(--wp--preset--color--primary);padding:8px 16px;border-radius:8px;text-decoration:none;font-size:12px;transition:all 0.3s ease;box-shadow:var(--wp--preset--shadow--natural);">
                    <?php esc_html_e('View Articles', 'kotlinskidev'); ?>
                </a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
    
    <?php else : ?>
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"20px","bottom":"20px"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="padding-top:20px;padding-bottom:20px">
        <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
        <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('No other tags available yet.', 'kotlinskidev'); ?></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <?php endif; ?>
    
</div>
<!-- /wp:group -->
