<?php
/**
 * Title: Service Grid
 * Slug: kotlinskidev/services-grid
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/service_icon.webp',
    $kotlinskidev_url . 'assets/images/service_icon.webp',
    $kotlinskidev_url . 'assets/images/service_icon.webp',
    $kotlinskidev_url . 'assets/images/service_icon.webp',
);
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"7rem","bottom":"7rem","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"gradient":"gradient-block-bottom","layout":{"type":"constrained","contentSize":"58.75rem"}} -->
<div class="wp-block-group has-gradient-block-bottom-gradient-background has-background" style="margin-top:0;margin-bottom:0;padding-top:7rem;padding-right:var(--wp--preset--spacing--40);padding-bottom:7rem;padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"margin":{"bottom":"5.25rem"}}},"layout":{"type":"constrained","contentSize":"46.25rem"}} -->
    <div class="wp-block-group" style="margin-bottom:5.25rem"><!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center"}} -->
        <div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group" style="padding-top:0.5rem;padding-bottom:0.5rem">
                <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
                <div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                    <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('See My Popular Posts', 'kotlinskidev') ?></a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->

        <!-- wp:heading {"textAlign":"center","level":1,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"fontStyle":"normal","fontWeight":"800","lineHeight":"1.2"}},"textColor":"foreground-alt"} -->
        <h1 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color" style="font-style:normal;font-weight:800;line-height:1.2"><?php esc_html_e('End-to-End', 'kotlinskidev') ?> <mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-primary-color"><?php esc_html_e('Solutions to Empower', 'kotlinskidev') ?></mark> <?php esc_html_e('Your Business', 'kotlinskidev') ?></h1>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
        <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries.', 'kotlinskidev') ?></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

    <!-- wp:columns {"verticalAlignment":"top","style":{"spacing":{"blockGap":{"top":"2.5rem","left":"4.625rem"}}}} -->
    <div class="wp-block-columns are-vertically-aligned-top"><!-- wp:column {"verticalAlignment":"top","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-top" style="flex-basis:50%"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"var:preset|spacing|40","margin":{"top":"0rem"}}},"layout":{"type":"constrained","contentSize":"100%","justifyContent":"right"}} -->
            <div class="wp-block-group" style="margin-top:0rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:image {"id":8695,"width":"4.625rem","height":"4.625rem","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-8695" style="object-fit:cover;width:4.625rem;height:4.625rem" /></figure>
                <!-- /wp:image -->

                <!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3"}},"textColor":"foreground-alt","fontSize":"large"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-large-font-size" style="line-height:1.3"><?php esc_html_e('Social Media and Brand identity', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.75rem"}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.75rem"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"top","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-top" style="flex-basis:50%"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"var:preset|spacing|40","margin":{"top":"0rem"}}},"layout":{"type":"constrained","contentSize":"100%","justifyContent":"right"}} -->
            <div class="wp-block-group" style="margin-top:0rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:image {"id":8698,"width":"4.625rem","height":"4.625rem","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[1]) ?>" alt="" class="wp-image-8698" style="object-fit:cover;width:4.625rem;height:4.625rem" /></figure>
                <!-- /wp:image -->

                <!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3"}},"textColor":"foreground-alt","fontSize":"large"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-large-font-size" style="line-height:1.3"><?php esc_html_e('Social Media and Brand identity', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.75rem"}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.75rem"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:columns {"verticalAlignment":"top","style":{"spacing":{"blockGap":{"top":"2.5rem","left":"4.625rem"},"margin":{"top":"3rem"}}}} -->
    <div class="wp-block-columns are-vertically-aligned-top" style="margin-top:3rem"><!-- wp:column {"verticalAlignment":"top","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-top" style="flex-basis:50%"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"var:preset|spacing|40","margin":{"top":"0rem"}}},"layout":{"type":"constrained","contentSize":"100%","justifyContent":"right"}} -->
            <div class="wp-block-group" style="margin-top:0rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:image {"id":8699,"width":"4.625rem","height":"4.625rem","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[2]) ?>" alt="" class="wp-image-8699" style="object-fit:cover;width:4.625rem;height:4.625rem" /></figure>
                <!-- /wp:image -->

                <!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3"}},"textColor":"foreground-alt","fontSize":"large"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-large-font-size" style="line-height:1.3"><?php esc_html_e('Social Media and Brand identity', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.75rem"}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.75rem"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"top","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-top" style="flex-basis:50%"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"var:preset|spacing|40","margin":{"top":"0rem"}}},"layout":{"type":"constrained","contentSize":"100%","justifyContent":"right"}} -->
            <div class="wp-block-group" style="margin-top:0rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:image {"id":8700,"width":"4.625rem","height":"4.625rem","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[3]) ?>" alt="" class="wp-image-8700" style="object-fit:cover;width:4.625rem;height:4.625rem" /></figure>
                <!-- /wp:image -->

                <!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3"}},"textColor":"foreground-alt","fontSize":"large"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-large-font-size" style="line-height:1.3"><?php esc_html_e('Social Media and Brand identity', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.75rem"}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.75rem"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->