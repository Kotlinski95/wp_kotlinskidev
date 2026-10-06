<?php
/**
 * Title: Certificates Feature Cards
 * Slug: kotlinskidev/certificates-feature-cards
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icon = $kotlinskidev_url . 'assets/images/service_icon.webp';
$kotlinskidev_certs = array(
    array(
        'issuer' => __('OpenAI', 'kotlinskidev'),
        'name'   => __('GPT-4 API Developer', 'kotlinskidev'),
        'desc'   => __('Production use of function calling, structured outputs and streaming in customer-facing apps.', 'kotlinskidev'),
        'issued' => __('Issued Mar 2025', 'kotlinskidev'),
    ),
    array(
        'issuer' => __('Anthropic', 'kotlinskidev'),
        'name'   => __('Claude Builder', 'kotlinskidev'),
        'desc'   => __('Tool use, long-context retrieval and evaluation workflows for agentic products.', 'kotlinskidev'),
        'issued' => __('Issued Jan 2025', 'kotlinskidev'),
    ),
    array(
        'issuer' => __('Vercel', 'kotlinskidev'),
        'name'   => __('Next.js App Router', 'kotlinskidev'),
        'desc'   => __('Server components, streaming routes and edge caching on production storefronts.', 'kotlinskidev'),
        'issued' => __('Issued Sep 2024', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/certificates-feature-cards","name":"Certificates Feature Cards"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.25rem"}},"layout":{"type":"grid","minimumColumnWidth":"19.375rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_certs as $kotlinskidev_cert) : ?>
        <!-- wp:group {"className":"kt-link-card","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.375rem"},"spacing":{"padding":{"top":"1.75rem","bottom":"1.75rem","left":"1.625rem","right":"1.625rem"},"blockGap":"1.125rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
        <div class="wp-block-group kt-link-card has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.375rem;padding-top:1.75rem;padding-right:1.625rem;padding-bottom:1.75rem;padding-left:1.625rem"><!-- wp:group {"style":{"spacing":{"blockGap":"1rem"}},"layout":{"type":"flex","verticalAlignment":"center"}} -->
            <div class="wp-block-group"><!-- wp:image {"width":"3.5rem","height":"3.5rem","sizeSlug":"full","linkDestination":"none","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1rem"}}} -->
                <figure class="wp-block-image size-full is-resized has-custom-border"><img src="<?php echo esc_url($kotlinskidev_icon) ?>" alt="" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1rem;width:3.5rem;height:3.5rem" /></figure>
                <!-- /wp:image -->

                <!-- wp:group {"style":{"spacing":{"blockGap":"0.25rem"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
                <div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.14em"},"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
                    <p class="has-foreground-alt-color has-text-color has-link-color has-x-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:700;letter-spacing:0.14em;text-transform:uppercase"><?php echo esc_html($kotlinskidev_cert['issuer']) ?></p>
                    <!-- /wp:paragraph -->

                    <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"medium"} -->
                    <h3 class="wp-block-heading has-medium-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_cert['name']) ?></h3>
                    <!-- /wp:heading -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->

            <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-foreground-alt-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0"><?php echo esc_html($kotlinskidev_cert['desc']) ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:group {"style":{"spacing":{"blockGap":"0.625rem"}},"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"center"}} -->
            <div class="wp-block-group"><!-- wp:paragraph {"style":{"border":{"radius":"999px"},"spacing":{"padding":{"top":"0.375rem","bottom":"0.375rem","left":"0.75rem","right":"0.75rem"},"margin":{"top":"0","bottom":"0"}},"typography":{"fontWeight":"600"}},"backgroundColor":"divider","textColor":"primary","fontSize":"x-small"} -->
                <p class="has-primary-color has-divider-background-color has-text-color has-background has-x-small-font-size" style="border-radius:999px;margin-top:0;margin-bottom:0;padding-top:0.375rem;padding-right:0.75rem;padding-bottom:0.375rem;padding-left:0.75rem;font-weight:600"><?php echo esc_html($kotlinskidev_cert['issued']) ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"},"spacing":{"margin":{"top":"0","bottom":"0"}},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
                <p class="has-primary-color has-text-color has-link-color has-small-font-size" style="margin-top:0;margin-bottom:0;font-weight:600"><a href="#"><?php esc_html_e('View credential →', 'kotlinskidev') ?></a></p>
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
