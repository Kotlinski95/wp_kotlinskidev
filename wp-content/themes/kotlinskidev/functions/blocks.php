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
    register_block_type( get_template_directory() . '/src/blocks/theme-switcher' );
    register_block_type( get_template_directory() . '/src/blocks/search-panel' );
    register_block_type( get_template_directory() . '/src/blocks/popular-pages' );
    register_block_type( get_template_directory() . '/src/blocks/nav-search-panel' );
    register_block_type( get_template_directory() . '/src/blocks/nav-popular-pages' );
    register_block_type( get_template_directory() . '/src/blocks/simple-grid' );
    register_block_type( get_template_directory() . '/src/blocks/holder' );
    register_block_type( get_template_directory() . '/src/blocks/nav-paragraph' );
    register_block_type( get_template_directory() . '/src/blocks/nav-image' );
    register_block_type( get_template_directory() . '/src/blocks/nav-banner' );
}
add_action( 'init', 'kotlinskidev_register_blocks' );
