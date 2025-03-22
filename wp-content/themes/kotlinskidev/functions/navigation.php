<?php

function kotlinskidev_navigation_shortcode()
{

    ob_start();
?>
    <nav>
        <div id="page-loader">
            <div class="spinner"></div>
        </div>
        <div class="header-wrapper">

            <section class="header-right">
                <!-- <?php wp_nav_menu(array('theme_location' => 'primary')); ?> -->
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
                <div id="hamburger-button" class="mobile-only">
                    <input type="checkbox" id="toggle" name="hamburger-toggle" aria-label="hamburger menu toggle" autocomplete="off">
                    <label for="toggle">
                    </label>
                </div>

                <!-- Navigation Menu -->
                <div class="hide-mobile">
                    <?php
                    wp_nav_menu(array(
                        'theme_location' => 'primary',
                        'container' => 'nav',
                        'container_class' => 'navigation',
                        'menu_class' => 'menu-items',
                    ));
                    ?>
                </div>

                <div class="mobile-only hamburger-container" id="hamburger-menu">
                    <?php
                    wp_nav_menu(array(
                        'theme_location' => 'mobile',
                        'container' => 'nav',
                        'container_class' => 'hamburger-container',
                        'menu_class' => 'menu-items',
                    ));
                    ?>
                </div>

            </section>
        </div>

    </nav>
<?php
    return ob_get_clean();
}
add_shortcode('navigation', 'kotlinskidev_navigation_shortcode');

?>