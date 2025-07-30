<?php
/**
 * Title: Enhanced Search Results
 * Slug: kotlinskidev/search-results
 * Categories: search, kotlinskidev/search, themeslug/custom
 */

$search_query = get_search_query();
$current_category = isset($_GET['search_category']) ? sanitize_text_field($_GET['search_category']) : '';
$current_type = isset($_GET['search_type']) ? sanitize_text_field($_GET['search_type']) : '';

if (!empty($search_query)) :
    // Build enhanced search arguments
    $search_args = array(
        's' => $search_query,
        'post_status' => 'publish',
        'posts_per_page' => 10,
        'orderby' => 'relevance',
        'order' => 'DESC'
    );
    
    // Filter by content type if specified
    if (!empty($current_type)) {
        $search_args['post_type'] = $current_type;
    } else {
        $search_args['post_type'] = array('post', 'page');
    }
    
    // Filter by category if specified
    if (!empty($current_category)) {
        $search_args['category_name'] = $current_category;
    }
    
    // Execute enhanced search
    $search_results = new WP_Query($search_args);
    
    if ($search_results->have_posts()) :
?>

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    
    <!-- wp:html -->
    <div style="margin-bottom:30px;">
        <!-- Search Summary -->
        <div style="background:var(--wp--preset--color--light-shade);padding:20px;border-radius:12px;border:1px solid var(--wp--preset--color--border-color);margin-bottom:40px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;">
                <div>
                    <h3 style="margin:0;color:var(--wp--preset--color--foreground-alt);font-size:1.25rem;">
                        Found <?php echo $search_results->found_posts; ?> results
                    </h3>
                    <p style="margin:5px 0 0 0;color:var(--wp--preset--color--foreground-alt);font-size:14px;">
                        Showing results for "<strong><?php echo esc_html($search_query); ?></strong>"
                        <?php if (!empty($current_category)) : ?>
                            in <strong><?php echo esc_html(str_replace('-', ' ', $current_category)); ?></strong>
                        <?php endif; ?>
                        <?php if (!empty($current_type)) : ?>
                            • <strong><?php echo ucfirst($current_type); ?>s</strong> only
                        <?php endif; ?>
                    </p>
                </div>
                <?php if ($search_results->max_num_pages > 1) : ?>
                <div style="color:var(--wp--preset--color--primary);font-size:14px;">
                    Page <?php echo get_query_var('paged', 1); ?> of <?php echo $search_results->max_num_pages; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- Search Results Grid -->
        <div style="display:grid;gap:30px;">
            <?php while ($search_results->have_posts()) : $search_results->the_post(); 
                $post_type = get_post_type();
                $is_page = ($post_type === 'page');
                $categories = get_the_category();
                $search_excerpt = kotlinskidev_get_search_excerpt(get_the_content(), $search_query, 40);
            ?>
            
            <div class="wp-block-group has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:1px;border-radius:18px;padding:30px;display:flex;gap:25px;">
                
                <!-- Featured Image (if available) -->
                <?php if (has_post_thumbnail()) : ?>
                <div style="flex-shrink:0;">
                    <a href="<?php the_permalink(); ?>">
                        <img src="<?php the_post_thumbnail_url('medium'); ?>" 
                             alt="<?php the_title(); ?>" 
                             style="width:150px;height:100px;object-fit:cover;border-radius:12px;" />
                    </a>
                </div>
                <?php endif; ?>
                
                <!-- Content Area -->
                <div style="flex-grow:1;">
                    
                    <!-- Content Type & Meta -->
                    <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px;font-size:14px;">
                        <span style="background:var(--wp--preset--color--primary);color:white;padding:4px 12px;border-radius:15px;font-weight:600;">
                            <?php echo $is_page ? '📄 Page' : '📝 Article'; ?>
                        </span>
                        
                        <?php if (!$is_page) : ?>
                            <span style="color:var(--wp--preset--color--foreground-alt);">
                                <?php echo get_the_date(); ?>
                            </span>
                            
                            <?php if (!empty($categories)) : ?>
                                <span style="color:var(--wp--preset--color--primary);">
                                    📂 <?php echo esc_html($categories[0]->name); ?>
                                </span>
                            <?php endif; ?>
                        <?php endif; ?>
                        
                        <span style="color:var(--wp--preset--color--primary);">
                            <?php echo kotlinskidev_reading_time(); ?>
                        </span>
                    </div>
                    
                    <!-- Title -->
                    <h3 style="margin-bottom:15px;font-size:1.5rem;font-weight:600;">
                        <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                            <?php echo kotlinskidev_highlight_search_terms(get_the_title(), $search_query); ?>
                        </a>
                    </h3>
                    
                    <!-- Search-optimized excerpt -->
                    <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:20px;line-height:1.6;">
                        <?php echo $search_excerpt; ?>
                    </div>
                    
                    <!-- Tags (for articles) -->
                    <?php if (!$is_page) : 
                        $tags = get_the_tags();
                        if ($tags) : ?>
                        <div style="margin-bottom:20px;">
                            <?php foreach (array_slice($tags, 0, 3) as $tag) : ?>
                                <span style="background:transparent;color:var(--wp--preset--color--primary);border:1px solid var(--wp--preset--color--primary);padding:4px 8px;border-radius:8px;font-size:12px;margin-right:8px;">
                                    #<?php echo $tag->name; ?>
                                </span>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; endif; ?>
                    
                    <!-- Read More Button -->
                    <div>
                        <a href="<?php the_permalink(); ?>" 
                           style="background:var(--wp--preset--color--primary);color:white;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;transition:all 0.3s ease;">
                            <?php echo $is_page ? 'View Page' : 'Read Article'; ?> →
                        </a>
                    </div>
                    
                </div>
            </div>
            
            <?php endwhile; ?>
        </div>
        
        <!-- Pagination -->
        <?php if ($search_results->max_num_pages > 1) : ?>
        <div style="display:flex;justify-content:center;margin-top:50px;">
            <?php 
            echo paginate_links(array(
                'total' => $search_results->max_num_pages,
                'current' => get_query_var('paged', 1),
                'prev_text' => '← Previous',
                'next_text' => 'Next →',
                'type' => 'plain'
            )); 
            ?>
        </div>
        <?php endif; ?>
        
    </div>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->

