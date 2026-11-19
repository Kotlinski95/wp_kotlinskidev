<?php
function kotlinskidev_render_search_header_fresh_per_language() {
    $search_query = get_search_query();

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"1.25rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="margin-bottom:1.25rem">

        <!-- wp:html -->
        <div style="text-align:center;">
            <?php if (!empty($search_query)) : ?>
                <h1 style="color:var(--wp--preset--color--foreground);font-weight:800;font-size:2.5rem;margin-bottom:0.625rem;">
                    <?php esc_html_e('Search Results', 'kotlinskidev'); ?>
                </h1>
            <?php else : ?>
                <h1 style="color:var(--wp--preset--color--foreground);font-weight:800;font-size:2.5rem;margin-bottom:0.625rem;">
                    <?php esc_html_e('Search My Content', 'kotlinskidev'); ?>
                </h1>

                <p style="color:var(--wp--preset--color--foreground);font-size:1.125rem;margin-bottom:0.9375rem;">
                    <?php esc_html_e('Find articles, pages, and resources across my entire site', 'kotlinskidev'); ?>
                </p>
            <?php endif; ?>
        </div>
        <!-- /wp:html -->
    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}
