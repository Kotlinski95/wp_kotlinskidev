<?php

/**
 * Title: Call to Action
 * Slug: kotlinskidev/cta-block
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/cta-block","name":"Call to Action"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"gradient":"gradient-bottom-left","layout":{"type":"constrained","contentSize":"1180px"}} -->
<div class="wp-block-group has-gradient-bottom-left-gradient-background has-background">
    <!-- wp:cover {"align":"full","textColor":"light-color","isUserOverlayColor":true,"minHeight":360,"gradient":"gradient-block-top-right","layout":{"type":"constrained","contentSize":"1180px"}} -->
    <div class="wp-block-cover alignfull has-text-color" style="min-height:360px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-100 has-background-dim has-background-gradient has-gradient-block-top-right-gradient-background"></span>
        <div class="wp-block-cover__inner-container">
            <!-- wp:columns {"verticalAlignment":"center","minHeight":360,"style":{"spacing":{"blockGap":{"left":"64px"}}}} -->
            <div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":"","style":{"spacing":{"blockGap":"var:preset|spacing|40"}}} -->
                <div class="wp-block-column is-vertically-aligned-center"><!-- wp:heading {"textAlign":"left","level":1,"style":{"typography":{"fontStyle":"normal","fontWeight":"800","fontSize":"48px","lineHeight":"1.4"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary"} -->
                    <h1 class="wp-block-heading has-text-align-left has-primary-color has-text-color has-link-color" style="font-size:48px;font-style:normal;font-weight:800;line-height:1.4"><?php esc_html_e('Boost Your Online Presence Today!', 'kotlinskidev') ?></h1>
                    <!-- /wp:heading -->

                    <!-- wp:paragraph {"align":"left","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} -->
                    <p class="has-text-align-left has-foreground-alt-color has-text-color has-link-color has-medium-font-size"><?php esc_html_e('Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.', 'kotlinskidev') ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:column -->

                <!-- wp:column {"verticalAlignment":"center","width":"25%"} -->
                <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:25%">
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
        </div>
    </div>
    <!-- /wp:cover -->
</div>
<!-- /wp:group -->