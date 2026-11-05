<?php
function kotlinskidev_redirect_search_page_query() {
    if ( ! is_page( [ 'search', 'szukaj' ] ) ) {
        return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
    if ( ! isset( $_GET['s'] ) || '' === $_GET['s'] ) {
        return;
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
    $search_params = [ 's' => sanitize_text_field( wp_unslash( $_GET['s'] ) ) ];

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
    if ( ! empty( $_GET['search_category'] ) ) {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
        $search_params['search_category'] = sanitize_text_field( wp_unslash( $_GET['search_category'] ) );
    }

    // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
    if ( ! empty( $_GET['search_type'] ) ) {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only search redirect, no state change
        $search_params['search_type'] = sanitize_text_field( wp_unslash( $_GET['search_type'] ) );
    }

    wp_safe_redirect( home_url( '/?' . http_build_query( $search_params ) ) );
    exit;
}
add_action( 'template_redirect', 'kotlinskidev_redirect_search_page_query' );

function kotlinskidev_render_popular_content_fresh_per_language( bool $blur_other_cards = false ) {
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

        <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground","fontSize":"x-large"} -->
        <h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Popular Content', 'kotlinskidev'); ?></h3>
        <!-- /wp:heading -->

        <!-- wp:html -->
        <?php if ($popular_posts->have_posts()) :
            $displayed_count = 0;
            $max_display = 6;
        ?>
            <div class="kt-post-card-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>">
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

                    $is_page = (get_post_type() === 'page');
                    $displayed_count++;

                    echo kotlinskidev_render_post_card(get_the_ID(), [
                        'badge_label' => $is_page ? esc_html__('Page', 'kotlinskidev') : esc_html__('Article', 'kotlinskidev'),
                        'button_label' => $is_page ? esc_html__('View Page', 'kotlinskidev') : esc_html__('Read Article', 'kotlinskidev'),
                    ]); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_post_card() escapes every dynamic value at the point of output
                endwhile; ?>
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

function kotlinskidev_render_recently_viewed_shell( bool $blur_other_cards = false ) {
    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"top":"2.5rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained" id="kt-recently-viewed" style="margin-top:2.5rem" hidden>

        <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground","fontSize":"x-large"} -->
        <h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Recently Viewed', 'kotlinskidev'); ?></h3>
        <!-- /wp:heading -->

        <!-- wp:html -->
        <div class="kt-post-card-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>"></div>
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

function kotlinskidev_render_search_form_fresh_per_language($wrapper_background_color = '', $input_border_color = '', $label_color = '') {
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

    $wrapper_style_override = '' !== $wrapper_background_color ? 'background-color:' . esc_attr($wrapper_background_color) . ';' : '';
    $field_style_override = '' !== $input_border_color ? ' style="border-color:' . esc_attr($input_border_color) . '"' : '';
    $label_style_override = '' !== $label_color ? ' style="color:' . esc_attr($label_color) . '"' : '';

    ob_start();
    ?>
    <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"0.9375rem"},"padding":{"top":"0.9375rem","bottom":"0.9375rem","left":"1.25rem","right":"1.25rem"}},"border":{"radius":"1.25rem","width":"0rem"}},"borderColor":"border-color","backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"50rem"}} -->
    <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0rem;border-radius:1.25rem;margin-bottom:0.9375rem;padding-top:0.9375rem;padding-right:1.25rem;padding-bottom:0.9375rem;padding-left:1.25rem;<?php echo esc_attr($wrapper_style_override); ?>">

        <!-- wp:html -->
        <form method="get" action="<?php echo esc_url($search_action_url); ?>" class="kotlinskidev-search-form">

            <div style="margin-bottom:1.25rem;">
                <label for="search-input" class="search-label"<?php echo $label_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
                    🔍 <?php esc_html_e('Search for content', 'kotlinskidev'); ?>
                </label>
                <input type="text"
                       id="search-input"
                       name="s"
                       value="<?php echo esc_attr($current_search); ?>"
                       placeholder="<?php esc_attr_e('Enter keywords, topics, or specific terms...', 'kotlinskidev'); ?>"
                       class="search-input-field"
                       required
                       aria-describedby="search-input-description"<?php echo $field_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?> />
                <div id="search-input-description" class="sr-only">
                    <?php esc_html_e('Search across all articles, pages, and content on the site', 'kotlinskidev'); ?>
                </div>
            </div>

            <div class="search-filters-grid">

                <div>
                    <label for="search-type" class="search-label"<?php echo $label_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
                        📄 <?php esc_html_e('Content Type', 'kotlinskidev'); ?>
                    </label>
                    <select name="search_type"
                            id="search-type"
                            class="search-select-field"
                            aria-describedby="search-type-description"<?php echo $field_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
                        <option value=""><?php esc_html_e('All Content', 'kotlinskidev'); ?></option>
                        <option value="post" <?php selected($current_type, 'post'); ?>><?php esc_html_e('Articles', 'kotlinskidev'); ?></option>
                        <option value="page" <?php selected($current_type, 'page'); ?>><?php esc_html_e('Pages', 'kotlinskidev'); ?></option>
                    </select>
                    <div id="search-type-description" class="sr-only">
                        <?php esc_html_e('Filter results by content type: articles, pages, or all content', 'kotlinskidev'); ?>
                    </div>
                </div>

                <div>
                    <label for="search-category" class="search-label"<?php echo $label_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
                        📂 <?php esc_html_e('Topic Category', 'kotlinskidev'); ?>
                    </label>
                    <select name="search_category"
                            id="search-category"
                            class="search-select-field"
                            aria-describedby="search-category-description"<?php echo $field_style_override; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above via esc_attr() on the attribute's own color value ?>>
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

function kotlinskidev_build_search_results_style_vars( array $attributes = [] ): string {
    $vars = [];

    $color_attribute_map = [
        'cardTextColor'              => '--kt-search-results-grid-card-text-color',
        'cardBorderColor'            => '--kt-search-results-grid-card-border-color',
        'cardBackgroundColor'        => '--kt-search-results-grid-card-bg',
        'buttonBackgroundColor'      => '--kt-search-results-grid-button-bg',
        'buttonTextColor'            => '--kt-search-results-grid-button-text-color',
        'buttonHoverBackgroundColor' => '--kt-search-results-grid-button-hover-bg',
        'buttonHoverTextColor'       => '--kt-search-results-grid-button-hover-text-color',
        'cardHoverBackgroundColor'   => '--kt-search-results-grid-card-hover-bg',
    ];

    foreach ( $color_attribute_map as $attribute_key => $css_var ) {
        $color_value = trim( (string) ( $attributes[ $attribute_key ] ?? '' ) );
        if ( '' !== $color_value ) {
            $vars[ $css_var ] = $color_value;
        }
    }

    if ( ! empty( $attributes['blurOtherCards'] ) ) {
        $blur_amount = trim( (string) ( $attributes['blurAmount'] ?? '' ) );
        if ( '' !== $blur_amount ) {
            $vars['--kt-blur-amount'] = $blur_amount;
        }
    }

    if ( empty( $vars ) ) {
        return '';
    }

    $declarations = [];
    foreach ( $vars as $property => $value ) {
        $declarations[] = $property . ':' . $value;
    }

    return implode( ';', $declarations ) . ';';
}

function kotlinskidev_render_search_results_fresh_per_language( bool $blur_other_cards = false, string $card_hover_background_color = '', string $blur_amount = '' ) {
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
                                <h3 style="margin:0;color:var(--wp--preset--color--foreground);font-size:1.25rem;">
                                    <?php printf(esc_html__('Found %d results', 'kotlinskidev'), absint($search_results->found_posts)); ?>
                                </h3>
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

                    <div class="kt-search-results-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>">
                        <?php while ($search_results->have_posts()) : $search_results->the_post();
                            $post_type = get_post_type();
                            $is_page = ($post_type === 'page');
                            $categories = get_the_category();
                            $search_excerpt = kotlinskidev_get_search_excerpt(get_the_content(), $search_query, 20);
                        ?>

                        <div class="kt-search-results-grid__card">

                            <a href="<?php the_permalink(); ?>" class="kt-search-results-grid__image-link">
                                <?php if (has_post_thumbnail()) : ?>
                                <img src="<?php the_post_thumbnail_url('medium'); ?>"
                                     alt="<?php the_title(); ?>"
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

                                if (preg_match('/class="([^"]*\b(?:prev|next)\b[^"]*)"/', $link, $prev_next_classes)) {
                                    $link = str_replace('class="' . $prev_next_classes[1] . '"', 'class="' . $prev_next_classes[1] . ' has-background has-text-color"', $link);
                                }

                                echo $link; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $link comes from WP core's paginate_links() array output, only modified via fixed str_replace/preg_replace patterns, no user input involved
                            }
                        }
                        ?>
                    </div>
                    <?php endif; ?>

                    <div style="background:var(--wp--preset--color--light-shade);padding:0.9375rem;border-radius:1rem;text-align:center;margin-top:1.25rem;border:0.125rem solid var(--wp--preset--color--border-color);">
                        <div class="kt-search-empty-icon" style="margin-bottom:0.625rem;">
                            <?php
                            $icon_path = get_template_directory() . '/assets/icons/search.svg';
                            if ( file_exists( $icon_path ) ) {
                                echo file_get_contents( $icon_path ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static theme-bundled icon asset under version control, not user-uploaded content
                            }
                            ?>
                        </div>
                        <h3 style="color:var(--wp--preset--color--foreground);margin-bottom:0.5rem;font-size:1.5rem;">
                            <?php esc_html_e('Looking for something else?', 'kotlinskidev'); ?>
                        </h3>
                        <p style="color:var(--wp--preset--color--foreground);margin-bottom:0.625rem;font-size:1rem;line-height:1.5;">
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
        endif;
        wp_reset_postdata();
    }

    if (empty($search_query)) {
        $popular_content_attrs = [];
        if ( $blur_other_cards ) {
            $popular_content_attrs['blurOtherCards'] = true;
            if ( '' !== $blur_amount ) {
                $popular_content_attrs['blurAmount'] = $blur_amount;
            }
        }
        if ( '' !== $card_hover_background_color ) {
            $popular_content_attrs['cardHoverBackgroundColor'] = $card_hover_background_color;
        }

        $popular_content_attrs_json = ! empty( $popular_content_attrs ) ? wp_json_encode( $popular_content_attrs ) : '';
        echo '<!-- wp:kotlinskidev/popular-content-dynamic' . ( '' !== $popular_content_attrs_json ? ' ' . $popular_content_attrs_json : '' ) . ' /-->';
    }

    return do_blocks(ob_get_clean());
}
