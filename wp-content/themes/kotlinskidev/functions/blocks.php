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

function kotlinskidev_register_blocks(): void {
    register_block_type( get_template_directory() . '/src/blocks/banner-carousel' );
    register_block_type( get_template_directory() . '/src/blocks/gallery-lightbox' );
    register_block_type( get_template_directory() . '/src/blocks/hero-carousel' );
    register_block_type( get_template_directory() . '/src/blocks/hero-carousel/slide' );
    register_block_type( get_template_directory() . '/src/blocks/protected-content' );
    register_block_type( get_template_directory() . '/src/blocks/scroll-section' );
    register_block_type( get_template_directory() . '/src/blocks/scroll-section/item' );
    register_block_type( get_template_directory() . '/src/blocks/navigation' );
    register_block_type( get_template_directory() . '/src/blocks/content-block' );
    register_block_type( get_template_directory() . '/src/blocks/theme-switcher' );
    register_block_type( get_template_directory() . '/src/blocks/search-panel' );
    register_block_type( get_template_directory() . '/src/blocks/popular-pages' );
    register_block_type( get_template_directory() . '/src/blocks/nav-search-panel' );
    register_block_type( get_template_directory() . '/src/blocks/language-panel' );
    register_block_type( get_template_directory() . '/src/blocks/nav-language-panel' );
    register_block_type( get_template_directory() . '/src/blocks/nav-popular-pages' );
    register_block_type( get_template_directory() . '/src/blocks/simple-grid' );
    register_block_type( get_template_directory() . '/src/blocks/holder' );
    register_block_type( get_template_directory() . '/src/blocks/nav-paragraph' );
    register_block_type( get_template_directory() . '/src/blocks/nav-link' );
    register_block_type( get_template_directory() . '/src/blocks/button' );
    register_block_type( get_template_directory() . '/src/blocks/nav-image' );
    register_block_type( get_template_directory() . '/src/blocks/nav-banner' );
    register_block_type( get_template_directory() . '/src/blocks/copyrights' );
    register_block_type( get_template_directory() . '/src/blocks/scroll-to-top' );
    register_block_type( get_template_directory() . '/src/blocks/social-section' );
    register_block_type( get_template_directory() . '/src/blocks/social-section/item' );
    register_block_type( get_template_directory() . '/src/blocks/slider' );
    register_block_type( get_template_directory() . '/src/blocks/responsive-image' );
    register_block_type( get_template_directory() . '/src/blocks/google-maps' );
    register_block_type( get_template_directory() . '/src/blocks/contact-form' );
}
add_action( 'init', 'kotlinskidev_register_blocks' );

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
    return preg_replace( '/<svg(\s)/i', '<svg aria-hidden="true" focusable="false" fill="currentColor"$1', $svg, 1 );
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
        'kotlinskidev/button',
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
