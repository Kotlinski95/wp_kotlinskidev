<?php
/**
 * Title: Photo Gallery
 * Slug: kotlinskidev/photo-gallery
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/work.webp',
    $kotlinskidev_url . 'assets/images/work.webp',
    $kotlinskidev_url . 'assets/images/work.webp',
    $kotlinskidev_url . 'assets/images/work.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/photo-gallery","name":"Photo Gallery"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"},"blockGap":"0"}},"gradient":"gradient-block-bottom-right","layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group has-gradient-block-bottom-right-gradient-background has-background" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:columns {"verticalAlignment":"bottom","style":{"spacing":{"blockGap":{"left":"84px"},"margin":{"bottom":"64px"}}}} -->
    <div class="wp-block-columns are-vertically-aligned-bottom" style="margin-bottom:64px"><!-- wp:column {"verticalAlignment":"bottom","width":"65%"} -->
        <div class="wp-block-column is-vertically-aligned-bottom" style="flex-basis:65%"><!-- wp:heading {"level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"800"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
            <h1 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="font-style:normal;font-weight:800"><?php esc_html_e('Photo Gallery', 'kotlinskidev') ?></h1>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-medium-font-size"><?php esc_html_e('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"bottom"} -->
        <div class="wp-block-column is-vertically-aligned-bottom">
            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
            <div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('See My Popular Posts', 'kotlinskidev') ?></a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:gallery {"className":"is-kotlinskidev-nowrap","columns":4,"linkTo":"none","sizeSlug":"thumbnail"} -->
    <figure class="wp-block-gallery has-nested-images columns-4 is-cropped is-kotlinskidev-nowrap"><!-- wp:image {"id":9049,"sizeSlug":"thumbnail","linkDestination":"none"} -->
        <figure class="wp-block-image size-thumbnail"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-9049" /></figure>
        <!-- /wp:image -->

        <!-- wp:image {"id":9048,"sizeSlug":"thumbnail","linkDestination":"none"} -->
        <figure class="wp-block-image size-thumbnail"><img src="<?php echo esc_url($kotlinskidev_images[1]) ?>" alt="" class="wp-image-9048" /></figure>
        <!-- /wp:image -->

        <!-- wp:image {"id":8714,"sizeSlug":"thumbnail","linkDestination":"none"} -->
        <figure class="wp-block-image size-thumbnail"><img src="<?php echo esc_url($kotlinskidev_images[2]) ?>" alt="" class="wp-image-8714" /></figure>
        <!-- /wp:image -->

        <!-- wp:image {"id":8744,"sizeSlug":"thumbnail","linkDestination":"none"} -->
        <figure class="wp-block-image size-thumbnail"><img src="<?php echo esc_url($kotlinskidev_images[3]) ?>" alt="" class="wp-image-8744" /></figure>
        <!-- /wp:image -->
    </figure>
    <!-- /wp:gallery -->
</div>
<!-- /wp:group -->