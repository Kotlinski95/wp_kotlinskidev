<?php
/**
 * Title: Collaborations Separate Tiles
 * Slug: kotlinskidev/collaborations-separate-tiles
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_icon = $kotlinskidev_url . 'assets/images/service_icon.webp';
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/collaborations-separate-tiles","name":"Collaborations Separate Tiles"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"1rem"}},"layout":{"type":"grid","minimumColumnWidth":"11.25rem"}} -->
    <div class="wp-block-group">
        <?php for ($i = 1; $i <= 6; $i++) : ?>
        <!-- wp:group {"className":"kt-link-card kt-link-card--lift kt-logo-dim kt-logo-dim--tile","style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1rem"}},"backgroundColor":"background-alt","layout":{"type":"flex","justifyContent":"center","verticalAlignment":"center"}} -->
        <div class="wp-block-group kt-link-card kt-link-card--lift kt-logo-dim kt-logo-dim--tile has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1rem"><!-- wp:image {"width":"3.5rem","height":"3.5rem","sizeSlug":"full","linkDestination":"none"} -->
            <figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url($kotlinskidev_icon) ?>" alt="<?php echo esc_attr(sprintf(
                /* translators: %d: collaborator/logo position number. */
                __('Collaborator logo %d', 'kotlinskidev'),
                $i
            )) ?>" style="width:3.5rem;height:3.5rem" /></figure>
            <!-- /wp:image -->
        </div>
        <!-- /wp:group -->
        <?php endfor; ?>
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
