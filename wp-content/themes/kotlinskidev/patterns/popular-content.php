<?php
/**
 * Title: Popular Content
 * Slug: kotlinskidev/popular-content
 * Categories: blog, kotlinskidev/blog
 */
?>
<!-- wp:group {"style":{"spacing":{"margin":{"top":"40px"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained" style="margin-top:40px">
    
    <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h3 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Popular Content', 'kotlinskidev'); ?></h3>
    <!-- /wp:heading -->
    
    <!-- wp:html -->
    <?php
    // Get popular posts (by comments + views if available)
    $popular_posts = new WP_Query(array(
        'post_type' => array('post', 'page'),
        'post_status' => 'publish',
        'posts_per_page' => 6,
        'orderby' => 'comment_count',
        'order' => 'DESC',
        'meta_query' => array(
            'relation' => 'OR',
            array(
                'key' => '_wp_page_visibility',
                'compare' => 'NOT EXISTS'
            ),
            array(
                'key' => '_wp_page_visibility',
                'value' => 'private',
                'compare' => '!='
            )
        )
    ));
    
    if ($popular_posts->have_posts()) :
    ?>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 15px; margin-top: 20px; margin-bottom: 20px;">
        <?php while ($popular_posts->have_posts()) : $popular_posts->the_post(); 
            $post_type = get_post_type();
            $is_page = ($post_type === 'page');
        ?>
        <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:2px;border-radius:18px;padding:15px;display:flex;flex-direction:column;height:100%;">
            
            <?php if (has_post_thumbnail()) : ?>
                <div style="margin-bottom:15px;flex-shrink:0;">
                    <a href="<?php the_permalink(); ?>">
                        <img src="<?php the_post_thumbnail_url('medium'); ?>" 
                             alt="<?php the_title(); ?>" 
                             style="width:100%;height:150px;object-fit:contain;border-radius:12px;" />
                    </a>
                </div>
            <?php endif; ?>
            
            <div style="margin-bottom:15px;flex-shrink:0;">
                <span style="background:linear-gradient(135deg, var(--wp--preset--color--primary) 0%, rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.8) 100%);color:white;padding:4px 12px;border-radius:15px;font-size:12px;font-weight:600;">
                    <?php echo $is_page ? '📄 ' . esc_html__('Page', 'kotlinskidev') : '📝 ' . esc_html__('Article', 'kotlinskidev'); ?>
                </span>
            </div>
            
            <h4 style="margin-bottom:15px;font-size:1.125rem;font-weight:600;flex-shrink:0;">
                <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                    <?php the_title(); ?>
                </a>
            </h4>
            
            <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:20px;flex-grow:1;font-size:14px;">
                <?php echo wp_trim_words(get_the_excerpt(), 20, '...'); ?>
            </div>
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;flex-shrink:0;font-size:12px;">
                <span style="color:var(--wp--preset--color--foreground-alt);">
                    <?php echo $is_page ? esc_html__('Updated', 'kotlinskidev') . ' ' . get_the_modified_date() : get_the_date(); ?>
                </span>
                <a href="<?php the_permalink(); ?>" class="search-link"
                   style="background:linear-gradient(135deg, var(--wp--preset--color--primary) 0%, rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.8) 100%);color:white;border:none;padding:10px 24px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.25), 0 2px 4px rgba(0, 0, 0, 0.08);text-transform:none;letter-spacing:0.025em;outline:none;text-decoration:none;line-height:1.4;">
                    <?php echo $is_page ? esc_html__('View', 'kotlinskidev') : esc_html__('Read', 'kotlinskidev'); ?>
                </a>
            </div>
            
        </div>
        <?php endwhile; ?>
    </div>
    <?php 
    endif; 
    wp_reset_postdata();
    ?>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->