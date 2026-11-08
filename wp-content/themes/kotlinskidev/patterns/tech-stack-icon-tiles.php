<?php
/**
 * Title: Tech Stack Icon Tiles
 * Slug: kotlinskidev/tech-stack-icon-tiles
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icons_dir = $kotlinskidev_url . 'assets/icons/tech-stack/';
$kotlinskidev_tiles = array(
    array('icon' => 'component.svg', 'name' => __('React / Next.js', 'kotlinskidev'), 'note' => __('Component UI, SSR', 'kotlinskidev')),
    array('icon' => 'layers.svg', 'name' => __('Angular / Spartacus', 'kotlinskidev'), 'note' => __('SAP Commerce storefronts', 'kotlinskidev')),
    array('icon' => 'braces.svg', 'name' => __('TypeScript', 'kotlinskidev'), 'note' => __('Strict mode by default', 'kotlinskidev')),
    array('icon' => 'gauge.svg', 'name' => __('Core Web Vitals', 'kotlinskidev'), 'note' => __('Field data, budgets', 'kotlinskidev')),
    array('icon' => 'cart.svg', 'name' => __('Shopify', 'kotlinskidev'), 'note' => __('Liquid and Hydrogen', 'kotlinskidev')),
    array('icon' => 'store.svg', 'name' => __('WooCommerce', 'kotlinskidev'), 'note' => __('WordPress commerce', 'kotlinskidev')),
    array('icon' => 'plug.svg', 'name' => __('SAP Hybris', 'kotlinskidev'), 'note' => __('Enterprise integrations', 'kotlinskidev')),
    array('icon' => 'branch.svg', 'name' => __('Git / GitHub', 'kotlinskidev'), 'note' => __('Version control, reviews', 'kotlinskidev')),
    array('icon' => 'pkg.svg', 'name' => __('Vite / Webpack', 'kotlinskidev'), 'note' => __('Builds and bundle budgets', 'kotlinskidev')),
    array('icon' => 'book.svg', 'name' => __('Storybook', 'kotlinskidev'), 'note' => __('Component documentation', 'kotlinskidev')),
    array('icon' => 'shield.svg', 'name' => __('ESLint / Prettier', 'kotlinskidev'), 'note' => __('Quality and formatting', 'kotlinskidev')),
    array('icon' => 'terminal.svg', 'name' => __('Jest / Testing Library', 'kotlinskidev'), 'note' => __('Unit and integration tests', 'kotlinskidev')),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/tech-stack-icon-tiles","name":"Tech Stack Icon Tiles"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"0.875rem"}},"layout":{"type":"grid","minimumColumnWidth":"13.125rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_tiles as $kotlinskidev_tile) : ?>
        <!-- wp:group {"className":"kt-link-card kt-link-card--hover-surface","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1rem"},"spacing":{"padding":{"top":"1.25rem","bottom":"1.25rem","left":"1.25rem","right":"1.25rem"},"blockGap":"0.875rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","verticalAlignment":"top"}} -->
        <div class="wp-block-group kt-link-card kt-link-card--hover-surface has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1rem;padding-top:1.25rem;padding-right:1.25rem;padding-bottom:1.25rem;padding-left:1.25rem"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.6875rem"}},"backgroundColor":"surface","layout":{"type":"flex","justifyContent":"center","verticalAlignment":"center"}} -->
            <div class="wp-block-group has-border-color has-surface-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.6875rem"><!-- wp:image {"width":"1.25rem","height":"1.25rem","sizeSlug":"full","linkDestination":"none"} -->
                <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_icons_dir . $kotlinskidev_tile['icon']) ?>" alt="" style="width:1.25rem;height:1.25rem" /></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:group -->

            <!-- wp:group {"style":{"spacing":{"blockGap":"0.1875rem"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
            <div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"small"} -->
                <p style="margin-top:0;margin-bottom:0;font-weight:600" class="has-small-font-size"><?php echo esc_html($kotlinskidev_tile['name']) ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_tile['note']) ?></p>
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
