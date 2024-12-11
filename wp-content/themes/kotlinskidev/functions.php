<?php
// Include theme setup functions
require_once get_template_directory() . '/functions/theme-setup.php';

// Include script and style enqueue functions
require_once get_template_directory() . '/functions/enqueue-scripts.php';

// Include customizer settings and functions
require_once get_template_directory() . '/functions/customizer.php';

// Include seo customizer settings and functions
// require_once get_template_directory() . '/functions/seo-customizer.php';

// Include logo functions
require_once get_template_directory() . '/functions/site-identity.php';

// Include maintenance settings and functions
require_once get_template_directory() . '/functions/maintenance.php';

// Include menu functions
require_once get_template_directory() . '/functions/menus.php';

require_once get_template_directory() . '/functions/language-switcher.php';

function your_theme_register_patterns() {
    // Register Footer Default Pattern
    register_block_pattern(
        'kotlinskidev/footer-default',
        array(
            'title'       => __( 'Footer Default', 'kotlinskidev' ),
            'description' => __( 'A predesigned footer layout with links and social icons.', 'kotlinskidev' ),
            'categories'  => array( 'footer' ),
            'content'     => file_get_contents( get_template_directory() . '/patterns/footer-default.php' ),
        )
    );
}
add_action( 'init', 'your_theme_register_patterns' );
?>
