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
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_timeline_steps as $kotlinskidev_i => $kotlinskidev_step) : ?>
        <!-- wp:group {"className":"kt-timeline-row","style":{"spacing":{"blockGap":"1.625rem"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
        <div class="wp-block-group kt-timeline-row"><!-- wp:group {"className":"kt-timeline-rail","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"center"}} -->
            <div class="wp-block-group kt-timeline-rail"><!-- wp:paragraph {"align":"center","className":"kt-timeline-badge","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"50%"},"spacing":{"padding":{"top":"0.75rem","bottom":"0.75rem","left":"0.75rem","right":"0.75rem"},"margin":{"top":"0","bottom":"0"}},"typography":{"fontWeight":"700"}},"backgroundColor":"surface","textColor":"primary","fontSize":"small"} -->
                <p class="kt-timeline-badge has-primary-color has-surface-background-color has-text-color has-background has-text-align-center has-small-font-size" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:50%;margin-top:0;margin-bottom:0;padding-top:0.75rem;padding-right:0.75rem;padding-bottom:0.75rem;padding-left:0.75rem;font-weight:700"><?php echo esc_html(sprintf('%02d', $kotlinskidev_i + 1)) ?></p>
                <!-- /wp:paragraph -->

                <?php if ($kotlinskidev_i < count($kotlinskidev_timeline_steps) - 1) : ?>
                <!-- wp:group {"className":"kt-timeline-connector","backgroundColor":"divider","layout":{"type":"default"}} -->
                <div class="wp-block-group kt-timeline-connector has-divider-background-color has-background"></div>
                <!-- /wp:group -->
                <?php endif; ?>
            </div>
            <!-- /wp:group -->

            <!-- wp:group {"className":"kt-timeline-content","style":{"spacing":{"blockGap":"0.875rem","padding":{"bottom":"2.25rem"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
            <div class="wp-block-group kt-timeline-content" style="padding-bottom:2.25rem"><!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"medium"} -->
                <h3 class="wp-block-heading has-medium-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_step['title']) ?></h3>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_step['desc']) ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:paragraph {"style":{"border":{"radius":"999px"},"spacing":{"padding":{"top":"0.375rem","bottom":"0.375rem","left":"0.75rem","right":"0.75rem"},"margin":{"top":"0","bottom":"0"}},"typography":{"fontWeight":"600"}},"backgroundColor":"divider","textColor":"primary","fontSize":"small"} -->
                <p class="has-primary-color has-divider-background-color has-text-color has-background has-small-font-size" style="border-radius:999px;margin-top:0;margin-bottom:0;padding-top:0.375rem;padding-right:0.75rem;padding-bottom:0.375rem;padding-left:0.75rem;font-weight:600"><?php echo esc_html($kotlinskidev_step['chip']) ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
        <?php endforeach; ?>
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
