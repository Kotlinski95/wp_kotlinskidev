<?php
function kotlinskidev_search_pagination_links( WP_Query $search_results, $current_page ): array {
    return paginate_links(array(
        'total' => $search_results->max_num_pages,
        'current' => $current_page,
        'prev_text' => '<span class="arrow">←</span><span class="text">' . esc_html__('Previous', 'kotlinskidev') . '</span>',
        'next_text' => '<span class="text">' . esc_html__('Next', 'kotlinskidev') . '</span><span class="arrow">→</span>',
        'type' => 'array',
        'show_all' => false,
        'mid_size' => 2,
        'end_size' => 1,
    )) ?: [];
}

function kotlinskidev_mark_first_search_page_link_current( string $link, $current_page ): string {
    $is_plain_number_link = strpos($link, 'page-numbers') !== false && !strpos($link, 'prev') && !strpos($link, 'next') && !strpos($link, 'dots');
    if (!($current_page == 1 && $is_plain_number_link)) {
        return $link;
    }

    if (preg_match('/>\s*1\s*</', $link) && !strpos($link, 'current')) {
        $link = str_replace('page-numbers', 'page-numbers current', $link);
        $link = preg_replace('/<a([^>]*)>/', '<span$1>', $link);
        $link = str_replace('</a>', '</span>', $link);
    }

    return $link;
}

function kotlinskidev_add_button_classes_to_search_page_arrow( string $link ): string {
    if (preg_match('/class="([^"]*\b(?:prev|next)\b[^"]*)"/', $link, $prev_next_classes)) {
        return str_replace('class="' . $prev_next_classes[1] . '"', 'class="' . $prev_next_classes[1] . ' has-background has-text-color"', $link);
    }

    return $link;
}

function kotlinskidev_style_search_pagination_link( string $link, $current_page ): string {
    return kotlinskidev_add_button_classes_to_search_page_arrow(kotlinskidev_mark_first_search_page_link_current($link, $current_page));
}

function kotlinskidev_search_results_pagination_markup( WP_Query $search_results ): string {
    ob_start();
?>
                    <?php if ($search_results->max_num_pages > 1) : ?>
                    <div class="search-results-pagination" style="display:flex;justify-content:center;margin-top:3.125rem;">
                        <?php
                        $current_page = max(1, get_query_var('paged', 1));
                        foreach (kotlinskidev_search_pagination_links($search_results, $current_page) as $link) {
                            echo kotlinskidev_style_search_pagination_link($link, $current_page); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $link comes from WP core's paginate_links() array output, only modified via fixed str_replace/preg_replace patterns, no user input involved
                        }
                        ?>
                    </div>
                    <?php endif; ?>

<?php
    return ob_get_clean();
}
