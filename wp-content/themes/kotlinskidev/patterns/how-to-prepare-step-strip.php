<?php
/**
 * Title: How To Prepare Step Strip
 * Slug: kotlinskidev/how-to-prepare-step-strip
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_steps = array(
    array(
        'label' => __('Step 1', 'kotlinskidev'),
        'title' => __('Prepare', 'kotlinskidev'),
        'desc'  => __('Goal, budget, content and brand files in one folder.', 'kotlinskidev'),
    ),
    array(
        'label' => __('Step 2', 'kotlinskidev'),
        'title' => __('Talk', 'kotlinskidev'),
        'desc'  => __('A 20-minute call, then a written scope and quote.', 'kotlinskidev'),
    ),
    array(
        'label' => __('Step 3', 'kotlinskidev'),
        'title' => __('Choose', 'kotlinskidev'),
        'desc'  => __('Templates and design direction, one feedback round.', 'kotlinskidev'),
    ),
    array(
        'label' => __('Step 4', 'kotlinskidev'),
        'title' => __('Build & test', 'kotlinskidev'),
        'desc'  => __('Staging link, device testing, one consolidated fix list.', 'kotlinskidev'),
    ),
    array(
        'label' => __('Step 5', 'kotlinskidev'),
        'title' => __('Launch', 'kotlinskidev'),
        'desc'  => __('Go-live, handover, docs and 30 days of bug cover.', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/how-to-prepare-step-strip","name":"How To Prepare Step Strip"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-htp-strip {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr));
            gap: 1.125rem;
        }
        .kotlinskidev-htp-strip__card {
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.125rem;
            padding: 1.5rem 1.375rem;
        }
        .kotlinskidev-htp-strip__label {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.13em;
            text-transform: uppercase;
            color: var(--wp--preset--color--primary);
            margin-bottom: 0.75rem;
        }
        .kotlinskidev-htp-strip__title {
            font-size: 1.0625rem;
            font-weight: 700;
            line-height: 1.3;
            color: var(--wp--preset--color--foreground);
            margin-bottom: 0.5rem;
        }
        .kotlinskidev-htp-strip__desc {
            font-size: 0.875rem;
            line-height: 1.6;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0;
        }
    </style>
    <div class="kotlinskidev-htp-strip">
        <?php foreach ($kotlinskidev_steps as $kotlinskidev_step) : ?>
        <div class="kotlinskidev-htp-strip__card">
            <div class="kotlinskidev-htp-strip__label"><?php echo esc_html($kotlinskidev_step['label']) ?></div>
            <div class="kotlinskidev-htp-strip__title"><?php echo esc_html($kotlinskidev_step['title']) ?></div>
            <p class="kotlinskidev-htp-strip__desc"><?php echo esc_html($kotlinskidev_step['desc']) ?></p>
        </div>
        <?php endforeach; ?>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->