<?php
/**
 * Title: Service Section with big Image
 * Slug: kotlinskidev/services-content
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/work.webp',
    $kotlinskidev_url . 'assets/images/work.webp',
    $kotlinskidev_url . 'assets/images/work.webp',
    $kotlinskidev_url . 'assets/images/icon_button.webp',
);
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"gradient":"gradient-block-top-right","layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group has-gradient-block-top-right-gradient-background has-background" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"margin":{"bottom":"4rem"}}},"layout":{"type":"constrained","contentSize":"46.25rem"}} -->
    <div class="wp-block-group" style="margin-bottom:4rem"><!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center"}} -->
        <div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem"}}},"backgroundColor":"light-shade","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-light-shade-background-color has-background" style="padding-top:0.5rem;padding-bottom:0.5rem">
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
        <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

    <!-- wp:columns {"verticalAlignment":"top","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|40","left":"2.5rem"}}}} -->
    <div class="wp-block-columns are-vertically-aligned-top"><!-- wp:column {"verticalAlignment":"top","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-top" style="flex-basis:50%"><!-- wp:cover {"url":"<?php echo esc_url($kotlinskidev_images[0]) ?>","id":8714,"dimRatio":0,"customOverlayColor":"#9fa1ae","isUserOverlayColor":true,"minHeight":310,"contentPosition":"bottom left","isDark":false,"layout":{"type":"constrained"}} -->
            <div class="wp-block-cover is-light has-custom-content-position is-position-bottom-left" style="min-height:310px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#9fa1ae"></span><img class="wp-block-cover__image-background wp-image-8714" alt="" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" data-object-fit="cover" />
                <div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","placeholder":"Write title…","fontSize":"large"} -->
                    <p class="has-text-align-center has-large-font-size"></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:image {"lightbox":{"enabled":false},"id":9420,"width":"3rem","height":"3.0625rem","scale":"cover","sizeSlug":"full","linkDestination":"custom","className":"is-style-kotlinskidev-image-hover-zoom","style":{"color":{"duotone":"var:preset|duotone|primary-light"}}} -->
                    <figure class="wp-block-image size-full is-resized is-style-kotlinskidev-image-hover-zoom"><a href="#"><img src="<?php echo esc_url($kotlinskidev_images[3]) ?>" alt="" class="wp-image-9420" style="object-fit:cover;width:3rem;height:3.0625rem" /></a></figure>
                    <!-- /wp:image -->
                </div>
            </div>
            <!-- /wp:cover -->

            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"2.5rem","margin":{"top":"1.75rem"}}},"layout":{"type":"constrained","contentSize":"100%","justifyContent":"right"}} -->
            <div class="wp-block-group" style="margin-top:1.75rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3"}},"textColor":"foreground-alt","fontSize":"big"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="line-height:1.3"><?php esc_html_e('Social Media and Brand identity', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.75rem"}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.75rem"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"top","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-top" style="flex-basis:50%"><!-- wp:cover {"url":"<?php echo esc_url($kotlinskidev_images[1]) ?>","id":8744,"dimRatio":0,"customOverlayColor":"#7455b0","isUserOverlayColor":true,"minHeight":310,"contentPosition":"bottom left","layout":{"type":"constrained"}} -->
            <div class="wp-block-cover has-custom-content-position is-position-bottom-left" style="min-height:310px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#7455b0"></span><img class="wp-block-cover__image-background wp-image-8744" alt="" src="<?php echo esc_url($kotlinskidev_images[1]) ?>" data-object-fit="cover" />
                <div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","placeholder":"Write title…","fontSize":"large"} -->
                    <p class="has-text-align-center has-large-font-size"></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:image {"lightbox":{"enabled":false},"id":9420,"width":"3rem","height":"3.0625rem","scale":"cover","sizeSlug":"full","linkDestination":"custom","className":"is-style-kotlinskidev-image-hover-zoom","style":{"color":{"duotone":"var:preset|duotone|primary-light"}}} -->
                    <figure class="wp-block-image size-full is-resized is-style-kotlinskidev-image-hover-zoom"><a href="#"><img src="<?php echo esc_url($kotlinskidev_images[3]) ?>" alt="" class="wp-image-9420" style="object-fit:cover;width:3rem;height:3.0625rem" /></a></figure>
                    <!-- /wp:image -->
                </div>
            </div>
            <!-- /wp:cover -->

            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"2.5rem","margin":{"top":"1.75rem"}}},"layout":{"type":"constrained","contentSize":"100%","justifyContent":"right"}} -->
            <div class="wp-block-group" style="margin-top:1.75rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3"}},"textColor":"foreground-alt","fontSize":"big"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="line-height:1.3"><?php esc_html_e('Digital MArketing', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.75rem"}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.75rem"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"top","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-top" style="flex-basis:50%"><!-- wp:cover {"url":"<?php echo esc_url($kotlinskidev_images[2]) ?>","id":8744,"dimRatio":0,"customOverlayColor":"#7455b0","isUserOverlayColor":true,"minHeight":310,"contentPosition":"bottom left","layout":{"type":"constrained"}} -->
            <div class="wp-block-cover has-custom-content-position is-position-bottom-left" style="min-height:310px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#7455b0"></span><img class="wp-block-cover__image-background wp-image-8744" alt="" src="<?php echo esc_url($kotlinskidev_images[2]) ?>" data-object-fit="cover" />
                <div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","placeholder":"Write title…","fontSize":"large"} -->
                    <p class="has-text-align-center has-large-font-size"></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:image {"lightbox":{"enabled":false},"id":9420,"width":"3rem","height":"3.0625rem","scale":"cover","sizeSlug":"full","linkDestination":"custom","className":"is-style-kotlinskidev-image-hover-zoom","style":{"color":{"duotone":"var:preset|duotone|primary-light"}}} -->
                    <figure class="wp-block-image size-full is-resized is-style-kotlinskidev-image-hover-zoom"><a href="#"><img src="<?php echo esc_url($kotlinskidev_images[3]) ?>" alt="" class="wp-image-9420" style="object-fit:cover;width:3rem;height:3.0625rem" /></a></figure>
                    <!-- /wp:image -->
                </div>
            </div>
            <!-- /wp:cover -->

            <!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"2.5rem","margin":{"top":"1.75rem"}}},"layout":{"type":"constrained","contentSize":"100%","justifyContent":"right"}} -->
            <div class="wp-block-group" style="margin-top:1.75rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:heading {"level":4,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"lineHeight":"1.3"}},"textColor":"foreground-alt","fontSize":"big"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="line-height:1.3"><?php esc_html_e('Startup Consulting', 'kotlinskidev') ?></h4>
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