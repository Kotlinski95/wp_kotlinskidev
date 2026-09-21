<?php
/**
 * Title: How To Prepare Phase Cards
 * Slug: kotlinskidev/how-to-prepare-phase-cards
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_phases = array(
    array(
        'eyebrow' => __('Before we start · your side', 'kotlinskidev'),
        'title'   => __('What to have ready', 'kotlinskidev'),
        'items'   => array(
            __('A one-line goal and a deadline that isn’t “as soon as possible”', 'kotlinskidev'),
            __('Logo in SVG or high-res PNG, brand colours, fonts you own a licence for', 'kotlinskidev'),
            __('Page-by-page text, or a note that you want help writing it', 'kotlinskidev'),
            __('Photos and product data — originals, not screenshots', 'kotlinskidev'),
            __('Two or three sites you like, and one line on why', 'kotlinskidev'),
            __('Hosting, domain and CMS access — shared through a password manager', 'kotlinskidev'),
            __('One decision-maker who signs off feedback', 'kotlinskidev'),
        ),
    ),
    array(
        'eyebrow' => __('During the project · my side', 'kotlinskidev'),
        'title'   => __('What you get from me', 'kotlinskidev'),
        'items'   => array(
            __('A written scope with a fixed quote or a capped estimate', 'kotlinskidev'),
            __('A staging URL from the first week, open to you at any time', 'kotlinskidev'),
            __('Short written updates at each milestone, no status meetings', 'kotlinskidev'),
            __('Device, performance, SEO and accessibility testing before launch', 'kotlinskidev'),
            __('A fix round after your review, then re-test and sign-off', 'kotlinskidev'),
            __('Full ownership: repository, accounts and documentation in your name', 'kotlinskidev'),
            __('30 days of bug cover after go-live', 'kotlinskidev'),
        ),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/how-to-prepare-phase-cards","name":"How To Prepare Phase Cards"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-htp-phases {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
            gap: 1.25rem;
        }
        .kotlinskidev-htp-phases__card {
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.375rem;
            padding: 1.875rem 1.75rem;
        }
        .kotlinskidev-htp-phases__eyebrow {
            font-size: 0.71875rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--wp--preset--color--foreground-alt);
            margin-bottom: 0.875rem;
        }
        .kotlinskidev-htp-phases__title {
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1.3;
            color: var(--wp--preset--color--foreground);
            margin: 0 0 1rem;
        }
        .kotlinskidev-htp-phases__list {
            display: grid;
            gap: 0.6875rem;
            font-size: 0.90625rem;
            line-height: 1.6;
            color: var(--wp--preset--color--foreground-alt);
        }
        .kotlinskidev-htp-phases__item {
            display: flex;
            align-items: baseline;
            gap: 0.6875rem;
        }
        .kotlinskidev-htp-phases__item::before {
            content: "";
            flex: none;
            width: 0.34375rem;
            height: 0.34375rem;
            border-radius: 50%;
            background: var(--wp--preset--color--primary);
        }
    </style>
    <div class="kotlinskidev-htp-phases">
        <?php foreach ($kotlinskidev_phases as $kotlinskidev_phase) : ?>
        <div class="kotlinskidev-htp-phases__card">
            <div class="kotlinskidev-htp-phases__eyebrow"><?php echo esc_html($kotlinskidev_phase['eyebrow']) ?></div>
            <div class="kotlinskidev-htp-phases__title"><?php echo esc_html($kotlinskidev_phase['title']) ?></div>
            <div class="kotlinskidev-htp-phases__list">
                <?php foreach ($kotlinskidev_phase['items'] as $kotlinskidev_item) : ?>
                <div class="kotlinskidev-htp-phases__item"><span><?php echo esc_html($kotlinskidev_item) ?></span></div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->