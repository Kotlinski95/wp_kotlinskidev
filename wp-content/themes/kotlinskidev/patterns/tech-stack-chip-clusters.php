<?php
/**
 * Title: Tech Stack Chip Clusters
 * Slug: kotlinskidev/tech-stack-chip-clusters
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_clusters = array(
    array(
        'label' => __('Frameworks', 'kotlinskidev'),
        'chips' => array('React', 'Next.js', 'Angular', 'Spartacus', 'Tailwind CSS', 'Jest'),
    ),
    array(
        'label' => __('Commerce', 'kotlinskidev'),
        'chips' => array('Shopify', 'Hydrogen', 'WooCommerce', 'SAP Hybris'),
    ),
    array(
        'label' => __('Languages', 'kotlinskidev'),
        'chips' => array('TypeScript', 'JavaScript', 'HTML5', 'SCSS', 'CSS3'),
    ),
    array(
        'label' => __('Tooling', 'kotlinskidev'),
        'chips' => array('Git', 'GitHub', 'GitLab', 'Vite', 'Webpack', 'Storybook', 'ESLint', 'Prettier'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/tech-stack-chip-clusters","name":"Tech Stack Chip Clusters"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.375rem"},"spacing":{"padding":{"top":"2rem","bottom":"2rem","left":"2rem","right":"2rem"},"blockGap":"1.625rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
    <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.375rem;padding-top:2rem;padding-right:2rem;padding-bottom:2rem;padding-left:2rem">
        <?php foreach ($kotlinskidev_clusters as $kotlinskidev_i => $kotlinskidev_cluster) : ?>
        <!-- wp:group <?php echo $kotlinskidev_i > 0 ? '{"style":{"border":{"top":{"width":"1px","color":"var:preset|color|divider"}},"spacing":{"padding":{"top":"1.625rem"},"blockGap":"1.125rem"}},"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"baseline"}}' : '{"style":{"spacing":{"blockGap":"1.125rem"}},"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"baseline"}}'; ?> -->
        <div class="wp-block-group has-border-color" <?php echo $kotlinskidev_i > 0 ? 'style="border-top-color:var(--wp--preset--color--divider);border-top-width:1px;padding-top:1.625rem"' : ''; ?>><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.14em"},"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
            <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php echo esc_html($kotlinskidev_cluster['label']) ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:group {"style":{"spacing":{"blockGap":"0.5625rem"}},"layout":{"type":"flex","flexWrap":"wrap"}} -->
            <div class="wp-block-group">
                <?php foreach ($kotlinskidev_cluster['chips'] as $kotlinskidev_chip) : ?>
                <!-- wp:paragraph {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"999px"},"spacing":{"padding":{"top":"0.4375rem","bottom":"0.4375rem","left":"0.9375rem","right":"0.9375rem"},"margin":{"top":"0","bottom":"0"}}},"backgroundColor":"surface","fontSize":"small"} -->
                <p class="has-surface-background-color has-background has-small-font-size" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:999px;margin-top:0;margin-bottom:0;padding-top:0.4375rem;padding-right:0.9375rem;padding-bottom:0.4375rem;padding-left:0.9375rem"><?php echo esc_html($kotlinskidev_chip) ?></p>
                <!-- /wp:paragraph -->
                <?php endforeach; ?>
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
        <?php endforeach; ?>
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
