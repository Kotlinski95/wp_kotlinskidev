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
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.125rem"}},"layout":{"type":"grid","minimumColumnWidth":"12.5rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_steps as $kotlinskidev_step) : ?>
        <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.125rem"},"spacing":{"padding":{"top":"1.5rem","bottom":"1.5rem","left":"1.375rem","right":"1.375rem"},"blockGap":"0.5rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.125rem;padding-top:1.5rem;padding-right:1.375rem;padding-bottom:1.5rem;padding-left:1.375rem"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.13em"},"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"x-small"} -->
            <p class="has-primary-color has-text-color has-link-color has-x-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:700;letter-spacing:0.13em;text-transform:uppercase"><?php echo esc_html($kotlinskidev_step['label']) ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"normal"} -->
            <h3 class="wp-block-heading has-normal-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_step['title']) ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_step['desc']) ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <?php endforeach; ?>
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
