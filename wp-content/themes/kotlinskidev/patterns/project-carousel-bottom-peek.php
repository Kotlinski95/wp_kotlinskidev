<?php
/**
 * Title: Project Carousel Bottom Peek
 * Slug: kotlinskidev/project-carousel-bottom-peek
 * Categories: sections, kotlinskidev/sections, themeslug/custom
 */
$kotlinskidev_url = trailingslashit(get_template_directory_uri());
$kotlinskidev_images = array(
    $kotlinskidev_url . 'assets/images/service_icon.webp',
);
?>
<!-- wp:group {"metadata":{"categories":["kotlinskidev"],"patternName":"kotlinskidev/project-carousel-bottom-peek","name":"Project Carousel Bottom Peek"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained","contentSize":"73.75rem"}} -->
<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"border":{"radius":"1.625rem"},"spacing":{"padding":{"top":"4.875rem","bottom":"0","left":"6%","right":"6%"}}},"backgroundColor":"dark-shade","textColor":"light-color","layout":{"type":"constrained"}} -->
    <div class="wp-block-group has-light-color-color has-dark-shade-background-color has-text-color has-background" style="border-radius:1.625rem;padding-top:4.875rem;padding-right:6%;padding-bottom:0;padding-left:6%"><!-- wp:html -->
        <style>
            .kotlinskidev-pc-peek {
                position: relative;
                text-align: center;
                overflow: hidden;
            }
            .kotlinskidev-pc-peek::before {
                content: "";
                position: absolute;
                top: -16%;
                left: 50%;
                transform: translateX(-50%);
                width: 62%;
                height: 56%;
                background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, transparent 68%);
                pointer-events: none;
            }
            .kotlinskidev-pc-peek__headline {
                position: relative;
                font-size: 4rem;
                line-height: 1;
                font-weight: 700;
                letter-spacing: -0.035em;
                color: #ffffff;
                margin: 0 0 1.25rem;
            }
            .kotlinskidev-pc-peek__copy {
                position: relative;
                font-size: 1rem;
                line-height: 1.6;
                color: #b7bcc4;
                margin: 0 auto 3.75rem;
                max-width: 56ch;
                font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            }
            .kotlinskidev-pc-peek__device {
                position: relative;
                max-width: 82%;
                margin: 0 auto;
                background: linear-gradient(#41454b, #26282c);
                border-radius: 1.25rem 1.25rem 0 0;
                padding: 0.75rem 0.75rem 0;
                box-shadow: 0 -0.625rem 4.375rem -1.25rem rgba(255, 255, 255, 0.12);
            }
            .kotlinskidev-pc-peek__screen {
                position: relative;
                border-radius: 0.75rem 0.75rem 0 0;
                overflow: hidden;
                background: #0d0d0d;
                aspect-ratio: 16/8;
            }
            .kotlinskidev-pc-peek__screen img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        </style>
        <div class="kotlinskidev-pc-peek">
            <h2 class="kotlinskidev-pc-peek__headline"><?php esc_html_e('Observe', 'kotlinskidev') ?></h2>
            <p class="kotlinskidev-pc-peek__copy"><?php esc_html_e('One line of project copy, set in mono for contrast against the display heading.', 'kotlinskidev') ?></p>
            <div class="kotlinskidev-pc-peek__device">
                <div class="kotlinskidev-pc-peek__screen">
                    <img src="<?php echo esc_url($kotlinskidev_images[0]) ?>" alt="" loading="lazy" />
                </div>
            </div>
        </div>
        <!-- /wp:html -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->