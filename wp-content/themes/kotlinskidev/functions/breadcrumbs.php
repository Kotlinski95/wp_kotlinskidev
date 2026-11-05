<?php
function kotlinskidev_breadcrumb_home_crumb( array $settings ): array {
    return [ 'label' => $settings['home_text'], 'url' => home_url( '/' ) ];
}

function kotlinskidev_breadcrumb_topics_crumb( array $settings ): array {
    return [ 'label' => $settings['topics_text'], 'url' => $settings['topics_url'] ];
}

function kotlinskidev_get_breadcrumb_trail(): array {
    $settings = kotlinskidev_get_breadcrumb_settings();
    $trail    = [ kotlinskidev_breadcrumb_home_crumb( $settings ) ];

    if ( is_category() ) {
        $category = get_queried_object();
        $trail[]  = kotlinskidev_breadcrumb_topics_crumb( $settings );
        $trail[]  = [ 'label' => $category->name, 'url' => null ];
        return $trail;
    }

    if ( is_tag() ) {
        $tag     = get_queried_object();
        $trail[] = [ 'label' => $tag->name, 'url' => null ];
        return $trail;
    }

    if ( is_single() && 'post' === get_post_type() ) {
        $categories = get_the_category();
        if ( ! empty( $categories ) ) {
            $category = $categories[0];
            $trail[]  = kotlinskidev_breadcrumb_topics_crumb( $settings );
            $trail[]  = [ 'label' => $category->name, 'url' => get_category_link( $category->term_id ) ];
        }
        $trail[] = [ 'label' => get_the_title(), 'url' => null ];
        return $trail;
    }

    if ( is_page() ) {
        $ancestors = array_reverse( get_post_ancestors( get_the_ID() ) );
        foreach ( $ancestors as $ancestor_id ) {
            $trail[] = [ 'label' => get_the_title( $ancestor_id ), 'url' => get_permalink( $ancestor_id ) ];
        }
        $trail[] = [ 'label' => get_the_title(), 'url' => null ];
        return $trail;
    }

    if ( is_search() ) {
        $trail[] = [
            'label' => sprintf( __( 'Search results for "%s"', 'kotlinskidev' ), get_search_query() ),
            'url'   => null,
        ];
        return $trail;
    }

    if ( is_home() || is_post_type_archive( 'post' ) ) {
        $trail[] = [ 'label' => __( 'Articles', 'kotlinskidev' ), 'url' => null ];
        return $trail;
    }

    $trail[] = [ 'label' => get_the_title(), 'url' => null ];
    return $trail;
}

function kotlinskidev_render_breadcrumb_item( array $crumb ): string {
    if ( empty( $crumb['url'] ) ) {
        return '<span class="kt-breadcrumbs__current">' . esc_html( $crumb['label'] ) . '</span>';
    }

    return '<a class="kt-breadcrumbs__item" href="' . esc_url( $crumb['url'] ) . '">' . esc_html( $crumb['label'] ) . '</a>';
}

function kotlinskidev_render_breadcrumb_trail( array $trail ): string {
    if ( count( $trail ) < 2 ) {
        return '';
    }

    $items = array_map( 'kotlinskidev_render_breadcrumb_item', $trail );

    return '<nav class="kt-breadcrumbs__list">' . implode( '<span class="kt-breadcrumbs__separator">→</span>', $items ) . '</nav>';
}

function kotlinskidev_current_url(): string {
    $request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
    return esc_url_raw( home_url( $request_uri ) );
}

function kotlinskidev_filter_yoast_breadcrumb_links( array $crumbs ): array {
    if ( is_front_page() ) {
        return $crumbs;
    }

    $trail = kotlinskidev_get_breadcrumb_trail();

    return array_map(
        static fn ( array $crumb ): array => [
            'text' => $crumb['label'],
            'url'  => empty( $crumb['url'] ) ? kotlinskidev_current_url() : $crumb['url'],
        ],
        $trail
    );
}
add_filter( 'wpseo_breadcrumb_links', 'kotlinskidev_filter_yoast_breadcrumb_links' );
