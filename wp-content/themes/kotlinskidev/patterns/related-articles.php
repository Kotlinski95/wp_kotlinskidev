<?php
/**
 * Title: Related Articles Section
 * Slug: kotlinskidev/related-articles
 * Categories: blog, kotlinskidev/blog, themeslug/custom
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group has-light-shade-background-color has-background" style="padding-top:1.25rem;padding-right:var(--wp--preset--spacing--40);padding-bottom:1.25rem;padding-left:var(--wp--preset--spacing--40)">
    
    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h2 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size" style="font-style:normal;font-weight:700"><?php esc_html_e('Related Articles', 'kotlinskidev') ?></h2>
    <!-- /wp:heading -->
    
    <!-- wp:html -->
    <?php
    // Get current post info for related articles logic
    $current_post_id = get_the_ID();
    $current_post = get_post($current_post_id); // Store current post
    $current_categories = get_the_category($current_post_id);
    $current_tags = get_the_tags($current_post_id);
    
    $related_posts = array();
    
    // Priority 1: Articles with same category AND same tags (most relevant)
    if (!empty($current_categories) && !empty($current_tags)) {
        $tag_ids = array_map(function($tag) { return $tag->term_id; }, $current_tags);
        
        $priority1_args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => 3,
            'post__not_in' => array($current_post_id),
            'category__in' => array($current_categories[0]->term_id),
            'tag__in' => $tag_ids,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $priority1_query = new WP_Query($priority1_args);
        if ($priority1_query->have_posts()) {
            while ($priority1_query->have_posts()) {
                $priority1_query->the_post();
                $post_obj = get_post();
                if ($post_obj->ID !== $current_post_id) { // Double-check exclusion
                    $related_posts[] = $post_obj;
                }
            }
            wp_reset_postdata();
        }
    }
    
    // Priority 2: Articles with same category (if we need more)
    if (count($related_posts) < 3 && !empty($current_categories)) {
        $already_included = array_merge(array($current_post_id), array_column($related_posts, 'ID'));
        
        $priority2_args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => 3 - count($related_posts),
            'post__not_in' => $already_included,
            'category__in' => array($current_categories[0]->term_id),
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $priority2_query = new WP_Query($priority2_args);
        if ($priority2_query->have_posts()) {
            while ($priority2_query->have_posts()) {
                $priority2_query->the_post();
                $post_obj = get_post();
                if ($post_obj->ID !== $current_post_id) { // Double-check exclusion
                    $related_posts[] = $post_obj;
                }
            }
            wp_reset_postdata();
        }
    }
    
    // Priority 3: Articles with same tags (if we still need more)
    if (count($related_posts) < 3 && !empty($current_tags)) {
        $already_included = array_merge(array($current_post_id), array_column($related_posts, 'ID'));
        $tag_ids = array_map(function($tag) { return $tag->term_id; }, $current_tags);
        
        $priority3_args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => 3 - count($related_posts),
            'post__not_in' => $already_included,
            'tag__in' => $tag_ids,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $priority3_query = new WP_Query($priority3_args);
        if ($priority3_query->have_posts()) {
            while ($priority3_query->have_posts()) {
                $priority3_query->the_post();
                $post_obj = get_post();
                if ($post_obj->ID !== $current_post_id) { // Double-check exclusion
                    $related_posts[] = $post_obj;
                }
            }
            wp_reset_postdata();
        }
    }
    
    // Priority 4: Recent articles (fallback if we still need more)
    if (count($related_posts) < 3) {
        $already_included = array_merge(array($current_post_id), array_column($related_posts, 'ID'));
        
        $priority4_args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => 3 - count($related_posts),
            'post__not_in' => $already_included,
            'orderby' => 'date',
            'order' => 'DESC'
        );
        
        $priority4_query = new WP_Query($priority4_args);
        if ($priority4_query->have_posts()) {
            while ($priority4_query->have_posts()) {
                $priority4_query->the_post();
                $post_obj = get_post();
                if ($post_obj->ID !== $current_post_id) { // Double-check exclusion
                    $related_posts[] = $post_obj;
                }
            }
            wp_reset_postdata();
        }
    }
    
    // Final safety check: Remove any duplicate current post
    $related_posts = array_filter($related_posts, function($post) use ($current_post_id) {
        return $post->ID !== $current_post_id;
    });
    
    if (!empty($related_posts)) :
    ?>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 0.9375rem; margin-top: 1.25rem;">
        <?php foreach ($related_posts as $related_post) : 
            // Use a different variable name to avoid confusion
            $display_post = $related_post;
        ?>
        <div class="wp-block-group has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:0.125rem;border-radius:1.125rem;padding:0.9375rem;display:flex;flex-direction:column;height:100%;box-shadow:var(--wp--preset--shadow--natural);">
            
            <?php if (has_post_thumbnail($display_post->ID)) : ?>
                <div style="margin-bottom:0.9375rem;flex-shrink:0;">
                    <a href="<?php echo get_permalink($display_post->ID); ?>">
                        <img src="<?php echo get_the_post_thumbnail_url($display_post->ID, 'medium_large'); ?>" 
                             alt="<?php echo esc_attr($display_post->post_title); ?>" 
                             style="width:100%;height:11.25rem;object-fit:contain;border-radius:0.875rem;" />
                    </a>
                </div>
            <?php endif; ?>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:0.9375rem;font-size:0.875rem;flex-shrink:0;">
                <span style="color:var(--wp--preset--color--foreground-alt);"><?php echo get_the_date('', $display_post->ID); ?></span>
                <span class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);">
                    <?php 
                    // Show relevance indicator
                    $post_categories = get_the_category($display_post->ID);
                    $post_tags = get_the_tags($display_post->ID);
                    
                    $same_category = !empty($current_categories) && !empty($post_categories) && 
                                   $current_categories[0]->term_id === $post_categories[0]->term_id;
                    
                    $same_tags = false;
                    if (!empty($current_tags) && !empty($post_tags)) {
                        $current_tag_ids = array_column($current_tags, 'term_id');
                        $post_tag_ids = array_column($post_tags, 'term_id');
                        $same_tags = !empty(array_intersect($current_tag_ids, $post_tag_ids));
                    }
                    
                    if ($same_category && $same_tags) {
                        echo '🎯 ' . esc_html__('Highly Related', 'kotlinskidev');
                    } elseif ($same_category) {
                        echo '📂 ' . esc_html__('Same Topic', 'kotlinskidev');
                    } elseif ($same_tags) {
                        echo '🏷️ ' . esc_html__('Similar Tags', 'kotlinskidev');
                    } else {
                        echo kotlinskidev_reading_time($display_post->ID);
                    }
                    ?>
                </span>
            </div>
            
            <h3 style="margin-bottom:1.25rem;font-size:1.25rem;font-weight:600;flex-shrink:0;">
                <a href="<?php echo get_permalink($display_post->ID); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                    <?php echo esc_html($display_post->post_title); ?>
                </a>
            </h3>
            
            <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.5625rem;flex-grow:1;">
                <?php 
                $excerpt = $display_post->post_excerpt;
                if (empty($excerpt)) {
                    $excerpt = $display_post->post_content;
                }
                echo wp_trim_words($excerpt, 25, '...');
                ?>
            </div>
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;flex-shrink:0;gap:0.9375rem;flex-wrap:wrap;">
                <div class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);font-size:0.875rem;display:flex;flex-wrap:wrap;row-gap:0.3125rem;">
                    <?php 
                    if (!empty($post_categories)) {
                        echo esc_html($post_categories[0]->name);
                    }
                    ?>
                </div>
                <a href="<?php echo get_permalink($display_post->ID); ?>" 
                   class="search-link"
                   style="background:linear-gradient(135deg, var(--wp--preset--color--primary) 0%, rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.8) 100%);color:white;border:none;padding:0.625rem 1.5rem;border-radius:0.75rem;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:inline-flex;align-items:center;gap:0.5rem;box-shadow:0 0.25rem 0.75rem rgba(var(--wp--preset--color--primary-rgb, 59, 130, 246), 0.25), 0 0.125rem 0.25rem rgba(0, 0, 0, 0.08);text-transform:none;letter-spacing:0.025em;outline:none;text-decoration:none;line-height:1.4;white-space:nowrap;">
                    <?php esc_html_e('Read Article', 'kotlinskidev'); ?>
                </a>
            </div>
            
        </div>
        <?php endforeach; ?>
    </div>
    
    <?php else : ?>
    <div style="text-align:center;padding:2.5rem 0;">
        <p style="color:var(--wp--preset--color--foreground-alt);"><?php esc_html_e('No related articles found.', 'kotlinskidev'); ?></p>
    </div>
    <?php endif; ?>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->