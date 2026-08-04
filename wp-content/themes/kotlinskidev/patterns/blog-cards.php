<?php

/**
 * Title: Blog Cards Grid
 * Slug: kotlinskidev/blog-cards
 * Categories: blog, kotlinskidev/blog, themeslug/custom
 */
?>
<!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="padding-top:1.25rem;padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--40)">

    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontStyle":"normal","fontWeight":"800"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
    <h2 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-large-font-size" style="font-style:normal;font-weight:800"><?php esc_html_e('Latest Articles', 'kotlinskidev') ?></h2>
    <!-- /wp:heading -->

    <!-- wp:query {"queryId":5,"query":{"perPage":"6","pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","exclude":[],"sticky":"","inherit":false},"layout":{"type":"constrained"}} -->
    <div class="wp-block-query">
        <!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.875rem","right":"1.875rem"},"margin":{"bottom":"1.875rem"}},"border":{"radius":"1rem","width":"0.0625rem"}},"borderColor":"border-color","backgroundColor":"light-shade","layout":{"type":"constrained"}} -->
        <div class="wp-block-group has-border-color has-border-color-border-color has-light-shade-background-color has-background" style="border-width:0.0625rem;border-radius:1rem;margin-bottom:1.875rem;padding-top:1.875rem;padding-right:1.875rem;padding-bottom:1.875rem;padding-left:1.875rem">

            <!-- wp:post-featured-image {"isLink":true,"style":{"border":{"radius":"0.75rem"},"spacing":{"margin":{"bottom":"0.9375rem"}}}} /-->

            <!-- wp:group {"style":{"spacing":{"margin":{"bottom":"0.625rem"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
            <div class="wp-block-group" style="margin-bottom:0.625rem">
                <!-- wp:post-date {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} /-->
                <!-- wp:post-terms {"term":"category","className":"kt-gradient-text","fontSize":"small"} /-->
            </div>
            <!-- /wp:group -->

            <!-- wp:post-title {"level":3,"isLink":true,"style":{"spacing":{"margin":{"bottom":"0.625rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"large"} /-->

            <!-- wp:post-excerpt {"moreText":"Continue reading →","excerptLength":25,"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} /-->

            <!-- wp:group {"style":{"spacing":{"margin":{"top":"0.9375rem"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
            <div class="wp-block-group" style="margin-top:0.9375rem">
                <!-- wp:post-terms {"term":"post_tag","className":"kt-gradient-text","fontSize":"small"} /-->
                <!-- wp:buttons -->
                <div class="wp-block-buttons">
                    <!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                    <div class="wp-block-button is-style-outline">
                        <a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('Read More', 'kotlinskidev') ?></a>
                    </div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:group -->

        </div>
        <!-- /wp:group -->
        <!-- /wp:post-template -->

        <!-- wp:group {"style":{"spacing":{"margin":{"top":"2.5rem"}}},"layout":{"type":"flex","justifyContent":"center"}} -->
        <div class="wp-block-group" style="margin-top:2.5rem">
            <!-- wp:buttons -->
            <div class="wp-block-buttons">
                <!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                <div class="wp-block-button is-style-outline">
                    <a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button" href="<?php echo esc_url(home_url('/blog/')); ?>"><?php esc_html_e('View All Articles', 'kotlinskidev') ?></a>
                </div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->

    </div>
    <!-- /wp:query -->

</div>
<!-- /wp:group -->