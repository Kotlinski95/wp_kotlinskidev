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
    <div style="margin-bottom:15px;">
        <!-- Search Summary -->
        <div style="background:var(--wp--preset--color--light-shade);padding:15px;border-radius:12px;border:2px solid var(--wp--preset--color--border-color);margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;">
                <div>
                    <h3 style="margin:0;color:var(--wp--preset--color--foreground-alt);font-size:1.25rem;">
                        <?php printf(esc_html__('Found %d results', 'kotlinskidev'), $search_results->found_posts); ?>
                    </h3>
                    <p style="margin:5px 0 0 0;color:var(--wp--preset--color--foreground-alt);font-size:14px;">
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
                <div style="color:var(--wp--preset--color--primary);font-size:14px;" class="link-dark-variant-support">
                    <?php printf(esc_html__('Page %d of %d', 'kotlinskidev'), max(1, get_query_var('paged', 1)), $search_results->max_num_pages); ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- Search Results Grid -->
        <div class="search-result-grid" style="display:grid;gap:15px;">
            <?php while ($search_results->have_posts()) : $search_results->the_post(); 
                $post_type = get_post_type();
                $is_page = ($post_type === 'page');
                $categories = get_the_category();
                $search_excerpt = kotlinskidev_get_search_excerpt(get_the_content(), $search_query, 40);
            ?>
            
            <div class="wp-block-group has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:2px;border-radius:18px;padding:15px;display:flex;flex-wrap:wrap;justify-content:start;align-items:center;gap:15px;">
                
                <!-- Featured Image (if available) -->
                <?php if (has_post_thumbnail()) : ?>
                <div style="flex-shrink:0;display:flex;justify-content:center;align-items:center;">
                    <a href="<?php the_permalink(); ?>">
                        <img src="<?php the_post_thumbnail_url('medium'); ?>" 
                             alt="<?php the_title(); ?>" 
                             style="width:200px;height:200px;object-fit:contain;border-radius:12px;" />
                    </a>
                </div>
                <?php endif; ?>
                
                <!-- Content Area -->
                <div style="flex-grow:1;">
                    
                    <!-- Content Type & Meta -->
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:15px;margin-bottom:15px;font-size:14px;">
                        <span style="background:var(--wp--preset--color--primary);color:white;padding:4px 12px;border-radius:15px;font-weight:600;">
                            <?php echo $is_page ? '📄 ' . esc_html__('Page', 'kotlinskidev') : '📝 ' . esc_html__('Article', 'kotlinskidev'); ?>
                        </span>
                        
                        <?php if (!$is_page) : ?>
                            <span style="color:var(--wp--preset--color--foreground-alt);">
                                <?php echo get_the_date(); ?>
                            </span>
                            
                            <?php if (!empty($categories)) : ?>
                                <span class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);">
                                    📂 <?php echo esc_html($categories[0]->name); ?>
                                </span>
                            <?php endif; ?>
                        <?php endif; ?>
                        
                        <span class="link-dark-variant-support" style="color:var(--wp--preset--color--primary);">
                            <?php echo kotlinskidev_reading_time(); ?>
                        </span>
                    </div>
                    
                    <!-- Title -->
                    <h3 style="margin-bottom:10px;font-size:1.5rem;font-weight:600;">
                        <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                            <?php echo kotlinskidev_highlight_search_terms(get_the_title(), $search_query); ?>
                        </a>
                    </h3>
                    
                    <!-- Search-optimized excerpt -->
                    <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:15px;line-height:1.6;">
                        <?php echo $search_excerpt; ?>
                    </div>
                    
                    <!-- Tags (for articles) -->
                    <?php if (!$is_page) : 
                        $tags = get_the_tags();
                        if ($tags) : ?>
                        <div style="margin-bottom:15px;">
                            <?php foreach (array_slice($tags, 0, 3) as $tag) : ?>
                                <span class="link-dark-variant-support" style="background:transparent;color:var(--wp--preset--color--primary);border:2px solid var(--wp--preset--color--primary);padding:4px 8px;border-radius:8px;font-size:12px;margin-right:8px;">
                                    #<?php echo $tag->name; ?>
                                </span>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; endif; ?>
                    
                    <!-- Read More Button -->
                    <div>
                        <a href="<?php the_permalink(); ?>" 
                           style="background:var(--wp--preset--color--primary);color:white;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;transition:all 0.3s ease;">
                            <?php echo $is_page ? esc_html__('View Page', 'kotlinskidev') : esc_html__('Read Article', 'kotlinskidev'); ?> →
                        </a>
                    </div>
                    
                </div>
            </div>
            
            <?php endwhile; ?>
        </div>
        
        <!-- Pagination -->
        <?php if ($search_results->max_num_pages > 1) : ?>
        <div class="search-results-pagination" style="display:flex;justify-content:center;margin-top:50px;">
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
        <div style="background:var(--wp--preset--color--light-shade);padding:15px;border-radius:16px;text-align:center;margin-top:20px;border:2px solid var(--wp--preset--color--border-color);">
            <div style="font-size:2rem;margin-bottom:10px;">🔍</div>
            <h3 style="color:var(--wp--preset--color--foreground-alt);margin-bottom:8px;font-size:1.5rem;">
                <?php esc_html_e('Looking for something else?', 'kotlinskidev'); ?>
            </h3>
            <p style="color:var(--wp--preset--color--foreground-alt);margin-bottom:10px;font-size:16px;line-height:1.5;">
                <?php esc_html_e('Try searching for a different term or explore more content using the search form below.', 'kotlinskidev'); ?>
            </p>
        </div>
        
    </div>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->

<?php else : ?>

<!-- No Results Found -->
<!-- wp:group {"style":{"spacing":{"padding":{"top":"20px","bottom":"20px"}}},"layout":{"type":"constrained","contentSize":"600px"}} -->
<div class="wp-block-group" style="padding-top:20px;padding-bottom:20px">
    
    <!-- wp:html -->
    <div style="text-align:center;">
        <div style="font-size:4rem;margin-bottom:15px;text-align:center;">🔍</div>
        
        <h3 style="color:var(--wp--preset--color--foreground-alt);margin-bottom:10px;">
            <?php esc_html_e('No results found', 'kotlinskidev'); ?>
        </h3>
        
        <p style="color:var(--wp--preset--color--foreground-alt);margin-bottom:30px;">
            <?php printf(
                esc_html__('We couldn\'t find any content matching "%s"', 'kotlinskidev'), 
                '<strong>' . esc_html($search_query) . '</strong>'
            ); ?>
            <?php if (!empty($current_category) || !empty($current_type)) : ?>
                <?php esc_html_e(' with your current filters', 'kotlinskidev'); ?>
            <?php endif; ?>.
        </p>
        
        <div style="background:var(--wp--preset--color--light-shade);padding:25px;border-radius:12px;text-align:left;margin-bottom:30px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
            <h4 style="color:var(--wp--preset--color--foreground-alt);margin-bottom:15px;"><?php esc_html_e('Try these search tips:', 'kotlinskidev'); ?></h4>
            <ul style="color:var(--wp--preset--color--foreground-alt);line-height:1.6;display:flex;flex-direction:column;justify-content:center;align-items:center;max-width:100%;width:fit-content;">
                <li><?php esc_html_e('Check your spelling and try again', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Use fewer or different keywords', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Remove content type or category filters', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Try more general terms', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Search for related topics or synonyms', 'kotlinskidev'); ?></li>
            </ul>
        </div>
        
        <a href="<?php echo esc_url(home_url('/')); ?>" 
           style="background:var(--wp--preset--color--primary);color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
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
<?php endif;