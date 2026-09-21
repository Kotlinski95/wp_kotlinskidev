<?php
/**
 * Title: How To Prepare Timeline
 * Slug: kotlinskidev/how-to-prepare-timeline
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_timeline_steps = array(
    array(
        'title' => __('Define the goal', 'kotlinskidev'),
        'desc'  => __('Before anything else: what should the site actually do? Sell a product, book appointments, publish articles, replace a broken WordPress install. One sentence is enough to start.', 'kotlinskidev'),
        'chip'  => __('You bring: the goal, the deadline, the budget range', 'kotlinskidev'),
    ),
    array(
        'title' => __('Gather your materials', 'kotlinskidev'),
        'desc'  => __('The single biggest cause of delay is missing content. Collect logo files, brand colours and fonts, photos, product data, legal pages and the text for each page — or tell me you need help writing it.', 'kotlinskidev'),
        'chip'  => __('You bring: logo, copy, images, 2–3 reference sites', 'kotlinskidev'),
    ),
    array(
        'title' => __('Contact me or book a call', 'kotlinskidev'),
        'desc'  => __('Send the brief by email or book a 20-minute call. I reply within a day with first questions and a rough feasibility answer — including an honest “this isn’t for me” when that’s the case.', 'kotlinskidev'),
        'chip'  => __('I deliver: reply in 24 h, first questions', 'kotlinskidev'),
    ),
    array(
        'title' => __('Discuss ideas and agree the scope', 'kotlinskidev'),
        'desc'  => __('We turn the brief into a written scope: page list, features, integrations, who writes the content, what is explicitly out of scope. You get a fixed quote or an hourly estimate with a cap, plus a timeline and payment schedule.', 'kotlinskidev'),
        'chip'  => __('I deliver: written scope, quote, timeline', 'kotlinskidev'),
    ),
    array(
        'title' => __('Pick a direction — templates and design', 'kotlinskidev'),
        'desc'  => __('You review layout templates and a design direction: typography, colour, section styles, and how it behaves on mobile. Choosing from a system is faster and cheaper than a blank-page design, and you can still customise every section.', 'kotlinskidev'),
        'chip'  => __('You bring: one round of consolidated feedback', 'kotlinskidev'),
    ),
    array(
        'title' => __('Access and setup', 'kotlinskidev'),
        'desc'  => __('Hosting, domain and DNS, repository, CMS accounts, analytics, payment or mailing providers. Send credentials through a password manager, never by email — and give me a staging environment rather than the live site.', 'kotlinskidev'),
        'chip'  => __('You bring: hosting, domain, CMS and analytics access', 'kotlinskidev'),
    ),
    array(
        'title' => __('Build, with a demo you can watch', 'kotlinskidev'),
        'desc'  => __('Development happens on a staging URL you can open any time. You get a short written update at each milestone, so nothing arrives as a surprise at the end.', 'kotlinskidev'),
        'chip'  => __('I deliver: staging link, milestone updates', 'kotlinskidev'),
    ),
    array(
        'title' => __('Testing and the fix round', 'kotlinskidev'),
        'desc'  => __('Cross-browser and real-device checks, Core Web Vitals, accessibility, forms, redirects and SEO metadata. You review on staging and send one consolidated list; I fix and re-test until it’s signed off.', 'kotlinskidev'),
        'chip'  => __('I deliver: test report, fixes, re-test', 'kotlinskidev'),
    ),
    array(
        'title' => __('Launch, handover and aftercare', 'kotlinskidev'),
        'desc'  => __('Go-live with backups and redirects in place, then you get the repository, all accounts in your name, a short walkthrough of how to edit content, and 30 days of bug cover. Optional monthly support continues from there.', 'kotlinskidev'),
        'chip'  => __('I deliver: launch, docs, ownership, 30-day cover', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/how-to-prepare-timeline","name":"How To Prepare Timeline"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"53.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-htp-timeline__row {
            display: flex;
            gap: 1.625rem;
        }
        .kotlinskidev-htp-timeline__rail {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: none;
            width: 2.75rem;
        }
        .kotlinskidev-htp-timeline__badge {
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 50%;
            border: 1px solid var(--wp--preset--color--divider);
            background: var(--wp--preset--color--surface);
            display: grid;
            place-items: center;
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--wp--preset--color--primary);
            flex: none;
        }
        .kotlinskidev-htp-timeline__connector {
            flex: 1;
            width: 1px;
            background: var(--wp--preset--color--divider);
            margin: 0.5rem 0;
        }
        .kotlinskidev-htp-timeline__content {
            flex: 1;
            min-width: 0;
            padding-bottom: 2.25rem;
        }
        .kotlinskidev-htp-timeline__title {
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1.3;
            color: var(--wp--preset--color--foreground);
            margin: 0 0 0.375rem;
        }
        .kotlinskidev-htp-timeline__desc {
            font-size: 0.9375rem;
            line-height: 1.7;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0 0 0.875rem;
        }
        .kotlinskidev-htp-timeline__chip {
            display: inline-block;
            font-size: 0.78125rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
            background: color-mix(in srgb, var(--wp--preset--color--primary) 12%, transparent);
            border-radius: 999px;
            padding: 0.375rem 0.75rem;
        }
    </style>
    <div class="kotlinskidev-htp-timeline">
        <?php foreach ($kotlinskidev_timeline_steps as $kotlinskidev_i => $kotlinskidev_step) : ?>
        <div class="kotlinskidev-htp-timeline__row">
            <div class="kotlinskidev-htp-timeline__rail">
                <span class="kotlinskidev-htp-timeline__badge"><?php echo esc_html(sprintf('%02d', $kotlinskidev_i + 1)) ?></span>
                <?php if ($kotlinskidev_i < count($kotlinskidev_timeline_steps) - 1) : ?>
                <span class="kotlinskidev-htp-timeline__connector"></span>
                <?php endif; ?>
            </div>
            <div class="kotlinskidev-htp-timeline__content">
                <div class="kotlinskidev-htp-timeline__title"><?php echo esc_html($kotlinskidev_step['title']) ?></div>
                <p class="kotlinskidev-htp-timeline__desc"><?php echo esc_html($kotlinskidev_step['desc']) ?></p>
                <span class="kotlinskidev-htp-timeline__chip"><?php echo esc_html($kotlinskidev_step['chip']) ?></span>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->