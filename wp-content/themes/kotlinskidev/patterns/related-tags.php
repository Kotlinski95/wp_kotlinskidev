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

<!-- wp:group {"style":{"spacing":{"margin":{"top":"80px"},"padding":{"top":"60px"},"border":{"top":{"color":"var:preset|color|border-color","width":"1px"}}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-top:80px;padding-top:60px;border-top-color:var(--wp--preset--color--border-color);border-top-width:1px">
    
    <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h3 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size">Related Tags</h3>
    <!-- /wp:heading -->
    
    <?php if (!empty($related_tags)) : ?>
    <!-- wp:html -->
    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 40px;">
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
        <div style="text-align:center;padding:20px;border:1px solid var(--wp--preset--color--border-color);border-radius:12px;background:var(--wp--preset--color--light-shade);transition:transform 0.3s ease;hover:transform:translateY(-2px);min-width:200px;">
            <div style="margin-bottom:10px;">
                <span style="background:var(--wp--preset--color--primary);color:white;padding:6px 12px;border-radius:15px;font-size:14px;font-weight:600;">
                    #<?php echo esc_html($tag->name); ?>
                </span>
            </div>
            
            <p style="color:var(--wp--preset--color--primary);font-size:14px;margin:5px 0;">
                <?php echo $tag->count; ?> <?php echo $tag->count === 1 ? 'article' : 'articles'; ?>
            </p>
            
            <?php if ($last_updated) : ?>
                <p style="color:var(--wp--preset--color--foreground-alt);font-size:12px;margin:5px 0;">
                    Updated <?php echo $last_updated; ?>
                </p>
            <?php endif; ?>
            
            <div style="margin-top:15px;">
                <a href="<?php echo esc_url($tag_link); ?>" 
                   style="background:transparent;color:var(--wp--preset--color--primary);border:1px solid var(--wp--preset--color--primary);padding:8px 16px;border-radius:8px;text-decoration:none;font-size:12px;transition:all 0.3s ease;box-shadow:var(--wp--preset--shadow--natural);">
                    View Articles
                </a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
    
    <?php else : ?>
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"40px","bottom":"40px"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group" style="padding-top:40px;padding-bottom:40px">
        <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
        <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color">No other tags available yet.</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
    <?php endif; ?>
    
</div>
<!-- /wp:group -->
