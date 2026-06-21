<?php
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
        'primary' => __('Primary Menu', 'kotlinskidev'),
    ));

    // Add theme support for Full Site Editing
    add_theme_support('block-templates');

    // Add support for editor styles
    add_theme_support('editor-styles');
    add_editor_style('build/critical.css');
    add_editor_style('build/main.css');

    // Add support for responsive embeds
    add_theme_support('responsive-embeds');

    // Add support for custom line height
    add_theme_support('custom-line-height');

    // Add support for custom units
    add_theme_support('custom-units');
}
add_action('after_setup_theme', 'kotlinskidev_theme_setup');

function remove_jquery()
{
    // Deregister jQuery from the front end, but keep it for logged-in admins
    if (!is_admin() && !current_user_can('manage_options')) {
        wp_deregister_script('jquery');
    }
}
add_action('wp_enqueue_scripts', 'remove_jquery');

function kotlinskidev_show_admin_bar(bool $show): bool
{
    return current_user_can('manage_options') ? $show : false;
}
add_filter('show_admin_bar', 'kotlinskidev_show_admin_bar');

function kotlinskidev_remove_admin_bar_css(): void
{
    if (!is_admin() && !current_user_can('manage_options')) {
        wp_deregister_style('admin-bar');
    }
}
add_action('wp_enqueue_scripts', 'kotlinskidev_remove_admin_bar_css');

// disable stylesheet (wpassetcleanup-style-css id added by wpassetcleanup plugin)
function shapeSpace_disable_scripts_styles()
{
    if (!is_admin()) {
        wp_dequeue_style('wpassetcleanup-style');
    }
}
add_action('wp_enqueue_scripts', 'shapeSpace_disable_scripts_styles', 100);

function mytheme_inline_theme_switcher_script()
{
?>
    <script type="text/javascript">
        (function() {
            let savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    savedTheme = 'dark';
                } else {
                    savedTheme = 'light';
                }
            }
            if (savedTheme === 'light') {
                document.body?.classList?.add('light-mode');
                document.documentElement.classList.add('light-mode');
            } else {
                document.body?.classList?.add('dark-mode');
                document.documentElement.classList.add('dark-mode');
            }
        })();
    </script>
    <style>
        .light-mode {
            background-color: #ffffff;
            color: #000000;
        }

        .dark-mode {
            background-color: #000000;
            color: #ffffff;
        }
    </style>
<?php
}
add_action('wp_head', 'mytheme_inline_theme_switcher_script', 1);
