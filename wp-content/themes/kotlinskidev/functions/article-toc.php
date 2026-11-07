<?php
function kotlinskidev_article_toc_label( string $html ): string {
    $text = trim( wp_strip_all_tags( $html ) );
    $text = preg_replace( '/^\d+[.)]\s+/', '', $text );

    return trim( (string) $text );
}

function kotlinskidev_article_toc_existing_id( string $html ): string {
    $processor = new WP_HTML_Tag_Processor( $html );
    if ( ! $processor->next_tag() ) {
        return '';
    }

    $id = $processor->get_attribute( 'id' );

    return is_string( $id ) ? $id : '';
}

function kotlinskidev_article_toc_unique_id( string $id, array $used ): string {
    if ( ! isset( $used[ $id ] ) ) {
        return $id;
    }

    $suffix = 2;
    while ( isset( $used[ $id . '-' . $suffix ] ) ) {
        ++$suffix;
    }

    return $id . '-' . $suffix;
}

function kotlinskidev_article_toc_color_value( $slug, $custom = '' ): string {
    if ( is_string( $slug ) && preg_match( '/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug ) ) {
        return 'var(--wp--preset--color--' . $slug . ')';
    }

    if ( ! is_string( $custom ) ) {
        return '';
    }

    $custom = trim( $custom );
    if ( preg_match( '/^var:preset\|color\|([a-z0-9]+(?:-[a-z0-9]+)*)$/', $custom, $matches ) ) {
        return 'var(--wp--preset--color--' . $matches[1] . ')';
    }
    if ( preg_match( '/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $custom ) ) {
        return $custom;
    }
    if ( preg_match( '/^(?:rgb|hsl)a?\(\s*[0-9.]+(?:deg)?%?(?:\s*[,\s]\s*[0-9.]+%?){2}(?:\s*[,\/]\s*[0-9.]+%?)?\s*\)$/i', $custom ) ) {
        return $custom;
    }

    return '';
}

function kotlinskidev_article_toc_support_color( array $attributes, string $slug_key, string $style_group, string $style_key ): string {
    $slug   = $attributes[ $slug_key ] ?? '';
    $custom = $attributes['style'][ $style_group ][ $style_key ] ?? '';

    return kotlinskidev_article_toc_color_value( $slug, $custom );
}

function kotlinskidev_article_toc_declarations( array $declarations ): string {
    $parts = array();
    foreach ( $declarations as $property => $value ) {
        if ( '' !== $value ) {
            $parts[] = $property . ':' . $value;
        }
    }

    return implode( ';', $parts );
}

function kotlinskidev_article_toc_card_vars( array $attributes ): array {
    $accent = kotlinskidev_article_toc_color_value( $attributes['accentColor'] ?? '', $attributes['customAccentColor'] ?? '' );
    $active = kotlinskidev_article_toc_color_value( $attributes['activeBackgroundColor'] ?? '', $attributes['customActiveBackgroundColor'] ?? '' );

    return array(
        '--kt-article-toc-accent'    => $accent,
        '--kt-article-toc-bar'       => $accent,
        '--kt-article-toc-active-bg' => $active,
    );
}

function kotlinskidev_article_toc_dialog_style( array $attributes ): string {
    return kotlinskidev_article_toc_declarations(
        array_merge(
            kotlinskidev_article_toc_card_vars( $attributes ),
            array(
                'color'            => kotlinskidev_article_toc_support_color( $attributes, 'textColor', 'color', 'text' ),
                'background-color' => kotlinskidev_article_toc_support_color( $attributes, 'backgroundColor', 'color', 'background' ),
                'border-color'     => kotlinskidev_article_toc_support_color( $attributes, 'borderColor', 'border', 'color' ),
            )
        )
    );
}

function kotlinskidev_article_toc_items( string $content ): array {
    $blocks = parse_blocks( $content );
    $items  = array();
    $used   = array();
    $count  = count( $blocks );

    for ( $i = 0; $i < $count; $i++ ) {
        $block = $blocks[ $i ];
        if ( 'core/heading' !== ( $block['blockName'] ?? null ) ) {
            continue;
        }

        $next = $blocks[ $i + 1 ] ?? null;
        if ( is_array( $next ) && 'core/list' === ( $next['blockName'] ?? null ) && str_contains( serialize_block( $next ), 'href="#' ) ) {
            return array();
        }

        $attrs = $block['attrs'] ?? array();
        $level = $attrs['level'] ?? 2;
        if ( 2 !== (int) $level ) {
            continue;
        }

        $class_name = $attrs['className'] ?? '';
        if ( is_string( $class_name ) && str_contains( $class_name, 'kt-toc-exclude' ) ) {
            continue;
        }

        $html  = (string) ( $block['innerHTML'] ?? '' );
        $label = kotlinskidev_article_toc_label( $html );
        if ( '' === $label ) {
            continue;
        }

        $id = '';
        if ( isset( $attrs['anchor'] ) && is_string( $attrs['anchor'] ) ) {
            $id = $attrs['anchor'];
        }
        if ( '' === $id ) {
            $id = kotlinskidev_article_toc_existing_id( $html );
        }
        if ( '' === $id ) {
            $id = sanitize_title( $label );
        }
        if ( '' === $id ) {
            $id = 'section-' . ( count( $items ) + 1 );
        }

        $id           = kotlinskidev_article_toc_unique_id( $id, $used );
        $used[ $id ]  = true;
        $items[]      = array(
            'id'    => $id,
            'label' => $label,
        );
    }

    return $items;
}

function kotlinskidev_article_toc_items_for_post( int $post_id ): array {
    static $memo = array();

    if ( ! isset( $memo[ $post_id ] ) ) {
        $post = get_post( $post_id );
        $memo[ $post_id ] = ( $post && isset( $post->post_content ) )
            ? kotlinskidev_article_toc_items( (string) $post->post_content )
            : array();
    }

    return $memo[ $post_id ];
}

function kotlinskidev_article_toc_inject_heading_id( string $block_content, array $block ): string {
    static $cursors = array();

    if ( ! is_singular( 'post' ) ) {
        return $block_content;
    }

    $post_id = (int) get_queried_object_id();
    if ( $post_id < 1 ) {
        $post_id = (int) get_the_ID();
    }
    if ( $post_id < 1 ) {
        return $block_content;
    }

    $processor = new WP_HTML_Tag_Processor( $block_content );
    if ( ! $processor->next_tag( 'h2' ) ) {
        return $block_content;
    }

    $existing = $processor->get_attribute( 'id' );
    if ( is_string( $existing ) && '' !== $existing ) {
        return $block_content;
    }

    $label  = kotlinskidev_article_toc_label( $block_content );
    $items  = kotlinskidev_article_toc_items_for_post( $post_id );
    $cursor = $cursors[ $post_id ] ?? 0;
    $total  = count( $items );

    for ( $i = $cursor; $i < $total; $i++ ) {
        if ( $items[ $i ]['label'] === $label ) {
            $cursors[ $post_id ] = $i + 1;
            $processor->set_attribute( 'id', $items[ $i ]['id'] );

            return $processor->get_updated_html();
        }
    }

    return $block_content;
}
add_filter( 'render_block_core/heading', 'kotlinskidev_article_toc_inject_heading_id', 10, 2 );
