<?php
/**
 * Title: Link Cards Icon Led
 * Slug: kotlinskidev/link-cards-icon-led
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_cards = array(
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-optimization.svg',
        'title' => __('Core Web Vitals optimization', 'kotlinskidev'),
        'desc'  => __('LCP, INP and CLS brought into the green and kept there.', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-websites.svg',
        'title' => __('Mobile-first frontend overhaul', 'kotlinskidev'),
        'desc'  => __('One component system that holds together at every width.', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_url . 'assets/icons/services/icon-analysis.svg',
        'title' => __('Performance audit & report', 'kotlinskidev'),
        'desc'  => __('Everything measured, prioritised and written down.', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/link-cards-icon-led","name":"Link Cards Icon Led"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-linkcards-icon {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(18.125rem, 1fr));
            gap: 1.5rem;
        }
        .kotlinskidev-linkcards-icon__card {
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
        .kotlinskidev-linkcards-icon__card:hover {
            border-color: var(--wp--preset--color--primary);
        }
        .kotlinskidev-linkcards-icon__head {
            height: 6.5rem;
            background: radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--wp--preset--color--primary) 10%, transparent), transparent 70%), var(--wp--preset--color--surface);
            display: flex;
            align-items: flex-end;
            padding: 0 1.5rem;
        }
        .kotlinskidev-linkcards-icon__badge {
            width: 3.5rem;
            height: 3.5rem;
            margin-bottom: -1.75rem;
            border-radius: 1rem;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            display: grid;
            place-items: center;
        }
        .kotlinskidev-linkcards-icon__badge img {
            width: 1.75rem;
            height: 1.75rem;
        }
        .kotlinskidev-linkcards-icon__body {
            padding: 2.625rem 1.5rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            flex: 1;
        }
        .kotlinskidev-linkcards-icon__title {
            font-size: 1.3125rem;
            line-height: 1.25;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.01em;
            color: var(--wp--preset--color--foreground);
        }
        .kotlinskidev-linkcards-icon__desc {
            font-size: 0.90625rem;
            line-height: 1.6;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0;
        }
        .kotlinskidev-linkcards-icon__link {
            margin-top: auto;
            padding-top: 0.875rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
        }
    </style>
    <div class="kotlinskidev-linkcards-icon">
        <?php foreach ($kotlinskidev_cards as $kotlinskidev_card) : ?>
        <a href="#" class="kotlinskidev-linkcards-icon__card">
            <div class="kotlinskidev-linkcards-icon__head">
                <div class="kotlinskidev-linkcards-icon__badge">
                    <img src="<?php echo esc_url($kotlinskidev_card['icon']) ?>" alt="" loading="lazy" />
                </div>
            </div>
            <div class="kotlinskidev-linkcards-icon__body">
                <h3 class="kotlinskidev-linkcards-icon__title"><?php echo esc_html($kotlinskidev_card['title']) ?></h3>
                <p class="kotlinskidev-linkcards-icon__desc"><?php echo esc_html($kotlinskidev_card['desc']) ?></p>
                <span class="kotlinskidev-linkcards-icon__link"><?php esc_html_e('See more →', 'kotlinskidev') ?></span>
            </div>
        </a>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->