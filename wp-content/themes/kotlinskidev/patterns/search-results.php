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
    $paged = max(1, get_query_var('paged', 1)); // Fix: Ensure minimum page is 1
    
    $search_args = array(
        's' => $search_query,
        'post_status' => 'publish',
        'posts_per_page' => 10,
        'paged' => $paged, // Fix: Add pagination support
        'orderby' => 'relevance',
        'order' => 'DESC'
    );
    $search_args = kotlinskidev_apply_seo_noindex_exclusion($search_args);
    
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
    <div style="margin-bottom:0.9375rem;">
        <!-- Search Summary -->
        <div style="background:var(--wp--preset--color--light-shade);padding:0.9375rem;border-radius:0.75rem;border:0.125rem solid var(--wp--preset--color--border-color);margin-bottom:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.9375rem;">
                <div>
                    <h3 style="margin:0;color:var(--wp--preset--color--foreground-alt);font-size:1.25rem;">
                        <?php printf(esc_html__('Found %d results', 'kotlinskidev'), $search_results->found_posts); ?>
                    </h3>
                    <p style="margin:0.3125rem 0 0 0;color:var(--wp--preset--color--foreground-alt);font-size:0.875rem;">
                        <?php printf(esc_html__('Showing results for "%s"', 'kotlinskidev'), '<strong>' . esc_html($search_query) . '</strong>'); ?>
                        <?php if (!empty($current_category)) : ?>
                            <?php printf(esc_html__(' in %s', 'kotlinskidev'), '<strong>' . esc_html(str_replace('-', ' ', $current_category)) . '</strong>'); ?>
                        <?php endif; ?>
                        <?php if (!empty($current_type)) : ?>
                            <?php 
                            $type_label = ($current_type === 'post') ? esc_html__('Articles', 'kotlinskidev') : esc_html__('Pages', 'kotlinskidev');
                            printf(esc_html__(' • %s only', 'kotlinskidev'), '<strong>' . $type_label . '</strong>');
                            ?>
                        <?php endif; ?>
                    </p>
                </div>
                <?php if ($search_results->max_num_pages > 1) : ?>
                <div style="font-size:0.875rem;" class="link-dark-variant-support kt-gradient-text">
                    <?php printf(esc_html__('Page %d of %d', 'kotlinskidev'), max(1, get_query_var('paged', 1)), $search_results->max_num_pages); ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- Search Results Grid -->
        <div class="search-result-grid" style="display:grid;gap:0.9375rem;">
            <?php while ($search_results->have_posts()) : $search_results->the_post(); 
                $post_type = get_post_type();
                $is_page = ($post_type === 'page');
                $categories = get_the_category();
                $search_excerpt = kotlinskidev_get_search_excerpt(get_the_content(), $search_query, 40);
            ?>
            
            <div class="wp-block-group has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:0.125rem;border-radius:1.125rem;padding:0.9375rem;display:flex;flex-wrap:wrap;justify-content:start;align-items:center;gap:0.9375rem;">
                
                <!-- Featured Image (if available) -->
                <?php if (has_post_thumbnail()) : ?>
                <div style="flex-shrink:0;display:flex;justify-content:center;align-items:center;">
                    <a href="<?php the_permalink(); ?>">
                        <img src="<?php the_post_thumbnail_url('medium'); ?>" 
                             alt="<?php the_title(); ?>" 
                             style="width:12.5rem;height:12.5rem;object-fit:contain;border-radius:0.75rem;" />
                    </a>
                </div>
                <?php endif; ?>
                
                <!-- Content Area -->
                <div style="flex-grow:1;">
                    
                    <!-- Content Type & Meta -->
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.9375rem;margin-bottom:0.9375rem;font-size:0.875rem;">
                        <span class="kt-gradient-pill" style="padding:0.25rem 0.75rem;border-radius:0.9375rem;font-weight:600;">
                            <?php echo $is_page ? '📄 ' . esc_html__('Page', 'kotlinskidev') : '📝 ' . esc_html__('Article', 'kotlinskidev'); ?>
                        </span>
                        
                        <?php if (!$is_page) : ?>
                            <span style="color:var(--wp--preset--color--foreground-alt);">
                                <?php echo get_the_date(); ?>
                            </span>
                            
                            <?php if (!empty($categories)) : ?>
                                <span class="link-dark-variant-support kt-gradient-text">
                                    📂 <?php echo esc_html($categories[0]->name); ?>
                                </span>
                            <?php endif; ?>
                        <?php endif; ?>

                        <span class="link-dark-variant-support kt-gradient-text">
                            <?php echo kotlinskidev_reading_time(); ?>
                        </span>
                    </div>
                    
                    <!-- Title -->
                    <h3 style="margin-bottom:0.625rem;font-size:1.5rem;font-weight:600;">
                        <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                            <?php echo kotlinskidev_highlight_search_terms(get_the_title(), $search_query); ?>
                        </a>
                    </h3>
                    
                    <!-- Search-optimized excerpt -->
                    <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:0.9375rem;line-height:1.6;">
                        <?php echo $search_excerpt; ?>
                    </div>
                    
                    <!-- Tags (for articles) -->
                    <?php if (!$is_page) : 
                        $tags = get_the_tags();
                        if ($tags) : ?>
                        <div style="margin-bottom:0.9375rem;">
                            <?php foreach (array_slice($tags, 0, 3) as $tag) : ?>
                                <span class="kt-gradient-pill" style="padding:0.25rem 0.5rem;border-radius:0.5rem;font-size:0.75rem;margin-right:0.5rem;">
                                    #<?php echo $tag->name; ?>
                                </span>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; endif; ?>
                    
                    <!-- Read More Button -->
                    <div>
                        <a href="<?php the_permalink(); ?>" 
                           class="search-link">
                            <?php echo $is_page ? esc_html__('View Page', 'kotlinskidev') : esc_html__('Read Article', 'kotlinskidev'); ?> →
                        </a>
                    </div>
                    
                </div>
            </div>
            
            <?php endwhile; ?>
        </div>
        
        <!-- Pagination -->
        <?php if ($search_results->max_num_pages > 1) : ?>
        <div class="search-results-pagination" style="display:flex;justify-content:center;margin-top:3.125rem;">
            <?php 
            $current_page = max(1, get_query_var('paged', 1));
            $pagination_args = array(
                'total' => $search_results->max_num_pages,
                'current' => $current_page,
                'prev_text' => '<span class="arrow">←</span><span class="text">' . esc_html__('Previous', 'kotlinskidev') . '</span>',
                'next_text' => '<span class="text">' . esc_html__('Next', 'kotlinskidev') . '</span><span class="arrow">→</span>',
                'type' => 'array',
                'show_all' => false,
                'mid_size' => 2,
                'end_size' => 1,
            );
            
            $pagination_links = paginate_links($pagination_args);
            
            if ($pagination_links) {
                foreach ($pagination_links as $link) {
                    // Fix the current page issue for page 1
                    if ($current_page == 1 && strpos($link, 'page-numbers') !== false && !strpos($link, 'prev') && !strpos($link, 'next') && !strpos($link, 'dots')) {
                        // Check if this is the page 1 link
                        if (preg_match('/>\s*1\s*</', $link) && !strpos($link, 'current')) {
                            $link = str_replace('page-numbers', 'page-numbers current', $link);
                            $link = preg_replace('/<a([^>]*)>/', '<span$1>', $link);
                            $link = str_replace('</a>', '</span>', $link);
                        }
                    }
                    echo $link;
                }
            }
            ?>
        </div>
        <?php endif; ?>
        
        <!-- Search Again Section -->
        <div style="background:var(--wp--preset--color--light-shade);padding:0.9375rem;border-radius:1rem;text-align:center;margin-top:1.25rem;border:0.125rem solid var(--wp--preset--color--border-color);">
            <div style="font-size:2rem;margin-bottom:0.625rem;">🔍</div>
            <h3 style="color:var(--wp--preset--color--foreground-alt);margin-bottom:0.5rem;font-size:1.5rem;">
                <?php esc_html_e('Looking for something else?', 'kotlinskidev'); ?>
            </h3>
            <p style="color:var(--wp--preset--color--foreground-alt);margin-bottom:0.625rem;font-size:1rem;line-height:1.5;">
                <?php esc_html_e('Try searching for a different term or explore more content using the search form below.', 'kotlinskidev'); ?>
            </p>
        </div>
        
    </div>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->

