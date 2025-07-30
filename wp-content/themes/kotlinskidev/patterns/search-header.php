<?php
/**
 * Title: Search Header
 * Slug: kotlinskidev/search-header
 * Categories: search, kotlinskidev/search, themeslug/custom
 */

$search_query = get_search_query();
$search_results_count = $GLOBALS['wp_query']->found_posts ?? 0;
?>

<!-- wp:group {"style":{"spacing":{"margin":{"bottom":"40px"}}},"layout":{"type":"constrained","contentSize":"800px"}} -->
<div class="wp-block-group" style="margin-bottom:40px">
    
    <!-- wp:html -->
    <div style="text-align:center;">
        <?php if (!empty($search_query)) : ?>
            <h1 style="color:var(--wp--preset--color--foreground-alt);font-weight:800;font-size:2.5rem;margin-bottom:15px;">
                Search Results
            </h1>
        <?php else : ?>
            <h1 style="color:var(--wp--preset--color--foreground-alt);font-weight:800;font-size:2.5rem;margin-bottom:15px;">
                Search Our Content
            </h1>
            
            <p style="color:var(--wp--preset--color--foreground-alt);font-size:1.125rem;margin-bottom:20px;">
                Find articles, pages, and resources across our entire site
            </p>
        <?php endif; ?>
    </div>
    <!-- /wp:html -->
    
</div>
<!-- /wp:group -->
