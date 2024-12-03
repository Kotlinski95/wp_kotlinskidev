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
        <?php wp_nav_menu(array('theme_location' => 'primary')); ?>
        </nav>
    </div>

</header>