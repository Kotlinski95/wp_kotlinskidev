<?php
/**
 * Title: Link Cards Feature Stack
 * Slug: kotlinskidev/link-cards-feature-stack
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/link-cards/img-project.svg',
);
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
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-linkcards-fs {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(18.75rem, 1fr));
            gap: 1.5rem;
            align-items: stretch;
        }
        .kotlinskidev-linkcards-fs__feature {
            display: flex;
            flex-direction: column;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.375rem;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            transition: border-color 0.25s ease;
        }
        .kotlinskidev-linkcards-fs__feature:hover {
            border-color: var(--wp--preset--color--primary);
        }
        .kotlinskidev-linkcards-fs__image {
            position: relative;
            aspect-ratio: 16/9;
            background: var(--wp--preset--color--surface);
        }
        .kotlinskidev-linkcards-fs__image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .kotlinskidev-linkcards-fs__body {
            padding: 1.875rem;
            display: flex;
            flex-direction: column;
            gap: 0.875rem;
            flex: 1;
        }
        .kotlinskidev-linkcards-fs__eyebrow {
            font-size: 0.71875rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--wp--preset--color--primary);
        }
        .kotlinskidev-linkcards-fs__title {
            font-size: 1.6875rem;
            line-height: 1.2;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.015em;
            color: var(--wp--preset--color--foreground);
        }
        .kotlinskidev-linkcards-fs__desc {
            font-size: 0.9375rem;
            line-height: 1.65;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0;
            max-width: 52ch;
        }
        .kotlinskidev-linkcards-fs__tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.25rem;
        }
        .kotlinskidev-linkcards-fs__tag {
            font-size: 0.78125rem;
            color: var(--wp--preset--color--foreground-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 999px;
            padding: 0.3125rem 0.75rem;
        }
        .kotlinskidev-linkcards-fs__link {
            margin-top: auto;
            padding-top: 1rem;
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
        }
        .kotlinskidev-linkcards-fs__stack {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        .kotlinskidev-linkcards-fs__row {
            flex: 1;
            display: flex;
            gap: 1.125rem;
            align-items: flex-start;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.25rem;
            padding: 1.625rem;
            text-decoration: none;
            color: inherit;
            transition: background 0.25s ease;
        }
        .kotlinskidev-linkcards-fs__row:hover {
            background: var(--wp--preset--color--surface);
        }
        .kotlinskidev-linkcards-fs__row-icon {
            flex: none;
            width: 3rem;
            height: 3rem;
            border-radius: 0.875rem;
            background: color-mix(in srgb, var(--wp--preset--color--primary) 10%, transparent);
            border: 1px solid var(--wp--preset--color--divider);
            display: grid;
            place-items: center;
        }
        .kotlinskidev-linkcards-fs__row-icon img {
            width: 1.625rem;
            height: 1.625rem;
        }
        .kotlinskidev-linkcards-fs__row-title {
            font-size: 1.1875rem;
            line-height: 1.28;
            font-weight: 700;
            margin: 0 0 0.5rem;
            color: var(--wp--preset--color--foreground);
        }
        .kotlinskidev-linkcards-fs__row-desc {
            font-size: 0.875rem;
            line-height: 1.6;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0 0 0.5rem;
        }
        .kotlinskidev-linkcards-fs__row-link {
            font-size: 0.84375rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
        }
    </style>
    <div class="kotlinskidev-linkcards-fs">
        <a href="#" class="kotlinskidev-linkcards-fs__feature">
            <div class="kotlinskidev-linkcards-fs__image">
                <img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
            </div>
            <div class="kotlinskidev-linkcards-fs__body">
                <div class="kotlinskidev-linkcards-fs__eyebrow"><?php esc_html_e('Featured project', 'kotlinskidev') ?></div>
                <h3 class="kotlinskidev-linkcards-fs__title"><?php esc_html_e('Shopify storefront rebuilt on Next.js', 'kotlinskidev') ?></h3>
                <p class="kotlinskidev-linkcards-fs__desc"><?php esc_html_e('Checkout time cut in half and a 41-point Lighthouse gain — the full write-up covers the architecture and the trade-offs.', 'kotlinskidev') ?></p>
                <div class="kotlinskidev-linkcards-fs__tags">
                    <span class="kotlinskidev-linkcards-fs__tag"><?php esc_html_e('Next.js', 'kotlinskidev') ?></span>
                    <span class="kotlinskidev-linkcards-fs__tag"><?php esc_html_e('Shopify', 'kotlinskidev') ?></span>
                    <span class="kotlinskidev-linkcards-fs__tag"><?php esc_html_e('Edge caching', 'kotlinskidev') ?></span>
                </div>
                <span class="kotlinskidev-linkcards-fs__link"><?php esc_html_e('Read the case study →', 'kotlinskidev') ?></span>
            </div>
        </a>
        <div class="kotlinskidev-linkcards-fs__stack">
            <?php foreach ($kotlinskidev_stack as $kotlinskidev_row) : ?>
            <a href="#" class="kotlinskidev-linkcards-fs__row">
                <div class="kotlinskidev-linkcards-fs__row-icon">
                    <img src="<?php echo esc_url($kotlinskidev_row['icon']) ?>" alt="" loading="lazy" />
                </div>
                <div>
                    <h3 class="kotlinskidev-linkcards-fs__row-title"><?php echo esc_html($kotlinskidev_row['title']) ?></h3>
                    <p class="kotlinskidev-linkcards-fs__row-desc"><?php echo esc_html($kotlinskidev_row['desc']) ?></p>
                    <span class="kotlinskidev-linkcards-fs__row-link"><?php echo esc_html($kotlinskidev_row['link']) ?></span>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->