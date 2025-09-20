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
            <section class="header-right" style="display: none;">
                <?php echo do_shortcode('[theme_switcher]'); ?>
                <div id="hamburger-button" class="mobile-only tablet-only">
                    <input type="checkbox" id="toggle" name="hamburger-toggle" aria-label="hamburger menu toggle" autocomplete="off">
                    <label for="toggle">
                    </label>
                </div>

                <!-- Navigation Menu -->
                <div class="hide-mobile hide-tablet">
                    <?php
                    wp_nav_menu(array(
                        'theme_location' => 'primary',
                        'container' => 'nav',
                        'container_class' => 'navigation',
                        'menu_class' => 'menu-items',
                    ));
                    ?>
                </div>

                <div class="mobile-only tablet-only hamburger-container" id="hamburger-menu">
                    <?php
                    wp_nav_menu(array(
                        'theme_location' => 'mobile',
                        'container' => 'nav',
                        'container_class' => 'hamburger-container',
                        'menu_class' => 'menu-items',
                    ));
                    ?>

                    <div class="social-menu-container">
                        <?php
                        // Add social icons section after the mobile navigation menu
                        if (has_nav_menu('social')) {
                            wp_nav_menu(array(
                                'theme_location' => 'social',
                                'container' => 'nav',
                                'container_class' => 'social-navigation',
                                'menu_class' => 'social-menu-items',
                            ));
                        }
                        ?>
                    </div>
                </div>

            </section>
        </div>

    </nav>
<?php
    return ob_get_clean();
}
add_shortcode('navigation', 'kotlinskidev_navigation_shortcode');
