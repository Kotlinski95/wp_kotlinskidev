<?php
/**
 * Title: Collaborations Split
 * Slug: kotlinskidev/collaborations-split
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icon = $kotlinskidev_url . 'assets/images/service_icon.webp';
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/collaborations-split","name":"Collaborations Split"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.375rem"},"spacing":{"padding":{"top":"2.5rem","bottom":"2.5rem","left":"2.5rem","right":"2.5rem"}}},"backgroundColor":"background-alt","layout":{"type":"constrained"}} -->
    <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.375rem;padding-top:2.5rem;padding-right:2.5rem;padding-bottom:2.5rem;padding-left:2.5rem"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"2.75rem"},"margin":{"top":"0","bottom":"0"}}}} -->
        <div class="wp-block-columns are-vertically-aligned-center" style="margin-top:0;margin-bottom:0"><!-- wp:column {"verticalAlignment":"center"} -->
            <div class="wp-block-column is-vertically-aligned-center">
                <!-- wp:heading {"level":3,"className":"kotlinskidev-collab-split-heading","style":{"typography":{"fontStyle":"normal","fontWeight":"700","lineHeight":"1.16"},"spacing":{"margin":{"top":"0","bottom":"0.875rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"big"} -->
                <h3 class="wp-block-heading kotlinskidev-collab-split-heading has-foreground-alt-color has-text-color has-link-color has-big-font-size" style="margin-top:0;margin-bottom:0.875rem;font-style:normal;font-weight:700;line-height:1.16"><?php esc_html_e('Teams I’ve built with', 'kotlinskidev') ?></h3>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"className":"kotlinskidev-collab-split-copy","style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.375rem"}}},"textColor":"foreground-alt"} -->
                <p class="kotlinskidev-collab-split-copy has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.375rem"><?php esc_html_e('Agencies, in-house product teams and founders — from single landing pages to multi-year platform work.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:paragraph {"className":"kotlinskidev-collab-split-copy","style":{"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}}},"textColor":"primary","fontSize":"small"} -->
                <p class="kotlinskidev-collab-split-copy has-primary-color has-text-color has-link-color has-small-font-size" style="font-weight:600"><a href="#"><?php esc_html_e('See the case studies →', 'kotlinskidev') ?></a></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"verticalAlignment":"center"} -->
            <div class="wp-block-column is-vertically-aligned-center"><!-- wp:group {"style":{"spacing":{"blockGap":"0.75rem"}},"layout":{"type":"grid","minimumColumnWidth":"7.5rem"}} -->
                <div class="wp-block-group">
                    <?php for ($i = 1; $i <= 6; $i++) : ?>
                    <!-- wp:group {"className":"kt-logo-dim kt-logo-dim--tile-small","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"0.75rem"}},"backgroundColor":"surface","layout":{"type":"flex","justifyContent":"center","verticalAlignment":"center"}} -->
                    <div class="wp-block-group kt-logo-dim kt-logo-dim--tile-small has-border-color has-surface-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:0.75rem"><!-- wp:image {"width":"2.5rem","height":"2.5rem","sizeSlug":"full","linkDestination":"none"} -->
                        <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_icon) ?>" alt="<?php echo esc_attr(sprintf(
                            /* translators: %d: collaborator/logo position number. */
                            __('Collaborator logo %d', 'kotlinskidev'),
                            $i
                        )) ?>" style="width:2.5rem;height:2.5rem" /></figure>
                        <!-- /wp:image -->
                    </div>
                    <!-- /wp:group -->
                    <?php endfor; ?>
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
