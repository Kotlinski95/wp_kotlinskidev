<?php
/**
 * Mobile Footer Menu Template
 * Fixed bottom navigation for mobile devices
 */

// Check if the mobile_footer menu has items
if (has_nav_menu('mobile_footer')) : ?>
    <nav id="mobile-footer-menu" class="mobile-footer-nav">
        <?php
        wp_nav_menu(array(
            'theme_location' => 'mobile_footer',
            'container' => 'nav',
            'container_class' => 'mobile-fixed-nav',
            'menu_class' => 'mobile-footer-menu-items',
        ));
        ?>
    </nav>
<?php endif; ?>
