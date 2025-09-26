<?php
/**
 * Title: Featured Content
 * Slug: kotlinskidev/featured-content
 * Categories: featured, kotlinskidev/featured, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/work.webp',
    $kotlinskidev_url . 'assets/images/work.webp',
);
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"100%"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem","left":"2.5rem","right":"2.5rem"},"margin":{"top":"0","bottom":"0"}}},"gradient":"gradient-block-top","layout":{"type":"constrained","contentSize":"65rem"}} -->
    <div class="wp-block-group has-gradient-block-top-gradient-background has-background" style="margin-top:0;margin-bottom:0;padding-top:1.25rem;padding-right:2.5rem;padding-bottom:1.25rem;padding-left:2.5rem"><!-- wp:group {"style":{"spacing":{"margin":{"bottom":"5.25rem"}}},"layout":{"type":"constrained","contentSize":"40rem"}} -->
        <div class="wp-block-group" style="margin-bottom:5.25rem"><!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center"}} -->
            <div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1.5rem","right":"1.5rem"}}},"layout":{"type":"constrained"}} -->
                <div class="wp-block-group" style="padding-top:0.5rem;padding-right:1.5rem;padding-bottom:0.5rem;padding-left:1.5rem">
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

            <!-- wp:heading {"textAlign":"center","level":1,"style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}},"typography":{"fontStyle":"normal","fontWeight":"800","lineHeight":"1.2"}},"textColor":"foreground-alt"} -->
            <h1 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color" style="font-style:normal;font-weight:800;line-height:1.2"><?php esc_html_e('Our Newest', 'kotlinskidev') ?> <mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-primary-color"><?php esc_html_e('Ventures with Leading', 'kotlinskidev') ?></mark> <?php esc_html_e('Companies', 'kotlinskidev') ?></h1>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
            <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

        <!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"top":"2.5rem","left":"0"}}}} -->
        <div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
            <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%"><!-- wp:cover {"url":"<?php echo esc_url($kotlinskidev_images[0]) ?>","id":8714,"dimRatio":0,"customOverlayColor":"#9fa1ae","isUserOverlayColor":true,"minHeight":500,"isDark":false,"layout":{"type":"constrained"}} -->
                <div class="wp-block-cover is-light" style="min-height:500px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#9fa1ae"></span><img class="wp-block-cover__image-background wp-image-8714" alt="" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" data-object-fit="cover" />
                    <div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","placeholder":"Write title…","fontSize":"large"} -->
                        <p class="has-text-align-center has-large-font-size"></p>
                        <!-- /wp:paragraph -->
                    </div>
                </div>
                <!-- /wp:cover -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
            <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%"><!-- wp:group {"style":{"spacing":{"padding":{"top":"3.125rem","bottom":"3.125rem","left":"3.125rem","right":"3.125rem"},"blockGap":"2.5rem"}},"layout":{"type":"constrained","contentSize":"26.25rem","justifyContent":"right"}} -->
                <div class="wp-block-group" style="padding-top:3.125rem;padding-right:3.125rem;padding-bottom:3.125rem;padding-left:3.125rem"><!-- wp:group {"style":{"spacing":{"margin":{"bottom":"1.5rem"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
                    <div class="wp-block-group" style="margin-bottom:1.5rem"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem"}}},"layout":{"type":"constrained"}} -->
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

                    <!-- wp:heading {"level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3"}},"textColor":"foreground-alt"} -->
                    <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="line-height:1.3"><?php esc_html_e('Next-Generation Mobile Apps Development', 'kotlinskidev') ?></h3>
                    <!-- /wp:heading -->

                    <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.75rem"}}},"textColor":"foreground-alt"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.75rem"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem","left":"2.5rem","right":"2.5rem"},"margin":{"top":"0","bottom":"0"}}},"gradient":"gradient-ten","layout":{"type":"constrained","contentSize":"65rem"}} -->
    <div class="wp-block-group has-gradient-ten-gradient-background has-background" style="margin-top:0;margin-bottom:0;padding-top:1.25rem;padding-right:2.5rem;padding-bottom:1.25rem;padding-left:2.5rem"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"top":"2.5rem","left":"0"}}}} -->
        <div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":"50%","style":{"spacing":{"padding":{"right":"0","left":"0","top":"3.125rem","bottom":"3.125rem"}}}} -->
            <div class="wp-block-column is-vertically-aligned-center" style="padding-top:3.125rem;padding-right:0;padding-bottom:3.125rem;padding-left:0;flex-basis:50%"><!-- wp:group {"style":{"spacing":{"padding":{"top":"3.125rem","bottom":"3.125rem","left":"0","right":"0"},"blockGap":"2.5rem"}},"layout":{"type":"constrained","contentSize":"28.125rem","justifyContent":"left"}} -->
                <div class="wp-block-group" style="padding-top:3.125rem;padding-right:0;padding-bottom:3.125rem;padding-left:0"><!-- wp:group {"style":{"spacing":{"margin":{"bottom":"1.5rem"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
                    <div class="wp-block-group" style="margin-bottom:1.5rem"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem"}}},"layout":{"type":"constrained"}} -->
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

                    <!-- wp:heading {"level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3"}},"textColor":"foreground-alt"} -->
                    <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="line-height:1.3"><?php esc_html_e('Creative Branding Solutions', 'kotlinskidev') ?></h3>
                    <!-- /wp:heading -->

                    <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.75rem"}}},"textColor":"foreground-alt"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.75rem"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
            <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%"><!-- wp:cover {"url":"<?php echo esc_url($kotlinskidev_images[1]) ?>","id":8744,"dimRatio":0,"customOverlayColor":"#7455b0","isUserOverlayColor":true,"minHeight":500,"layout":{"type":"constrained"}} -->
                <div class="wp-block-cover" style="min-height:500px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#7455b0"></span><img class="wp-block-cover__image-background wp-image-8744" alt="" src="<?php echo esc_url($kotlinskidev_images[1]) ?>" data-object-fit="cover" />
                    <div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","placeholder":"Write title…","fontSize":"large"} -->
                        <p class="has-text-align-center has-large-font-size"></p>
                        <!-- /wp:paragraph -->
                    </div>
                </div>
                <!-- /wp:cover -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->