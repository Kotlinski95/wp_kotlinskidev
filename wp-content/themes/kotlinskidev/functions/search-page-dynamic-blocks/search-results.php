<?php
function kotlinskidev_search_results_query_args( array $request ): array {
    $paged = max(1, get_query_var('paged', 1));

    $search_args = array(
        's' => $request['query'],
        'post_status' => 'publish',
        'posts_per_page' => 10,
        'paged' => $paged,
        'orderby' => 'relevance',
        'order' => 'DESC',
        'lang' => function_exists('pll_current_language') ? pll_current_language() : '',
    );
    $search_args = kotlinskidev_apply_seo_noindex_exclusion($search_args);

    $search_args['post_type'] = !empty($request['type']) ? $request['type'] : array('post', 'page');

    if (!empty($request['category'])) {
        $search_args['category_name'] = $request['category'];
    }

    return $search_args;
}

function kotlinskidev_search_results_for_query_markup( array $request, bool $blur_other_cards ): string {
    $search_results = new WP_Query(kotlinskidev_search_results_query_args($request));

    $markup = $search_results->have_posts()
        ? kotlinskidev_search_results_found_markup($search_results, $request, $blur_other_cards)
        : kotlinskidev_search_results_empty_markup($request);

    wp_reset_postdata();

    return $markup;
}

function kotlinskidev_search_results_popular_content_attributes( bool $blur_other_cards, string $card_hover_background_color, string $blur_amount ): array {
    $attributes = [];

    if ( $blur_other_cards ) {
        $attributes['blurOtherCards'] = true;
        if ( '' !== $blur_amount ) {
            $attributes['blurAmount'] = $blur_amount;
        }
    }
    if ( '' !== $card_hover_background_color ) {
        $attributes['cardHoverBackgroundColor'] = $card_hover_background_color;
    }

    return $attributes;
}

function kotlinskidev_search_results_popular_content_fallback( bool $blur_other_cards, string $card_hover_background_color, string $blur_amount ): string {
    $attributes = kotlinskidev_search_results_popular_content_attributes($blur_other_cards, $card_hover_background_color, $blur_amount);
    $attributes_json = ! empty( $attributes ) ? wp_json_encode( $attributes ) : '';

    return '<!-- wp:kotlinskidev/popular-content-dynamic' . ( '' !== $attributes_json ? ' ' . $attributes_json : '' ) . ' /-->';
}

function kotlinskidev_render_search_results_fresh_per_language( bool $blur_other_cards = false, string $card_hover_background_color = '', string $blur_amount = '' ) {
    $request = [
        'query' => get_search_query(),
        'category' => kotlinskidev_search_request_value('search_category'),
        'type' => kotlinskidev_search_request_value('search_type'),
    ];

    if (!empty($request['query'])) {
        return do_blocks(kotlinskidev_search_results_for_query_markup($request, $blur_other_cards));
    }

    return do_blocks(kotlinskidev_search_results_popular_content_fallback($blur_other_cards, $card_hover_background_color, $blur_amount));
}
