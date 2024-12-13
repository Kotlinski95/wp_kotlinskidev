<header>
    <div id="page-loader">
        <div class="spinner"></div>
    </div>
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
        <section class="header-right">
        <!-- <?php wp_nav_menu(array('theme_location' => 'primary')); ?> -->
        <div class="theme-switcher">  
            <div class="btn">
                <input type="checkbox" name="check" id="theme-toggle">
                <label for="theme-toggle">
                    <div class="box">
                        <div class="ball"></div>
                        <div class="scenary">
                            <div class="moon">
                                <!-- <?php echo file_get_contents(get_template_directory() . '/assets/images/dark-mode.svg');?> -->
                                <span class="icon icon-light-bulb-svgrepo-com" style="color:black;"></span>
                            </div>
                            <div class="sun">
                                <!-- <?php echo file_get_contents(get_template_directory() . '/assets/images/light-mode.svg');?> -->
                                <span class="icon icon-light-bulb-svgrepo-com-1"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span><span class="path6"></span><span class="path7"></span></span>
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

        <?php echo do_shortcode('[language_switcher]'); ?>
        </section>
    </div>

</header>