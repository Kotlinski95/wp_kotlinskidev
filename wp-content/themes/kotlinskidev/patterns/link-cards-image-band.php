<?php
/**
 * Title: Link Cards Image Band
 * Slug: kotlinskidev/link-cards-image-band
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = $kotlinskidev_url . 'assets/images/link-cards/';
$kotlinskidev_cards = array(
    array(
        'eyebrow' => __('Service', 'kotlinskidev'),
        'title'   => __('Core Web Vitals optimization', 'kotlinskidev'),
        'desc'    => __('LCP, INP and CLS brought into the green, with before-and-after field data.', 'kotlinskidev'),
        'image'   => $kotlinskidev_images . 'img-vitals.svg',
    ),
    array(
        'eyebrow' => __('Service', 'kotlinskidev'),
        'title'   => __('Mobile-first frontend overhaul', 'kotlinskidev'),
        'desc'    => __('Rebuilt from the smallest breakpoint up, so the phone experience stops being an afterthought.', 'kotlinskidev'),
        'image'   => $kotlinskidev_images . 'img-mobile.svg',
    ),
    array(
        'eyebrow' => __('Service', 'kotlinskidev'),
        'title'   => __('Performance audit & report', 'kotlinskidev'),
        'desc'    => __('A prioritised list of what to fix first, with the measured cost of each problem.', 'kotlinskidev'),
        'image'   => $kotlinskidev_images . 'img-audit.svg',
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/link-cards-image-band","name":"Link Cards Image Band"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-linkcards-band {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(18.125rem, 1fr));
            gap: 1.5rem;
        }
        .kotlinskidev-linkcards-band__card {
            display: flex;
            flex-direction: column;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.25rem;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            transition: border-color 0.25s ease;
        }
        .kotlinskidev-linkcards-band__card:hover {
            border-color: var(--wp--preset--color--primary);
        }
        .kotlinskidev-linkcards-band__image {
            position: relative;
            aspect-ratio: 16/10;
            background: var(--wp--preset--color--surface);
        }
        .kotlinskidev-linkcards-band__image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .kotlinskidev-linkcards-band__body {
            padding: 1.625rem 1.5rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            flex: 1;
        }
        .kotlinskidev-linkcards-band__eyebrow {
            font-size: 0.71875rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--wp--preset--color--primary);
        }
        .kotlinskidev-linkcards-band__title {
            font-size: 1.3125rem;
            line-height: 1.25;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.01em;
            color: var(--wp--preset--color--foreground);
        }
        .kotlinskidev-linkcards-band__desc {
            font-size: 0.90625rem;
            line-height: 1.6;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0;
        }
        .kotlinskidev-linkcards-band__link {
            margin-top: auto;
            padding-top: 0.875rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
        }
    </style>
    <div class="kotlinskidev-linkcards-band">
        <?php foreach ($kotlinskidev_cards as $kotlinskidev_card) : ?>
        <a href="#" class="kotlinskidev-linkcards-band__card">
            <div class="kotlinskidev-linkcards-band__image">
                <img src="<?php echo esc_url($kotlinskidev_card['image']) ?>" alt="" loading="lazy" />
            </div>
            <div class="kotlinskidev-linkcards-band__body">
                <div class="kotlinskidev-linkcards-band__eyebrow"><?php echo esc_html($kotlinskidev_card['eyebrow']) ?></div>
                <h3 class="kotlinskidev-linkcards-band__title"><?php echo esc_html($kotlinskidev_card['title']) ?></h3>
                <p class="kotlinskidev-linkcards-band__desc"><?php echo esc_html($kotlinskidev_card['desc']) ?></p>
                <span class="kotlinskidev-linkcards-band__link"><?php esc_html_e('See more →', 'kotlinskidev') ?></span>
            </div>
        </a>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->