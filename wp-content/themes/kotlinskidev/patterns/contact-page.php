<?php
/**
 * Title: Contact Us
 * Slug: kotlinskidev/contact-page
 * Categories: pages, kotlinskidev/pages, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/google-map.webp',
);
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"margin":{"top":"0","bottom":"0"}}},"gradient":"gradient-block-bottom","layout":{"type":"constrained","contentSize":"100%"}} -->
<div class="wp-block-group has-gradient-block-bottom-gradient-background has-background" style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|2.5rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--2.5rem)"><!-- wp:image {"id":10027,"sizeSlug":"large","linkDestination":"none","align":"wide"} -->
        <figure class="wp-block-image alignwide size-large"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-10027" /></figure>
        <!-- /wp:image -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/contact-with-form","name":"Contact with Form"},"style":{"spacing":{"padding":{"top":"5rem","bottom":"5rem","right":"var:preset|spacing|2.5rem","left":"var:preset|spacing|2.5rem"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:5rem;padding-right:var(--wp--preset--spacing--2.5rem);padding-bottom:5rem;padding-left:var(--wp--preset--spacing--2.5rem)"><!-- wp:group {"style":{"spacing":{"margin":{"bottom":"3.75rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
        <div class="wp-block-group" style="margin-bottom:3.75rem"><!-- wp:group {"layout":{"type":"constrained","contentSize":"46.25rem","justifyContent":"left"}} -->
            <div class="wp-block-group"><!-- wp:heading {"level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"800"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <h1 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="font-style:normal;font-weight:800"><?php esc_html_e('Keep in Touch', 'kotlinskidev') ?></h1>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"typography":{"lineHeight":1.7,"fontSize":"1.125rem"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="font-size:1.125rem;line-height:1.7"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

            <!-- wp:columns {"verticalAlignment":"top","style":{"spacing":{"blockGap":{"top":"5rem","left":"6.25rem"}}}} -->
            <div class="wp-block-columns are-vertically-aligned-top"><!-- wp:column {"verticalAlignment":"top"} -->
                <div class="wp-block-column is-vertically-aligned-top"><!-- wp:group {"style":{"spacing":{"margin":{"top":"1.875rem"},"blockGap":"var:preset|spacing|1.25rem"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                    <div class="wp-block-group" style="margin-top:1.875rem"><!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                        <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Address:', 'kotlinskidev') ?></h4>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph {"style":{"typography":{"fontStyle":"normal","fontWeight":"500","lineHeight":1.6,"fontSize":"1.125rem"}},"textColor":"sub-heading-color"} -->
                        <p class="has-sub-heading-color-color has-text-color" style="font-size:1.125rem;font-style:normal;font-weight:500;line-height:1.6"><a href="#"><?php esc_html_e('2824 Fleming Street, Montgomery', 'kotlinskidev') ?></a></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->

                    <!-- wp:group {"style":{"spacing":{"margin":{"top":"1.5rem"},"blockGap":"var:preset|spacing|1.25rem"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                    <div class="wp-block-group" style="margin-top:1.5rem"><!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                        <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Phone:', 'kotlinskidev') ?></h4>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph {"style":{"typography":{"fontStyle":"normal","fontWeight":"500","lineHeight":1.6,"fontSize":"1.125rem"}},"textColor":"sub-heading-color"} -->
                        <p class="has-sub-heading-color-color has-text-color" style="font-size:1.125rem;font-style:normal;font-weight:500;line-height:1.6"><a href="#"><?php esc_html_e('+1 (012) 345-6789', 'kotlinskidev') ?></a></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->

                    <!-- wp:group {"style":{"spacing":{"margin":{"top":"1.5rem"},"blockGap":"var:preset|spacing|1.25rem"}},"layout":{"type":"flex","orientation":"vertical"}} -->
                    <div class="wp-block-group" style="margin-top:1.5rem"><!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                        <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Email:', 'kotlinskidev') ?></h4>
                        <!-- /wp:heading -->

                        <!-- wp:paragraph {"style":{"typography":{"fontStyle":"normal","fontWeight":"500","lineHeight":1.6,"fontSize":"1.125rem"}},"textColor":"sub-heading-color"} -->
                        <p class="has-sub-heading-color-color has-text-color" style="font-size:1.125rem;font-style:normal;font-weight:500;line-height:1.6"><a href="#"><?php esc_html_e('email@example.com', 'kotlinskidev') ?></a></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->

                    <!-- wp:social-links {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|2.5rem"},"margin":{"top":"2.5rem"}}},"layout":{"type":"flex","justifyContent":"left"}} -->
                    <ul class="wp-block-social-links" style="margin-top:2.5rem"><!-- wp:social-link {"url":"#","service":"facebook"} /-->

                        <!-- wp:social-link {"url":"#","service":"linkedin"} /-->

                        <!-- wp:social-link {"url":"#","service":"x"} /-->

                        <!-- wp:social-link {"url":"#","service":"youtube"} /-->

                        <!-- wp:social-link {"url":"#","service":"vk"} /-->

                        <!-- wp:social-link {"url":"#","service":"telegram"} /-->
                    </ul>
                    <!-- /wp:social-links -->
                </div>
                <!-- /wp:column -->

                <!-- wp:column {"verticalAlignment":"top","width":"60%"} -->
                <div class="wp-block-column is-vertically-aligned-top" style="flex-basis:60%"><!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                    <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Please insert the contact form shortcode here to display the form.', 'kotlinskidev') ?></h4>
                    <!-- /wp:heading -->
                </div>
                <!-- /wp:column -->
            </div>
            <!-- /wp:columns -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->