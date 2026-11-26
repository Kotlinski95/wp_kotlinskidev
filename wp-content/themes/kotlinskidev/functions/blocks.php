<?php
function kotlinskidev_register_block_categories( array $categories ): array {
    $slugs = array_column( $categories, 'slug' );
    if ( ! in_array( 'kotlinskidev-navigation', $slugs, true ) ) {
        $categories[] = [
            'slug'  => 'kotlinskidev-navigation',
            'title' => __( 'Navigation', 'kotlinskidev' ),
            'icon'  => 'menu',
        ];
    }
    return $categories;
}
add_filter( 'block_categories_all', 'kotlinskidev_register_block_categories' );

function kotlinskidev_block_directory_plan(): array {
    return [
        'banner-carousel',
        'gallery-lightbox',
        'hero-carousel',
        'hero-carousel/slide',
        'protected-content',
        'scroll-section',
        'scroll-section/item',
        'navigation',
        'content-block',
        'theme-switcher',
        'search-panel',
        'popular-pages',
        'nav-search-panel',
        'language-panel',
        'nav-language-panel',
        'nav-popular-pages',
        'simple-grid',
        'holder',
        'nav-paragraph',
        'nav-link',
        'button',
        'nav-image',
        'nav-banner',
        'copyrights',
        'scroll-to-top',
        'social-section',
        'social-section/item',
        'slider',
        'responsive-image',
        'google-maps',
        'contact-form',
        'breadcrumbs',
        'model-viewer',
        'icon',
        'content-tabs',
        'content-tabs/item',
        'content-tabs/nav-link',
        'speed-dial',
        'speed-dial/item',
        'device-frame',
        'feature-card-canvas',
        [
            'feature' => 'article_cards',
            'blocks'  => [
                'article-card',
            ],
        ],
        [
            'feature' => 'project_cards',
            'blocks'  => [
                'project-card',
            ],
        ],
        'translated-text',
        [
            'feature' => 'offers',
            'blocks'  => [
                'offer-table',
            ],
        ],
        'process-steps',
        'process-steps/item',
        'pricing-cards',
        'pricing-cards/item',
        'contact-detail',
        'marquee',
        'marquee/item',
        'blog-topics-grid-dynamic',
        'category-header-dynamic',
        'category-posts-grid-dynamic',
        'other-topics-dynamic',
        'article-tags-dynamic',
        'related-articles-dynamic',
        [
            'feature' => 'article_toc',
            'blocks'  => [
                'article-toc',
            ],
        ],
        'tag-posts-grid-dynamic',
        'popular-content-dynamic',
        'recently-viewed-dynamic',
        'search-header-dynamic',
        'not-found-dynamic',
        'search-form-dynamic',
        'search-results-dynamic',
        [
            'feature' => 'certificates',
            'blocks'  => [
                'certificates-grid-dynamic',
                'certificate',
            ],
        ],
        [
            'feature' => 'canvas_backgrounds',
            'blocks'  => [
                'canvas-background/layer-gradient',
                'canvas-background/layer-noise',
                'canvas-background/layer-grid-lines',
                'canvas-background/layer-blob',
                'canvas-background/layer-sweep',
                'canvas-background/layer-light-rays',
                'canvas-background/layer-curved-rays',
                'canvas-background/layer-star-field',
                'canvas-background/layer-orbit-trails',
                'canvas-background/layer-warp-field',
                'canvas-background/layer-nebula',
                'canvas-background/layer-aurora',
                'canvas-background/layer-neon-waves',
            ],
        ],
        'bg-effect-preset-settings',
    ];
}

function kotlinskidev_enabled_block_directories(): array {
    $directories = [];

    foreach ( kotlinskidev_block_directory_plan() as $entry ) {
        if ( is_string( $entry ) ) {
            $directories[] = $entry;
            continue;
        }

        if ( kotlinskidev_feature_enabled( $entry['feature'] ) ) {
            array_push( $directories, ...$entry['blocks'] );
        }
    }

    return $directories;
}

