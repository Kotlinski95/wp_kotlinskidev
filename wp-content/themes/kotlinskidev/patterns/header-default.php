<?php

/**
 * Title: Header Default
 * Slug: kotlinskidev/header-default
 * Categories: header, kotlinskidev/header, themeslug/custom
 */

?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/header-default","name":"Header Default"},"tagName":"header","style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"100%"}} -->
<header class="wp-block-group" style="margin-top:0;margin-bottom:0"><!-- wp:group {"style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"top":"0px","bottom":"0px","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1180px"}} -->
    <div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:0px;padding-right:var(--wp--preset--spacing--40);padding-bottom:0px;padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
        <div class="wp-block-group">
            <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30","margin":{"top":"0","bottom":"0"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
            <div class="wp-block-group" style="margin-top:0;margin-bottom:0">
                <!-- wp:site-logo {"width":86,"height":64,"shouldSyncIcon":false} /-->
            </div>
            <!-- /wp:group -->

            <!-- wp:shortcode -->
            [theme_shortcode_here]
            <!-- /wp:shortcode -->

            <!-- wp:navigation {"textColor":"heading-color","overlayBackgroundColor":"secondary-bg","overlayTextColor":"heading-color","className":"kotlinskidev-navigation","style":{"typography":{"textTransform":"none","fontStyle":"normal","fontWeight":"500","lineHeight":"2","fontSize":"18px"},"spacing":{"blockGap":"24px"}},"layout":{"type":"flex","justifyContent":"center"}} /-->

            <!-- wp:shortcode -->
            [language_shortcode_here]
            <!-- /wp:shortcode -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</header>
<!-- /wp:group -->