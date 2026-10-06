<?php
/**
 * Title: Work With Me Split
 * Slug: kotlinskidev/work-with-me-split
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icons = $kotlinskidev_url . 'assets/icons/work-with-me/';
$kotlinskidev_service_icons = $kotlinskidev_url . 'assets/icons/services/';
$kotlinskidev_rows = array(
    array(
        'icon'  => $kotlinskidev_icons . 'icon-hire.svg',
        'title' => __('Hire me full-time', 'kotlinskidev'),
        'sub'   => __('Permanent or B2B contract', 'kotlinskidev'),
        'link'  => __('CV →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-support.svg',
        'title' => __('Ongoing support', 'kotlinskidev'),
        'sub'   => __('From 10 h / month', 'kotlinskidev'),
        'link'  => __('Plans →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-fix.svg',
        'title' => __('Help with my website', 'kotlinskidev'),
        'sub'   => __('Build, redesign or rescue', 'kotlinskidev'),
        'link'  => __('Brief →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_service_icons . 'icon-analysis.svg',
        'title' => __('Ask for an analysis', 'kotlinskidev'),
        'sub'   => __('Speed, SEO, accessibility', 'kotlinskidev'),
        'link'  => __('Audit →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-parttime.svg',
        'title' => __('Part-time engagement', 'kotlinskidev'),
        'sub'   => __('2–3 days a week', 'kotlinskidev'),
        'link'  => __('Scope →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-freelance.svg',
        'title' => __('Small freelance jobs', 'kotlinskidev'),
        'sub'   => __('Evenings and weekends', 'kotlinskidev'),
        'link'  => __('Send →', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/work-with-me-split","name":"Work With Me Split"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:columns {"verticalAlignment":"top","style":{"spacing":{"blockGap":{"left":"1.75rem"}}}} -->
    <div class="wp-block-columns are-vertically-aligned-top"><!-- wp:column {"verticalAlignment":"top"} -->
        <div class="wp-block-column is-vertically-aligned-top"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.375rem"},"spacing":{"padding":{"top":"2.125rem","bottom":"2.125rem","left":"1.875rem","right":"1.875rem"}}},"backgroundColor":"background-alt","layout":{"type":"constrained"}} -->
            <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.375rem;padding-top:2.125rem;padding-right:1.875rem;padding-bottom:2.125rem;padding-left:1.875rem"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.14em"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"0.875rem"}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="margin-bottom:0.875rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php esc_html_e('Currently available', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","lineHeight":"1.2"},"spacing":{"margin":{"top":"0","bottom":"0.875rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"big"} -->
                <h3 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="margin-top:0;margin-bottom:0.875rem;font-style:normal;font-weight:700;line-height:1.2"><?php esc_html_e('Pick the smallest thing that solves your problem.', 'kotlinskidev') ?></h3>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.375rem"}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.375rem"><?php esc_html_e('Most people need an hour of diagnosis before they need a contract. Start with an audit or a single task — scale up from there if it works.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:buttons {"style":{"spacing":{"blockGap":"0.75rem","margin":{"bottom":"1.625rem"}}},"layout":{"type":"flex","justifyContent":"left","flexWrap":"wrap"}} -->
                <div class="wp-block-buttons" style="margin-bottom:1.625rem"><!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                    <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('Book a 20-min call', 'kotlinskidev') ?></a></div>
                    <!-- /wp:button -->

                    <!-- wp:button {"textColor":"foreground-alt","style":{"border":{"width":"1px","color":"var:preset|color|divider"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"className":"is-style-outline"} -->
                    <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-foreground-alt-color has-text-color has-link-color has-border-color wp-element-button" style="border-color:var(--wp--preset--color--divider);border-width:1px"><?php esc_html_e('Email me', 'kotlinskidev') ?></a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->

                <!-- wp:group {"style":{"border":{"top":{"color":"var:preset|color|divider","width":"1px"}},"spacing":{"padding":{"top":"1.375rem"},"blockGap":"1.375rem"}},"layout":{"type":"flex","flexWrap":"wrap"}} -->
                <div class="wp-block-group has-border-color" style="border-top-color:var(--wp--preset--color--divider);border-top-width:1px;padding-top:1.375rem"><!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('Remote · CET', 'kotlinskidev') ?></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('Elastic hours', 'kotlinskidev') ?></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('Replies in 24 h', 'kotlinskidev') ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"top"} -->
        <div class="wp-block-column is-vertically-aligned-top"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.375rem"},"spacing":{"padding":{"top":"0.375rem","bottom":"0.375rem","left":"1.625rem","right":"1.625rem"}}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
            <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.375rem;padding-top:0.375rem;padding-right:1.625rem;padding-bottom:0.375rem;padding-left:1.625rem">
                <?php foreach ($kotlinskidev_rows as $kotlinskidev_i => $kotlinskidev_row) : ?>
                <!-- wp:group <?php echo $kotlinskidev_i > 0 ? '{"style":{"border":{"top":{"width":"1px","color":"var:preset|color|divider"}},"spacing":{"padding":{"top":"1.1875rem","bottom":"1.1875rem"},"blockGap":"1rem"}},"layout":{"type":"flex","verticalAlignment":"center"}}' : '{"style":{"spacing":{"padding":{"top":"1.1875rem","bottom":"1.1875rem"},"blockGap":"1rem"}},"layout":{"type":"flex","verticalAlignment":"center"}}'; ?> -->
                <div class="wp-block-group has-border-color" style="<?php echo $kotlinskidev_i > 0 ? 'border-top-color:var(--wp--preset--color--divider);border-top-width:1px;' : ''; ?>padding-top:1.1875rem;padding-bottom:1.1875rem"><!-- wp:image {"width":"1.5rem","height":"1.5rem","sizeSlug":"full","linkDestination":"none"} -->
                    <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_row['icon']) ?>" alt="" style="width:1.5rem;height:1.5rem" /></figure>
                    <!-- /wp:image -->

                    <!-- wp:group {"style":{"spacing":{"blockGap":"0.125rem"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
                    <div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"small"} -->
                        <p class="has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:700"><?php echo esc_html($kotlinskidev_row['title']) ?></p>
                        <!-- /wp:paragraph -->

                        <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
                        <p class="has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_row['sub']) ?></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->

                    <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"x-small"} -->
                    <p class="has-primary-color has-text-color has-link-color has-x-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600"><?php echo esc_html($kotlinskidev_row['link']) ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
                <?php endforeach; ?>
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->