<?php else : ?>

<!-- No Results Found -->
<!-- wp:group {"style":{"spacing":{"padding":{"top":"60px","bottom":"60px"}}},"layout":{"type":"constrained","contentSize":"600px"}} -->
<div class="wp-block-group" style="padding-top:60px;padding-bottom:60px">
    
    <!-- wp:html -->
    <div style="text-align:center;">
        <div style="font-size:4rem;margin-bottom:20px;">🔍</div>
        
        <h3 style="color:var(--wp--preset--color--foreground-alt);margin-bottom:15px;">
            No results found
        </h3>
        
        <p style="color:var(--wp--preset--color--foreground-alt);margin-bottom:30px;">
            We couldn't find any content matching "<strong><?php echo esc_html($search_query); ?></strong>"
            <?php if (!empty($current_category) || !empty($current_type)) : ?>
                with your current filters
            <?php endif; ?>.
        </p>
        
        <div style="background:var(--wp--preset--color--light-shade);padding:25px;border-radius:12px;text-align:left;margin-bottom:30px;">
            <h4 style="color:var(--wp--preset--color--foreground-alt);margin-bottom:15px;">Try these search tips:</h4>
            <ul style="color:var(--wp--preset--color--foreground-alt);line-height:1.6;">
                <li>Check your spelling and try again</li>
                <li>Use fewer or different keywords</li>
                <li>Remove content type or category filters</li>
                <li>Try more general terms</li>
                <li>Search for related topics or synonyms</li>
            </ul>
        </div>
        
        <a href="<?php echo esc_url(home_url('/')); ?>" 
           style="background:var(--wp--preset--color--primary);color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
            Browse All Content
        </a>
    </div>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->

<?php 
    endif; 
    wp_reset_postdata();
endif;
?>

<!-- Suggested Content (when no search query) -->
<?php if (empty($search_query)) : ?>
<!-- wp:pattern {"slug":"kotlinskidev/popular-content"} /-->
<?php endif; ?>
