<?php
/**
 * Title: Work With Me Option Cards
 * Slug: kotlinskidev/work-with-me-option-cards
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icons = $kotlinskidev_url . 'assets/icons/work-with-me/';
$kotlinskidev_service_icons = $kotlinskidev_url . 'assets/icons/services/';
$kotlinskidev_options = array(
    array(
        'icon'  => $kotlinskidev_icons . 'icon-hire.svg',
        'chip'  => __('Full-time', 'kotlinskidev'),
        'title' => __('Hire me', 'kotlinskidev'),
        'desc'  => __('Permanent or contract frontend role — React, Next.js and commerce storefronts. Remote, EU hours.', 'kotlinskidev'),
        'link'  => __('See my CV →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-support.svg',
        'chip'  => __('Retainer', 'kotlinskidev'),
        'title' => __('Ongoing support', 'kotlinskidev'),
        'desc'  => __('A monthly block of hours for updates, releases and the things that break at the wrong moment.', 'kotlinskidev'),
        'link'  => __('Check availability →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-fix.svg',
        'chip'  => __('Project', 'kotlinskidev'),
        'title' => __('Help with my website', 'kotlinskidev'),
        'desc'  => __('A build, a redesign or a rescue — WordPress, Shopify or a custom Next.js front end.', 'kotlinskidev'),
        'link'  => __('Describe the project →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_service_icons . 'icon-analysis.svg',
        'chip'  => __('Fixed fee', 'kotlinskidev'),
        'title' => __('Ask for an analysis', 'kotlinskidev'),
        'desc'  => __('Performance, SEO and accessibility audit with a written, prioritised list of what to fix first.', 'kotlinskidev'),
        'link'  => __('Request an audit →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-parttime.svg',
        'chip'  => __('Part-time', 'kotlinskidev'),
        'title' => __('Part-time engagement', 'kotlinskidev'),
        'desc'  => __('Two or three days a week alongside your team, with elastic hours and async handover.', 'kotlinskidev'),
        'link'  => __('Talk about scope →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-freelance.svg',
        'chip'  => __('Evenings', 'kotlinskidev'),
        'title' => __('Small freelance jobs', 'kotlinskidev'),
        'desc'  => __('Short tasks picked up after hours — a landing page, a tricky bug, a block that needs building.', 'kotlinskidev'),
        'link'  => __('Send the task →', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/work-with-me-option-cards","name":"Work With Me Option Cards"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-wwm-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
            gap: 1.25rem;
        }
        .kotlinskidev-wwm-cards__card {
            display: block;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.375rem;
            padding: 1.875rem 1.75rem;
            text-decoration: none;
            color: inherit;
            transition: border-color 0.25s ease, transform 0.25s ease;
        }
        .kotlinskidev-wwm-cards__card:hover {
            border-color: var(--wp--preset--color--primary);
            transform: translateY(-0.1875rem);
        }
        .kotlinskidev-wwm-cards__head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
        }
        .kotlinskidev-wwm-cards__icon {
            width: 3rem;
            height: 3rem;
            flex: none;
            border-radius: 0.875rem;
            background: color-mix(in srgb, var(--wp--preset--color--primary) 10%, transparent);
            border: 1px solid var(--wp--preset--color--divider);
            display: grid;
            place-items: center;
        }
        .kotlinskidev-wwm-cards__icon img {
            width: 1.625rem;
            height: 1.625rem;
        }
        .kotlinskidev-wwm-cards__chip {
            font-size: 0.71875rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--wp--preset--color--primary);
            background: color-mix(in srgb, var(--wp--preset--color--primary) 12%, transparent);
            border-radius: 999px;
            padding: 0.375rem 0.75rem;
            white-space: nowrap;
        }
        .kotlinskidev-wwm-cards__title {
            font-size: 1.3125rem;
            font-weight: 700;
            line-height: 1.3;
            margin: 0 0 0.625rem;
            color: var(--wp--preset--color--foreground);
        }
        .kotlinskidev-wwm-cards__desc {
            font-size: 0.90625rem;
            line-height: 1.65;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0 0 1.125rem;
        }
        .kotlinskidev-wwm-cards__link {
            font-size: 0.84375rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
        }
    </style>
    <div class="kotlinskidev-wwm-cards">
        <?php foreach ($kotlinskidev_options as $kotlinskidev_option) : ?>
        <a href="#" class="kotlinskidev-wwm-cards__card">
            <div class="kotlinskidev-wwm-cards__head">
                <div class="kotlinskidev-wwm-cards__icon">
                    <img src="<?php echo esc_url($kotlinskidev_option['icon']) ?>" alt="" loading="lazy" />
                </div>
                <span class="kotlinskidev-wwm-cards__chip"><?php echo esc_html($kotlinskidev_option['chip']) ?></span>
            </div>
            <h3 class="kotlinskidev-wwm-cards__title"><?php echo esc_html($kotlinskidev_option['title']) ?></h3>
            <p class="kotlinskidev-wwm-cards__desc"><?php echo esc_html($kotlinskidev_option['desc']) ?></p>
            <span class="kotlinskidev-wwm-cards__link"><?php echo esc_html($kotlinskidev_option['link']) ?></span>
        </a>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->