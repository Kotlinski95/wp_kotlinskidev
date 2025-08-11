<?php
/**
 * Title: Tag Posts Grid
 * Slug: kotlinskidev/tag-posts-grid
 * Categories: blog, kotlinskidev/blog
 */
?>
<!-- wp:query {"queryId":1,"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true},"layout":{"type":"constrained"}} -->
<div class="wp-block-query">
    <!-- wp:html -->
    <?php
    // Get current tag for the query
    $current_tag = get_queried_object();
    
    // Query posts with this tag
    $tag_posts = new WP_Query(array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => 6,
        'tag_id' => $current_tag->term_id,
        'orderby' => 'date',
        'order' => 'DESC'
    ));
    
    if ($tag_posts->have_posts()) :
    ?>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 15px; margin-bottom: 20px;">
        <?php while ($tag_posts->have_posts()) : $tag_posts->the_post(); ?>
        <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:2px;border-radius:18px;padding:15px;display:flex;flex-direction:column;height:100%;">
            
            <?php if (has_post_thumbnail()) : ?>
                <div style="margin-bottom:15px;flex-shrink:0;">
                    <a href="<?php the_permalink(); ?>">
                        <img src="<?php the_post_thumbnail_url('medium_large'); ?>" 
                             alt="<?php the_title(); ?>" 
                             style="width:100%;height:200px;object-fit:contain;border-radius:14px;" />
                    </a>
                </div>
            <?php endif; ?>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;font-size:14px;flex-shrink:0;">
                <span style="color:var(--wp--preset--color--foreground-alt);"><?php echo get_the_date(); ?></span>
                <span class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);">
                    <?php 
                    $categories = get_the_category();
                    if (!empty($categories)) {
                        echo esc_html($categories[0]->name);
                    }
                    ?>
                </span>
            </div>
            
            <h2 style="margin-bottom:20px;font-size:1.5rem;font-weight:600;flex-shrink:0;">
                <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                    <?php the_title(); ?>
                </a>
            </h2>
            
            <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:25px;flex-grow:1;">
                <?php echo wp_trim_words(get_the_excerpt(), 30, '...'); ?>
            </div>
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;flex-shrink:0;">
                <?php 
                $post_tags = get_the_tags();
                $tag_names = array();
                $has_other_tags = false;
                
                if ($post_tags) {
                    foreach ($post_tags as $tag) {
                        if ($tag->term_id !== $current_tag->term_id) { // Don't show current tag
                            $tag_names[] = '#' . $tag->name;
                            $has_other_tags = true;
                        }
                    }
                }
                
                if ($has_other_tags) : ?>
                <div class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);font-size:14px;">
                    <?php echo implode(' ', array_slice($tag_names, 0, 2)); // Show max 2 other tags ?>
                </div>
                <?php else : ?>
                <div></div>
                <?php endif; ?>
                <a href="<?php the_permalink(); ?>" class="search-link"
                   style="background:linear-gradient(135deg, var(--wp--preset--color--primary) 0%, rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.8) 100%);color:white;border:none;padding:10px 24px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.25), 0 2px 4px rgba(0, 0, 0, 0.08);text-transform:none;letter-spacing:0.025em;outline:none;text-decoration:none;line-height:1.4;">
                    <?php esc_html_e('Read Article', 'kotlinskidev'); ?>
                </a>
            </div>
            
        </div>
        <?php endwhile; ?>
    </div>
    
    <?php if ($tag_posts->max_num_pages > 1) : ?>
    <div style="display:flex;justify-content:center;margin-top:40px;">
        <?php 
        echo paginate_links(array(
            'total' => $tag_posts->max_num_pages,
            'prev_text' => '← ' . esc_html__('Previous', 'kotlinskidev'),
            'next_text' => esc_html__('Next', 'kotlinskidev') . ' →',
        )); 
        ?>
    </div>
    <?php endif; ?>
    
    <?php else : ?>
    <div style="text-align:center;padding:60px 0;">
        <h2 style="color:var(--wp--preset--color--foreground-alt);"><?php esc_html_e('No articles found with this tag', 'kotlinskidev'); ?></h2>
        <p style="color:var(--wp--preset--color--foreground-alt);"><?php esc_html_e('Articles with this tag are coming soon!', 'kotlinskidev'); ?></p>
    </div>
    <?php 
    endif; 
    wp_reset_postdata();
    ?>
    <!-- /wp:html -->
</div>
<!-- /wp:query -->