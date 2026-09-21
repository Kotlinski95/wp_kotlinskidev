<?php
/**
 * Title: Collaborations Described Cards
 * Slug: kotlinskidev/collaborations-described-cards
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/service_icon.webp',
);
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
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-collab-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(18.75rem, 1fr));
            gap: 1.25rem;
        }
        .kotlinskidev-collab-cards__card {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.25rem;
            padding: 1.625rem;
            text-decoration: none;
            color: inherit;
            transition: border-color 0.25s ease, background 0.25s ease;
        }
        .kotlinskidev-collab-cards__card:hover {
            border-color: var(--wp--preset--color--primary);
            background: var(--wp--preset--color--surface);
        }
        .kotlinskidev-collab-cards__logo {
            height: 2.75rem;
            display: flex;
            align-items: center;
        }
        .kotlinskidev-collab-cards__logo img {
            max-height: 100%;
            max-width: 60%;
            object-fit: contain;
            filter: grayscale(1) opacity(0.6);
        }
        .kotlinskidev-collab-cards__meta {
            font-size: 0.71875rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--wp--preset--color--primary);
            margin-bottom: 0.5rem;
        }
        .kotlinskidev-collab-cards__title {
            font-size: 1.1875rem;
            font-weight: 700;
            line-height: 1.3;
            color: var(--wp--preset--color--foreground);
            margin: 0 0 0.5rem;
        }
        .kotlinskidev-collab-cards__desc {
            font-size: 0.90625rem;
            line-height: 1.6;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0;
        }
        .kotlinskidev-collab-cards__link {
            margin-top: auto;
            font-size: 0.84375rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
        }
    </style>
    <div class="kotlinskidev-collab-cards">
        <?php foreach ($kotlinskidev_collaborations as $kotlinskidev_collab) : ?>
        <a href="#" class="kotlinskidev-collab-cards__card">
            <div class="kotlinskidev-collab-cards__logo">
                <img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
            </div>
            <div>
                <div class="kotlinskidev-collab-cards__meta"><?php echo esc_html($kotlinskidev_collab['meta']) ?></div>
                <h3 class="kotlinskidev-collab-cards__title"><?php echo esc_html($kotlinskidev_collab['title']) ?></h3>
                <p class="kotlinskidev-collab-cards__desc"><?php echo esc_html($kotlinskidev_collab['desc']) ?></p>
            </div>
            <span class="kotlinskidev-collab-cards__link"><?php esc_html_e('Read more →', 'kotlinskidev') ?></span>
        </a>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->