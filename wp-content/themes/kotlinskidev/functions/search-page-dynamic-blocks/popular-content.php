<?php
function kotlinskidev_popular_content_has_page_views(): bool {
    global $wpdb;
    return $wpdb->get_var("SELECT COUNT(*) FROM $wpdb->postmeta WHERE meta_key = '_kotlinskidev_page_views'") > 0;
}

function kotlinskidev_popular_content_query_args(): array {
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

    if (kotlinskidev_popular_content_has_page_views()) {
        $query_args['meta_key'] = '_kotlinskidev_page_views';
        $query_args['orderby'] = 'meta_value_num';
    } else {
        $query_args['orderby'] = 'date';
    }

    return $query_args;
}

function kotlinskidev_is_noindex_flagged_post( $post_id ): bool {
    return get_post_meta($post_id, '_genesis_noindex', true) == '1' ||
        get_post_meta($post_id, '_yoast_wpseo_meta-robots-noindex', true) == '1' ||
        get_post_meta($post_id, '_aioseop_noindex', true) == 'on' ||
        get_post_meta($post_id, 'rank_math_robots', true) == 'noindex';
}

function kotlinskidev_popular_content_cards( WP_Query $popular_posts ): string {
    $max_display = 6;
    $displayed_count = 0;
    $cards = '';

    while ($popular_posts->have_posts() && $displayed_count < $max_display) {
        $popular_posts->the_post();

        if (kotlinskidev_is_noindex_flagged_post(get_the_ID())) {
            continue;
        }

        $is_page = (get_post_type() === 'page');
        $displayed_count++;

        $cards .= kotlinskidev_render_post_card(get_the_ID(), [
            'badge_label' => $is_page ? esc_html__('Page', 'kotlinskidev') : esc_html__('Article', 'kotlinskidev'),
            'button_label' => $is_page ? esc_html__('View Page', 'kotlinskidev') : esc_html__('Read Article', 'kotlinskidev'),
        ]);
    }

    return $cards;
}

function kotlinskidev_popular_content_cards_markup( WP_Query $popular_posts, bool $blur_other_cards ): string {
    if (!$popular_posts->have_posts()) {
        wp_reset_postdata();
        return '';
    }

    $cards = kotlinskidev_popular_content_cards($popular_posts);
    wp_reset_postdata();

    ob_start();
?>
            <div class="kt-post-card-grid<?php echo $blur_other_cards ? ' has-blur-siblings' : ''; ?>">
                <?php echo $cards; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_post_card() escapes every dynamic value at the point of output ?>
            </div>
        <?php
    return ob_get_clean();
}

function kotlinskidev_render_popular_content_fresh_per_language( bool $blur_other_cards = false ) {
    $popular_posts = new WP_Query(kotlinskidev_popular_content_query_args());
    $cards_markup = kotlinskidev_popular_content_cards_markup($popular_posts, $blur_other_cards);

    ob_start();
?>
    <!-- wp:group {"style":{"spacing":{"margin":{"top":"2.5rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group is-layout-constrained wp-block-group-is-layout-constrained" style="margin-top:2.5rem">

        <!-- wp:heading {"textAlign":"center","level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground","fontSize":"x-large"} -->
        <h3 class="wp-block-heading has-text-align-center has-foreground-color has-text-color has-link-color has-x-large-font-size"><?php esc_html_e('Popular Content', 'kotlinskidev'); ?></h3>
        <!-- /wp:heading -->

        <!-- wp:html -->
        <?php echo $cards_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by kotlinskidev_popular_content_cards_markup() from kotlinskidev_render_post_card() output ?>
        <!-- /wp:html -->

    </div>
    <!-- /wp:group -->
    <?php
    return do_blocks(ob_get_clean());
}
