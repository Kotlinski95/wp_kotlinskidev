<?php
/**
 * Title: Certificates Compact Strip
 * Slug: kotlinskidev/certificates-compact-strip
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icon = $kotlinskidev_url . 'assets/images/service_icon.webp';
$kotlinskidev_issuers = array(
    __('OpenAI', 'kotlinskidev'),
    __('Anthropic', 'kotlinskidev'),
    __('Google', 'kotlinskidev'),
    __('Vercel', 'kotlinskidev'),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/certificates-compact-strip","name":"Certificates Compact Strip"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"1.375rem","bottom":"1.375rem","left":"1.625rem","right":"1.625rem"},"blockGap":"1rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap"}} -->
    <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:1.375rem;padding-right:1.625rem;padding-bottom:1.375rem;padding-left:1.625rem"><!-- wp:group {"style":{"spacing":{"blockGap":"0.875rem"}},"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"center"}} -->
        <div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.14em"},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php esc_html_e('Certified in', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->

            <?php foreach ($kotlinskidev_issuers as $kotlinskidev_issuer) : ?>
            <!-- wp:group {"groupLinkUrl":"#","className":"kt-pill-link","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"999px"},"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"0.5rem","right":"1rem"},"blockGap":"0.625rem"}},"layout":{"type":"flex","verticalAlignment":"center"}} -->
            <div class="wp-block-group kt-pill-link has-border-color" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:999px;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:0.5rem"><!-- wp:image {"width":"1.625rem","height":"1.625rem","sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"50%"}}} -->
                <figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url($kotlinskidev_icon) ?>" alt="" style="border-radius:50%;width:1.625rem;height:1.625rem" /></figure>
                <!-- /wp:image -->

                <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"small"} -->
                <p class="has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600"><?php echo esc_html($kotlinskidev_issuer) ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
            <?php endforeach; ?>
        </div>
        <!-- /wp:group -->

        <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}},"spacing":{"margin":{"top":"0","bottom":"0"}}},"textColor":"primary","fontSize":"small"} -->
        <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600"><a href="#"><?php esc_html_e('All credentials →', 'kotlinskidev') ?></a></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
