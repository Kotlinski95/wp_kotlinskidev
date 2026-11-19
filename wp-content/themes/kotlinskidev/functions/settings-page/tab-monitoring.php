<?php
function kotlinskidev_register_monitoring_settings(): void
{
    register_setting(
        'kotlinskidev_settings_monitoring',
        'kotlinskidev_sentry_dsn',
        [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_monitoring',
        esc_html__('Sentry', 'kotlinskidev'),
        'kotlinskidev_render_monitoring_section',
        'kotlinskidev-settings-monitoring'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-monitoring', 'kotlinskidev_section_monitoring', [
        'kotlinskidev_sentry_dsn' => [
            'title'    => esc_html__('DSN', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_sentry_dsn_field',
            'args'     => ['label_for' => 'kotlinskidev_sentry_dsn'],
        ],
    ]);

    register_setting(
        'kotlinskidev_settings_monitoring',
        'kotlinskidev_ntfy_alert_url',
        [
            'type'              => 'string',
            'sanitize_callback' => 'kotlinskidev_sanitize_ntfy_alert_url',
            'default'           => '',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_alerts',
        esc_html__('Alerts', 'kotlinskidev'),
        'kotlinskidev_render_alerts_section',
        'kotlinskidev-settings-monitoring'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-monitoring', 'kotlinskidev_section_alerts', [
        'kotlinskidev_ntfy_alert_url' => [
            'title'    => esc_html__('ntfy topic URL', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_ntfy_alert_url_field',
            'args'     => ['label_for' => 'kotlinskidev_ntfy_alert_url'],
        ],
    ]);
}

function kotlinskidev_render_monitoring_section(): void
{
    echo '<p>' . esc_html__('Reports uncaught PHP exceptions and fatal errors (the class of bug that shows visitors a broken page) to Sentry. Regular warnings/notices/deprecations are not sent — this is scoped to failures that actually break a page, to stay well inside a free-tier event quota. Only active when WP_DEBUG is off, so local development never sends events.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_sentry_dsn_field(): void
{
    $value = get_option('kotlinskidev_sentry_dsn', '');
    ?>
    <input type="url" id="kotlinskidev_sentry_dsn" name="kotlinskidev_sentry_dsn" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="https://examplePublicKey@o0.ingest.sentry.io/0" />
    <p class="description">
        <?php esc_html_e('From your Sentry project (Settings → Client Keys). Leave empty to disable reporting.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_alerts_section(): void
{
    echo '<p>' . esc_html__('Sends a push notification when the site fails to send an email, independently of the mailer that failed. Install the ntfy app on your phone, choose a long random topic name, subscribe to it in the app, then paste https://ntfy.sh/<topic> below. Only the site host, the time and a short error message are sent; no visitor data is ever sent.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_ntfy_alert_url_field(): void
{
    $value = get_option('kotlinskidev_ntfy_alert_url', '');
    ?>
    <input type="url" id="kotlinskidev_ntfy_alert_url" name="kotlinskidev_ntfy_alert_url" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="https://ntfy.sh/your-long-random-topic" />
    <p class="description">
        <?php esc_html_e('Treat this URL like a password: anyone who knows the topic can read the alerts. Leave empty to disable alerts and the weekly mail check.', 'kotlinskidev'); ?>
    </p>
    <?php if (!kotlinskidev_ntfy_alerts_enabled()) : ?>
    <p class="description">
        <?php
        printf(
            esc_html__('Alerts are off in this environment (%s). They are only sent when WP_ENVIRONMENT_TYPE is production.', 'kotlinskidev'),
            esc_html(wp_get_environment_type())
        );
        ?>
    </p>
    <?php endif; ?>
    <?php
}
