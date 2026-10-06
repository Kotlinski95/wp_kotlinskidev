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
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.25rem"}},"layout":{"type":"grid","minimumColumnWidth":"17.5rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_cards as $kotlinskidev_i => $kotlinskidev_card) : ?>
        <!-- wp:group {"groupLinkUrl":"#","className":"kt-link-card kt-link-card--hover-surface","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem","left":{"width":"0.1875rem","color":"var:preset|color|primary"}},"spacing":{"padding":{"top":"1.875rem","bottom":"1.625rem","left":"1.75rem","right":"1.75rem"},"blockGap":"0.875rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group kt-link-card kt-link-card--hover-surface has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-left-color:var(--wp--preset--color--primary);border-left-width:0.1875rem;border-radius:1.25rem;padding-top:1.875rem;padding-right:1.75rem;padding-bottom:1.625rem;padding-left:1.75rem"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","lineHeight":"1"},"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|divider"}}}},"textColor":"divider","fontSize":"x-large"} -->
            <p class="has-divider-color has-text-color has-link-color has-x-large-font-size" style="margin-top:0;margin-bottom:0;font-weight:700;line-height:1"><?php echo esc_html(sprintf('%02d', $kotlinskidev_i + 1)) ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"medium"} -->
            <h3 class="wp-block-heading has-medium-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_card['title']) ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_card['desc']) ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:group {"style":{"border":{"top":{"width":"1px","color":"var:preset|color|divider"}},"spacing":{"padding":{"top":"1rem"},"margin":{"top":"0.5rem"}}},"layout":{"type":"flex","justifyContent":"space-between","verticalAlignment":"center"}} -->
            <div class="wp-block-group has-border-color" style="border-top-color:var(--wp--preset--color--divider);border-top-width:1px;margin-top:0.5rem;padding-top:1rem"><!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_card['duration']) ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
                <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600"><?php esc_html_e('See more →', 'kotlinskidev') ?></p>
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
