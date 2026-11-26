<?php
function kotlinskidev_search_results_footer_icon_markup(): string {
    $icon_path = get_template_directory() . '/assets/icons/search.svg';
    return file_exists( $icon_path ) ? file_get_contents( $icon_path ) : '';
}

function kotlinskidev_search_results_footer_markup(): string {
    $icon_markup = kotlinskidev_search_results_footer_icon_markup();

    ob_start();
?>
                    <div style="background:var(--wp--preset--color--light-shade);padding:0.9375rem;border-radius:1rem;text-align:center;margin-top:1.25rem;border:0.125rem solid var(--wp--preset--color--border-color);">
                        <div class="kt-search-empty-icon" style="margin-bottom:0.625rem;">
                            <?php echo $icon_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static theme-bundled icon asset under version control, not user-uploaded content ?>
                        </div>
                        <h3 style="color:var(--wp--preset--color--foreground);margin-bottom:0.5rem;font-size:1.5rem;">
                            <?php esc_html_e('Looking for something else?', 'kotlinskidev'); ?>
                        </h3>
                        <p style="color:var(--wp--preset--color--foreground);margin-bottom:0.625rem;font-size:1rem;line-height:1.5;">
                            <?php esc_html_e('Try searching for a different term or explore more content using the search form below.', 'kotlinskidev'); ?>
                        </p>
                    </div>

<?php
    return ob_get_clean();
}

function kotlinskidev_search_results_found_markup( WP_Query $search_results, array $request, bool $blur_other_cards ): string {
    $summary_markup = kotlinskidev_search_results_summary_markup($search_results, $request);
    $grid_markup = kotlinskidev_search_results_grid_markup($search_results, $request['query'], $blur_other_cards);
    $pagination_markup = kotlinskidev_search_results_pagination_markup($search_results);
    $footer_markup = kotlinskidev_search_results_footer_markup();

    ob_start();
?>
            <!-- wp:group {"layout":{"type":"constrained"}} -->
            <div class="wp-block-group">

                <!-- wp:html -->
                <div style="margin-bottom:0.9375rem;">
<?php echo $summary_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by kotlinskidev_search_results_summary_markup(), which escapes every dynamic value at the point of output ?>
<?php echo $grid_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by kotlinskidev_search_results_grid_markup(), which escapes every dynamic value at the point of output ?>
<?php echo $pagination_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by kotlinskidev_search_results_pagination_markup() from WP core's paginate_links() output ?>
<?php echo $footer_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by kotlinskidev_search_results_footer_markup() from escaped strings and a static theme icon ?>
                </div>
                <!-- /wp:html -->

            </div>
            <!-- /wp:group -->
            <?php
    return ob_get_clean();
}
