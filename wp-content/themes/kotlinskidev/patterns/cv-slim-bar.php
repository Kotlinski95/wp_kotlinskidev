<?php
/**
 * Title: CV Slim Bar
 * Slug: kotlinskidev/cv-slim-bar
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/about.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/cv-slim-bar","name":"CV Slim Bar"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"1.375rem","bottom":"1.375rem","left":"1.625rem","right":"1.625rem"}}},"backgroundColor":"background-alt","layout":{"type":"constrained"}} -->
    <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:1.375rem;padding-right:1.625rem;padding-bottom:1.375rem;padding-left:1.625rem"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"1.25rem"},"margin":{"top":"0","bottom":"0"}}}} -->
        <div class="wp-block-columns are-vertically-aligned-center" style="margin-top:0;margin-bottom:0"><!-- wp:column {"verticalAlignment":"center","width":"3.25rem"} -->
            <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:3.25rem"><!-- wp:image {"id":5979,"width":"3.25rem","height":"3.25rem","scale":"cover","sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"50%"}}} -->
                <figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-5979" style="border-radius:50%;object-fit:cover;width:3.25rem;height:3.25rem" /></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"verticalAlignment":"center"} -->
            <div class="wp-block-column is-vertically-aligned-center">
                <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"},"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground"} -->
                <p class="has-foreground-color has-text-color has-link-color"><?php esc_html_e('Adrian Kotliński — Web Developer', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"top":"0.125rem"}}},"textColor":"foreground-alt","fontSize":"small"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-top:0.125rem"><?php esc_html_e('One-page CV, PDF, updated September 2026', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"verticalAlignment":"center","width":"17.5rem"} -->
            <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:17.5rem">
                <!-- wp:group {"style":{"spacing":{"blockGap":"1.125rem"}},"layout":{"type":"flex","justifyContent":"right","flexWrap":"wrap","verticalAlignment":"center"}} -->
                <div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
                    <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="font-weight:600"><a href="#"><?php esc_html_e('Without photo', 'kotlinskidev') ?></a></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"right"}} -->
                    <div class="wp-block-buttons"><!-- wp:button {"gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                        <div class="wp-block-button"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('Download CV', 'kotlinskidev') ?></a></div>
                        <!-- /wp:button -->
                    </div>
                    <!-- /wp:buttons -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->