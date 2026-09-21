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
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-tech-chips {
            display: flex;
            flex-direction: column;
            gap: 1.625rem;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.375rem;
            padding: 2rem;
        }
        .kotlinskidev-tech-chips__row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
            gap: 1.125rem 2.25rem;
            align-items: baseline;
        }
        .kotlinskidev-tech-chips__row:not(:first-child) {
            padding-top: 1.625rem;
            border-top: 1px solid var(--wp--preset--color--divider);
        }
        .kotlinskidev-tech-chips__label {
            font-size: 0.78125rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--wp--preset--color--primary);
        }
        .kotlinskidev-tech-chips__pills {
            grid-column: span 2;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5625rem;
        }
        .kotlinskidev-tech-chips__pill {
            font-size: 0.90625rem;
            color: var(--wp--preset--color--foreground);
            background: var(--wp--preset--color--surface);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 999px;
            padding: 0.4375rem 0.9375rem;
        }
    </style>
    <div class="kotlinskidev-tech-chips">
        <?php foreach ($kotlinskidev_clusters as $kotlinskidev_cluster) : ?>
        <div class="kotlinskidev-tech-chips__row">
            <div class="kotlinskidev-tech-chips__label"><?php echo esc_html($kotlinskidev_cluster['label']) ?></div>
            <div class="kotlinskidev-tech-chips__pills">
                <?php foreach ($kotlinskidev_cluster['chips'] as $kotlinskidev_chip) : ?>
                <span class="kotlinskidev-tech-chips__pill"><?php echo esc_html($kotlinskidev_chip) ?></span>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->