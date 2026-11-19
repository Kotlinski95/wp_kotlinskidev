<?php
function kotlinskidev_add_breadcrumb_settings() {
    add_action('admin_menu', 'kotlinskidev_breadcrumb_admin_menu');
    add_action('admin_init', 'kotlinskidev_breadcrumb_settings_init');
}
add_action('init', 'kotlinskidev_add_breadcrumb_settings');

function kotlinskidev_breadcrumb_admin_menu() {
    add_submenu_page(
        'edit.php',
        __('Breadcrumb Settings', 'kotlinskidev'),
        __('Breadcrumb Settings', 'kotlinskidev'),
        'manage_options',
        'kotlinskidev-breadcrumbs',
        'kotlinskidev_breadcrumb_settings_page'
    );
}

function kotlinskidev_breadcrumb_setting_fields() {
    return array(
        array('field' => 'home_text_en', 'label' => __('Home Text (English)', 'kotlinskidev'), 'callback' => 'kotlinskidev_breadcrumb_text_field', 'placeholder' => 'Home'),
        array('field' => 'topics_text_en', 'label' => __('Topics Text (English)', 'kotlinskidev'), 'callback' => 'kotlinskidev_breadcrumb_text_field', 'placeholder' => 'Topics'),
        array('field' => 'topics_url_en', 'label' => __('Topics Page URL (English)', 'kotlinskidev'), 'callback' => 'kotlinskidev_breadcrumb_url_field', 'placeholder' => '/blog-topics/'),
        array('field' => 'home_text_pl', 'label' => __('Home Text (Polish)', 'kotlinskidev'), 'callback' => 'kotlinskidev_breadcrumb_text_field', 'placeholder' => 'Strona główna'),
        array('field' => 'topics_text_pl', 'label' => __('Topics Text (Polish)', 'kotlinskidev'), 'callback' => 'kotlinskidev_breadcrumb_text_field', 'placeholder' => 'Tematy'),
        array('field' => 'topics_url_pl', 'label' => __('Topics Page URL (Polish)', 'kotlinskidev'), 'callback' => 'kotlinskidev_breadcrumb_url_field', 'placeholder' => '/tematy-bloga/'),
    );
}

function kotlinskidev_breadcrumb_settings_init() {
    register_setting('kotlinskidev_breadcrumbs', 'kotlinskidev_breadcrumb_settings');

    add_settings_section(
        'kotlinskidev_breadcrumb_main',
        __('Breadcrumb Navigation Settings', 'kotlinskidev'),
        'kotlinskidev_breadcrumb_section_callback',
        'kotlinskidev_breadcrumbs'
    );

    foreach (kotlinskidev_breadcrumb_setting_fields() as $setting_field) {
        add_settings_field(
            $setting_field['field'],
            $setting_field['label'],
            $setting_field['callback'],
            'kotlinskidev_breadcrumbs',
            'kotlinskidev_breadcrumb_main',
            array('field' => $setting_field['field'], 'placeholder' => $setting_field['placeholder'])
        );
    }
}

function kotlinskidev_breadcrumb_section_callback() {
    echo '<p>' . esc_html__('Configure breadcrumb navigation texts and URLs for both English and Polish versions of your site.', 'kotlinskidev') . '</p>';
}

function kotlinskidev_breadcrumb_input_field($args) {
    $options = get_option('kotlinskidev_breadcrumb_settings');
    $value = isset($options[$args['field']]) ? $options[$args['field']] : '';
    echo '<input type="text" name="kotlinskidev_breadcrumb_settings[' . esc_attr($args['field']) . ']" value="' . esc_attr($value) . '" placeholder="' . esc_attr($args['placeholder']) . '" class="regular-text" />';
}

function kotlinskidev_breadcrumb_text_field($args) {
    kotlinskidev_breadcrumb_input_field($args);
}

function kotlinskidev_breadcrumb_url_field($args) {
    kotlinskidev_breadcrumb_input_field($args);
    echo '<p class="description">' . esc_html__('Enter a relative path (e.g., /articles, /blog-topics) or full URL (e.g., https://yoursite.com/topics/)', 'kotlinskidev') . '</p>';
}

function kotlinskidev_breadcrumb_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form action="options.php" method="post">
            <?php
            settings_fields('kotlinskidev_breadcrumbs');
            do_settings_sections('kotlinskidev_breadcrumbs');
            submit_button(__('Save Breadcrumb Settings', 'kotlinskidev'));
            ?>
        </form>
        
        <div style="margin-top: 1.875rem; padding: 0.9375rem; background: #f9f9f9; border-left: 0.25rem solid #0073aa;">
            <h3><?php esc_html_e('How to Use', 'kotlinskidev'); ?></h3>
            <ul>
                <li><?php esc_html_e('Set custom text for "Home" and "Topics" links in both languages', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Configure URLs for your topics pages (can be relative paths or full URLs)', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Leave fields empty to use default values', 'kotlinskidev'); ?></li>
                <li><?php esc_html_e('Changes will apply immediately to all category and article pages', 'kotlinskidev'); ?></li>
            </ul>
        </div>
    </div>
    <?php
}

function kotlinskidev_resolve_breadcrumb_topics_url($topics_url) {
    if (!filter_var($topics_url, FILTER_VALIDATE_URL) && !str_starts_with($topics_url, '/')) {
        return home_url('/' . ltrim($topics_url, '/'));
    }

    if (str_starts_with($topics_url, '/')) {
        return home_url($topics_url);
    }

    return $topics_url;
}

function kotlinskidev_get_breadcrumb_settings($locale = null) {
    static $cache = [];

    if (!$locale) {
        $locale = get_locale();
    }

    if (isset($cache[$locale])) {
        return $cache[$locale];
    }

    $options = get_option('kotlinskidev_breadcrumb_settings', array());
    $language_suffix = ($locale == 'pl_PL') ? 'pl' : 'en';
    $default_topics_url = ($locale == 'pl_PL') ? '/tematy-bloga/' : '/blog-topics/';

    $topics_url = !empty($options['topics_url_' . $language_suffix])
        ? $options['topics_url_' . $language_suffix]
        : home_url($default_topics_url);

    $settings = array(
        'home_text' => !empty($options['home_text_' . $language_suffix]) ? $options['home_text_' . $language_suffix] : __('Home', 'kotlinskidev'),
        'topics_text' => !empty($options['topics_text_' . $language_suffix]) ? $options['topics_text_' . $language_suffix] : __('Topics', 'kotlinskidev'),
        'topics_url' => kotlinskidev_resolve_breadcrumb_topics_url($topics_url),
    );

    $cache[$locale] = $settings;
    return $settings;
}
