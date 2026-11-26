<?php
function kotlinskidev_register_tracking_settings(): void
{
    register_setting(
        'kotlinskidev_settings_tracking',
        'custom_fb_pixel_loader_pixel_id',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_tracking',
        'custom_fb_pixel_loader_custom_script',
        [
            'type'    => 'string',
            'default' => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_tracking',
        'custom_ga_loader_ga_id',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    register_setting(
        'kotlinskidev_settings_tracking',
        'custom_ga_loader_custom_script',
        [
            'type'    => 'string',
            'default' => '',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_tracking_fb',
        esc_html__('Facebook Pixel', 'kotlinskidev'),
        'kotlinskidev_render_tracking_fb_section',
        'kotlinskidev-settings-tracking'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-tracking', 'kotlinskidev_section_tracking_fb', [
        'custom_fb_pixel_loader_pixel_id' => [
            'title'    => esc_html__('Pixel ID', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_fb_pixel_id_field',
            'args'     => ['label_for' => 'custom_fb_pixel_loader_pixel_id'],
        ],
        'custom_fb_pixel_loader_custom_script' => [
            'title'    => esc_html__('Custom script (overrides ID)', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_fb_pixel_script_field',
            'args'     => ['label_for' => 'custom_fb_pixel_loader_custom_script'],
        ],
    ]);

    add_settings_section(
        'kotlinskidev_section_tracking_ga',
        esc_html__('Google Analytics', 'kotlinskidev'),
        'kotlinskidev_render_tracking_ga_section',
        'kotlinskidev-settings-tracking'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-tracking', 'kotlinskidev_section_tracking_ga', [
        'custom_ga_loader_ga_id' => [
            'title'    => esc_html__('Measurement ID', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_ga_id_field',
            'args'     => ['label_for' => 'custom_ga_loader_ga_id'],
        ],
        'custom_ga_loader_custom_script' => [
            'title'    => esc_html__('Custom script (overrides ID)', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_ga_script_field',
            'args'     => ['label_for' => 'custom_ga_loader_custom_script'],
        ],
    ]);

    register_setting(
        'kotlinskidev_settings_tracking',
        'kotlinskidev_cf_beacon_token',
        [
            'type'              => 'string',
            'sanitize_callback' => 'kotlinskidev_sanitize_cf_beacon_token',
            'default'           => '',
        ]
    );

    add_settings_section(
        'kotlinskidev_section_tracking_cf',
        esc_html__('Cloudflare Web Analytics', 'kotlinskidev'),
        'kotlinskidev_render_tracking_cf_section',
        'kotlinskidev-settings-tracking'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-tracking', 'kotlinskidev_section_tracking_cf', [
        'kotlinskidev_cf_beacon_token' => [
            'title'    => esc_html__('Beacon token', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_cf_beacon_token_field',
            'args'     => ['label_for' => 'kotlinskidev_cf_beacon_token'],
        ],
    ]);

    register_setting(
        'kotlinskidev_settings_tracking',
        'kotlinskidev_enabled_analytics_events',
        [
            'type'              => 'array',
            'sanitize_callback' => 'kotlinskidev_sanitize_enabled_analytics_events',
            'default'           => array_keys(kotlinskidev_tracked_event_names()),
        ]
    );

    add_settings_section(
        'kotlinskidev_section_tracking_events',
        esc_html__('Custom Event Tracking', 'kotlinskidev'),
        'kotlinskidev_render_tracking_events_section',
        'kotlinskidev-settings-tracking'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-tracking', 'kotlinskidev_section_tracking_events', [
        'kotlinskidev_enabled_analytics_events' => [
            'title'    => esc_html__('Enabled events', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_tracking_events_field',
        ],
    ]);
}

function kotlinskidev_render_tracking_fb_section(): void
{
    echo '<p>' . esc_html__('Loads the Facebook Pixel on the frontend only (not in wp-admin or REST responses), gated behind Complianz\'s "marketing" consent category — it only executes once a visitor accepts marketing cookies. A pasted custom script is output as-is and is not consent-gated automatically.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_fb_pixel_id_field(): void
{
    $value = get_option('custom_fb_pixel_loader_pixel_id', '');
    ?>
    <input type="text" id="custom_fb_pixel_loader_pixel_id" name="custom_fb_pixel_loader_pixel_id" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="123456789012345" />
    <?php
}

function kotlinskidev_render_fb_pixel_script_field(): void
{
    $value = get_option('custom_fb_pixel_loader_custom_script', '');
    ?>
    <textarea id="custom_fb_pixel_loader_custom_script" name="custom_fb_pixel_loader_custom_script" rows="8" class="large-text code"><?php echo esc_textarea($value); ?></textarea>
    <p class="description"><?php esc_html_e('Paste a full script tag here to override the ID-based snippet above.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_tracking_ga_section(): void
{
    echo '<p>' . esc_html__('Loads Google Analytics (gtag.js) on the frontend only (not in wp-admin or REST responses), gated behind Complianz\'s "statistics" consent category — it only executes once a visitor accepts statistics cookies. A pasted custom script is output as-is and is not consent-gated automatically.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_ga_id_field(): void
{
    $value = get_option('custom_ga_loader_ga_id', '');
    ?>
    <input type="text" id="custom_ga_loader_ga_id" name="custom_ga_loader_ga_id" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="G-XXXXXXXXXX" />
    <?php
}

function kotlinskidev_render_ga_script_field(): void
{
    $value = get_option('custom_ga_loader_custom_script', '');
    ?>
    <textarea id="custom_ga_loader_custom_script" name="custom_ga_loader_custom_script" rows="8" class="large-text code"><?php echo esc_textarea($value); ?></textarea>
    <p class="description"><?php esc_html_e('Paste a full script tag here to override the ID-based snippet above.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_tracking_cf_section(): void
{
    echo '<p>' . esc_html__('Loads the Cloudflare Web Analytics beacon after the first interaction or six seconds after page load, so it stays out of the critical path. Leave the token empty to disable it, and turn Auto-install off in Cloudflare so the beacon is not loaded twice.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_cf_beacon_token_field(): void
{
    $value = get_option('kotlinskidev_cf_beacon_token', '');
    ?>
    <input type="text" id="kotlinskidev_cf_beacon_token" name="kotlinskidev_cf_beacon_token" value="<?php echo esc_attr($value); ?>" class="regular-text code" maxlength="32" placeholder="32 hexadecimal characters" />
    <p class="description"><?php esc_html_e('Cloudflare dashboard, Analytics & Logs, Web Analytics, your site, Manage site, the token inside the JavaScript snippet.', 'kotlinskidev'); ?></p>
    <?php
}

function kotlinskidev_render_tracking_events_section(): void
{
    echo '<p>' . esc_html__('Custom GA4/Meta events this theme sends beyond a plain pageview (CTA clicks, form completions, lightbox opens, etc.). Unchecking one stops it going to every connected platform at once — for per-platform routing (e.g. an event reaching GA4 but not Meta), that stays a code-level decision in routing.ts. See docs/tracking-spec.md for what each event tracks.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_tracking_events_field(): void
{
    $enabled = kotlinskidev_get_enabled_analytics_events();
    ?>
    <input type="hidden" name="kotlinskidev_enabled_analytics_events[]" value="" />
    <?php foreach (kotlinskidev_tracked_event_names() as $event_name => $label) : ?>
        <label style="display:block;margin-bottom:0.25rem;">
            <input
                type="checkbox"
                name="kotlinskidev_enabled_analytics_events[]"
                value="<?php echo esc_attr($event_name); ?>"
                <?php checked(in_array($event_name, $enabled, true)); ?>
            />
            <?php echo esc_html($label); ?>
            <code><?php echo esc_html($event_name); ?></code>
        </label>
    <?php endforeach; ?>
    <?php
}
