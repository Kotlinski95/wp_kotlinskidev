<?php
function kotlinskidev_maintenance_page_data()
{
    return [
        'background_image' => get_option('maintenance_mode_background_image', 'https://kotlinskidev.wordifysites.com/wp-content/uploads/2024/09/kotlinskidev-coming-soon-compressed.webp'),
        'logo' => get_option('maintenance_mode_logo', 'https://kotlinskidev.wordifysites.com/wp-content/uploads/2024/09/Kotlinskidev-transparent.webp'),
        'heading' => get_maintenance_translation('maintenance_mode_heading', 'Website under development!'),
        'description' => get_maintenance_translation('maintenance_mode_description', 'Work is underway to complete this site. Those interested in contacting me are invited to use social media.'),
        'contact_email' => get_option('maintenance_mode_contact_email', 'kotlinskidev@gmail.com'),
        'contact_button_text' => get_maintenance_translation('maintenance_mode_contact_button_text', 'Contact'),
        'html_lang' => get_maintenance_current_language() ?: 'en',
    ];
}

function kotlinskidev_send_maintenance_headers()
{
    http_response_code(503);
    header('Content-Type: text/html; charset=UTF-8');
    header('Retry-After: 3600');
}

function generate_maintenance_page()
{
    $page = kotlinskidev_maintenance_page_data();
    kotlinskidev_send_maintenance_headers();
    kotlinskidev_print_maintenance_head($page);
    kotlinskidev_print_maintenance_body($page);
}

function kotlinskidev_print_maintenance_head(array $page)
{
?>
    <!DOCTYPE html>
    <html class="sp-html sp-seedprod sp-h-full" dir="ltr" lang="<?php echo esc_attr($page['html_lang']); ?>" prefix="og: https://ogp.me/ns#">

    <head>
        <title><?php echo esc_html(get_bloginfo('name')); ?> - Maintenance Mode</title>
        <meta charset="UTF-8" />
        <meta name="description" content="<?php echo esc_attr($page['description']); ?>" />
        <link href="<?php echo esc_url($page['logo']); ?>" rel="shortcut icon" type="image/x-icon" />

        <meta property="og:url" content="<?php echo esc_url(home_url('/')); ?>" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="<?php echo esc_attr(get_bloginfo('name')); ?> - Maintenance Mode" />
        <meta property="og:description" content="<?php echo esc_attr($page['description']); ?>" />
        <meta property="og:image" content="<?php echo esc_url($page['logo']); ?>" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="<?php echo esc_attr(get_bloginfo('name')); ?> - Maintenance Mode" />
        <meta name="twitter:description" content="<?php echo esc_attr($page['description']); ?>" />
        <meta property="twitter:image" content="<?php echo esc_url($page['logo']); ?>" />

        <meta name="viewport" content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=3.0, user-scalable=no, viewport-fit=cover" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Hind:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        <style>
<?php
    kotlinskidev_print_maintenance_base_styles();
    kotlinskidev_print_maintenance_widget_styles();
?>
        </style>
    </head>
<?php
}

function kotlinskidev_print_maintenance_body(array $page)
{
?>

    <body class="spBgcoverscroll sp-h-full sp-antialiased sp-bg-slideshow">
        <?php echo get_maintenance_language_switcher(); ?>

        <div id="sp-page" class="spBgcoverscroll sp-content-4" style="background-color: 191919; background-image: url('<?php echo esc_url($page['background_image']); ?>') !important; font-family: 'Hind', Times, serif; font-weight: 400;">
            <section id="sp-ks8a8s" class="sp-el-section" style="width: 100%; max-width: 100%; border-radius: 0.625rem;">
                <div id="sp-vw3kvy" class="sp-el-row sm:sp-flex sp-w-full sp-m-auto sp-justify-between" style="padding: 0px; width: auto; max-width: 62.5rem; margin-inline: auto;">
                    <div id="sp-ovbx1s" class="sp-el-col sp-w-full" style="width: calc(100% - 0px); height: 100vh; display: flex; flex-direction: column; justify-content:center; overflow: hidden;">
                        <figure id="sp-xp7nhn" class="sp-image-wrapper sp-el-block" style="margin: 0px; text-align: center;">
                            <div>
                                <span>
                                    <img src="<?php echo esc_url($page['logo']); ?>" alt="<?php echo esc_attr(get_bloginfo('name')); ?> Logo" width="31.25rem" height="31.25rem" class="sp-image-block" style="width: 31.25rem; max-width: 100%; height: auto;" />
                                </span>
                            </div>
                        </figure>
                        <div class="sp-footer">
                            <div id="sp-jknss8" class="sp-spacer" style="height: 2.4375rem;"></div>
                            <h1 id="sp-y0sc75" class="sp-css-target sp-el-block sp-headline-block-y0sc75 sp-type-header" style="font-size: 3.375rem; text-align: center; margin: 0px;">
                                <?php echo esc_html($page['heading']); ?>
                            </h1>
                            <div id="sp-p7ef8k" class="sp-css-target sp-text-wrapper sp-el-block sp-text-wrapper-p7ef8k" style="font-size: 1.375rem; margin: 0px; text-align: center;">
                                <section class="section section-body">
                                    <p><?php echo esc_html($page['description']); ?></p>
                                </section>
                            </div>
                            <div id="sp-d4et4f" class="sp-spacer" style="height: 0.625rem;"></div>
                            <div id="sp-button-parent-q09cvl" class="sp-button-wrapper sp-el-block" style="margin: 0px; text-align: center;">
                                <a href="mailto:<?php echo esc_attr($page['contact_email']); ?>" id="sp-q09cvl" target="" rel="noopener" class="sp-button sp-css-target sp-text-center sp-inline-block sp-leading-none sp-button-q09cvl mail-button" style="font-size: 1.125rem; font-weight: 400; font-style: normal; background: transparent; color: #ebebeb; width: auto; padding: 0.75rem 1rem; border-radius: 0.25rem; border: 0.1875rem solid #ebebeb; box-shadow: rgba(255, 255, 255, 0.2) 0px 0.0625rem 0px inset;">
                                    <span style="font-family: Hind;"><?php echo esc_html($page['contact_button_text']); ?></span>
                                </a>
                            </div>
                            <?php echo get_maintenance_social_media_links(); ?>
                            <div id="sp-qkrns1" class="sp-spacer" style="height: 0.75rem;"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div class="wp-login">
            <a href="<?php echo esc_url(wp_login_url()); ?>" target="_self" class="wp-login-button" style="position:fixed; top: 0.625rem; right: 0.625rem; opacity: 0.3; color: #fff; text-decoration: none; background: rgba(0,0,0,0.5); padding: 0.3125rem 0.625rem; border-radius: 0.1875rem; font-size: 0.75rem;">Log-in</a>
        </div>

        <script>
            function toggleLanguageDropdown() {
                const dropdown = document.querySelector('.language-dropdown');
                dropdown.classList.toggle('active');
            }

            document.addEventListener('click', function(event) {
                const dropdown = document.querySelector('.language-dropdown');
                if (!dropdown.contains(event.target)) {
                    dropdown.classList.remove('active');
                }
            });

            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    document.querySelector('.language-dropdown').classList.remove('active');
                }
            });
        </script>
    </body>

    </html>
<?php
}
