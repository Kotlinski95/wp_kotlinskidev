<?php
/**
 * Title: Hero Banner
 * Slug: kotlinskidev/hero-banner
 * Categories: banner, kotlinskidev/banners
 */
$background_url = esc_url(get_theme_file_uri('assets/images/hero-background.webp'));
?>
<!-- wp:cover {"url":"<?php echo $background_url; ?>","id":3838,"dimRatio":50,"overlayColor":"contrast","textColor":"light-color","align":"full"} -->
<div class="pattern-hero-banner wp-block-cover alignfull has-text-color"><span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim"></span>
    <img class="wp-block-cover__image-background wp-image-3838" alt="" src="<?php echo esc_url(get_theme_file_uri('assets/images/hero-background.webp')) ?>" data-object-fit="cover" />
    <div class="wp-block-cover__inner-container"><!-- wp:group {"style":{"spacing":{"blockGap":"2.5rem"}},"layout":{"type":"constrained","wideSize":"%","contentSize":"75%"}} -->
        <div class="wp-block-group"><!-- wp:heading {"textAlign":"center","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
            <h2 class="wp-block-heading has-text-align-center has-light-color-color has-text-color has-link-color"><?php esc_html_e('Welcome to My Site', 'kotlinskidev') ?></h2>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"align":"center","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
            <p class="has-text-align-center has-light-color-color has-text-color has-link-color"><?php esc_html_e('Home Banner description', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
            <div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('See My Popular Posts →', 'kotlinskidev') ?></a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
</div>
<!-- /wp:cover -->