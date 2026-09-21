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
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-tech-groups {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(21.25rem, 1fr));
            gap: 1.25rem;
        }
        .kotlinskidev-tech-groups__card {
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.25rem;
            padding: 1.75rem;
        }
        .kotlinskidev-tech-groups__head {
            display: flex;
            align-items: center;
            gap: 0.875rem;
            margin-bottom: 1.375rem;
        }
        .kotlinskidev-tech-groups__icon {
            width: 2.625rem;
            height: 2.625rem;
            flex: none;
            border-radius: 0.75rem;
            background: color-mix(in srgb, var(--wp--preset--color--primary) 10%, transparent);
            border: 1px solid var(--wp--preset--color--divider);
            display: grid;
            place-items: center;
        }
        .kotlinskidev-tech-groups__icon img {
            width: 1.375rem;
            height: 1.375rem;
        }
        .kotlinskidev-tech-groups__title {
            font-size: 0.8125rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0;
        }
        .kotlinskidev-tech-groups__row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem 0.625rem;
            padding: 0.8125rem 0;
            border-top: 1px solid var(--wp--preset--color--divider);
            font-size: 0.9375rem;
        }
        .kotlinskidev-tech-groups__name {
            font-weight: 600;
            color: var(--wp--preset--color--foreground);
        }
        .kotlinskidev-tech-groups__note {
            color: var(--wp--preset--color--foreground-alt);
            line-height: 1.5;
        }
    </style>
    <div class="kotlinskidev-tech-groups">
        <?php foreach ($kotlinskidev_groups as $kotlinskidev_group) : ?>
        <div class="kotlinskidev-tech-groups__card">
            <div class="kotlinskidev-tech-groups__head">
                <div class="kotlinskidev-tech-groups__icon">
                    <img src="<?php echo esc_url($kotlinskidev_group['icon']) ?>" alt="" loading="lazy" />
                </div>
                <h3 class="kotlinskidev-tech-groups__title"><?php echo esc_html($kotlinskidev_group['title']) ?></h3>
            </div>
            <dl style="margin:0">
                <?php foreach ($kotlinskidev_group['items'] as $kotlinskidev_item) : ?>
                <div class="kotlinskidev-tech-groups__row">
                    <dt class="kotlinskidev-tech-groups__name"><?php echo esc_html($kotlinskidev_item['name']) ?></dt>
                    <dd class="kotlinskidev-tech-groups__note" style="margin:0"><?php echo esc_html($kotlinskidev_item['note']) ?></dd>
                </div>
                <?php endforeach; ?>
            </dl>
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->