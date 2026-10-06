<?php
/**
 * Title: Work With Me Option Cards
 * Slug: kotlinskidev/work-with-me-option-cards
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icons = $kotlinskidev_url . 'assets/icons/work-with-me/';
$kotlinskidev_service_icons = $kotlinskidev_url . 'assets/icons/services/';
$kotlinskidev_options = array(
    array(
        'icon'  => $kotlinskidev_icons . 'icon-hire.svg',
        'chip'  => __('Full-time', 'kotlinskidev'),
        'title' => __('Hire me', 'kotlinskidev'),
        'desc'  => __('Permanent or contract frontend role — React, Next.js and commerce storefronts. Remote, EU hours.', 'kotlinskidev'),
        'link'  => __('See my CV →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-support.svg',
        'chip'  => __('Retainer', 'kotlinskidev'),
        'title' => __('Ongoing support', 'kotlinskidev'),
        'desc'  => __('A monthly block of hours for updates, releases and the things that break at the wrong moment.', 'kotlinskidev'),
        'link'  => __('Check availability →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-fix.svg',
        'chip'  => __('Project', 'kotlinskidev'),
        'title' => __('Help with my website', 'kotlinskidev'),
        'desc'  => __('A build, a redesign or a rescue — WordPress, Shopify or a custom Next.js front end.', 'kotlinskidev'),
        'link'  => __('Describe the project →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_service_icons . 'icon-analysis.svg',
        'chip'  => __('Fixed fee', 'kotlinskidev'),
        'title' => __('Ask for an analysis', 'kotlinskidev'),
        'desc'  => __('Performance, SEO and accessibility audit with a written, prioritised list of what to fix first.', 'kotlinskidev'),
        'link'  => __('Request an audit →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-parttime.svg',
        'chip'  => __('Part-time', 'kotlinskidev'),
        'title' => __('Part-time engagement', 'kotlinskidev'),
        'desc'  => __('Two or three days a week alongside your team, with elastic hours and async handover.', 'kotlinskidev'),
        'link'  => __('Talk about scope →', 'kotlinskidev'),
    ),
    array(
        'icon'  => $kotlinskidev_icons . 'icon-freelance.svg',
        'chip'  => __('Evenings', 'kotlinskidev'),
        'title' => __('Small freelance jobs', 'kotlinskidev'),
        'desc'  => __('Short tasks picked up after hours — a landing page, a tricky bug, a block that needs building.', 'kotlinskidev'),
        'link'  => __('Send the task →', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/work-with-me-option-cards","name":"Work With Me Option Cards"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.25rem"}},"layout":{"type":"grid","minimumColumnWidth":"20rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_options as $kotlinskidev_option) : ?>
        <!-- wp:group {"groupLinkUrl":"#","className":"kt-link-card kt-link-card--lift","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.375rem"},"spacing":{"padding":{"top":"1.875rem","bottom":"1.875rem","left":"1.75rem","right":"1.75rem"},"blockGap":"0.625rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group kt-link-card kt-link-card--lift has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.375rem;padding-top:1.875rem;padding-right:1.75rem;padding-bottom:1.875rem;padding-left:1.75rem"><!-- wp:group {"style":{"spacing":{"blockGap":"0.75rem"},"margin":{"bottom":"1.25rem"}},"layout":{"type":"flex","justifyContent":"space-between","verticalAlignment":"center"}} -->
            <div class="wp-block-group" style="margin-bottom:1.25rem"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.875rem"}},"backgroundColor":"divider","layout":{"type":"flex","justifyContent":"center","verticalAlignment":"center"}} -->
                <div class="wp-block-group has-border-color has-divider-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.875rem"><!-- wp:image {"width":"1.625rem","height":"1.625rem","sizeSlug":"full","linkDestination":"none"} -->
                    <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_option['icon']) ?>" alt="" style="width:1.625rem;height:1.625rem" /></figure>
                    <!-- /wp:image -->
                </div>
                <!-- /wp:group -->

                <!-- wp:paragraph {"style":{"border":{"radius":"999px"},"spacing":{"padding":{"top":"0.375rem","bottom":"0.375rem","left":"0.75rem","right":"0.75rem"},"margin":{"top":"0","bottom":"0"}},"typography":{"fontWeight":"700","letterSpacing":"0.14em"}},"backgroundColor":"divider","textColor":"primary","fontSize":"x-small"} -->
                <p class="has-primary-color has-divider-background-color has-text-color has-background has-x-small-font-size" style="border-radius:999px;margin-top:0;margin-bottom:0;padding-top:0.375rem;padding-right:0.75rem;padding-bottom:0.375rem;padding-left:0.75rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php echo esc_html($kotlinskidev_option['chip']) ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

            <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"medium"} -->
            <h3 class="wp-block-heading has-medium-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_option['title']) ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_option['desc']) ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
            <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600"><?php echo esc_html($kotlinskidev_option['link']) ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <?php endforeach; ?>
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
