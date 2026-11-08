<?php
/**
 * Title: Service Icons Grid
 * Slug: kotlinskidev/service-icons-grid
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icons = array(
    $kotlinskidev_url . 'assets/icons/services/icon-websites.svg',
    $kotlinskidev_url . 'assets/icons/services/icon-optimization.svg',
    $kotlinskidev_url . 'assets/icons/services/icon-applications.svg',
    $kotlinskidev_url . 'assets/icons/services/icon-analysis.svg',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/service-icons-grid","name":"Service Icons Grid"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.625rem"}},"layout":{"type":"grid","minimumColumnWidth":"16.875rem"}} -->
    <div class="wp-block-group"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1rem"},"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.875rem","right":"1.875rem"},"blockGap":"0.625rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1rem;padding-top:1.875rem;padding-right:1.875rem;padding-bottom:1.875rem;padding-left:1.875rem"><!-- wp:image {"width":"3.5rem","height":"3.5rem","lightbox":{"enabled":false},"sizeSlug":"full","linkDestination":"none"} -->
            <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_icons[0]) ?>" alt="" style="width:3.5rem;height:3.5rem" /></figure>
            <!-- /wp:image -->

            <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"},"spacing":{"margin":{"top":"0.375rem","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} -->
            <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-medium-font-size" style="margin-top:0.375rem;margin-bottom:0;font-style:normal;font-weight:700"><?php esc_html_e('Websites', 'kotlinskidev') ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('Design and build sites that hold together at every breakpoint, from first commit to launch.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

        <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1rem"},"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.875rem","right":"1.875rem"},"blockGap":"0.625rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1rem;padding-top:1.875rem;padding-right:1.875rem;padding-bottom:1.875rem;padding-left:1.875rem"><!-- wp:image {"width":"3.5rem","height":"3.5rem","lightbox":{"enabled":false},"sizeSlug":"full","linkDestination":"none"} -->
            <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_icons[1]) ?>" alt="" style="width:3.5rem;height:3.5rem" /></figure>
            <!-- /wp:image -->

            <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"},"spacing":{"margin":{"top":"0.375rem","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} -->
            <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-medium-font-size" style="margin-top:0.375rem;margin-bottom:0;font-style:normal;font-weight:700"><?php esc_html_e('Page optimization', 'kotlinskidev') ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('LCP, INP and CLS brought into the green, with before-and-after field data to prove it.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

        <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1rem"},"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.875rem","right":"1.875rem"},"blockGap":"0.625rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1rem;padding-top:1.875rem;padding-right:1.875rem;padding-bottom:1.875rem;padding-left:1.875rem"><!-- wp:image {"width":"3.5rem","height":"3.5rem","lightbox":{"enabled":false},"sizeSlug":"full","linkDestination":"none"} -->
            <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_icons[2]) ?>" alt="" style="width:3.5rem;height:3.5rem" /></figure>
            <!-- /wp:image -->

            <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"},"spacing":{"margin":{"top":"0.375rem","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} -->
            <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-medium-font-size" style="margin-top:0.375rem;margin-bottom:0;font-style:normal;font-weight:700"><?php esc_html_e('Internet applications', 'kotlinskidev') ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('Composable, component-based applications built with React, Next.js and Node.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

        <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1rem"},"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.875rem","right":"1.875rem"},"blockGap":"0.625rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1rem;padding-top:1.875rem;padding-right:1.875rem;padding-bottom:1.875rem;padding-left:1.875rem"><!-- wp:image {"width":"3.5rem","height":"3.5rem","lightbox":{"enabled":false},"sizeSlug":"full","linkDestination":"none"} -->
            <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_icons[3]) ?>" alt="" style="width:3.5rem;height:3.5rem" /></figure>
            <!-- /wp:image -->

            <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"},"spacing":{"margin":{"top":"0.375rem","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"medium"} -->
            <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-medium-font-size" style="margin-top:0.375rem;margin-bottom:0;font-style:normal;font-weight:700"><?php esc_html_e('Analysis and reporting', 'kotlinskidev') ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('A prioritised, measured list of what to fix first, with the cost of every problem attached.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->