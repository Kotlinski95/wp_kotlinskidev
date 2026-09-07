<?php
function kotlinskidev_render_popular_content_fresh_per_language() {
    $query_args = array(
        'post_type' => array('post', 'page'),
        'post_status' => 'publish',
        'posts_per_page' => 12,
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
        'meta_query' => array(
            'relation' => 'OR',
            array(
                'key' => '_wp_page_visibility',
                'compare' => 'NOT EXISTS'
            ),
            array(
                'key' => '_wp_page_visibility',
                'value' => 'private',
                'compare' => '!='
            )
        )
    );

    global $wpdb;
    $has_views = $wpdb->get_var("SELECT COUNT(*) FROM $wpdb->postmeta WHERE meta_key = '_kotlinskidev_page_views'");

    if ($has_views > 0) {
        $query_args['meta_key'] = '_kotlinskidev_page_views';
        $query_args['orderby'] = 'meta_value_num';
    } else {
        $query_args['orderby'] = 'date';
    }

    $popular_posts = new WP_Query($query_args);

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"top":"2.5rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained" style="margin-top:2.5rem">

        <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
        <h3 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Popular Content', 'kotlinskidev'); ?></h3>
        <!-- /wp:heading -->

        <!-- wp:html -->
        <?php if ($popular_posts->have_posts()) :
            $displayed_count = 0;
            $max_display = 6;
        ?>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr)); gap: 0.9375rem; margin-top: 1.25rem; margin-bottom: 1.25rem;">
                <?php while ($popular_posts->have_posts() && $displayed_count < $max_display) :
                    $popular_posts->the_post();

                    $should_index = true;

                    if (
                        get_post_meta(get_the_ID(), '_genesis_noindex', true) == '1' ||
                        get_post_meta(get_the_ID(), '_yoast_wpseo_meta-robots-noindex', true) == '1' ||
                        get_post_meta(get_the_ID(), '_aioseop_noindex', true) == 'on' ||
                        get_post_meta(get_the_ID(), 'rank_math_robots', true) == 'noindex'
                    ) {
                        $should_index = false;
                    }

                    if (!$should_index) continue;

                    $post_type = get_post_type();
                    $is_page = ($post_type === 'page');
                    $displayed_count++;
                ?>
                    <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0.125rem;border-radius:1.125rem;padding:0.9375rem;display:flex;flex-direction:column;height:100%;">

                        <?php if (has_post_thumbnail()) : ?>
                            <div style="margin-bottom:0.9375rem;flex-shrink:0;">
                                <a href="<?php the_permalink(); ?>">
                                    <img src="<?php the_post_thumbnail_url('medium'); ?>"
                                        alt="<?php the_title(); ?>"
                                        style="width:100%;height:9.375rem;object-fit:contain;border-radius:0.75rem;" />
                                </a>
                            </div>
                        <?php endif; ?>

                        <div style="margin-bottom:0.9375rem;flex-shrink:0;">
                            <span class="kt-gradient-pill" style="padding:0.25rem 0.75rem;border-radius:0.9375rem;font-size:0.75rem;font-weight:600;">
                                <?php echo $is_page ? '📄 ' . esc_html__('Page', 'kotlinskidev') : '📝 ' . esc_html__('Article', 'kotlinskidev'); ?>
                            </span>
                        </div>

                        <h4 style="margin-bottom:0.9375rem;font-size:1.125rem;font-weight:600;flex-shrink:0;">
                            <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                                <?php the_title(); ?>
                            </a>
                        </h4>

                        <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:1.25rem;flex-grow:1;font-size:0.875rem;">
                            <?php echo esc_html(wp_trim_words(get_the_excerpt(), 20, '...')); ?>
                        </div>

                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;flex-shrink:0;font-size:0.75rem;">
                            <span style="color:var(--wp--preset--color--foreground-alt);">
                                <?php echo $is_page ? esc_html__('Updated', 'kotlinskidev') . ' ' . get_the_modified_date() : get_the_date(); ?>
                            </span>
                            <a href="<?php the_permalink(); ?>" class="search-link">
                                <?php echo $is_page ? esc_html__('View', 'kotlinskidev') : esc_html__('Read', 'kotlinskidev'); ?>
                            </a>
                        </div>

                    </div>
                <?php endwhile; ?>
            </div>
        <?php
        endif;
        wp_reset_postdata();
        ?>
        <!-- /wp:html -->

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_render_search_header_fresh_per_language() {
    $search_query = get_search_query();

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"1.25rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="margin-bottom:1.25rem">

        <!-- wp:html -->
        <div style="text-align:center;">
            <?php if (!empty($search_query)) : ?>
                <h1 style="color:var(--wp--preset--color--foreground-alt);font-weight:800;font-size:2.5rem;margin-bottom:0.625rem;">
                    <?php esc_html_e('Search Results', 'kotlinskidev'); ?>
                </h1>
            <?php else : ?>
                <h1 style="color:var(--wp--preset--color--foreground-alt);font-weight:800;font-size:2.5rem;margin-bottom:0.625rem;">
                    <?php esc_html_e('Search Our Content', 'kotlinskidev'); ?>
                </h1>

                <p style="color:var(--wp--preset--color--foreground-alt);font-size:1.125rem;margin-bottom:0.9375rem;">
                    <?php esc_html_e('Find articles, pages, and resources across our entire site', 'kotlinskidev'); ?>
                </p>
            <?php endif; ?>
        </div>
        <!-- /wp:html -->
    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_search_action_url_for_current_language() {
    $current_url = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '';
    $parsed_url = parse_url($current_url);
    $full_path = isset($parsed_url['path']) ? trim($parsed_url['path'], '/') : '';

    $site_url = get_option('home') ?: site_url();
    $site_path = trim(parse_url($site_url, PHP_URL_PATH) ?? '', '/');

    $relative_path = $full_path;
    if ($site_path && strpos($full_path, $site_path) === 0) {
        $relative_path = trim(substr($full_path, strlen($site_path)), '/');
    } else {
        $path_parts = explode('/', $full_path);
        if (count($path_parts) >= 2 && $path_parts[0] === 'adriankotlinski') {
            $relative_path = implode('/', array_slice($path_parts, 1));
        }
    }

    if (preg_match('/^([a-z]{2})(?:\/|$)/', $relative_path, $matches)) {
        return home_url('/' . $matches[1] . '/');
    }

    if (preg_match('/^([a-z]{2}[_-][a-z]{2})(?:\/|$)/i', $relative_path, $matches)) {
        return home_url('/' . $matches[1] . '/');
    }

    return home_url('/');
}

function kotlinskidev_render_search_form_fresh_per_language() {
    $current_search = get_search_query();
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search filter selection, no state change
    $current_category = isset($_GET['search_category']) ? sanitize_text_field(wp_unslash($_GET['search_category'])) : '';
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search filter selection, no state change
    $current_type = isset($_GET['search_type']) ? sanitize_text_field(wp_unslash($_GET['search_type'])) : '';
    $search_action_url = kotlinskidev_search_action_url_for_current_language();

    $categories = get_categories(array(
        'hide_empty' => true,
        'orderby' => 'count',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    ));

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"0.9375rem"},"padding":{"top":"0.9375rem","bottom":"0.9375rem","left":"1.25rem","right":"1.25rem"}},"border":{"radius":"1.25rem","width":"0rem"}},"borderColor":"border-color","backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"50rem"}} -->
    <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0rem;border-radius:1.25rem;margin-bottom:0.9375rem;padding-top:0.9375rem;padding-right:1.25rem;padding-bottom:0.9375rem;padding-left:1.25rem">

        <!-- wp:html -->
        <form method="get" action="<?php echo esc_url($search_action_url); ?>" class="kotlinskidev-search-form">

            <div style="margin-bottom:1.25rem;">
                <label for="search-input" class="search-label">
                    🔍 <?php esc_html_e('Search for content', 'kotlinskidev'); ?>
                </label>
                <input type="text"
                       id="search-input"
                       name="s"
                       value="<?php echo esc_attr($current_search); ?>"
                       placeholder="<?php esc_attr_e('Enter keywords, topics, or specific terms...', 'kotlinskidev'); ?>"
                       class="search-input-field"
                       required
                       aria-describedby="search-input-description" />
                <div id="search-input-description" class="sr-only">
                    <?php esc_html_e('Search across all articles, pages, and content on the site', 'kotlinskidev'); ?>
                </div>
            </div>

            <div class="search-filters-grid">

                <div>
                    <label for="search-type" class="search-label">
                        📄 <?php esc_html_e('Content Type', 'kotlinskidev'); ?>
                    </label>
                    <select name="search_type"
                            id="search-type"
                            class="search-select-field"
                            aria-describedby="search-type-description">
                        <option value=""><?php esc_html_e('All Content', 'kotlinskidev'); ?></option>
                        <option value="post" <?php selected($current_type, 'post'); ?>><?php esc_html_e('Articles', 'kotlinskidev'); ?></option>
                        <option value="page" <?php selected($current_type, 'page'); ?>><?php esc_html_e('Pages', 'kotlinskidev'); ?></option>
                    </select>
                    <div id="search-type-description" class="sr-only">
                        <?php esc_html_e('Filter results by content type: articles, pages, or all content', 'kotlinskidev'); ?>
                    </div>
                </div>

                <div>
                    <label for="search-category" class="search-label">
                        📂 <?php esc_html_e('Topic Category', 'kotlinskidev'); ?>
                    </label>
                    <select name="search_category"
                            id="search-category"
                            class="search-select-field"
                            aria-describedby="search-category-description">
                        <option value=""><?php esc_html_e('All Topics', 'kotlinskidev'); ?></option>
                        <?php
                        foreach ($categories as $category) {
                            echo '<option value="' . esc_attr($category->slug) . '"' . selected($current_category, $category->slug, false) . '>';
                            echo esc_html($category->name) . ' (' . absint($category->count) . ')';
                            echo '</option>';
                        }
                        ?>
                    </select>
                    <div id="search-category-description" class="sr-only">
                        <?php esc_html_e('Filter results by topic category', 'kotlinskidev'); ?>
                    </div>
                </div>
            </div>

            <div style="text-align:center;margin-bottom:1.25rem;">
                <button type="submit" class="search-button" aria-describedby="search-button-description">
                    <span>🔍</span>
                    <span><?php esc_html_e('Search Content', 'kotlinskidev'); ?></span>
                </button>
                <div id="search-button-description" class="sr-only">
                    <?php esc_html_e('Search for content using the criteria above', 'kotlinskidev'); ?>
                </div>
            </div>

            <?php if (!empty($current_search)) : ?>
            <div style="text-align:center;">
                <?php
                $search_slug = __('search', 'kotlinskidev');
                $clear_url = home_url('/' . $search_slug . '/');
                ?>
                <a href="<?php echo esc_url($clear_url); ?>"
                   class="clear-search-link link-dark-variant-support"
                   aria-label="<?php esc_attr_e('Clear search and return to homepage', 'kotlinskidev'); ?>">
                    ✕ <?php esc_html_e('Clear search and filters', 'kotlinskidev'); ?>
                </a>
            </div>
            <?php endif; ?>

        </form>

        <script>
        document.addEventListener('DOMContentLoaded', function() {
            const searchForm = document.querySelector('.kotlinskidev-search-form');
            if (searchForm) {
                searchForm.addEventListener('submit', function(e) {
                    const inputs = searchForm.querySelectorAll('input, select');
                    inputs.forEach(function(input) {
                        if (input.name && (input.value === '' || input.value === null)) {
                            input.removeAttribute('name');
                        }
                    });
                });
            }
        });
        </script>
        <!-- /wp:html -->
    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}

