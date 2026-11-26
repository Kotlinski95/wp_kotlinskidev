<?php
function kotlinskidev_search_result_card_markup( string $search_query ): string {
    $post_type = get_post_type();
    $is_page = ($post_type === 'page');
    $categories = get_the_category();
    $search_excerpt = kotlinskidev_get_search_excerpt(get_the_content(), $search_query, 20);

    ob_start();
?>

                        <div class="kt-search-results-grid__card">

                            <a href="<?php the_permalink(); ?>" class="kt-search-results-grid__image-link" aria-hidden="true" tabindex="-1">
                                <?php if (has_post_thumbnail()) : ?>
                                <img src="<?php the_post_thumbnail_url('medium'); ?>"
                                     alt=""
                                     class="kt-search-results-grid__image" />
                                <?php else : ?>
                                <span class="kt-search-results-grid__image-placeholder" aria-hidden="true">
                                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 6h16l8 8v28a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                                        <path d="M29 6v8h8" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                                        <path d="M17 26h14M17 32h14M17 20h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                    </svg>
                                </span>
                                <?php endif; ?>
                            </a>

                            <div class="kt-search-results-grid__body">

                                <div class="kt-search-results-grid__meta-row">
                                    <span class="kt-search-results-grid__badge">
                                        <?php echo $is_page ? '📄 ' . esc_html__('Page', 'kotlinskidev') : '📝 ' . esc_html__('Article', 'kotlinskidev'); ?>
                                    </span>

                                    <?php if (!$is_page) : ?>
                                        <span class="kt-search-results-grid__date">
                                            <?php echo get_the_date(); ?>
                                        </span>

                                        <?php if (!empty($categories)) : ?>
                                            <span class="link-dark-variant-support kt-gradient-text">
                                                📂 <?php echo esc_html($categories[0]->name); ?>
                                            </span>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                </div>

                                <h3 class="kt-search-results-grid__title">
                                    <a href="<?php the_permalink(); ?>" class="kt-search-results-grid__title-link">
                                        <?php echo kotlinskidev_highlight_search_terms(get_the_title(), $search_query); ?>
                                    </a>
                                </h3>

                                <div class="kt-search-results-grid__excerpt kt-line-clamp">
                                    <?php echo $search_excerpt; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_get_search_excerpt() returns output already escaped via kotlinskidev_highlight_search_terms() ?>
                                </div>

                                <?php if (!$is_page) :
                                    $tags = get_the_tags();
                                    if ($tags) : ?>
                                    <div class="kt-search-results-grid__tags">
                                        <?php foreach (array_slice($tags, 0, 3) as $tag) : ?>
                                            <span class="kt-search-results-grid__tag">
                                                #<?php echo esc_html($tag->name); ?>
                                            </span>
                                        <?php endforeach; ?>
                                    </div>
                                <?php endif; endif; ?>

                                <a href="<?php the_permalink(); ?>"
                                   class="wp-element-button has-background has-text-color kt-search-results-grid__button">
                                    <?php echo $is_page ? esc_html__('View Page', 'kotlinskidev') : esc_html__('Read Article', 'kotlinskidev'); ?> →
                                </a>

                            </div>
                        </div>

                        <?php
    return ob_get_clean();
}

function kotlinskidev_search_results_cards( WP_Query $search_results, string $search_query ): string {
    $cards = '';

    while ($search_results->have_posts()) {
        $search_results->the_post();
        $cards .= kotlinskidev_search_result_card_markup($search_query);
    }

    return $cards;
}

function kotlinskidev_search_results_grid_markup( WP_Query $search_results, string $search_query, bool $blur_other_cards ): string {
    $cards = kotlinskidev_search_results_cards($search_results, $search_query);

    ob_start();
?>
                    <div class="kt-search-results-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>">
                        <?php echo $cards; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_search_result_card_markup() escapes every dynamic value at the point of output ?>
                    </div>

<?php
    return ob_get_clean();
}
