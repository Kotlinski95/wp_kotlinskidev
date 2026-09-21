<?php
/**
 * Title: Certificates Badge Grid
 * Slug: kotlinskidev/certificates-badge-grid
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/service_icon.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/certificates-badge-grid","name":"Certificates Badge Grid"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-badge-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(14.375rem, 1fr));
            gap: 1.25rem;
        }
        .kotlinskidev-badge-grid__tile {
            display: block;
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.25rem;
            padding: 1.625rem 1.5rem 1.375rem;
            text-align: center;
            text-decoration: none;
            transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .kotlinskidev-badge-grid__tile:hover {
            border-color: var(--wp--preset--color--primary);
            transform: translateY(-0.1875rem);
        }
        .kotlinskidev-badge-grid__icon {
            width: 6rem;
            height: 6rem;
            margin: 0 auto 1.125rem;
            border-radius: 50%;
            object-fit: contain;
            background: var(--wp--preset--color--surface);
            border: 1px solid var(--wp--preset--color--divider);
            padding: 0.875rem;
        }
        .kotlinskidev-badge-grid__name {
            font-size: 1rem;
            font-weight: 700;
            line-height: 1.35;
            color: var(--wp--preset--color--foreground);
            margin-bottom: 0.375rem;
        }
        .kotlinskidev-badge-grid__issuer {
            font-size: 0.84375rem;
            color: var(--wp--preset--color--foreground-alt);
            margin-bottom: 0.875rem;
        }
        .kotlinskidev-badge-grid__meta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: var(--wp--preset--color--foreground-alt);
        }
        .kotlinskidev-badge-grid__meta span:first-child {
            opacity: 0.6;
        }
        .kotlinskidev-badge-grid__verify {
            color: var(--wp--preset--color--primary);
            font-weight: 600;
        }
    </style>
    <div class="kotlinskidev-badge-grid">
        <a href="#" class="kotlinskidev-badge-grid__tile">
            <img class="kotlinskidev-badge-grid__icon" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
            <div class="kotlinskidev-badge-grid__name"><?php esc_html_e('GPT-4 API Developer', 'kotlinskidev') ?></div>
            <div class="kotlinskidev-badge-grid__issuer"><?php esc_html_e('OpenAI', 'kotlinskidev') ?></div>
            <div class="kotlinskidev-badge-grid__meta"><span><?php esc_html_e('Issued 2025', 'kotlinskidev') ?></span><span>·</span><span class="kotlinskidev-badge-grid__verify"><?php esc_html_e('Verify', 'kotlinskidev') ?></span></div>
        </a>
        <a href="#" class="kotlinskidev-badge-grid__tile">
            <img class="kotlinskidev-badge-grid__icon" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
            <div class="kotlinskidev-badge-grid__name"><?php esc_html_e('Claude Builder', 'kotlinskidev') ?></div>
            <div class="kotlinskidev-badge-grid__issuer"><?php esc_html_e('Anthropic', 'kotlinskidev') ?></div>
            <div class="kotlinskidev-badge-grid__meta"><span><?php esc_html_e('Issued 2025', 'kotlinskidev') ?></span><span>·</span><span class="kotlinskidev-badge-grid__verify"><?php esc_html_e('Verify', 'kotlinskidev') ?></span></div>
        </a>
        <a href="#" class="kotlinskidev-badge-grid__tile">
            <img class="kotlinskidev-badge-grid__icon" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
            <div class="kotlinskidev-badge-grid__name"><?php esc_html_e('Gemini for Developers', 'kotlinskidev') ?></div>
            <div class="kotlinskidev-badge-grid__issuer"><?php esc_html_e('Google', 'kotlinskidev') ?></div>
            <div class="kotlinskidev-badge-grid__meta"><span><?php esc_html_e('Issued 2024', 'kotlinskidev') ?></span><span>·</span><span class="kotlinskidev-badge-grid__verify"><?php esc_html_e('Verify', 'kotlinskidev') ?></span></div>
        </a>
        <a href="#" class="kotlinskidev-badge-grid__tile">
            <img class="kotlinskidev-badge-grid__icon" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
            <div class="kotlinskidev-badge-grid__name"><?php esc_html_e('Next.js App Router', 'kotlinskidev') ?></div>
            <div class="kotlinskidev-badge-grid__issuer"><?php esc_html_e('Vercel', 'kotlinskidev') ?></div>
            <div class="kotlinskidev-badge-grid__meta"><span><?php esc_html_e('Issued 2024', 'kotlinskidev') ?></span><span>·</span><span class="kotlinskidev-badge-grid__verify"><?php esc_html_e('Verify', 'kotlinskidev') ?></span></div>
        </a>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->