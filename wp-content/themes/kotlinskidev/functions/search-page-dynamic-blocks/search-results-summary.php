<?php
function kotlinskidev_search_results_summary_markup( WP_Query $search_results, array $request ): string {
    $search_query = $request['query'];
    $current_category = $request['category'];
    $current_type = $request['type'];
    ob_start();
?>
                    <div style="background:var(--wp--preset--color--light-shade);padding:0.9375rem;border-radius:0.75rem;border:0.125rem solid var(--wp--preset--color--border-color);margin-bottom:1.25rem;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.9375rem;">
                            <div>
                                <h2 style="margin:0;color:var(--wp--preset--color--foreground);font-size:1.25rem;font-weight:700;line-height:var(--wp--preset--line-height--x-small);">
                                    <?php printf(esc_html__('Found %d results', 'kotlinskidev'), absint($search_results->found_posts)); ?>
                                </h2>
                                <p style="margin:0.3125rem 0 0 0;color:var(--wp--preset--color--foreground);font-size:0.875rem;">
                                    <?php printf(esc_html__('Showing results for "%s"', 'kotlinskidev'), '<strong>' . esc_html($search_query) . '</strong>'); ?>
                                    <?php if (!empty($current_category)) : ?>
                                        <?php printf(esc_html__(' in %s', 'kotlinskidev'), '<strong>' . esc_html(str_replace('-', ' ', $current_category)) . '</strong>'); ?>
                                    <?php endif; ?>
                                    <?php if (!empty($current_type)) : ?>
                                        <?php
                                        $type_label = ($current_type === 'post') ? esc_html__('Articles', 'kotlinskidev') : esc_html__('Pages', 'kotlinskidev');
                                        printf(esc_html__(' • %s only', 'kotlinskidev'), '<strong>' . $type_label . '</strong>'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $type_label is built exclusively from esc_html__() calls above
                                        ?>
                                    <?php endif; ?>
                                </p>
                            </div>
                            <?php if ($search_results->max_num_pages > 1) : ?>
                            <div style="font-size:0.875rem;" class="link-dark-variant-support kt-gradient-text">
                                <?php printf(esc_html__('Page %d of %d', 'kotlinskidev'), absint(max(1, get_query_var('paged', 1))), absint($search_results->max_num_pages)); ?>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>

<?php
    return ob_get_clean();
}
