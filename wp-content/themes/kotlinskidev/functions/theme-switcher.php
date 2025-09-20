<?php
function kotlinskidev_theme_switcher_shortcode()
{
    ob_start();
?>
    <div class="theme-switcher">
        <input type="checkbox" name="check" id="theme-toggle">
        <label for="theme-toggle">
            <span class="wrapper">
                <span class="icon light" data-theme-icon="light">
                    <?php
                    $svg_path = get_template_directory() . '/assets/icons/light.svg';
                    if (file_exists($svg_path)) {
                        echo file_get_contents($svg_path);
                    }
                    ?>
                </span>
                <span class="icon dark" data-theme-icon="dark">
                    <?php
                    $svg_path = get_template_directory() . '/assets/icons/dark.svg';
                    if (file_exists($svg_path)) {
                        echo file_get_contents($svg_path);
                    }
                    ?>
                </span>
            </span>
        </label>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('theme_switcher', 'kotlinskidev_theme_switcher_shortcode');