function kotlinskidev_render_search_results_fresh_per_language() {
    $search_query = get_search_query();
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search filter selection, no state change
    $current_category = isset($_GET['search_category']) ? sanitize_text_field(wp_unslash($_GET['search_category'])) : '';
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search filter selection, no state change
    $current_type = isset($_GET['search_type']) ? sanitize_text_field(wp_unslash($_GET['search_type'])) : '';

    ob_start();

    if (!empty($search_query)) {
        $paged = max(1, get_query_var('paged', 1));

        $search_args = array(
            's' => $search_query,
            'post_status' => 'publish',
            'posts_per_page' => 10,
            'paged' => $paged,
            'orderby' => 'relevance',
            'order' => 'DESC',
            'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
        );
        $search_args = kotlinskidev_apply_seo_noindex_exclusion($search_args);

        if (!empty($current_type)) {
            $search_args['post_type'] = $current_type;
        } else {
            $search_args['post_type'] = array('post', 'page');
        }

        if (!empty($current_category)) {
            $search_args['category_name'] = $current_category;
        }

        $search_results = new WP_Query($search_args);

        if ($search_results->have_posts()) :
            ?>
            <!-- wp:group {"layout":{"type":"constrained"}} -->
            <div class="wp-block-group">

                <!-- wp:html -->
                <div style="margin-bottom:0.9375rem;">
                    <div style="background:var(--wp--preset--color--light-shade);padding:0.9375rem;border-radius:0.75rem;border:0.125rem solid var(--wp--preset--color--border-color);margin-bottom:1.25rem;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.9375rem;">
                            <div>
                                <h3 style="margin:0;color:var(--wp--preset--color--foreground-alt);font-size:1.25rem;">
                                    <?php printf(esc_html__('Found %d results', 'kotlinskidev'), absint($search_results->found_posts)); ?>
                                </h3>
                                <p style="margin:0.3125rem 0 0 0;color:var(--wp--preset--color--foreground-alt);font-size:0.875rem;">
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

                    <div class="search-result-grid" style="display:grid;gap:0.9375rem;">
                        <?php while ($search_results->have_posts()) : $search_results->the_post();
                            $post_type = get_post_type();
                            $is_page = ($post_type === 'page');
                            $categories = get_the_category();
                            $search_excerpt = kotlinskidev_get_search_excerpt(get_the_content(), $search_query, 40);
                        ?>

                        <div class="wp-block-group has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:0.125rem;border-radius:1.125rem;padding:0.9375rem;display:flex;flex-wrap:wrap;justify-content:start;align-items:center;gap:0.9375rem;">

                            <?php if (has_post_thumbnail()) : ?>
                            <div style="flex-shrink:0;display:flex;justify-content:center;align-items:center;">
                                <a href="<?php the_permalink(); ?>">
                                    <img src="<?php the_post_thumbnail_url('medium'); ?>"
                                         alt="<?php the_title(); ?>"
                                         style="width:12.5rem;height:12.5rem;object-fit:contain;border-radius:0.75rem;" />
                                </a>
                            </div>
                            <?php endif; ?>

                            <div style="flex-grow:1;">

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

                                <h3 style="margin-bottom:0.625rem;font-size:1.5rem;font-weight:600;">
                                    <a href="<?php the_permalink(); ?>" style="color:var(--wp--preset--color--foreground-alt);text-decoration:none;">
                                        <?php echo kotlinskidev_highlight_search_terms(get_the_title(), $search_query); ?>
                                    </a>
                                </h3>

                                <div style="color:var(--wp--preset--color--foreground-alt);margin-bottom:0.9375rem;line-height:1.6;">
                                    <?php echo $search_excerpt; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_get_search_excerpt() returns output already escaped via kotlinskidev_highlight_search_terms() ?>
                                </div>

                                <?php if (!$is_page) :
                                    $tags = get_the_tags();
                                    if ($tags) : ?>
                                    <div style="margin-bottom:0.9375rem;">
                                        <?php foreach (array_slice($tags, 0, 3) as $tag) : ?>
                                            <span class="kt-gradient-pill" style="padding:0.25rem 0.5rem;border-radius:0.5rem;font-size:0.75rem;margin-right:0.5rem;">
                                                #<?php echo esc_html($tag->name); ?>
                                            </span>
                                        <?php endforeach; ?>
                                    </div>
                                <?php endif; endif; ?>

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

                    <?php if ($search_results->max_num_pages > 1) : ?>
                    <div class="search-results-pagination" style="display:flex;justify-content:center;margin-top:3.125rem;">
                        <?php
                        $current_page = max(1, get_query_var('paged', 1));
                        $pagination_links = paginate_links(array(
                            'total' => $search_results->max_num_pages,
                            'current' => $current_page,
                            'prev_text' => '<span class="arrow">←</span><span class="text">' . esc_html__('Previous', 'kotlinskidev') . '</span>',
                            'next_text' => '<span class="text">' . esc_html__('Next', 'kotlinskidev') . '</span><span class="arrow">→</span>',
                            'type' => 'array',
                            'show_all' => false,
                            'mid_size' => 2,
                            'end_size' => 1,
                        ));

                        if ($pagination_links) {
                            foreach ($pagination_links as $link) {
                                if ($current_page == 1 && strpos($link, 'page-numbers') !== false && !strpos($link, 'prev') && !strpos($link, 'next') && !strpos($link, 'dots')) {
                                    if (preg_match('/>\s*1\s*</', $link) && !strpos($link, 'current')) {
                                        $link = str_replace('page-numbers', 'page-numbers current', $link);
                                        $link = preg_replace('/<a([^>]*)>/', '<span$1>', $link);
                                        $link = str_replace('</a>', '</span>', $link);
                                    }
                                }
                                echo $link; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $link comes from WP core's paginate_links() array output, only modified via fixed str_replace/preg_replace patterns, no user input involved
                            }
                        }
                        ?>
                    </div>
                    <?php endif; ?>

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
            <?php
        else :
            ?>
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
    }

    if (empty($search_query)) {
        echo '<!-- wp:kotlinskidev/popular-content-dynamic /-->';
    }

    return do_blocks(ob_get_clean());
}

function kotlinskidev_register_search_page_dynamic_blocks() {
    register_block_type('kotlinskidev/popular-content-dynamic', array(
        'render_callback' => 'kotlinskidev_render_popular_content_fresh_per_language',
    ));
    register_block_type('kotlinskidev/search-header-dynamic', array(
        'render_callback' => 'kotlinskidev_render_search_header_fresh_per_language',
    ));
    register_block_type('kotlinskidev/search-form-dynamic', array(
        'render_callback' => 'kotlinskidev_render_search_form_fresh_per_language',
    ));
    register_block_type('kotlinskidev/search-results-dynamic', array(
        'render_callback' => 'kotlinskidev_render_search_results_fresh_per_language',
    ));
}
add_action('init', 'kotlinskidev_register_search_page_dynamic_blocks');
