<?php
/**
 * Title: Collaborations Hairline Grid
 * Slug: kotlinskidev/collaborations-hairline-grid
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/service_icon.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/collaborations-hairline-grid","name":"Collaborations Hairline Grid"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-hairline-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(9.375rem, 1fr));
            gap: 1px;
            background: var(--wp--preset--color--divider);
            border: 1px solid var(--wp--preset--color--divider);
        }
        .kotlinskidev-hairline-grid__cell {
            background: var(--wp--preset--color--surface);
            height: 7rem;
            padding: 1.375rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: filter 0.3s ease, background 0.3s ease;
            filter: grayscale(1) opacity(0.45);
        }
        .kotlinskidev-hairline-grid__cell:hover {
            filter: grayscale(0) opacity(1);
            background: var(--wp--preset--color--background-alt);
        }
        .kotlinskidev-hairline-grid__cell img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
    </style>
    <div class="kotlinskidev-hairline-grid">
        <?php for ($i = 1; $i <= 10; $i++) : ?>
        <div class="kotlinskidev-hairline-grid__cell">
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
<!-- /wp:group -->