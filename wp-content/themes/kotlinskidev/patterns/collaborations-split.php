<?php
/**
 * Title: Collaborations Split
 * Slug: kotlinskidev/collaborations-split
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/service_icon.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/collaborations-split","name":"Collaborations Split"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        @media (max-width: 48rem) {
            .kotlinskidev-collab-split-heading,
            .kotlinskidev-collab-split-copy {
                text-align: center;
            }
        }
    </style>
    <!-- /wp:html -->

    <!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.375rem"},"spacing":{"padding":{"top":"2.5rem","bottom":"2.5rem","left":"2.5rem","right":"2.5rem"}}},"backgroundColor":"background-alt","layout":{"type":"constrained"}} -->
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
            <div class="wp-block-column is-vertically-aligned-center">
                <!-- wp:html -->
                <style>
                    .kotlinskidev-collab-split-wall {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
                        gap: 0.75rem;
                    }
                    .kotlinskidev-collab-split-wall__tile {
                        height: 5.25rem;
                        padding: 1rem;
                        background: var(--wp--preset--color--surface);
                        border: 1px solid var(--wp--preset--color--divider);
                        border-radius: 0.75rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .kotlinskidev-collab-split-wall__tile img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        filter: grayscale(1) opacity(0.5);
                        transition: filter 0.3s ease;
                    }
                    .kotlinskidev-collab-split-wall__tile:hover img {
                        filter: grayscale(0) opacity(1);
                    }
                </style>
                <div class="kotlinskidev-collab-split-wall">
                    <?php for ($i = 1; $i <= 6; $i++) : ?>
                    <div class="kotlinskidev-collab-split-wall__tile">
                        <img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="<?php echo esc_attr(sprintf(
                            /* translators: %d: collaborator/logo position number. */
                            __('Collaborator logo %d', 'kotlinskidev'),
                            $i
                        )) ?>" loading="lazy" />
                    </div>
                    <?php endfor; ?>
                </div>
                <!-- /wp:html -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->