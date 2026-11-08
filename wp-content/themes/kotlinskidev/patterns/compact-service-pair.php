<?php
/**
 * Title: Compact Service Pair
 * Slug: kotlinskidev/compact-service-pair
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_service_icons = $kotlinskidev_url . 'assets/icons/services/';
$kotlinskidev_images = array(
    $kotlinskidev_service_icons . 'icon-optimization.svg',
    $kotlinskidev_service_icons . 'icon-analysis.svg',
    $kotlinskidev_service_icons . 'icon-applications.svg',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/compact-service-pair","name":"Compact Service Pair"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.5rem"}},"layout":{"type":"grid","minimumColumnWidth":"18.75rem"}} -->
    <div class="wp-block-group"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"2.125rem","bottom":"2.125rem","left":"2.125rem","right":"2.125rem"},"blockGap":"1.125rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:2.125rem;padding-right:2.125rem;padding-bottom:2.125rem;padding-left:2.125rem"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.875rem"},"dimensions":{"minHeight":"3.25rem"},"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}},"gradient":"gradient-two","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center","verticalAlignment":"center"}} -->
            <div class="wp-block-group has-border-color has-gradient-two-gradient-background has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.875rem;min-height:3.25rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:image {"width":"1.625rem","height":"1.625rem","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" style="object-fit:cover;width:1.625rem;height:1.625rem" /></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:group -->

            <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","lineHeight":"1.2"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"big"} -->
            <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="font-style:normal;font-weight:700;line-height:1.2"><?php esc_html_e('Optimization of existing pages', 'kotlinskidev') ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('Performance, SEO and accessibility passes on sites already in production — measured before and after.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
            <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="font-weight:600"><a href="#"><?php esc_html_e('Check more →', 'kotlinskidev') ?></a></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

        <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"2.125rem","bottom":"2.125rem","left":"2.125rem","right":"2.125rem"},"blockGap":"1.125rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:2.125rem;padding-right:2.125rem;padding-bottom:2.125rem;padding-left:2.125rem"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.875rem"},"dimensions":{"minHeight":"3.25rem"},"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}},"gradient":"gradient-two","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center","verticalAlignment":"center"}} -->
            <div class="wp-block-group has-border-color has-gradient-two-gradient-background has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.875rem;min-height:3.25rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:image {"width":"1.625rem","height":"1.625rem","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[1]) ?>" alt="" style="object-fit:cover;width:1.625rem;height:1.625rem" /></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:group -->

            <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","lineHeight":"1.2"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"big"} -->
            <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="font-style:normal;font-weight:700;line-height:1.2"><?php esc_html_e('Performance analysis', 'kotlinskidev') ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('A full audit of scripts, payloads and render path, with a prioritised list of what to fix first.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
            <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="font-weight:600"><a href="#"><?php esc_html_e('Check more →', 'kotlinskidev') ?></a></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

        <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"2.125rem","bottom":"2.125rem","left":"2.125rem","right":"2.125rem"},"blockGap":"1.125rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:2.125rem;padding-right:2.125rem;padding-bottom:2.125rem;padding-left:2.125rem"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.875rem"},"dimensions":{"minHeight":"3.25rem"},"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}},"gradient":"gradient-two","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center","verticalAlignment":"center"}} -->
            <div class="wp-block-group has-border-color has-gradient-two-gradient-background has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.875rem;min-height:3.25rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:image {"width":"1.625rem","height":"1.625rem","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_images[2]) ?>" alt="" style="object-fit:cover;width:1.625rem;height:1.625rem" /></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:group -->

            <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","lineHeight":"1.2"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"big"} -->
            <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="font-style:normal;font-weight:700;line-height:1.2"><?php esc_html_e('Applications', 'kotlinskidev') ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('Next.js and Angular applications, from first commit to deployment pipeline.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
            <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="font-weight:600"><a href="#"><?php esc_html_e('Check more →', 'kotlinskidev') ?></a></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->