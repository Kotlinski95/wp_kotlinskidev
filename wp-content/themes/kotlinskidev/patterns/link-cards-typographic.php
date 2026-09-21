<?php
/**
 * Title: Link Cards Typographic
 * Slug: kotlinskidev/link-cards-typographic
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_cards = array(
    array(
        'title'    => __('Core Web Vitals optimization', 'kotlinskidev'),
        'desc'     => __('LCP, INP and CLS into the green, verified against real field data.', 'kotlinskidev'),
        'duration' => __('4–6 weeks', 'kotlinskidev'),
    ),
    array(
        'title'    => __('Mobile-first frontend overhaul', 'kotlinskidev'),
        'desc'     => __('Rebuilt from the smallest breakpoint up, one component system across widths.', 'kotlinskidev'),
        'duration' => __('6–10 weeks', 'kotlinskidev'),
    ),
    array(
        'title'    => __('Performance audit & report', 'kotlinskidev'),
        'desc'     => __('A prioritised fix list with the measured cost of each problem.', 'kotlinskidev'),
        'duration' => __('3–5 days', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/link-cards-typographic","name":"Link Cards Typographic"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-linkcards-type {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(17.5rem, 1fr));
            gap: 1.25rem;
        }
        .kotlinskidev-linkcards-type__card {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 0.875rem;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.25rem;
            padding: 1.875rem 1.75rem 1.625rem;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            transition: background 0.25s ease;
        }
        .kotlinskidev-linkcards-type__card:hover {
            background: var(--wp--preset--color--surface);
        }
        .kotlinskidev-linkcards-type__card::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 0.1875rem;
            background: linear-gradient(var(--wp--preset--color--primary), color-mix(in srgb, var(--wp--preset--color--primary) 40%, transparent));
        }
        .kotlinskidev-linkcards-type__num {
            font-size: 2.125rem;
            font-weight: 700;
            line-height: 1;
            color: var(--wp--preset--color--divider);
        }
        .kotlinskidev-linkcards-type__title {
            font-size: 1.375rem;
            line-height: 1.25;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.01em;
            color: var(--wp--preset--color--foreground);
        }
        .kotlinskidev-linkcards-type__desc {
            font-size: 0.90625rem;
            line-height: 1.6;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0;
        }
        .kotlinskidev-linkcards-type__foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--wp--preset--color--divider);
            font-size: 0.84375rem;
        }
        .kotlinskidev-linkcards-type__duration {
            color: var(--wp--preset--color--foreground-alt);
        }
        .kotlinskidev-linkcards-type__link {
            font-weight: 600;
            color: var(--wp--preset--color--primary);
        }
    </style>
    <div class="kotlinskidev-linkcards-type">
        <?php foreach ($kotlinskidev_cards as $kotlinskidev_i => $kotlinskidev_card) : ?>
        <a href="#" class="kotlinskidev-linkcards-type__card">
            <div class="kotlinskidev-linkcards-type__num"><?php echo esc_html(sprintf('%02d', $kotlinskidev_i + 1)) ?></div>
            <h3 class="kotlinskidev-linkcards-type__title"><?php echo esc_html($kotlinskidev_card['title']) ?></h3>
            <p class="kotlinskidev-linkcards-type__desc"><?php echo esc_html($kotlinskidev_card['desc']) ?></p>
            <div class="kotlinskidev-linkcards-type__foot">
                <span class="kotlinskidev-linkcards-type__duration"><?php echo esc_html($kotlinskidev_card['duration']) ?></span>
                <span class="kotlinskidev-linkcards-type__link"><?php esc_html_e('See more →', 'kotlinskidev') ?></span>
            </div>
        </a>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->