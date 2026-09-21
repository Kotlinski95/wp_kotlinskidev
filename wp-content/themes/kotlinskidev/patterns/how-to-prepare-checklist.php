<?php
/**
 * Title: How To Prepare Checklist
 * Slug: kotlinskidev/how-to-prepare-checklist
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_checklist = array(
    __('What the site must achieve', 'kotlinskidev'),
    __('Deadline and budget range', 'kotlinskidev'),
    __('Who writes the content', 'kotlinskidev'),
    __('Where the site is hosted today', 'kotlinskidev'),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/how-to-prepare-checklist","name":"How To Prepare Checklist"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.5rem"},"spacing":{"padding":{"top":"2.25rem","bottom":"2.25rem","left":"2.125rem","right":"2.125rem"}}},"backgroundColor":"background-alt","layout":{"type":"constrained"}} -->
    <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.5rem;padding-top:2.25rem;padding-right:2.125rem;padding-bottom:2.25rem;padding-left:2.125rem"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"1.75rem"},"margin":{"top":"0","bottom":"1.5rem"}}}} -->
        <div class="wp-block-columns are-vertically-aligned-center" style="margin-top:0;margin-bottom:1.5rem"><!-- wp:column {"verticalAlignment":"center"} -->
            <div class="wp-block-column is-vertically-aligned-center">
                <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","lineHeight":"1.25"},"spacing":{"margin":{"top":"0","bottom":"0.5rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"big"} -->
                <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="margin-top:0;margin-bottom:0.5rem;font-style:normal;font-weight:700;line-height:1.25"><?php esc_html_e('Bring these to the first call', 'kotlinskidev') ?></h3>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('Four answers are enough for me to quote. Anything missing, we work it out together.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"verticalAlignment":"center","width":"12.5rem"} -->
            <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:12.5rem"><!-- wp:buttons {"layout":{"type":"flex","justifyContent":"right"}} -->
                <div class="wp-block-buttons"><!-- wp:button {"gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                    <div class="wp-block-button"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('Book a 20-min call', 'kotlinskidev') ?></a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->

        <!-- wp:html -->
        <style>
            .kotlinskidev-htp-checklist {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(13.75rem, 1fr));
                gap: 0.875rem;
            }
            .kotlinskidev-htp-checklist__item {
                border: 1px solid var(--wp--preset--color--divider);
                border-radius: 1rem;
                padding: 1.125rem 1.25rem;
            }
            .kotlinskidev-htp-checklist__num {
                font-size: 0.8125rem;
                font-weight: 700;
                color: var(--wp--preset--color--primary);
                margin-bottom: 0.375rem;
            }
            .kotlinskidev-htp-checklist__label {
                font-size: 0.9375rem;
                font-weight: 600;
                line-height: 1.4;
                color: var(--wp--preset--color--foreground);
            }
        </style>
        <div class="kotlinskidev-htp-checklist">
            <?php foreach ($kotlinskidev_checklist as $kotlinskidev_i => $kotlinskidev_label) : ?>
            <div class="kotlinskidev-htp-checklist__item">
                <div class="kotlinskidev-htp-checklist__num"><?php echo esc_html(sprintf('%02d', $kotlinskidev_i + 1)) ?></div>
                <div class="kotlinskidev-htp-checklist__label"><?php echo esc_html($kotlinskidev_label) ?></div>
            </div>
            <?php endforeach; ?>
        </div>
        <!-- /wp:html -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->