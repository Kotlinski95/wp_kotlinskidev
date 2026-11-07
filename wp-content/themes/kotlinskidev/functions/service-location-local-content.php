<?php
const KOTLINSKIDEV_LOCAL_FAQ_MAX                = 2;
const KOTLINSKIDEV_LOCAL_FAQ_QUESTION_MAX_LENGTH = 300;
const KOTLINSKIDEV_LOCAL_FAQ_ANSWER_MAX_LENGTH   = 1000;
const KOTLINSKIDEV_FEATURED_PROJECTS_MAX        = 3;

function kotlinskidev_sanitize_local_faq( $value ): array {
    if ( ! is_array( $value ) ) {
        return [];
    }

    $pairs = [];
    foreach ( $value as $item ) {
        if ( ! is_array( $item ) ) {
            continue;
        }

        $question = sanitize_text_field( (string) ( $item['question'] ?? '' ) );
        $answer   = sanitize_textarea_field( (string) ( $item['answer'] ?? '' ) );

        if ( '' === $question || '' === $answer ) {
            continue;
        }

        $pairs[] = [ 'question' => $question, 'answer' => $answer ];

        if ( count( $pairs ) >= KOTLINSKIDEV_LOCAL_FAQ_MAX ) {
            break;
        }
    }

    return $pairs;
}

function kotlinskidev_sanitize_featured_projects( $value ): array {
    if ( ! is_array( $value ) ) {
        return [];
    }

    $ids = [];
    foreach ( $value as $id ) {
        $id = absint( $id );
        if ( $id > 0 && ! in_array( $id, $ids, true ) ) {
            $ids[] = $id;
        }
        if ( count( $ids ) >= KOTLINSKIDEV_FEATURED_PROJECTS_MAX ) {
            break;
        }
    }

    return $ids;
}

function kotlinskidev_sanitize_city_local_section( $section ): string {
    $section = (string) $section;

    return in_array( $section, [ 'intro', 'faq', 'nearby' ], true ) ? $section : 'intro';
}

function kotlinskidev_register_service_location_local_meta(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    $auth = function ( $allowed, $meta_key, $post_id ) {
        return current_user_can( 'edit_post', (int) $post_id );
    };

    $text_fields = [
        'local_intro'    => 'sanitize_textarea_field',
        'local_audience' => 'sanitize_textarea_field',
        'local_distance' => 'sanitize_text_field',
    ];

    foreach ( $text_fields as $key => $sanitize_callback ) {
        register_post_meta( 'service_location', $key, [
            'type'              => 'string',
            'single'            => true,
            'default'           => '',
            'show_in_rest'      => true,
            'sanitize_callback' => $sanitize_callback,
            'auth_callback'     => $auth,
        ] );
    }

    register_post_meta( 'service_location', 'local_faq', [
        'type'              => 'array',
        'single'            => true,
        'default'           => [],
        'show_in_rest'      => [
            'schema' => [
                'type'     => 'array',
                'maxItems' => KOTLINSKIDEV_LOCAL_FAQ_MAX,
                'items'    => [
                    'type'       => 'object',
                    'properties' => [
                        'question' => [ 'type' => 'string', 'maxLength' => KOTLINSKIDEV_LOCAL_FAQ_QUESTION_MAX_LENGTH ],
                        'answer'   => [ 'type' => 'string', 'maxLength' => KOTLINSKIDEV_LOCAL_FAQ_ANSWER_MAX_LENGTH ],
                    ],
                ],
            ],
        ],
        'sanitize_callback' => 'kotlinskidev_sanitize_local_faq',
        'auth_callback'     => $auth,
    ] );

    register_post_meta( 'service_location', 'featured_projects', [
        'type'              => 'array',
        'single'            => true,
        'default'           => [],
        'show_in_rest'      => [
            'schema' => [
                'type'     => 'array',
                'maxItems' => KOTLINSKIDEV_FEATURED_PROJECTS_MAX,
                'items'    => [ 'type' => 'integer' ],
            ],
        ],
        'sanitize_callback' => 'kotlinskidev_sanitize_featured_projects',
        'auth_callback'     => $auth,
    ] );
}
add_action( 'init', 'kotlinskidev_register_service_location_local_meta' );

function kotlinskidev_get_service_location_local_fields( int $post_id ): array {
    return [
        'local_intro'       => trim( (string) get_post_meta( $post_id, 'local_intro', true ) ),
        'local_audience'    => trim( (string) get_post_meta( $post_id, 'local_audience', true ) ),
        'local_distance'    => trim( (string) get_post_meta( $post_id, 'local_distance', true ) ),
        'local_faq'         => kotlinskidev_sanitize_local_faq( get_post_meta( $post_id, 'local_faq', true ) ),
        'featured_projects' => kotlinskidev_sanitize_featured_projects( get_post_meta( $post_id, 'featured_projects', true ) ),
    ];
}