function kotlinskidev_register_blocks(): void {
    foreach ( kotlinskidev_enabled_block_directories() as $directory ) {
        register_block_type( get_template_directory() . '/src/blocks/' . $directory );
    }
}
add_action( 'init', 'kotlinskidev_register_blocks' );

function kotlinskidev_restrict_canvas_layer_blocks_to_scene_editor( $allowed_block_types, $editor_context ) {
    $post = $editor_context->post ?? null;

    if ( $post instanceof WP_Post && 'kt_canvas_scene' === $post->post_type ) {
        return $allowed_block_types;
    }

    $registered = array_keys( WP_Block_Type_Registry::get_instance()->get_all_registered() );
    $allowed    = true === $allowed_block_types ? $registered : $allowed_block_types;

    return array_values( array_diff( $allowed, kotlinskidev_canvas_scene_layer_allowlist() ) );
}
add_filter( 'allowed_block_types_all', 'kotlinskidev_restrict_canvas_layer_blocks_to_scene_editor', 10, 2 );

function kotlinskidev_navigation_listable_blocks( array $blocks ): array {
    $blocks[] = 'kotlinskidev/social-section';
    $blocks[] = 'kotlinskidev/nav-link';
    $blocks[] = 'kotlinskidev/button';
    $blocks[] = 'kotlinskidev/nav-search-panel';
    $blocks[] = 'kotlinskidev/nav-language-panel';
    $blocks[] = 'kotlinskidev/nav-popular-pages';
    $blocks[] = 'kotlinskidev/nav-image';
    $blocks[] = 'kotlinskidev/nav-banner';
    $blocks[] = 'kotlinskidev/nav-paragraph';
    return $blocks;
}
add_filter( 'block_core_navigation_listable_blocks', 'kotlinskidev_navigation_listable_blocks' );

function kotlinskidev_inline_nav_icon( int $id ): string {
    if ( ! $id || 'image/svg+xml' !== get_post_mime_type( $id ) ) {
        return '';
    }
    $svg = kotlinskidev_load_svg_content( $id );
    if ( ! $svg ) {
        return '';
    }
    $svg = preg_replace( '/ fill="[^"]*"/i', '', $svg );
    $inline = preg_replace( '/<svg(\s)/i', '<svg aria-hidden="true" focusable="false" fill="currentColor"$1', $svg, 1 );
    if ( function_exists( 'kotlinskidev_svg_sprite_reference' ) ) {
        $reference = kotlinskidev_svg_sprite_reference( $id, $inline );
        if ( null !== $reference ) {
            return $reference;
        }
    }
    return $inline;
}

function kotlinskidev_pll_current_language_data(): ?array {
    if ( ! function_exists( 'pll_the_languages' ) ) {
        return null;
    }
    $languages = pll_the_languages( [ 'raw' => 1, 'echo' => 0 ] );
    if ( ! is_array( $languages ) ) {
        return null;
    }
    foreach ( $languages as $language ) {
        if ( ! empty( $language['current_lang'] ) ) {
            return $language;
        }
    }
    return null;
}

function kotlinskidev_navigation_container_blocks(): array {
    return [
        'core/navigation',
        'core/navigation-submenu',
        'kotlinskidev/holder',
        'kotlinskidev/search-panel',
        'kotlinskidev/nav-search-panel',
        'kotlinskidev/language-panel',
        'kotlinskidev/nav-language-panel',
    ];
}

function kotlinskidev_navigation_item_blocks(): array {
    return [
        'kotlinskidev/nav-image',
        'kotlinskidev/nav-banner',
        'kotlinskidev/nav-link',
        'kotlinskidev/nav-paragraph',
        'kotlinskidev/simple-grid',
        'kotlinskidev/social-section',
        'kotlinskidev/nav-popular-pages',
        'polylang/navigation-language-switcher',
    ];
}

function kotlinskidev_assign_navigation_item_parents( array $args, string $block_type ): array {
    if ( ! in_array( $block_type, kotlinskidev_navigation_item_blocks(), true ) ) {
        return $args;
    }

    $args['parent'] = kotlinskidev_navigation_container_blocks();

    return $args;
}
add_filter( 'register_block_type_args', 'kotlinskidev_assign_navigation_item_parents', 10, 2 );
