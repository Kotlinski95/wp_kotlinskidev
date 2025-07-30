<?php
/**
 * Title: Blog Topics Grid
 * Slug: kotlinskidev/blog-topics-grid
 * Categories: blog, kotlinskidev/blog, themeslug/custom
 */

// Get all categories with posts
$categories = get_categories(array(
    'hide_empty' => true,
    'exclude' => array(1), // Exclude "Uncategorized"
    'orderby' => 'name',
    'order' => 'ASC'
));

if (!empty($categories)) :
?>

<!-- wp:group {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0">
    
    <!-- wp:html -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px;">
        <?php foreach ($categories as $category) : 
            $post_count = $category->count;
            $category_link = get_category_link($category->term_id);
            $extended_description = kotlinskidev_get_category_description($category->term_id);
            
            // Get latest post from this category for featured image
            $latest_post = get_posts(array(
                'category' => $category->term_id,
                'posts_per_page' => 1,
                'post_status' => 'publish'
            ));
            
            $featured_image = '';
            if (!empty($latest_post) && has_post_thumbnail($latest_post[0]->ID)) {
                $featured_image = get_the_post_thumbnail_url($latest_post[0]->ID, 'medium');
            }
        ?>
        
        <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:1px;border-radius:20px;padding:40px;box-shadow:var(--wp--preset--shadow--natural);transition:transform 0.3s ease;hover:transform:translateY(-5px);">
            
            <?php if ($featured_image) : ?>
            <div style="margin-bottom:25px;">
                <a href="<?php echo esc_url($category_link); ?>">
                <img src="<?php echo esc_url($featured_image); ?>" 
                     alt="<?php echo esc_attr($category->name); ?>" 
                     style="width:100%;height:200px;object-fit:contain;border-radius:16px;" />
                </a>
            </div>
            <?php endif; ?>
            
            <div style="text-align:center;">
            <h2 style="margin-bottom:15px;font-size:1.5rem;font-weight:700;color:var(--wp--preset--color--foreground-alt);">
                <a href="<?php echo esc_url($category_link); ?>" 
                   style="color:inherit;text-decoration:none;">
                <?php echo esc_html($category->name); ?>
                </a>
            </h2>
            
            <?php if ($extended_description) : ?>
                <p style="color:var(--wp--preset--color--foreground-alt);margin-bottom:20px;line-height:1.6;">
                <?php echo esc_html($extended_description); ?>
                </p>
            <?php endif; ?>
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:25px;">
                <span style="color:var(--wp--preset--color--primary);font-size:14px;font-weight:600;">
                <?php echo $post_count; ?> <?php echo $post_count === 1 ? 'Article' : 'Articles'; ?>
                </span>
                <span style="color:var(--wp--preset--color--foreground-alt);font-size:14px;">
                <?php 
                if (!empty($latest_post)) {
                    echo 'Updated ' . human_time_diff(get_the_time('U', $latest_post[0]->ID), current_time('timestamp')) . ' ago';
                }
                ?>
                </span>
            </div>
            
            <a href="<?php echo esc_url($category_link); ?>" 
               style="background:var(--wp--preset--color--primary);color:white;border-radius:12px;padding:12px 24px;text-decoration:none;display:inline-block;font-weight:600;transition:all 0.3s ease;">
                Explore <?php echo esc_html($category->name); ?>
            </a>
            </div>
            
        </div>
        
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->

<?php else : ?>

<!-- wp:group {"style":{"spacing":{"padding":{"top":"60px","bottom":"60px"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:60px;padding-bottom:60px">
    <!-- wp:heading {"textAlign":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
    <h2 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color">No topics found</h2>
    <!-- /wp:heading -->
    
    <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
    <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color">No blog topics have been created yet. Create some categories and add posts to them!</p>
    <!-- /wp:paragraph -->
    
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-buttons">
        <!-- wp:button -->
        <div class="wp-block-button">
            <a class="wp-block-button__link wp-element-button" href="<?php echo esc_url(admin_url('edit-tags.php?taxonomy=category')); ?>">Create Your First Topic</a>
        </div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->

<?php endif; ?>
