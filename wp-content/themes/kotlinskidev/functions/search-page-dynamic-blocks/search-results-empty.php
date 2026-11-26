<?php
function kotlinskidev_search_results_empty_markup( array $request ): string {
    $search_query = $request['query'];
    $current_category = $request['category'];
    $current_type = $request['type'];

    ob_start();
?>
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem"}}},"layout":{"type":"constrained","contentSize":"37.5rem"}} -->
            <div class="wp-block-group" style="padding-top:1.25rem;padding-bottom:1.25rem">

                <!-- wp:html -->
                <div style="text-align:center;">
                    <div style="font-size:4rem;margin-bottom:0.9375rem;text-align:center;">🔍</div>

                    <h3 style="color:var(--wp--preset--color--foreground);margin-bottom:0.625rem;">
                        <?php esc_html_e('No results found', 'kotlinskidev'); ?>
                    </h3>

                    <p style="color:var(--wp--preset--color--foreground);margin-bottom:1.875rem;">
                        <?php printf(
                            esc_html__('We couldn\'t find any content matching "%s"', 'kotlinskidev'),
                            '<strong>' . esc_html($search_query) . '</strong>'
                        ); ?>
                        <?php if (!empty($current_category) || !empty($current_type)) : ?>
                            <?php esc_html_e(' with your current filters', 'kotlinskidev'); ?>
                        <?php endif; ?>.
                    </p>

                    <div style="background:var(--wp--preset--color--light-shade);padding:1.5625rem;border-radius:0.75rem;text-align:left;margin-bottom:1.875rem;display:flex;flex-direction:column;justify-content:center;align-items:center;">
                        <h4 style="color:var(--wp--preset--color--foreground);margin-bottom:0.9375rem;"><?php esc_html_e('Try these search tips:', 'kotlinskidev'); ?></h4>
                        <ul style="color:var(--wp--preset--color--foreground);line-height:1.6;display:flex;flex-direction:column;justify-content:center;align-items:center;max-width:100%;width:fit-content;">
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
    return ob_get_clean();
}
