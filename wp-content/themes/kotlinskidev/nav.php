<header>
    <div class="header-wrapper">
        <div class="logo">
            <?php
            if (has_custom_logo()) {
                the_custom_logo(); // Display the custom logo
            } else {
                // If no custom logo, display site title
            ?>
                <a href="<?php echo esc_url(home_url('/')); ?>">
                    <h1><?php bloginfo('name'); ?></h1>
                </a>
            <?php
            }
            ?>
        </div>
        <!-- <?php wp_nav_menu(array('theme_location' => 'primary')); ?> -->

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

        <?php echo do_shortcode('[language_switcher]'); ?>
    </div>

</header>