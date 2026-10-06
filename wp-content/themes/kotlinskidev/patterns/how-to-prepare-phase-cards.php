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
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.25rem"}},"layout":{"type":"grid","minimumColumnWidth":"20rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_phases as $kotlinskidev_phase) : ?>
        <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.375rem"},"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.75rem","right":"1.75rem"},"blockGap":"0.875rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.375rem;padding-top:1.875rem;padding-right:1.75rem;padding-bottom:1.875rem;padding-left:1.75rem"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.14em"},"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php echo esc_html($kotlinskidev_phase['eyebrow']) ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"medium"} -->
            <h3 class="wp-block-heading has-medium-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_phase['title']) ?></h3>
            <!-- /wp:heading -->

            <!-- wp:list {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <ul class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0">
                <?php foreach ($kotlinskidev_phase['items'] as $kotlinskidev_item) : ?>
                <!-- wp:list-item -->
                <li><?php echo esc_html($kotlinskidev_item) ?></li>
                <!-- /wp:list-item -->
                <?php endforeach; ?>
            </ul>
            <!-- /wp:list -->
        </div>
        <!-- /wp:group -->
        <?php endforeach; ?>
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
