<?php
// Theme setup function
function kotlinskidev_theme_setup()
{
    // Add default posts and comments RSS feed links to head.
    add_theme_support('automatic-feed-links');

    // Let WordPress manage the document title.
    add_theme_support('title-tag');

    // Enable support for Post Thumbnails on posts and pages.
    add_theme_support('post-thumbnails');

    // Register menu location.
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'my-simple-theme'),
    ));
}
add_action('after_setup_theme', 'kotlinskidev_theme_setup');

function remove_jquery()
{
    // Deregister jQuery from the front end
    if (!is_admin()) {
        wp_deregister_script('jquery');
    }
}
add_action('wp_enqueue_scripts', 'remove_jquery');

// function conditional_admin_bar_css() {
//     if (!is_user_logged_in()) { // Remove CSS only for non-logged-in users
//         wp_deregister_style('admin-bar');
//     }
// }
// add_action('wp_enqueue_scripts', 'conditional_admin_bar_css');

// Disable admin bar for all users on the front end
add_filter('show_admin_bar', '__return_false');

// Remove admin bar CSS from the front end
function remove_admin_bar_css()
{
    if (!is_admin()) {
        wp_deregister_style('admin-bar');
    }
}
add_action('wp_enqueue_scripts', 'remove_admin_bar_css');

// Disable Gutenberg Block Library CSS
// function remove_block_library_css()
// {
//     wp_dequeue_style('wp-block-library'); // Core block library
//     wp_dequeue_style('wp-block-library-theme'); // Block library theme styles
//     wp_dequeue_style('global-styles'); // Global styles (since WordPress 5.9+)
// }
// add_action('wp_enqueue_scripts', 'remove_block_library_css');

// disable stylesheet (wpassetcleanup-style-css id added by wpassetcleanup plugin)
function shapeSpace_disable_scripts_styles()
{
    if (!is_admin()) {
        wp_dequeue_style('wpassetcleanup-style');
    }
}
add_action('wp_enqueue_scripts', 'shapeSpace_disable_scripts_styles', 100);

function mytheme_inline_theme_switcher_script() {
    ?>
    <script type="text/javascript">
        (function() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body?.classList?.add('light-mode');
            }
        })();
    </script>
    <?php
}
add_action('wp_head', 'mytheme_inline_theme_switcher_script', 1);
