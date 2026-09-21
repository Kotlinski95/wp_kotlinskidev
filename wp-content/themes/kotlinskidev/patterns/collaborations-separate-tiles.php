<?php
/**
 * Title: Collaborations Separate Tiles
 * Slug: kotlinskidev/collaborations-separate-tiles
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/service_icon.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/collaborations-separate-tiles","name":"Collaborations Separate Tiles"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-tiles {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(11.25rem, 1fr));
            gap: 1rem;
        }
        .kotlinskidev-tiles__tile {
            height: 7.5rem;
            padding: 1.625rem;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .kotlinskidev-tiles__tile:hover {
            transform: translateY(-0.1875rem);
            border-color: var(--wp--preset--color--primary);
            background: var(--wp--preset--color--surface);
        }
        .kotlinskidev-tiles__tile img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            filter: grayscale(1) opacity(0.5);
            transition: filter 0.3s ease;
        }
        .kotlinskidev-tiles__tile:hover img {
            filter: grayscale(0) opacity(1);
        }
    </style>
    <div class="kotlinskidev-tiles">
        <?php for ($i = 1; $i <= 6; $i++) : ?>
        <div class="kotlinskidev-tiles__tile">
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