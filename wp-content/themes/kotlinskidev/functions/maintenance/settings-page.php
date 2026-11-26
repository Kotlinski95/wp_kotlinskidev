<?php
function maintenance_mode_settings_page()
{
?>
    <div class="wrap">
        <h1><?php esc_html_e('Maintenance Mode Settings', 'your-theme'); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('maintenance_mode_options');
            do_settings_sections('maintenance-mode');
            submit_button(); ?>
        </form>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const backgroundUploadButton = document.getElementById('maintenance_background_upload_button');
            if (backgroundUploadButton) {
                backgroundUploadButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const mediaUploader = wp.media({
                        title: 'Choose Background Image',
                        button: {
                            text: 'Use This Image'
                        },
                        multiple: false,
                        library: {
                            type: 'image'
                        }
                    });

                    mediaUploader.on('select', function() {
                        const attachment = mediaUploader.state().get('selection').first().toJSON();
                        const backgroundInput = document.getElementById('maintenance_mode_background_image');
                        const backgroundPreview = document.getElementById('maintenance_background_preview');

                        if (backgroundInput) {
                            backgroundInput.value = attachment.url;
                        }
                        if (backgroundPreview) {
                            backgroundPreview.innerHTML = '<img src="' + attachment.url + '" style="max-width: 12.5rem; height: auto; border: 0.0625rem solid #ddd; padding: 0.3125rem;">';
                        }
                    });

                    mediaUploader.open();
                });
            }

            const logoUploadButton = document.getElementById('maintenance_logo_upload_button');
            if (logoUploadButton) {
                logoUploadButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const mediaUploader = wp.media({
                        title: 'Choose Logo',
                        button: {
                            text: 'Use This Image'
                        },
                        multiple: false,
                        library: {
                            type: 'image'
                        }
                    });

                    mediaUploader.on('select', function() {
                        const attachment = mediaUploader.state().get('selection').first().toJSON();
                        const logoInput = document.getElementById('maintenance_mode_logo');
                        const logoPreview = document.getElementById('maintenance_logo_preview');

                        if (logoInput) {
                            logoInput.value = attachment.url;
                        }
                        if (logoPreview) {
                            logoPreview.innerHTML = '<img src="' + attachment.url + '" style="max-width: 9.375rem; height: auto; border: 0.0625rem solid #ddd; padding: 0.3125rem;">';
                        }
                    });

                    mediaUploader.open();
                });
            }

            const backgroundClearButton = document.getElementById('maintenance_background_clear_button');
            if (backgroundClearButton) {
                backgroundClearButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const backgroundInput = document.getElementById('maintenance_mode_background_image');
                    const backgroundPreview = document.getElementById('maintenance_background_preview');

                    if (backgroundInput) {
                        backgroundInput.value = '';
                    }
                    if (backgroundPreview) {
                        backgroundPreview.innerHTML = '';
                    }
                });
            }

            const logoClearButton = document.getElementById('maintenance_logo_clear_button');
            if (logoClearButton) {
                logoClearButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const logoInput = document.getElementById('maintenance_mode_logo');
                    const logoPreview = document.getElementById('maintenance_logo_preview');

                    if (logoInput) {
                        logoInput.value = '';
                    }
                    if (logoPreview) {
                        logoPreview.innerHTML = '';
                    }
                });
            }
        });
    </script>
<?php
}
