<?php
/**
 * Title: Certificates Badge Grid
 * Slug: kotlinskidev/certificates-badge-grid
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icon = $kotlinskidev_url . 'assets/images/service_icon.webp';
$kotlinskidev_badges = array(
    array(
        'name'   => __('GPT-4 API Developer', 'kotlinskidev'),
        'issuer' => __('OpenAI', 'kotlinskidev'),
        'issued' => __('Issued 2025', 'kotlinskidev'),
    ),
    array(
        'name'   => __('Claude Builder', 'kotlinskidev'),
        'issuer' => __('Anthropic', 'kotlinskidev'),
        'issued' => __('Issued 2025', 'kotlinskidev'),
    ),
    array(
        'name'   => __('Gemini for Developers', 'kotlinskidev'),
        'issuer' => __('Google', 'kotlinskidev'),
        'issued' => __('Issued 2024', 'kotlinskidev'),
    ),
    array(
        'name'   => __('Next.js App Router', 'kotlinskidev'),
        'issuer' => __('Vercel', 'kotlinskidev'),
        'issued' => __('Issued 2024', 'kotlinskidev'),
    ),
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/certificates-badge-grid","name":"Certificates Badge Grid"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1.25rem"}},"layout":{"type":"grid","minimumColumnWidth":"14.375rem"}} -->
    <div class="wp-block-group">
        <?php foreach ($kotlinskidev_badges as $kotlinskidev_badge) : ?>
        <!-- wp:group {"groupLinkUrl":"#","className":"kt-link-card kt-link-card--lift","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.25rem"},"spacing":{"padding":{"top":"1.625rem","bottom":"1.375rem","left":"1.5rem","right":"1.5rem"},"blockGap":"0.375rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","orientation":"vertical","justifyContent":"center","verticalAlignment":"center"}} -->
        <div class="wp-block-group kt-link-card kt-link-card--lift has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.25rem;padding-top:1.625rem;padding-right:1.5rem;padding-bottom:1.375rem;padding-left:1.5rem"><!-- wp:image {"width":"6rem","height":"6rem","align":"center","sizeSlug":"full","linkDestination":"none","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"50%"}}} -->
            <figure class="wp-block-image aligncenter size-full is-resized has-custom-border"><img src="<?php echo esc_url($kotlinskidev_icon) ?>" alt="" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:50%;width:6rem;height:6rem" /></figure>
            <!-- /wp:image -->

            <!-- wp:heading {"textAlign":"center","level":3,"style":{"spacing":{"margin":{"top":"0.75rem","bottom":"0"}}},"fontSize":"normal"} -->
            <h3 class="wp-block-heading has-text-align-center has-normal-font-size" style="margin-top:0.75rem;margin-bottom:0"><?php echo esc_html($kotlinskidev_badge['name']) ?></h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"small"} -->
            <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color has-small-font-size"><?php echo esc_html($kotlinskidev_badge['issuer']) ?></p>
            <!-- /wp:paragraph -->

            <!-- wp:paragraph {"align":"center","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-small"} -->
            <p class="has-text-align-center has-foreground-alt-color has-text-color has-link-color has-x-small-font-size"><?php echo esc_html($kotlinskidev_badge['issued']) ?> · <?php esc_html_e('Verify', 'kotlinskidev') ?></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <?php endforeach; ?>
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
