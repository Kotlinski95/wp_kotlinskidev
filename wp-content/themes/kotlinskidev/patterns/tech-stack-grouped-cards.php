<?php
/**
 * Title: Tech Stack Grouped Cards
 * Slug: kotlinskidev/tech-stack-grouped-cards
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_groups = array(
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-applications.svg',
        'title' => __('Frameworks & libraries', 'kotlinskidev'),
        'items' => array(
            array('name' => __('React / Next.js', 'kotlinskidev'), 'note' => __('Component-based, fast rendering', 'kotlinskidev')),
            array('name' => __('Spartacus', 'kotlinskidev'), 'note' => __('SAP Commerce storefronts', 'kotlinskidev')),
            array('name' => __('Tailwind CSS', 'kotlinskidev'), 'note' => __('Utility-first styling', 'kotlinskidev')),
            array('name' => __('Jest / Testing Library', 'kotlinskidev'), 'note' => __('Unit and integration tests', 'kotlinskidev')),
        ),
    ),
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-websites.svg',
        'title' => __('E-commerce platforms', 'kotlinskidev'),
        'items' => array(
            array('name' => __('Shopify', 'kotlinskidev'), 'note' => __('Liquid themes and Hydrogen', 'kotlinskidev')),
            array('name' => __('WooCommerce', 'kotlinskidev'), 'note' => __('WordPress-based commerce', 'kotlinskidev')),
            array('name' => __('SAP Hybris', 'kotlinskidev'), 'note' => __('Enterprise commerce stack', 'kotlinskidev')),
        ),
    ),
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-optimization.svg',
        'title' => __('Languages & styling', 'kotlinskidev'),
        'items' => array(
            array('name' => __('TypeScript', 'kotlinskidev'), 'note' => __('Strict, scalable JavaScript', 'kotlinskidev')),
            array('name' => __('JavaScript ES6+', 'kotlinskidev'), 'note' => __('Core language', 'kotlinskidev')),
            array('name' => __('HTML5', 'kotlinskidev'), 'note' => __('Semantic, accessible markup', 'kotlinskidev')),
            array('name' => __('SCSS / CSS3', 'kotlinskidev'), 'note' => __('Modular, maintainable styling', 'kotlinskidev')),
        ),
    ),
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-analysis.svg',
        'title' => __('Dev tools & workflow', 'kotlinskidev'),
        'items' => array(
            array('name' => __('Git / GitHub / GitLab', 'kotlinskidev'), 'note' => __('Version control', 'kotlinskidev')),
            array('name' => __('Vite / Webpack', 'kotlinskidev'), 'note' => __('Modern build tooling', 'kotlinskidev')),
            array('name' => __('Storybook', 'kotlinskidev'), 'note' => __('Component documentation', 'kotlinskidev')),
            array('name' => __('ESLint / Prettier', 'kotlinskidev'), 'note' => __('Code quality and formatting', 'kotlinskidev')),
        ),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/tech-stack-grouped-cards","name":"Tech Stack Grouped Cards"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.25rem"}},"layout":{"type":"grid","minimumColumnWidth":"21.25rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_groups as $kotlinskidev_group) : ?>
        <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"1.75rem","bottom":"1.75rem","left":"1.75rem","right":"1.75rem"}}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:1.75rem;padding-right:1.75rem;padding-bottom:1.75rem;padding-left:1.75rem"><!-- wp:group {"style":{"spacing":{"blockGap":"0.875rem","margin":{"bottom":"1.375rem"}}},"layout":{"type":"flex","verticalAlignment":"center"}} -->
            <div class="wp-block-group" style="margin-bottom:1.375rem"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.75rem"}},"backgroundColor":"divider","layout":{"type":"flex","justifyContent":"center","verticalAlignment":"center"}} -->
                <div class="wp-block-group has-border-color has-divider-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.75rem"><!-- wp:image {"width":"1.375rem","height":"1.375rem","sizeSlug":"full","linkDestination":"none"} -->
                    <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_group['icon']) ?>" alt="" style="width:1.375rem;height:1.375rem" /></figure>
                    <!-- /wp:image -->
                </div>
                <!-- /wp:group -->

                <!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"700","letterSpacing":"0.14em"},"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
                <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php echo esc_html($kotlinskidev_group['title']) ?></h3>
                <!-- /wp:heading -->
            </div>
            <!-- /wp:group -->

            <?php foreach ($kotlinskidev_group['items'] as $kotlinskidev_i => $kotlinskidev_item) : ?>
            <!-- wp:group <?php echo $kotlinskidev_i > 0 ? '{"style":{"border":{"top":{"width":"1px","color":"var:preset|color|divider"}},"spacing":{"padding":{"top":"0.8125rem","bottom":"0.8125rem"}},"blockGap":"0.625rem"},"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"baseline"}}' : '{"style":{"spacing":{"padding":{"top":"0.8125rem","bottom":"0.8125rem"}},"blockGap":"0.625rem"},"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"baseline"}}'; ?> -->
            <div class="wp-block-group has-border-color" style="<?php echo $kotlinskidev_i > 0 ? 'border-top-color:var(--wp--preset--color--divider);border-top-width:1px;' : ''; ?>padding-top:0.8125rem;padding-bottom:0.8125rem"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"spacing":{"margin":{"top":"0","bottom":"0"}}}} -->
                <p style="margin-top:0;margin-bottom:0;font-weight:600"><?php echo esc_html($kotlinskidev_item['name']) ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_item['note']) ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
            <?php endforeach; ?>
        </div>
        <!-- /wp:group -->
        <?php endforeach; ?>
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
