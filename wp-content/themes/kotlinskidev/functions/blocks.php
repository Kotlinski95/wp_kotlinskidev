<?php
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
}
add_action( 'init', 'kotlinskidev_register_blocks' );
