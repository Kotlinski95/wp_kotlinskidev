<?php
/**
 * Title: 404 Template
 * Slug: kotlinskidev/template-404
 * Categories: pages, kotlinskidev/pages, themeslug/custom
 */
?>
<!-- wp:group {"tagName":"main","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"margin":{"top":"6.25rem","bottom":"0"}}},"backgroundColor":"background-alt","layout":{"type":"constrained","contentSize":"100%"}} -->
<main class="main-wrapper wp-block-group has-background-alt-background-color has-background" style="margin-top:6.25rem;margin-bottom:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"1rem"},"blockGap":"var:preset|spacing|3.125rem","margin":{"top":"0","bottom":"0"}}},"backgroundColor":"light-shade","layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group has-light-shade-background-color has-background" style="margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:1rem">
        <!-- wp:image {"align":"center","width":"25rem","sizeSlug":"full","linkDestination":"none"} -->
        <figure class="wp-block-image aligncenter size-full is-resized"><img src="<?php echo esc_url(get_template_directory_uri() . '/assets/images/404.webp'); ?>" alt="404" style="width:25rem" /></figure>
        <!-- /wp:image -->

        <!-- wp:heading {"textAlign":"center","level":1,"className":"kotlinskidev-404-title","style":{"typography":{"fontStyle":"normal","fontWeight":"600","lineHeight":"1.1"}},"textColor":"foreground-alt"} -->
        <h1 class="wp-block-heading has-text-align-center has-foreground-alt-color has-text-color kotlinskidev-404-title" style="font-style:normal;font-weight:600;line-height:1.1;">
            <?php esc_html_e('OOPS! Page Not Found!', 'kotlinskidev') ?>
        </h1>
        <!-- /wp:heading -->

        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"2rem","bottom":"1.5rem"}}}} -->
        <div class="wp-block-buttons" style="margin-top:2rem;margin-bottom:1.5rem"><!-- wp:button {"className":"is-style-outline"} -->
            <div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url(home_url('/')); ?>"><?php esc_html_e('Go to Homepage', 'kotlinskidev'); ?></a></div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem","right":"var:preset|spacing|2.5rem","left":"var:preset|spacing|2.5rem"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
    <div class="wp-block-group" style="padding-top:1.25rem;padding-right:var(--wp--preset--spacing--2-5-rem);padding-bottom:1.25rem;padding-left:var(--wp--preset--spacing--2-5-rem)"><!-- wp:columns -->
        <div class="wp-block-columns"><!-- wp:column -->
            <div class="wp-block-column"><!-- wp:heading {"style":{"typography":{"fontStyle":"normal","fontWeight":"500"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <h2 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="font-style:normal;font-weight:500"><?php esc_html_e('Helpful Link', 'kotlinskidev') ?></h2>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="line-height:1.5"><?php esc_html_e('Something went wrong! We couldn’t find the page you were looking for. But don’t worry, we’ve got some other Links that might be helpful:', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->

        <!-- wp:columns {"style":{"spacing":{"margin":{"top":"2.5rem"}}}} -->
        <div class="wp-block-columns" style="margin-top:2.5rem">
            <!-- wp:column -->
            <div class="wp-block-column"><!-- wp:heading {"level":4,"style":{"typography":{"fontStyle":"normal","fontWeight":"500"},"spacing":{"margin":{"bottom":"var:preset|spacing|3.125rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:var(--wp--preset--spacing--3-125-rem);font-style:normal;font-weight:500"><?php echo esc_html_x('Pages', '404', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:page-list {"className":"is-style-kotlinskidev-page-list-bullet-hide-style is-style-kotlinskidev-page-list-bullet-hide-style","style":{"typography":{"lineHeight":"2"}}} /-->
            </div>
            <!-- /wp:column -->

            <!-- wp:column -->
            <div class="wp-block-column"><!-- wp:heading {"level":4,"style":{"typography":{"fontStyle":"normal","fontWeight":"500"},"spacing":{"margin":{"bottom":"var:preset|spacing|3.125rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:var(--wp--preset--spacing--3-125-rem);font-style:normal;font-weight:500"><?php echo esc_html_x('Categories', '404', 'kotlinskidev') ?></h4>
                <!-- /wp:heading -->

                <!-- wp:categories {"className":"is-style-kotlinskidev-categories-bullet-hide-style is-style-kotlinskidev-categories-bullet-hide-style","style":{"typography":{"lineHeight":"2"}}} /-->
            </div>
            <!-- /wp:column -->

            <!-- wp:column -->
            <div class="wp-block-column"><!-- wp:heading {"level":4,"style":{"typography":{"fontStyle":"normal","fontWeight":"500"},"spacing":{"margin":{"bottom":"var:preset|spacing|3.125rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <h4 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:var(--wp--preset--spacing--3-125-rem);font-style:normal;font-weight:500">
                    <?php echo esc_html_x('Posts', '404', 'kotlinskidev'); ?>
                </h4>
                <!-- /wp:heading -->

                <!-- wp:query {"queryId":0,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false},"className":"kotlinskidev-404-post-list"} -->
                <div class="wp-block-query kotlinskidev-404-post-list"><!-- wp:post-template {"style":{"spacing":{"blockGap":"0.5rem"}}} -->
                    <!-- wp:post-title {"isLink":true,"style":{"typography":{"lineHeight":"2"}},"fontSize":"small"} /-->
                    <!-- /wp:post-template -->
                </div>
                <!-- /wp:query -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</main>
<!-- /wp:group -->
