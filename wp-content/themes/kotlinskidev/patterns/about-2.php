<?php

/**
 * Title: About Section 2
 * Slug: kotlinskidev/about-2
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/about.webp',
    $kotlinskidev_url . 'assets/images/video_icon.webp',
);
?>
<!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|40","left":"var:preset|spacing|40","top":"var:preset|spacing|20","bottom":"1rem"},"margin":{"top":"0","bottom":"0"}}},"backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group has-light-shade-background-color has-background" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--40);padding-bottom:1rem;padding-left:var(--wp--preset--spacing--40)"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"48px"},"margin":{"top":"0","bottom":"64px"}}}} -->
    <div class="wp-block-columns are-vertically-aligned-center" style="margin-top:0;margin-bottom:64px"><!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
            <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
            <div class="wp-block-group">
                <!-- wp:group {"style":{"spacing":{"padding":{"top":"8px","bottom":"8px"},"margin":{"bottom":"16px"}}},"backgroundColor":"background-alt","layout":{"type":"constrained"}} -->
                <div class="wp-block-group has-background-alt-background-color has-background" style="margin-bottom:16px;padding-top:8px;padding-bottom:8px;">
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

            <!-- wp:heading {"level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"800","lineHeight":"1.2"},"spacing":{"margin":{"top":"10px","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"xx-large"} -->
            <h1 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-xx-large-font-size" style="margin-top:10px;margin-bottom:0;font-style:normal;font-weight:800;line-height:1.2"><?php esc_html_e('Building Smarter Solutions SaaS Experts', 'kotlinskidev') ?></h1>
            <!-- /wp:heading -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"center"} -->
        <div class="wp-block-column is-vertically-aligned-center"><!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"fontSize":"18px"}},"textColor":"foreground-alt"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color" style="font-size:18px"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"typography":{"fontSize":"18px"}},"textColor":"foreground-alt"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color" style="font-size:18px"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:cover {"url":"<?php echo esc_url($kotlinskidev_images[0]) ?>","id":5979,"dimRatio":0,"customOverlayColor":"#706f72","isUserOverlayColor":true,"minHeight":580,"style":{"color":{"duotone":"var:preset|duotone|secondary-light"}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-cover" style="min-height:580px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#706f72"></span><img class="wp-block-cover__image-background wp-image-5979" alt="" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" data-object-fit="cover" />
        <div class="wp-block-cover__inner-container"><!-- wp:image {"lightbox":{"enabled":false},"id":9963,"sizeSlug":"full","linkDestination":"custom","align":"center","className":"is-style-kotlinskidev-image-pulse"} -->
            <figure class="wp-block-image aligncenter size-full is-style-kotlinskidev-image-pulse"><a href="#"><img src="<?php echo esc_url($kotlinskidev_images[1]) ?>" alt="" class="wp-image-9963" /></a></figure>
            <!-- /wp:image -->
        </div>
    </div>
    <!-- /wp:cover -->
</div>
<!-- /wp:group -->