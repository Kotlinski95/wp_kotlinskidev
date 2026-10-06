<?php
/**
 * Title: Project Carousel Bottom Peek
 * Slug: kotlinskidev/project-carousel-bottom-peek
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_image = $kotlinskidev_url . 'assets/images/service_icon.webp';
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/project-carousel-bottom-peek","name":"Project Carousel Bottom Peek"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"className":"kt-device-mockup","style":{"border":{"radius":"1.625rem"},"spacing":{"padding":{"top":"4.875rem","bottom":"0","left":"6%","right":"6%"}}},"backgroundColor":"dark-shade","textColor":"light-color","layout":{"type":"constrained"}} -->
    <div class="wp-block-group kt-device-mockup has-light-color-color has-dark-shade-background-color has-text-color has-background" style="border-radius:1.625rem;padding-top:4.875rem;padding-right:6%;padding-bottom:0;padding-left:6%"><!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontWeight":"700","lineHeight":"1","letterSpacing":"-0.035em"},"spacing":{"margin":{"top":"0","bottom":"1.25rem"}}},"textColor":"light-color","fontSize":"xxx-large"} -->
        <h2 class="wp-block-heading has-text-align-center has-light-color-color has-text-color has-xxx-large-font-size" style="margin-top:0;margin-bottom:1.25rem;font-weight:700;line-height:1;letter-spacing:-0.035em"><?php esc_html_e('Observe', 'kotlinskidev') ?></h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","className":"kt-device-mockup__copy","style":{"spacing":{"margin":{"bottom":"3.75rem"}}},"textColor":"foreground-alt-dark"} -->
        <p class="kt-device-mockup__copy has-text-align-center has-foreground-alt-dark-color has-text-color" style="margin-bottom:3.75rem"><?php esc_html_e('One line of project copy, set in mono for contrast against the display heading.', 'kotlinskidev') ?></p>
        <!-- /wp:paragraph -->

        <!-- wp:group {"className":"kt-device-mockup__frame","layout":{"type":"constrained"}} -->
        <div class="wp-block-group kt-device-mockup__frame"><!-- wp:image {"aspectRatio":"16/8","scale":"cover","sizeSlug":"full","linkDestination":"none","className":"kt-device-mockup__screen"} -->
            <figure class="wp-block-image size-full kt-device-mockup__screen"><img src="<?php echo esc_url($kotlinskidev_image) ?>" alt="" style="aspect-ratio:16/8;object-fit:cover" /></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
