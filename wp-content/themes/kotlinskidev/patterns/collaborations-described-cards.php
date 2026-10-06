<?php
/**
 * Title: Collaborations Described Cards
 * Slug: kotlinskidev/collaborations-described-cards
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icon = $kotlinskidev_url . 'assets/images/service_icon.webp';
$kotlinskidev_collaborations = array(
    array(
        'meta'  => __('E-commerce · 2025', 'kotlinskidev'),
        'title' => __('Headless storefront migration', 'kotlinskidev'),
        'desc'  => __('Moved a Shopify theme onto Next.js; checkout time halved.', 'kotlinskidev'),
    ),
    array(
        'meta'  => __('SaaS · 2024', 'kotlinskidev'),
        'title' => __('Dashboard performance work', 'kotlinskidev'),
        'desc'  => __('Cut initial bundle by 62% and made the table view usable on mobile.', 'kotlinskidev'),
    ),
    array(
        'meta'  => __('Agency · 2024', 'kotlinskidev'),
        'title' => __('Frontend for six client sites', 'kotlinskidev'),
        'desc'  => __('A shared component library the agency’s team still builds on.', 'kotlinskidev'),
    ),
    array(
        'meta'  => __('Publisher · 2023', 'kotlinskidev'),
        'title' => __('Core Web Vitals rescue', 'kotlinskidev'),
        'desc'  => __('All three metrics into the green across 40k article pages.', 'kotlinskidev'),
    ),
    array(
        'meta'  => __('Marketplace · 2023', 'kotlinskidev'),
        'title' => __('Angular to Next.js rewrite', 'kotlinskidev'),
        'desc'  => __('Incremental migration with no downtime and no feature freeze.', 'kotlinskidev'),
    ),
    array(
        'meta'  => __('Startup · 2022', 'kotlinskidev'),
        'title' => __('Marketing site from scratch', 'kotlinskidev'),
        'desc'  => __('Design, build and CMS in five weeks, launched on time.', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/collaborations-described-cards","name":"Collaborations Described Cards"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.25rem"}},"layout":{"type":"grid","minimumColumnWidth":"18.75rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_collaborations as $kotlinskidev_collab) : ?>
        <!-- wp:group {"groupLinkUrl":"#","className":"kt-link-card kt-link-card--hover-surface","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"1.625rem","bottom":"1.625rem","left":"1.625rem","right":"1.625rem"},"blockGap":"1rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group kt-link-card kt-link-card--hover-surface has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:1.625rem;padding-right:1.625rem;padding-bottom:1.625rem;padding-left:1.625rem"><!-- wp:image {"width":"2.75rem","height":"2.75rem","sizeSlug":"full","linkDestination":"none","className":"kt-logo-dim"} -->
            <figure class="wp-block-image size-full is-resized kt-logo-dim"><img src="<?php echo esc_url($kotlinskidev_icon) ?>" alt="" style="width:2.75rem;height:2.75rem" /></figure>
            <!-- /wp:image -->

            <!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
            <div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.14em"},"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"x-small"} -->
                <p class="has-primary-color has-text-color has-link-color has-x-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php echo esc_html($kotlinskidev_collab['meta']) ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"medium"} -->
                <h3 class="wp-block-heading has-medium-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_collab['title']) ?></h3>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_collab['desc']) ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

            <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"auto","bottom":"0"}},"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
            <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="margin-top:auto;margin-bottom:0;font-weight:600"><?php esc_html_e('Read more →', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <?php endforeach; ?>
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
