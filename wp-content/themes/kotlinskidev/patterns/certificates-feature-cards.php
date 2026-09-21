<?php
/**
 * Title: Certificates Feature Cards
 * Slug: kotlinskidev/certificates-feature-cards
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/service_icon.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/certificates-feature-cards","name":"Certificates Feature Cards"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:html -->
    <style>
        .kotlinskidev-cert-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(19.375rem, 1fr));
            gap: 1.25rem;
        }
        .kotlinskidev-cert-cards__card {
            background: var(--wp--preset--color--background-alt);
            border: 1px solid var(--wp--preset--color--divider);
            border-radius: 1.375rem;
            padding: 1.75rem 1.625rem;
            transition: border-color 0.2s ease;
        }
        .kotlinskidev-cert-cards__card:hover {
            border-color: var(--wp--preset--color--primary);
        }
        .kotlinskidev-cert-cards__head {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.125rem;
        }
        .kotlinskidev-cert-cards__logo {
            width: 3.5rem;
            height: 3.5rem;
            flex: none;
            border-radius: 1rem;
            object-fit: contain;
            background: var(--wp--preset--color--surface);
            border: 1px solid var(--wp--preset--color--divider);
            padding: 0.5625rem;
        }
        .kotlinskidev-cert-cards__issuer {
            font-size: 0.71875rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--wp--preset--color--foreground-alt);
        }
        .kotlinskidev-cert-cards__name {
            font-size: 1.125rem;
            font-weight: 700;
            line-height: 1.3;
            color: var(--wp--preset--color--foreground);
            margin-top: 0.25rem;
        }
        .kotlinskidev-cert-cards__desc {
            font-size: 0.90625rem;
            line-height: 1.65;
            color: var(--wp--preset--color--foreground-alt);
            margin: 0 0 1.25rem;
        }
        .kotlinskidev-cert-cards__foot {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            flex-wrap: wrap;
        }
        .kotlinskidev-cert-cards__chip {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
            background: color-mix(in srgb, var(--wp--preset--color--primary) 12%, transparent);
            border-radius: 999px;
            padding: 0.375rem 0.75rem;
        }
        .kotlinskidev-cert-cards__link {
            font-size: 0.84375rem;
            font-weight: 600;
            color: var(--wp--preset--color--primary);
            text-decoration: none;
        }
        .kotlinskidev-cert-cards__link:hover {
            text-decoration: underline;
        }
    </style>
    <div class="kotlinskidev-cert-cards">
        <div class="kotlinskidev-cert-cards__card">
            <div class="kotlinskidev-cert-cards__head">
                <img class="kotlinskidev-cert-cards__logo" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
                <div>
                    <div class="kotlinskidev-cert-cards__issuer"><?php esc_html_e('OpenAI', 'kotlinskidev') ?></div>
                    <div class="kotlinskidev-cert-cards__name"><?php esc_html_e('GPT-4 API Developer', 'kotlinskidev') ?></div>
                </div>
            </div>
            <p class="kotlinskidev-cert-cards__desc"><?php esc_html_e('Production use of function calling, structured outputs and streaming in customer-facing apps.', 'kotlinskidev') ?></p>
            <div class="kotlinskidev-cert-cards__foot">
                <span class="kotlinskidev-cert-cards__chip"><?php esc_html_e('Issued Mar 2025', 'kotlinskidev') ?></span>
                <a href="#" class="kotlinskidev-cert-cards__link"><?php esc_html_e('View credential →', 'kotlinskidev') ?></a>
            </div>
        </div>
        <div class="kotlinskidev-cert-cards__card">
            <div class="kotlinskidev-cert-cards__head">
                <img class="kotlinskidev-cert-cards__logo" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
                <div>
                    <div class="kotlinskidev-cert-cards__issuer"><?php esc_html_e('Anthropic', 'kotlinskidev') ?></div>
                    <div class="kotlinskidev-cert-cards__name"><?php esc_html_e('Claude Builder', 'kotlinskidev') ?></div>
                </div>
            </div>
            <p class="kotlinskidev-cert-cards__desc"><?php esc_html_e('Tool use, long-context retrieval and evaluation workflows for agentic products.', 'kotlinskidev') ?></p>
            <div class="kotlinskidev-cert-cards__foot">
                <span class="kotlinskidev-cert-cards__chip"><?php esc_html_e('Issued Jan 2025', 'kotlinskidev') ?></span>
                <a href="#" class="kotlinskidev-cert-cards__link"><?php esc_html_e('View credential →', 'kotlinskidev') ?></a>
            </div>
        </div>
        <div class="kotlinskidev-cert-cards__card">
            <div class="kotlinskidev-cert-cards__head">
                <img class="kotlinskidev-cert-cards__logo" src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
                <div>
                    <div class="kotlinskidev-cert-cards__issuer"><?php esc_html_e('Vercel', 'kotlinskidev') ?></div>
                    <div class="kotlinskidev-cert-cards__name"><?php esc_html_e('Next.js App Router', 'kotlinskidev') ?></div>
                </div>
            </div>
            <p class="kotlinskidev-cert-cards__desc"><?php esc_html_e('Server components, streaming routes and edge caching on production storefronts.', 'kotlinskidev') ?></p>
            <div class="kotlinskidev-cert-cards__foot">
                <span class="kotlinskidev-cert-cards__chip"><?php esc_html_e('Issued Sep 2024', 'kotlinskidev') ?></span>
                <a href="#" class="kotlinskidev-cert-cards__link"><?php esc_html_e('View credential →', 'kotlinskidev') ?></a>
            </div>
        </div>
    </div>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->