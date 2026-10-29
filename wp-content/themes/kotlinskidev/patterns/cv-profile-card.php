<?php
/**
 * Title: CV Profile Card
 * Slug: kotlinskidev/cv-profile-card
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/about.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/cv-profile-card","name":"CV Profile Card"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.625rem"},"spacing":{"padding":{"top":"2.375rem","bottom":"2.375rem","left":"2.25rem","right":"2.25rem"}}},"backgroundColor":"background-alt","layout":{"type":"constrained"}} -->
    <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.625rem;padding-top:2.375rem;padding-right:2.25rem;padding-bottom:2.375rem;padding-left:2.25rem"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"2.125rem"},"margin":{"top":"0","bottom":"0"}}}} -->
        <div class="wp-block-columns are-vertically-aligned-center" style="margin-top:0;margin-bottom:0"><!-- wp:column {"verticalAlignment":"center","width":"9.375rem"} -->
            <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:9.375rem"><!-- wp:image {"id":5979,"width":"9.375rem","height":"9.375rem","scale":"cover","sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"50%"}}} -->
                <figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-5979" style="border-radius:50%;object-fit:cover;width:9.375rem;height:9.375rem" /></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"verticalAlignment":"center"} -->
            <div class="wp-block-column is-vertically-aligned-center">
                <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.14em"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}},"spacing":{"margin":{"bottom":"0.625rem"}}},"textColor":"primary","fontSize":"x-small"} -->
                <p class="has-primary-color has-text-color has-link-color has-x-small-font-size" style="margin-bottom:0.625rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php esc_html_e('Open to work · Remote, CET', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:heading {"level":2,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","lineHeight":"1.15"},"spacing":{"margin":{"top":"0","bottom":"0.25rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
                <h2 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-x-large-font-size" style="margin-top:0;margin-bottom:0.25rem;font-style:normal;font-weight:700;line-height:1.15"><?php esc_html_e('Adrian Kotliński', 'kotlinskidev') ?></h2>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1rem"}}},"textColor":"foreground-alt","fontSize":"medium"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-medium-font-size" style="margin-bottom:1rem"><?php esc_html_e('Web Developer · React, Next.js, commerce', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.375rem"}}},"textColor":"foreground-alt","fontSize":"small"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-bottom:1.375rem"><?php esc_html_e('Eight years building storefronts and content sites. The CV is one page, PDF, updated September 2026.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:buttons {"style":{"spacing":{"blockGap":"0.75rem","margin":{"bottom":"1.125rem"}}},"layout":{"type":"flex","justifyContent":"left"}} -->
                <div class="wp-block-buttons" style="margin-bottom:1.125rem"><!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                    <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('Download CV — PDF · 380 KB', 'kotlinskidev') ?></a></div>
                    <!-- /wp:button -->

                    <!-- wp:button {"textColor":"foreground-alt","style":{"border":{"width":"1px","color":"var:preset|color|divider"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"className":"is-style-outline"} -->
                    <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-foreground-alt-color has-text-color has-link-color has-border-color wp-element-button" style="border-color:var(--wp--preset--color--divider);border-width:1px"><?php esc_html_e('Career history', 'kotlinskidev') ?></a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><a href="#"><?php esc_html_e('Version without photo', 'kotlinskidev') ?></a> · <a href="#"><?php esc_html_e('LinkedIn', 'kotlinskidev') ?></a> · <a href="#"><?php esc_html_e('GitHub', 'kotlinskidev') ?></a> · <a href="#"><?php esc_html_e('Contact me', 'kotlinskidev') ?></a></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->