<?php else : ?>

<!-- No Results Found -->
<!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem"}}},"layout":{"type":"constrained","contentSize":"37.5rem"}} -->
<div class="wp-block-group" style="padding-top:1.25rem;padding-bottom:1.25rem">
    
    <!-- wp:html -->
    <div style="text-align:center;">
        <div style="font-size:4rem;margin-bottom:0.9375rem;text-align:center;">🔍</div>
        
        <h3 style="color:var(--wp--preset--color--foreground-alt);margin-bottom:0.625rem;">
            <?php esc_html_e('No results found', 'kotlinskidev'); ?>
        </h3>
        
        <p style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.875rem;">
            <?php printf(
                esc_html__('We couldn\'t find any content matching "%s"', 'kotlinskidev'), 
                '<strong>' . esc_html($search_query) . '</strong>'
            ); ?>
            <?php if (!empty($current_category) || !empty($current_type)) : ?>
                <?php esc_html_e(' with your current filters', 'kotlinskidev'); ?>
            <?php endif; ?>.
        </p>
        
        <div style="background:var(--wp--preset--color--light-shade);padding:1.5625rem;border-radius:0.75rem;text-align:left;margin-bottom:1.875rem;display:flex;flex-direction:column;justify-content:center;align-items:center;">
            <h4 style="color:var(--wp--preset--color--foreground-alt);margin-bottom:0.9375rem;"><?php esc_html_e('Try these search tips:', 'kotlinskidev'); ?></h4>
            <ul style="color:var(--wp--preset--color--foreground-alt);line-height:1.6;display:flex;flex-direction:column;justify-content:center;align-items:center;max-width:100%;width:fit-content;">
                <li><?php esc_html_e('Check your spelling and try again', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Use fewer or different keywords', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Remove content type or category filters', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Try more general terms', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Search for related topics or synonyms', 'kotlinskidev'); ?></li>
            </ul>
        </div>
        
        <a href="<?php echo esc_url(home_url('/')); ?>"
           class="search-link">
            <?php esc_html_e('Browse All Content', 'kotlinskidev'); ?>
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