<?php
/**
 * Title: Testimonial Section
 * Slug: kotlinskidev/testimonial-section
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/rating_star.webp',
    $kotlinskidev_url . 'assets/images/testimonial.webp',
    $kotlinskidev_url . 'assets/images/testimonial.webp',
    $kotlinskidev_url . 'assets/images/testimonial.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/testimonial-section","name":"Testimonial Section"},"style":{"spacing":{"padding":{"top":"7rem","bottom":"4rem","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group has-light-shade-background-color has-background" style="margin-top:0;margin-bottom:0;padding-top:7rem;padding-right:var(--wp--preset--spacing--40);padding-bottom:4rem;padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"margin":{"bottom":"3.75rem"}}},"layout":{"type":"constrained","contentSize":"40rem","justifyContent":"center"}} -->
    <div class="wp-block-group" style="margin-bottom:3.75rem">
        <!-- wp:heading {"textAlign":"center","level":2,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3","fontStyle":"normal","fontWeight":"800"}},"textColor":"foreground-alt"} -->
        <h2 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color" style="font-style:normal;font-weight:800;line-height:1.3"><?php esc_html_e('Hear From Our Happy Clients: Their Stories', 'kotlinskidev') ?></h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
        <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

    <!-- wp:columns {"style":{"spacing":{"margin":{"top":"0"},"blockGap":{"left":"1.875rem"}}}} -->
    <div class="wp-block-columns" style="margin-top:0"><!-- wp:column -->
        <div class="wp-block-column"><!-- wp:group {"className":"kotlinskidev-hover-box","style":{"border":{"radius":"0.75rem","width":"0.0625rem"},"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.875rem","right":"1.875rem"},"margin":{"top":"0","bottom":"0"}}},"backgroundColor":"background-alt","borderColor":"border-color","layout":{"type":"constrained"}} -->
            <div class="wp-block-group kotlinskidev-hover-box has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:0.0625rem;border-radius:0.75rem;margin-top:0;margin-bottom:0;padding-top:1.875rem;padding-right:1.875rem;padding-bottom:1.875rem;padding-left:1.875rem"><!-- wp:image {"id":4435,"width":"5.875rem","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-4435" style="width:5.875rem" /></figure>
                <!-- /wp:image -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
                <div class="wp-block-group"><!-- wp:image {"id":2415,"width":"auto","height":"3.75rem","aspectRatio":"1","scale":"cover","sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"3.125rem"}}} -->
                    <figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url($kotlinskidev_images[1]) ?>" alt="" class="wp-image-2415" style="border-radius:3.125rem;aspect-ratio:1;object-fit:cover;width:auto;height:3.75rem" /></figure>
                    <!-- /wp:image -->

                    <!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                    <div class="wp-block-group"><!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary"} -->
                        <h3 class="wp-block-heading has-primary-color has-text-color has-link-color" style="font-style:normal;font-weight:600"><?php esc_html_e('Henry Benzamin Clark', 'kotlinskidev') ?></h3>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                        <p class="has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Fitness Coach', 'kotlinskidev') ?></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column"><!-- wp:group {"className":"kotlinskidev-hover-box","style":{"border":{"radius":"0.75rem","width":"0.0625rem"},"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.875rem","right":"1.875rem"},"margin":{"top":"0","bottom":"0"}}},"backgroundColor":"background-alt","borderColor":"border-color","layout":{"type":"constrained"}} -->
            <div class="wp-block-group kotlinskidev-hover-box has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:0.0625rem;border-radius:0.75rem;margin-top:0;margin-bottom:0;padding-top:1.875rem;padding-right:1.875rem;padding-bottom:1.875rem;padding-left:1.875rem"><!-- wp:image {"id":4435,"width":"5.875rem","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-4435" style="width:5.875rem" /></figure>
                <!-- /wp:image -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
                <div class="wp-block-group"><!-- wp:image {"id":2415,"width":"auto","height":"3.75rem","aspectRatio":"1","scale":"cover","sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"3.125rem"}}} -->
                    <figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url($kotlinskidev_images[2]) ?>" alt="" class="wp-image-2415" style="border-radius:3.125rem;aspect-ratio:1;object-fit:cover;width:auto;height:3.75rem" /></figure>
                    <!-- /wp:image -->

                    <!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                    <div class="wp-block-group"><!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary"} -->
                        <h3 class="wp-block-heading has-primary-color has-text-color has-link-color" style="font-style:normal;font-weight:600"><?php esc_html_e('Lexy Coxtera', 'kotlinskidev') ?></h3>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                        <p class="has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Content Writer', 'kotlinskidev') ?></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column"><!-- wp:group {"className":"kotlinskidev-hover-box","style":{"border":{"radius":"0.75rem","width":"0.0625rem"},"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.875rem","right":"1.875rem"},"margin":{"top":"0","bottom":"0"}}},"backgroundColor":"background-alt","borderColor":"border-color","layout":{"type":"constrained"}} -->
            <div class="wp-block-group kotlinskidev-hover-box has-border-color has-border-color-border-color has-background-alt-background-color has-background" style="border-width:0.0625rem;border-radius:0.75rem;margin-top:0;margin-bottom:0;padding-top:1.875rem;padding-right:1.875rem;padding-bottom:1.875rem;padding-left:1.875rem"><!-- wp:image {"id":4435,"width":"5.875rem","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-4435" style="width:5.875rem" /></figure>
                <!-- /wp:image -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
                <div class="wp-block-group"><!-- wp:image {"id":2415,"width":"auto","height":"3.75rem","aspectRatio":"1","scale":"cover","sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"3.125rem"}}} -->
                    <figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url($kotlinskidev_images[3]) ?>" alt="" class="wp-image-2415" style="border-radius:3.125rem;aspect-ratio:1;object-fit:cover;width:auto;height:3.75rem" /></figure>
                    <!-- /wp:image -->

                    <!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                    <div class="wp-block-group"><!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary"} -->
                        <h3 class="wp-block-heading has-primary-color has-text-color has-link-color" style="font-style:normal;font-weight:600"><?php esc_html_e('Robert Mathew', 'kotlinskidev') ?></h3>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                        <p class="has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Product Owner', 'kotlinskidev') ?></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
        <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('See My Popular Posts', 'kotlinskidev') ?></a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->