<?php
/**
 * Title: CV Document Preview
 * Slug: kotlinskidev/cv-document-preview
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/about.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/cv-document-preview","name":"CV Document Preview"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"2.75rem"}}}} -->
    <div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center"} -->
        <div class="wp-block-column is-vertically-aligned-center"><!-- wp:image {"id":5979,"width":"18.75rem","aspectRatio":"1/1.414","scale":"cover","sizeSlug":"full","linkDestination":"none","align":"center","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.75rem"}}} -->
            <figure class="wp-block-image aligncenter size-full is-resized has-custom-border"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" class="wp-image-5979 has-border-color" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.75rem;aspect-ratio:1/1.414;object-fit:cover;width:18.75rem" /></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"center"} -->
        <div class="wp-block-column is-vertically-aligned-center">
            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.14em"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"0.75rem"}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="margin-bottom:0.75rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php esc_html_e('Curriculum vitae', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:heading {"level":2,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","lineHeight":"1.2"},"spacing":{"margin":{"top":"0","bottom":"0.75rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"big"} -->
            <h2 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="margin-top:0;margin-bottom:0.75rem;font-style:normal;font-weight:700;line-height:1.2"><?php esc_html_e('Everything on one page', 'kotlinskidev') ?></h2>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.375rem"}}},"textColor":"foreground-alt"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.375rem"><?php esc_html_e('Role history, stack and selected projects — no filler. Two versions: with a photo for Polish and German applications, without one for the UK and US.', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:group {"style":{"spacing":{"blockGap":"0.625rem","margin":{"bottom":"1.375rem"}}},"layout":{"type":"constrained"}} -->
            <div class="wp-block-group" style="margin-bottom:1.375rem"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.875rem"},"spacing":{"padding":{"top":"0.9375rem","bottom":"0.9375rem","left":"1.125rem","right":"1.125rem"},"margin":{"bottom":"0.625rem"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap"}} -->
                <div class="wp-block-group has-border-color" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.875rem;margin-bottom:0.625rem;padding-top:0.9375rem;padding-right:1.125rem;padding-bottom:0.9375rem;padding-left:1.125rem"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground"} -->
                    <p class="has-foreground-color has-text-color has-link-color" style="font-weight:600"><?php esc_html_e('CV with photo', 'kotlinskidev') ?></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><a href="#"><?php esc_html_e('PDF · 380 KB ↓', 'kotlinskidev') ?></a></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->

                <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.875rem"},"spacing":{"padding":{"top":"0.9375rem","bottom":"0.9375rem","left":"1.125rem","right":"1.125rem"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap"}} -->
                <div class="wp-block-group has-border-color" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.875rem;padding-top:0.9375rem;padding-right:1.125rem;padding-bottom:0.9375rem;padding-left:1.125rem"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|foreground"}}}},"textColor":"foreground"} -->
                    <p class="has-foreground-color has-text-color has-link-color" style="font-weight:600"><?php esc_html_e('CV without photo', 'kotlinskidev') ?></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><a href="#"><?php esc_html_e('PDF · 340 KB ↓', 'kotlinskidev') ?></a></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->

            <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php esc_html_e('Updated 19 September 2026 · also on', 'kotlinskidev') ?> <a href="#"><?php esc_html_e('LinkedIn', 'kotlinskidev') ?></a></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->