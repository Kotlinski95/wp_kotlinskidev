<?php
function kotlinskidev_register_security_settings(): void
{
    kotlinskidev_register_csp_settings();
    kotlinskidev_register_other_header_settings();
}

function kotlinskidev_register_csp_settings(): void
{
    kotlinskidev_register_boolean_setting('kotlinskidev_settings_security', 'kotlinskidev_csp_enabled', true);

    kotlinskidev_register_boolean_setting('kotlinskidev_settings_security', 'kotlinskidev_csp_enforce', false);

    kotlinskidev_register_boolean_setting('kotlinskidev_settings_security', 'kotlinskidev_csp_upgrade_insecure_requests', true);

    $csp_defaults = kotlinskidev_csp_directive_defaults();
    foreach (array_values(kotlinskidev_csp_directive_option_map()) as $csp_option_key) {
        register_setting(
            'kotlinskidev_settings_security',
            $csp_option_key,
            [
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => $csp_defaults[$csp_option_key],
            ]
        );
    }

    add_settings_section(
        'kotlinskidev_section_csp_general',
        esc_html__('Content Security Policy', 'kotlinskidev'),
        'kotlinskidev_render_csp_general_section',
        'kotlinskidev-settings-security'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-security', 'kotlinskidev_section_csp_general', [
        'kotlinskidev_csp_enabled' => [
            'title'    => esc_html__('Enable CSP', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_csp_enabled_field',
        ],
        'kotlinskidev_csp_enforce' => [
            'title'    => esc_html__('Mode', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_csp_enforce_field',
        ],
        'kotlinskidev_csp_upgrade_insecure_requests' => [
            'title'    => esc_html__('Upgrade insecure requests', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_csp_upgrade_insecure_requests_field',
        ],
    ]);

    add_settings_section(
        'kotlinskidev_section_csp_directives',
        esc_html__('CSP Directives', 'kotlinskidev'),
        'kotlinskidev_render_csp_directives_section',
        'kotlinskidev-settings-security'
    );

    foreach (kotlinskidev_csp_directive_labels() as $csp_option_key => $csp_label) {
        add_settings_field(
            $csp_option_key,
            $csp_label,
            'kotlinskidev_render_csp_directive_field',
            'kotlinskidev-settings-security',
            'kotlinskidev_section_csp_directives',
            ['option' => $csp_option_key, 'label_for' => $csp_option_key]
        );
    }
}

function kotlinskidev_register_other_header_settings(): void
{
    register_setting(
        'kotlinskidev_settings_security',
        'kotlinskidev_referrer_policy',
        [
            'type'              => 'string',
            'sanitize_callback' => 'kotlinskidev_sanitize_referrer_policy',
            'default'           => 'strict-origin-when-cross-origin',
        ]
    );

    register_setting(
        'kotlinskidev_settings_security',
        'kotlinskidev_permissions_policy',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => kotlinskidev_permissions_policy_default(),
        ]
    );

    add_settings_section(
        'kotlinskidev_section_other_headers',
        esc_html__('Other Security Headers', 'kotlinskidev'),
        'kotlinskidev_render_other_headers_section',
        'kotlinskidev-settings-security'
    );

    kotlinskidev_add_settings_fields('kotlinskidev-settings-security', 'kotlinskidev_section_other_headers', [
        'kotlinskidev_referrer_policy' => [
            'title'    => esc_html__('Referrer-Policy', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_referrer_policy_field',
            'args'     => ['label_for' => 'kotlinskidev_referrer_policy'],
        ],
        'kotlinskidev_permissions_policy' => [
            'title'    => esc_html__('Permissions-Policy', 'kotlinskidev'),
            'callback' => 'kotlinskidev_render_permissions_policy_field',
            'args'     => ['label_for' => 'kotlinskidev_permissions_policy'],
        ],
    ]);
}

function kotlinskidev_sanitize_referrer_policy(string $value): string
{
    return in_array($value, kotlinskidev_referrer_policy_choices(), true) ? $value : 'strict-origin-when-cross-origin';
}

function kotlinskidev_render_csp_general_section(): void
{
    echo '<p>' . esc_html__('Controls the Content-Security-Policy header sent on frontend responses (never on wp-admin or REST requests). Each directive below is a space-separated list of sources, exactly as it appears in a real CSP header — clear a field to omit that directive entirely. Defaults match this theme\'s own third-party inventory (Google Fonts/Maps, Facebook Pixel, Google Analytics, Cloudflare Turnstile); edit them to match whatever a given site actually loads.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_csp_enabled_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_csp_enabled',
        'default' => true,
        'label'   => __('Send a Content-Security-Policy header', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_csp_enforce_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_csp_enforce',
        'default' => false,
        'label'   => __('Enforce the policy (blocks violations)', 'kotlinskidev'),
        'description' => __('Leave unchecked to send Content-Security-Policy-Report-Only instead — the browser reports violations to the console without blocking anything. Recommended for at least a few days on a new site before enforcing.', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_csp_upgrade_insecure_requests_field(): void
{
    kotlinskidev_render_checkbox_field([
        'option'  => 'kotlinskidev_csp_upgrade_insecure_requests',
        'default' => true,
        'label'   => __('Add the upgrade-insecure-requests directive', 'kotlinskidev'),
    ]);
}

function kotlinskidev_render_csp_directives_section(): void
{
    echo '<p>' . esc_html__('One field per CSP directive. Values are sanitized as plain text (no HTML, no line breaks) before being sent in the header.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_csp_directive_field(array $args): void
{
    $option  = $args['option'];
    $default = kotlinskidev_csp_directive_defaults()[$option];
    $value   = (string) get_option($option, $default);
    ?>
    <input type="text" id="<?php echo esc_attr($option); ?>" name="<?php echo esc_attr($option); ?>" value="<?php echo esc_attr($value); ?>" class="large-text code" placeholder="<?php echo esc_attr($default); ?>" />
    <?php
}

function kotlinskidev_render_other_headers_section(): void
{
    echo '<p>' . esc_html__('Referrer-Policy and Permissions-Policy are sent on every frontend response (never on wp-admin or REST requests). Set independently per site — no need to touch code to give a different customer a different policy.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_render_referrer_policy_field(): void
{
    $value = kotlinskidev_sanitize_referrer_policy((string) get_option('kotlinskidev_referrer_policy', 'strict-origin-when-cross-origin'));
    ?>
    <select id="kotlinskidev_referrer_policy" name="kotlinskidev_referrer_policy">
        <?php foreach (kotlinskidev_referrer_policy_choices() as $choice) : ?>
            <option value="<?php echo esc_attr($choice); ?>" <?php selected($value, $choice); ?>>
                <?php echo esc_html($choice); ?>
            </option>
        <?php endforeach; ?>
    </select>
    <p class="description">
        <?php esc_html_e('Controls how much of the current page URL is sent to other sites when a visitor follows a link away from this one. strict-origin-when-cross-origin is a balanced default.', 'kotlinskidev'); ?>
    </p>
    <?php
}

function kotlinskidev_render_permissions_policy_field(): void
{
    $value = get_option('kotlinskidev_permissions_policy', kotlinskidev_permissions_policy_default());
    ?>
    <textarea id="kotlinskidev_permissions_policy" name="kotlinskidev_permissions_policy" rows="4" class="large-text code"><?php echo esc_textarea($value); ?></textarea>
    <p class="description">
        <?php esc_html_e('Full Permissions-Policy header value. Clear this field to stop sending the header entirely — it will not fall back to a default once saved empty.', 'kotlinskidev'); ?>
    </p>
    <?php
}
