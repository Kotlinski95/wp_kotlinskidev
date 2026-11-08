<?php
/**
 * Title: Link Cards Image Band
 * Slug: kotlinskidev/link-cards-image-band
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = $kotlinskidev_url . 'assets/images/link-cards/';
$kotlinskidev_cards = array(
    array(
        'eyebrow' => __('Service', 'kotlinskidev'),
        'title'   => __('Core Web Vitals optimization', 'kotlinskidev'),
        'desc'    => __('LCP, INP and CLS brought into the green, with before-and-after field data.', 'kotlinskidev'),
        'image'   => $kotlinskidev_images . 'img-vitals.svg',
    ),
    array(
        'eyebrow' => __('Service', 'kotlinskidev'),
        'title'   => __('Mobile-first frontend overhaul', 'kotlinskidev'),
        'desc'    => __('Rebuilt from the smallest breakpoint up, so the phone experience stops being an afterthought.', 'kotlinskidev'),
        'image'   => $kotlinskidev_images . 'img-mobile.svg',
    ),
    array(
        'eyebrow' => __('Service', 'kotlinskidev'),
        'title'   => __('Performance audit & report', 'kotlinskidev'),
        'desc'    => __('A prioritised list of what to fix first, with the measured cost of each problem.', 'kotlinskidev'),
        'image'   => $kotlinskidev_images . 'img-audit.svg',
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/link-cards-image-band","name":"Link Cards Image Band"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.5rem"}},"layout":{"type":"grid","minimumColumnWidth":"18.125rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_cards as $kotlinskidev_card) : ?>
        <!-- wp:group {"groupLinkUrl":"#","className":"kt-link-card","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"blockGap":"0"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group kt-link-card has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0"><!-- wp:image {"aspectRatio":"16/10","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
            <figure class="wp-block-image size-full"><img src="<?php echo esc_url($kotlinskidev_card['image']) ?>" alt="" style="aspect-ratio:16/10;object-fit:cover" /></figure>
            <!-- /wp:image -->

            <!-- wp:group {"style":{"spacing":{"padding":{"top":"1.625rem","bottom":"1.5rem","left":"1.5rem","right":"1.5rem"},"blockGap":"0.75rem"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
            <div class="wp-block-group" style="padding-top:1.625rem;padding-right:1.5rem;padding-bottom:1.5rem;padding-left:1.5rem"><!-- wp:paragraph {"style":{"typography":{"textTransform":"uppercase","letterSpacing":"0.2em"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"x-small"} -->
                <p class="has-primary-color has-text-color has-link-color has-x-small-font-size" style="letter-spacing:0.2em;text-transform:uppercase"><?php echo esc_html($kotlinskidev_card['eyebrow']) ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"medium"} -->
                <h3 class="wp-block-heading has-medium-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_card['title']) ?></h3>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php echo esc_html($kotlinskidev_card['desc']) ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"auto","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
                <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="margin-top:auto;margin-bottom:0"><?php esc_html_e('See more →', 'kotlinskidev') ?></p>
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
