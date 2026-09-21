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
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-tech-tiles {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(13.125rem, 1fr));
            gap: 0.875rem;
        }
        .kotlinskidev-tech-tiles__tile {
            display: flex;
            gap: 0.875rem;
            align-items: flex-start;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1rem;
            padding: 1.25rem;
            transition: border-color 0.25s ease, background 0.25s ease;
        }
        .kotlinskidev-tech-tiles__tile:hover {
            border-color: var(--wp--preset--color--primary);
            background: var(--wp--preset--color--surface);
        }
        .kotlinskidev-tech-tiles__icon {
            flex: none;
            width: 2.375rem;
            height: 2.375rem;
            border-radius: 0.6875rem;
            background: var(--wp--preset--color--surface);
            border: 1px solid var(--wp--preset--color--divider);
            display: grid;
            place-items: center;
        }
        .kotlinskidev-tech-tiles__icon img {
            width: 1.25rem;
            height: 1.25rem;
        }
        .kotlinskidev-tech-tiles__name {
            font-size: 0.9375rem;
            font-weight: 600;
            line-height: 1.3;
            color: var(--wp--preset--color--foreground);
        }
        .kotlinskidev-tech-tiles__note {
            font-size: 0.8125rem;
            color: var(--wp--preset--color--foreground-alt);
            margin-top: 0.1875rem;
            line-height: 1.45;
        }
    </style>
    <div class="kotlinskidev-tech-tiles">
        <?php foreach ($kotlinskidev_tiles as $kotlinskidev_tile) : ?>
        <div class="kotlinskidev-tech-tiles__tile">
            <div class="kotlinskidev-tech-tiles__icon">
                <img src="<?php echo esc_url($kotlinskidev_icons_dir . $kotlinskidev_tile['icon']) ?>" alt="" loading="lazy" />
            </div>
            <div>
                <div class="kotlinskidev-tech-tiles__name"><?php echo esc_html($kotlinskidev_tile['name']) ?></div>
                <div class="kotlinskidev-tech-tiles__note"><?php echo esc_html($kotlinskidev_tile['note']) ?></div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->