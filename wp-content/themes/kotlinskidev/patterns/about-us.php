<?php

/**
 * Title: About Us Section
 * Slug: kotlinskidev/about-us
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/about.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/about-us","name":"About Us Section"},"style":{"spacing":{"padding":{"top":"120px","bottom":"120px","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"backgroundColor":"background-alt","layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group has-background-alt-background-color has-background" style="margin-top:0;margin-bottom:0;padding-top:120px;padding-right:var(--wp--preset--spacing--40);padding-bottom:120px;padding-left:var(--wp--preset--spacing--40)"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"48px"},"margin":{"top":"0","bottom":"0"}}}} -->
    <div class="wp-block-columns are-vertically-aligned-center" style="margin-top:0;margin-bottom:0"><!-- wp:column {"verticalAlignment":"center"} -->
        <div class="wp-block-column is-vertically-aligned-center">
            <!-- wp:heading {"level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"800","lineHeight":"1.2"},"spacing":{"margin":{"top":"10px","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"xx-large"} -->
            <h1 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-xx-large-font-size" style="margin-top:10px;margin-bottom:0;font-style:normal;font-weight:800;line-height:1.2"><?php esc_html_e('Building Smarter Solutions: SaaS Experts', 'kotlinskidev') ?></h1>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
            <div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('See My Popular Posts', 'kotlinskidev') ?></a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"center"} -->
        <div class="wp-block-column is-vertically-aligned-center"><!-- wp:image {"id":5979,"sizeSlug":"full","linkDestination":"none","align":"right","style":{"border":{"radius":"0px"},"color":{"duotone":"var:preset|duotone|secondary-light"}}} -->
            <figure class="wp-block-image alignright size-full has-custom-border"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-5979" style="border-radius:0px" /></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->