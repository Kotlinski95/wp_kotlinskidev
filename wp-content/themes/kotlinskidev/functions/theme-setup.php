<?php
function kotlinskidev_theme_setup()
{
    add_theme_support('automatic-feed-links');

    add_theme_support('title-tag');

    add_theme_support('post-thumbnails');

    add_theme_support('block-templates');

    add_theme_support('editor-styles');
    add_editor_style('build/css/critical.css');
    add_editor_style('build/css/main-all.css');

    add_theme_support('responsive-embeds');

    add_theme_support('custom-line-height');

    add_theme_support('custom-units');
}
add_action('after_setup_theme', 'kotlinskidev_theme_setup');

function remove_jquery()
{
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

function shapeSpace_disable_scripts_styles()
{
    if (!is_admin()) {
        wp_dequeue_style('wpassetcleanup-style');
    }
}
add_action('wp_enqueue_scripts', 'shapeSpace_disable_scripts_styles', 100);

function mytheme_inline_theme_switcher_script()
{
    $config = kotlinskidev_theme_switcher_config();
?>
    <script type="text/javascript">
        (function() {
            var config = <?php echo wp_json_encode($config); ?>;
            window.kotlinskidevTheme = config;
            var savedTheme = config.enabled ? localStorage.getItem('theme') : null;
            if (!savedTheme) {
                if (config.defaultMode === 'auto') {
                    savedTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
                } else {
                    savedTheme = config.defaultMode;
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
<?php
}
add_action('wp_head', 'mytheme_inline_theme_switcher_script', 1);
