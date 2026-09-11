<?php
function kotlinskidev_sentry_should_init(): bool
{
    if ('' === (string) get_option('kotlinskidev_sentry_dsn', '')) {
        return false;
    }

    if (defined('WP_DEBUG') && WP_DEBUG) {
        return false;
    }

    return file_exists(get_template_directory() . '/vendor/autoload.php');
}

function kotlinskidev_init_sentry(): void
{
    if (!kotlinskidev_sentry_should_init()) {
        return;
    }

    require_once get_template_directory() . '/vendor/autoload.php';

    if (!class_exists('\Sentry\State\Hub') || !class_exists('\Sentry\ErrorHandler')) {
        return;
    }

    \Sentry\init([
        'dsn'                => get_option('kotlinskidev_sentry_dsn', ''),
        'environment'        => wp_get_environment_type(),
        'release'            => 'kotlinskidev@' . wp_get_theme()->get('Version'),
        'traces_sample_rate' => 0,
        'error_types'        => E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR | E_USER_ERROR,
    ]);

    \Sentry\ErrorHandler::registerOnceExceptionHandler();
    \Sentry\ErrorHandler::registerOnceFatalErrorHandler();
}
kotlinskidev_init_sentry();
