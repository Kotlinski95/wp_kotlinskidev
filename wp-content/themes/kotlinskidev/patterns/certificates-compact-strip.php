<?php
/**
 * Title: Certificates Compact Strip
 * Slug: kotlinskidev/certificates-compact-strip
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/service_icon.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/certificates-compact-strip","name":"Certificates Compact Strip"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-cert-strip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.25rem;
            padding: 1.375rem 1.625rem;
        }
        .kotlinskidev-cert-strip__group {
            display: flex;
            align-items: center;
            gap: 0.875rem;
            flex-wrap: wrap;
        }
        .kotlinskidev-cert-strip__label {
            font-size: 0.71875rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--wp--preset--color--foreground-alt);
            white-space: nowrap;
        }
        .kotlinskidev-cert-strip__pill {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 999px;
            padding: 0.5rem 1rem 0.5rem 0.5rem;
            font-size: 0.84375rem;
            font-weight: 600;
            color: var(--wp--preset--color--foreground);
            text-decoration: none;
            transition: border-color 0.2s ease, color 0.2s ease;
        }
        .kotlinskidev-cert-strip__pill:hover {
            border-color: var(--wp--preset--color--primary);
            color: var(--wp--preset--color--primary);
        }
        .kotlinskidev-cert-strip__pill img {
            width: 1.625rem;
            height: 1.625rem;
            border-radius: 50%;
            object-fit: contain;
        }
        .kotlinskidev-cert-strip__all {
            font-size: 0.84375rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
            text-decoration: none;
            white-space: nowrap;
        }
        .kotlinskidev-cert-strip__all:hover {
            text-decoration: underline;
        }
    </style>
    <div class="kotlinskidev-cert-strip">
        <div class="kotlinskidev-cert-strip__group">
            <span class="kotlinskidev-cert-strip__label"><?php esc_html_e('Certified in', 'kotlinskidev') ?></span>
            <a href="#" class="kotlinskidev-cert-strip__pill"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" /><?php esc_html_e('OpenAI', 'kotlinskidev') ?></a>
            <a href="#" class="kotlinskidev-cert-strip__pill"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" /><?php esc_html_e('Anthropic', 'kotlinskidev') ?></a>
            <a href="#" class="kotlinskidev-cert-strip__pill"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" /><?php esc_html_e('Google', 'kotlinskidev') ?></a>
            <a href="#" class="kotlinskidev-cert-strip__pill"><img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" /><?php esc_html_e('Vercel', 'kotlinskidev') ?></a>
        </div>
        <a href="#" class="kotlinskidev-cert-strip__all"><?php esc_html_e('All credentials →', 'kotlinskidev') ?></a>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->