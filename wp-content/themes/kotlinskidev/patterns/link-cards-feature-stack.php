<?php
/**
 * Title: Link Cards Feature Stack
 * Slug: kotlinskidev/link-cards-feature-stack
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_feature_image = $kotlinskidev_url . 'assets/images/link-cards/img-project.svg';
$kotlinskidev_stack = array(
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-applications.svg',
        'title' => __('All services', 'kotlinskidev'),
        'desc'  => __('Audits, builds, optimization and ongoing maintenance.', 'kotlinskidev'),
        'link'  => __('Browse services →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-analysis.svg',
        'title' => __('Free performance check', 'kotlinskidev'),
        'desc'  => __('Send a URL and get the three biggest wins back.', 'kotlinskidev'),
        'link'  => __('Request a check →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-websites.svg',
        'title' => __('Blog & notes', 'kotlinskidev'),
        'desc'  => __('Practices I use, written up as I go.', 'kotlinskidev'),
        'link'  => __('Read the blog →', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/link-cards-feature-stack","name":"Link Cards Feature Stack"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.5rem"}},"layout":{"type":"grid","minimumColumnWidth":"18.75rem"}} -->
    <div class="wp-block-group"><!-- wp:group {"groupLinkUrl":"#","className":"kt-link-card","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.375rem"},"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"0"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group kt-link-card has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.375rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:image {"aspectRatio":"16/9","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
            <figure class="wp-block-image size-full"><img src="<?php echo esc_url($kotlinskidev_feature_image) ?>" alt="" style="aspect-ratio:16/9;object-fit:cover" /></figure>
            <!-- /wp:image -->

            <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.875rem","right":"1.875rem"},"blockGap":"0.875rem"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
            <div class="wp-block-group" style="padding-top:1.875rem;padding-right:1.875rem;padding-bottom:1.875rem;padding-left:1.875rem"><!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.2em"},"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"x-small"} -->
                <p class="has-primary-color has-text-color has-link-color has-x-small-font-size" style="margin-top:0;margin-bottom:0;letter-spacing:0.2em;text-transform:uppercase"><?php esc_html_e('Featured project', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"big"} -->
                <h3 class="wp-block-heading has-big-font-size" style="margin-top:0;margin-bottom:0"><?php esc_html_e('Shopify storefront rebuilt on Next.js', 'kotlinskidev') ?></h3>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-top:0;margin-bottom:0"><?php esc_html_e('Checkout time cut in half and a 41-point Lighthouse gain — the full write-up covers the architecture and the trade-offs.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","flexWrap":"wrap"}} -->
                <div class="wp-block-group">
                    <?php foreach (array('Next.js', 'Shopify', 'Edge caching') as $kotlinskidev_tag) : ?>
                    <!-- wp:paragraph {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"999px"},"spacing":{"padding":{"top":"0.3125rem","bottom":"0.3125rem","left":"0.75rem","right":"0.75rem"},"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:999px;margin-top:0;margin-bottom:0;padding-top:0.3125rem;padding-right:0.75rem;padding-bottom:0.3125rem;padding-left:0.75rem"><?php echo esc_html($kotlinskidev_tag) ?></p>
                    <!-- /wp:paragraph -->
                    <?php endforeach; ?>
                </div>
                <!-- /wp:group -->

                <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"auto","bottom":"0"}},"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary"} -->
                <p class="has-primary-color has-text-color has-link-color" style="margin-top:auto;margin-bottom:0;font-weight:600"><?php esc_html_e('Read the case study →', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->

        <!-- wp:group {"style":{"spacing":{"blockGap":"1.5rem"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group">
            <?php foreach ($kotlinskidev_stack as $kotlinskidev_row) : ?>
            <!-- wp:group {"groupLinkUrl":"#","className":"kt-link-card kt-link-card--hover-surface","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"1.625rem","bottom":"1.625rem","left":"1.625rem","right":"1.625rem"},"blockGap":"1.125rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","verticalAlignment":"top"}} -->
            <div class="wp-block-group kt-link-card kt-link-card--hover-surface has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:1.625rem;padding-right:1.625rem;padding-bottom:1.625rem;padding-left:1.625rem"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.875rem"}},"backgroundColor":"divider","layout":{"type":"flex","justifyContent":"center","verticalAlignment":"center"}} -->
                <div class="wp-block-group has-border-color has-divider-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.875rem"><!-- wp:image {"width":"1.625rem","height":"1.625rem","sizeSlug":"full","linkDestination":"none"} -->
                    <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_row['icon']) ?>" alt="" style="width:1.625rem;height:1.625rem" /></figure>
                    <!-- /wp:image -->
                </div>
                <!-- /wp:group -->

                <!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
                <div class="wp-block-group"><!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"medium"} -->
                    <h3 class="wp-block-heading has-medium-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_row['title']) ?></h3>
                    <!-- /wp:heading -->

                    <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_row['desc']) ?></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
                    <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600"><?php echo esc_html($kotlinskidev_row['link']) ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
            <?php endforeach; ?>
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
