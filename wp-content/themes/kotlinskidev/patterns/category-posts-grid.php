<?php
/**
 * Title: Category Posts Grid
 * Slug: kotlinskidev/category-posts-grid
 * Categories: blog, kotlinskidev/blog, themeslug/custom
 */
?>
<!-- wp:query {"queryId":1,"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true},"layout":{"type":"constrained"}} -->
<div class="wp-block-query">
    
    <!-- wp:html -->
    <?php
    // Get current category for the query
    $current_category = get_queried_object();
    
    // Query posts from this category
    $category_posts = new WP_Query(array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => 6,
        'cat' => $current_category->term_id,
        'orderby' => 'date',
        'order' => 'DESC'
    ));
    
    if ($category_posts->have_posts()) :
    ?>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 0.9375rem; margin-bottom: 1.25rem;">
        <?php while ($category_posts->have_posts()) : $category_posts->the_post(); ?>
        <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0.125rem;border-radius:1.125rem;padding:0.9375rem;display:flex;flex-direction:column;height:100%;box-shadow:var(--wp--preset--shadow--natural);">
            
            <?php if (has_post_thumbnail()) : ?>
            <div style="margin-bottom:0.9375rem;flex-shrink:0;">
                <a href="<?php the_permalink(); ?>">
                <img src="<?php the_post_thumbnail_url('medium_large'); ?>" 
                     alt="<?php the_title(); ?>" 
                     style="width:100%;height:12.5rem;object-fit:contain;border-radius:0.875rem;" />
                </a>
            </div>
            <?php endif; ?>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:0.9375rem;font-size:0.875rem;flex-shrink:0;">
            <span style="color:var(--wp--preset--color--foreground-alt);"><?php echo get_the_date(); ?></span>
            <span class="link-dark-variant-support kt-gradient-text"><?php echo kotlinskidev_reading_time(); ?></span>
            </div>
            
            <h2 style="margin-bottom:0.9375rem;font-size:1.5rem;font-weight:600;flex-shrink:0;">
            <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                <?php the_title(); ?>
            </a>
            </h2>
            
            <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.5625rem;flex-grow:1;">
            <?php echo esc_html(wp_trim_words(get_the_excerpt(), 30, '...')); ?>
            </div>
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;flex-shrink:0;gap:0.9375rem;flex-wrap:wrap;">
            <?php 
            $post_tags = get_the_tags();
            if ($post_tags) : ?>
            <div class="link-dark-variant-support kt-gradient-text" style="font-size:0.875rem;display:flex;flex-wrap:wrap;row-gap:0.3125rem;">
                <?php the_tags('', ', ', ''); ?>
            </div>
            <?php else : ?>
            <div></div>
            <?php endif; ?>
            <a href="<?php the_permalink(); ?>" 
               class="search-link">
                <?php esc_html_e('Read Article', 'kotlinskidev'); ?>
            </a>
            </div>
            
        </div>
        <?php endwhile; ?>
    </div>
    
    <?php if ($category_posts->max_num_pages > 1) : ?>
    <div style="display:flex;justify-content:center;margin-top:2.5rem;">
        <?php 
        echo paginate_links(array(
            'total' => $category_posts->max_num_pages,
            'prev_text' => '← ' . esc_html__('Previous', 'kotlinskidev'),
            'next_text' => esc_html__('Next', 'kotlinskidev') . ' →',
        )); 
        ?>
    </div>
    <?php endif; ?>
    
    <?php else : ?>
    <div style="text-align:center;padding:3.75rem 0;">
        <h2 style="color:var(--wp--preset--color--foreground-alt);"><?php esc_html_e('No articles in this topic yet', 'kotlinskidev'); ?></h2>
        <p style="color:var(--wp--preset--color--foreground-alt);"><?php esc_html_e('Articles for this topic are coming soon!', 'kotlinskidev'); ?></p>
    </div>
    <?php 
    endif; 
    wp_reset_postdata();
    ?>
    <!-- /wp:html -->
</div>
<!-- /wp:query -->