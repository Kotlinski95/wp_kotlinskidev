<?php
/**
 * Title: Deploy Pipeline
 * Slug: kotlinskidev/deploy-pipeline
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/deploy-pipeline","name":"Deploy Pipeline"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"border":{"width":"1px","color":"var:preset|color|divider","radius":"1.5rem"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"backgroundColor":"background-alt","layout":{"type":"constrained"}} -->
    <div class="wp-block-group has-border-color has-background-alt-background-color has-background" style="border-color:var(--wp--preset--color--divider);border-width:1px;border-radius:1.5rem;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"3.5rem"},"margin":{"top":"0","bottom":"0"}}}} -->
        <div class="wp-block-columns are-vertically-aligned-center" style="margin-top:0;margin-bottom:0"><!-- wp:column {"verticalAlignment":"center"} -->
            <div class="wp-block-column is-vertically-aligned-center">
                <!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","letterSpacing":"0.15em"},"elements":{"link":{"color":{"text":"var:preset|color|primary"}}},"spacing":{"margin":{"bottom":"0.875rem"}}},"textColor":"primary","fontSize":"x-small"} -->
                <p class="has-primary-color has-text-color has-link-color has-x-small-font-size" style="margin-bottom:0.875rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase"><?php esc_html_e('Delivery', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:heading {"level":2,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","lineHeight":"1.15"},"spacing":{"margin":{"top":"0","bottom":"1.125rem"}},"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}}},"textColor":"foreground-alt","fontSize":"x-large"} -->
                <h2 class="wp-block-heading has-foreground-alt-color has-text-color has-link-color has-x-large-font-size" style="margin-top:0;margin-bottom:1.125rem;font-style:normal;font-weight:700;line-height:1.15"><?php esc_html_e('From commit to live in minutes', 'kotlinskidev') ?></h2>
                <!-- /wp:heading -->

                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|foreground-alt"}}},"spacing":{"margin":{"bottom":"1.75rem"}}},"textColor":"foreground-alt"} -->
                <p class="has-foreground-alt-color has-text-color has-link-color" style="margin-bottom:1.75rem"><?php esc_html_e('Automated checks, preview builds and zero-downtime deploys — so releasing a change is routine rather than an event.', 'kotlinskidev') ?></p>
                <!-- /wp:paragraph -->

                <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"left"}} -->
                <div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline","gradient":"gradient-one","textColor":"light-color","style":{"elements":{"link":{"color":{"text":"var:preset|color|light-color"}}}}} -->
                    <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-light-color-color has-gradient-one-gradient-background has-text-color has-background has-link-color wp-element-button"><?php esc_html_e('Check more', 'kotlinskidev') ?></a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"verticalAlignment":"center"} -->
            <div class="wp-block-column is-vertically-aligned-center">
                <!-- wp:html -->
                <style>
                    .kotlinskidev-deploy-card {
                        border: 1px solid var(--wp--preset--color--divider);
                        border-radius: 1rem;
                        background: var(--wp--preset--color--surface);
                        overflow: hidden;
                    }
                    .kotlinskidev-deploy-card__header {
                        display: flex;
                        align-items: center;
                        gap: 0.5625rem;
                        padding: 0.8125rem 1rem;
                        border-bottom: 1px solid var(--wp--preset--color--divider);
                        font-size: 0.75rem;
                        color: var(--wp--preset--color--foreground-alt);
                    }
                    .kotlinskidev-deploy-card__dot {
                        width: 0.5rem;
                        height: 0.5rem;
                        border-radius: 50%;
                        background: var(--wp--preset--color--primary);
                        flex-shrink: 0;
                    }
                    .kotlinskidev-deploy-card__status {
                        margin-left: auto;
                        color: var(--wp--preset--color--primary);
                        font-weight: 600;
                    }
                    .kotlinskidev-deploy-card__body {
                        padding: 0.5rem 0.375rem;
                    }
                    .kotlinskidev-deploy-card__step {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem;
                        font-size: 0.8125rem;
                    }
                    .kotlinskidev-deploy-card__icon {
                        width: 1.25rem;
                        height: 1.25rem;
                        border-radius: 50%;
                        flex-shrink: 0;
                        display: grid;
                        place-items: center;
                        font-size: 0.6875rem;
                    }
                    .kotlinskidev-deploy-card__icon--done {
                        background: var(--wp--preset--color--primary);
                        color: var(--wp--preset--color--surface);
                    }
                    .kotlinskidev-deploy-card__icon--running {
                        border: 0.125rem solid var(--wp--preset--color--primary);
                        border-top-color: transparent;
                        animation: kotlinskidev-deploy-spin 0.8s linear infinite;
                    }
                    .kotlinskidev-deploy-card__icon--pending {
                        border: 1px solid var(--wp--preset--color--divider);
                    }
                    .kotlinskidev-deploy-card__label {
                        color: var(--wp--preset--color--foreground);
                    }
                    .kotlinskidev-deploy-card__label--pending {
                        color: var(--wp--preset--color--foreground-alt);
                    }
                    .kotlinskidev-deploy-card__label--running {
                        color: var(--wp--preset--color--foreground);
                        font-weight: 600;
                    }
                    .kotlinskidev-deploy-card__time {
                        margin-left: auto;
                        color: var(--wp--preset--color--foreground-alt);
                        font-size: 0.75rem;
                    }
                    .kotlinskidev-deploy-card__time--running {
                        color: var(--wp--preset--color--primary);
                    }
                    .kotlinskidev-deploy-card__progress {
                        margin: 0 0.75rem 0.75rem 2.75rem;
                        height: 0.3125rem;
                        border-radius: 0.1875rem;
                        background: var(--wp--preset--color--divider);
                        overflow: hidden;
                    }
                    .kotlinskidev-deploy-card__progress span {
                        display: block;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, var(--wp--preset--color--primary), transparent);
                        animation: kotlinskidev-deploy-sweep 1.9s linear infinite;
                    }
                    @keyframes kotlinskidev-deploy-sweep {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    @keyframes kotlinskidev-deploy-spin {
                        to { transform: rotate(360deg); }
                    }
                    @media (prefers-reduced-motion: reduce) {
                        .kotlinskidev-deploy-card__progress span,
                        .kotlinskidev-deploy-card__icon--running {
                            animation: none;
                        }
                    }
                </style>
                <div class="kotlinskidev-deploy-card" aria-hidden="true">
                    <div class="kotlinskidev-deploy-card__header">
                        <span class="kotlinskidev-deploy-card__dot"></span>
                        <span><?php esc_html_e('Deployment · main', 'kotlinskidev') ?></span>
                        <span class="kotlinskidev-deploy-card__status"><?php esc_html_e('Ready', 'kotlinskidev') ?></span>
                    </div>
                    <div class="kotlinskidev-deploy-card__body">
                        <div class="kotlinskidev-deploy-card__step">
                            <span class="kotlinskidev-deploy-card__icon kotlinskidev-deploy-card__icon--done">✓</span>
                            <span class="kotlinskidev-deploy-card__label"><?php esc_html_e('Install dependencies', 'kotlinskidev') ?></span>
                            <span class="kotlinskidev-deploy-card__time">14s</span>
                        </div>
                        <div class="kotlinskidev-deploy-card__step">
                            <span class="kotlinskidev-deploy-card__icon kotlinskidev-deploy-card__icon--done">✓</span>
                            <span class="kotlinskidev-deploy-card__label"><?php esc_html_e('Lint & type-check', 'kotlinskidev') ?></span>
                            <span class="kotlinskidev-deploy-card__time">9s</span>
                        </div>
                        <div class="kotlinskidev-deploy-card__step">
                            <span class="kotlinskidev-deploy-card__icon kotlinskidev-deploy-card__icon--done">✓</span>
                            <span class="kotlinskidev-deploy-card__label"><?php esc_html_e('Build static pages', 'kotlinskidev') ?></span>
                            <span class="kotlinskidev-deploy-card__time">42s</span>
                        </div>
                        <div class="kotlinskidev-deploy-card__step" style="padding-bottom:0.375rem">
                            <span class="kotlinskidev-deploy-card__icon kotlinskidev-deploy-card__icon--running"></span>
                            <span class="kotlinskidev-deploy-card__label--running"><?php esc_html_e('Deploy to production', 'kotlinskidev') ?></span>
                            <span class="kotlinskidev-deploy-card__time kotlinskidev-deploy-card__time--running"><?php esc_html_e('running', 'kotlinskidev') ?></span>
                        </div>
                        <div class="kotlinskidev-deploy-card__progress"><span></span></div>
                        <div class="kotlinskidev-deploy-card__step">
                            <span class="kotlinskidev-deploy-card__icon kotlinskidev-deploy-card__icon--pending"></span>
                            <span class="kotlinskidev-deploy-card__label--pending"><?php esc_html_e('Invalidate CDN cache', 'kotlinskidev') ?></span>
                        </div>
                    </div>
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