<?php

function kotlinskidev_theme_switcher_shortcode()
{
    $template_dir = get_template_directory();
    $dark_mode_svg = file_exists("$template_dir/assets/images/light-bulb-dark.svg")
        ? file_get_contents("$template_dir/assets/images/light-bulb-dark.svg")
        : '';

    $light_mode_svg = file_exists("$template_dir/assets/images/light-bulb.svg")
        ? file_get_contents("$template_dir/assets/images/light-bulb.svg")
        : '';
    ob_start();
?>
    <div class="theme-switcher">
        <div class="btn">
            <input type="checkbox" name="check" id="theme-toggle">
            <label for="theme-toggle">
                <div class="box">
                    <div class="ball"></div>
                    <div class="scenery">
                        <div class="moon icon">
                            <!-- wp:html -->
                            <?php echo file_get_contents(get_template_directory() . '/assets/images/light-bulb-dark.svg'); ?>
                            <!-- /wp:html -->
                        </div>
                        <div class="sun icon">
                            <!-- wp:html -->
                            <?php echo file_get_contents(get_template_directory() . '/assets/images/light-bulb.svg'); ?>
                            <!-- /wp:html -->
                        </div>
                    </div>
                </div>
            </label>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('theme_switcher', 'kotlinskidev_theme_switcher_shortcode');

?>