function kotlinskidev_render_city_local_intro_markup( array $fields ): string {
    $markup = '';

    if ( '' !== ( $fields['local_intro'] ?? '' ) ) {
        $markup .= '<p class="kt-city-local__intro">' . esc_html( $fields['local_intro'] ) . '</p>';
    }

    $facts = [
        'local_audience' => __( 'Who I help', 'kotlinskidev' ),
        'local_distance' => __( 'Distance and meetings', 'kotlinskidev' ),
    ];

    $items = '';
    foreach ( $facts as $key => $label ) {
        if ( '' === ( $fields[ $key ] ?? '' ) ) {
            continue;
        }
        $items .= '<div class="kt-city-local__fact"><dt class="kt-city-local__fact-label">' . esc_html( $label ) . '</dt><dd class="kt-city-local__fact-value">' . esc_html( $fields[ $key ] ) . '</dd></div>';
    }

    if ( '' !== $items ) {
        $markup .= '<dl class="kt-city-local__facts">' . $items . '</dl>';
    }

    return $markup;
}

function kotlinskidev_render_city_local_faq_markup( array $fields ): string {
    $markup = '';

    foreach ( (array) ( $fields['local_faq'] ?? [] ) as $pair ) {
        $question = (string) ( $pair['question'] ?? '' );
        $answer   = (string) ( $pair['answer'] ?? '' );
        if ( '' === $question || '' === $answer ) {
            continue;
        }
        $markup .= '<!-- wp:details {"style":{"typography":{"fontSize":"1.125rem","fontWeight":"600"}}} -->'
            . '<details class="wp-block-details" style="font-size:1.125rem;font-weight:600"><summary>' . esc_html( $question ) . '</summary>'
            . '<!-- wp:paragraph {"textColor":"foreground"} --><p class="has-foreground-color has-text-color">' . esc_html( $answer ) . '</p><!-- /wp:paragraph -->'
            . '</details><!-- /wp:details -->';
    }

    return '' === $markup ? '' : do_blocks( $markup );
}

function kotlinskidev_render_city_local_nearby_markup( int $post_id ): string {
    $cards = kotlinskidev_render_city_grid_cards( [ 'exclude_id' => $post_id, 'show_empty' => false ] );

    if ( '' === $cards ) {
        return '';
    }

    return '<h2 class="kt-city-local__nearby-heading">' . esc_html__( 'Other cities I work in', 'kotlinskidev' ) . '</h2><div class="kt-city-grid" style="' . esc_attr( kotlinskidev_build_city_grid_style_vars() ) . '">' . $cards . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $cards is built from esc_url()/esc_html()'d values
}

function kotlinskidev_render_city_local_content( int $post_id, string $section ): string {
    if ( $post_id <= 0 ) {
        return '';
    }

    if ( 'nearby' === $section ) {
        return kotlinskidev_render_city_local_nearby_markup( $post_id );
    }

    $fields = kotlinskidev_get_service_location_local_fields( $post_id );

    return 'faq' === $section
        ? kotlinskidev_render_city_local_faq_markup( $fields )
        : kotlinskidev_render_city_local_intro_markup( $fields );
}

function kotlinskidev_register_city_local_content_block(): void {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return;
    }

    register_block_type( get_template_directory() . '/src/blocks/city-local-content' );
}
add_action( 'init', 'kotlinskidev_register_city_local_content_block' );

function kotlinskidev_featured_project_ids_for_post( int $post_id ): array {
    $featured = kotlinskidev_sanitize_featured_projects( get_post_meta( $post_id, 'featured_projects', true ) );

    return array_map( 'kotlinskidev_resolve_translatable_post_id', $featured );
}

function kotlinskidev_filter_service_location_project_cards( string $block_content, array $block ): string {
    if ( ! kotlinskidev_feature_enabled( 'service_locations' ) ) {
        return $block_content;
    }

    if ( 'kotlinskidev/project-card' !== ( $block['blockName'] ?? '' ) || ! is_singular( 'service_location' ) ) {
        return $block_content;
    }

    $featured = kotlinskidev_featured_project_ids_for_post( (int) get_queried_object_id() );
    if ( [] === $featured ) {
        return $block_content;
    }

    $card_id = (int) ( $block['attrs']['cardId'] ?? 0 );
    if ( $card_id <= 0 ) {
        return $block_content;
    }

    return in_array( kotlinskidev_resolve_translatable_post_id( $card_id ), $featured, true ) ? $block_content : '';
}
add_filter( 'render_block', 'kotlinskidev_filter_service_location_project_cards', 10, 2 );
