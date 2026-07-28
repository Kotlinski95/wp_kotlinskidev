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
    return $blocks;
}
add_filter( 'block_core_navigation_listable_blocks', 'kotlinskidev_navigation_listable_blocks' );

function kotlinskidev_inline_nav_icon( int $id ): string {
    if ( ! $id ) {
        return '';
    }
    $file = get_attached_file( $id );
    if ( ! $file || 'svg' !== strtolower( pathinfo( $file, PATHINFO_EXTENSION ) ) ) {
        return '';
    }
    $svg = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
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
        'kotlinskidev/holder',
        'kotlinskidev/simple-grid',
        'kotlinskidev/language-panel',
        'kotlinskidev/nav-language-panel',
        'kotlinskidev/search-panel',
        'kotlinskidev/nav-search-panel',
        'kotlinskidev/popular-pages',
        'kotlinskidev/nav-popular-pages',
    ];
}

function kotlinskidev_extend_navigation_scoped_blocks( array $args, string $block_type ): array {
    $restricted_to = array_merge( $args['parent'] ?? [], $args['ancestor'] ?? [] );

    if ( ! in_array( 'core/navigation', $restricted_to, true ) ) {
        return $args;
    }

    $args['ancestor'] = array_values( array_unique( array_merge(
        $args['ancestor'] ?? [],
        $args['parent'] ?? [],
        [ 'core/navigation' ],
        kotlinskidev_navigation_container_blocks()
    ) ) );
    unset( $args['parent'] );

    return $args;
}
add_filter( 'register_block_type_args', 'kotlinskidev_extend_navigation_scoped_blocks', 10, 2 );
