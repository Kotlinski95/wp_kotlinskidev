<?php
const KOTLINSKIDEV_THEME_UPDATE_SLUG           = 'kotlinskidev';
const KOTLINSKIDEV_THEME_UPDATE_OPTION         = 'kotlinskidev_theme_update';
const KOTLINSKIDEV_THEME_UPDATE_FAILURE_OPTION = 'kotlinskidev_theme_update_failure';
const KOTLINSKIDEV_THEME_UPDATE_DISABLED_CONST = 'KOTLINSKIDEV_THEME_UPDATES_DISABLED';
const KOTLINSKIDEV_THEME_UPDATE_CHANNEL_CONST  = 'KOTLINSKIDEV_THEME_UPDATE_CHANNEL';
const KOTLINSKIDEV_THEME_UPDATE_STABLE         = 'stable';
const KOTLINSKIDEV_THEME_UPDATE_BETA           = 'beta';
const KOTLINSKIDEV_THEME_UPDATE_VERSION_REGEX  = '/^\d+\.\d+\.\d+(-(beta|rc)\.\d+)?\z/';
const KOTLINSKIDEV_THEME_UPDATE_ASSET_NAME     = 'kotlinskidev.zip';
const KOTLINSKIDEV_THEME_UPDATE_RELEASE_LIMIT  = 20;
const KOTLINSKIDEV_THEME_UPDATE_OWNER          = 'Kotlinski95';
const KOTLINSKIDEV_THEME_UPDATE_REPO           = 'wp_kotlinskidev';
const KOTLINSKIDEV_THEME_UPDATE_PUBLIC_KEY     = 'X/D67g0F1WItbFC2+YGmNyI6dzpTVm043KfpYvxKtlk=';
const KOTLINSKIDEV_THEME_UPDATE_REQUIRED_FILES = [ 'style.css', 'theme.json', 'functions.php', 'vendor/autoload.php' ];

function kotlinskidev_theme_update_constant( string $name ): mixed {
    return defined( $name ) ? constant( $name ) : null;
}

function kotlinskidev_theme_update_valid_channel( mixed $value ): bool {
    return KOTLINSKIDEV_THEME_UPDATE_STABLE === $value || KOTLINSKIDEV_THEME_UPDATE_BETA === $value;
}

function kotlinskidev_theme_update_channel( ?callable $read_constant = null ): string {
    $read_constant = $read_constant ?? 'kotlinskidev_theme_update_constant';
    $constant      = $read_constant( KOTLINSKIDEV_THEME_UPDATE_CHANNEL_CONST );

    $option = get_site_option( KOTLINSKIDEV_THEME_UPDATE_OPTION, [] );
    $stored = is_array( $option ) ? ( $option['channel'] ?? null ) : null;

    $channel = kotlinskidev_theme_update_valid_channel( $constant )
        ? $constant
        : ( kotlinskidev_theme_update_valid_channel( $stored ) ? $stored : KOTLINSKIDEV_THEME_UPDATE_STABLE );

    $filtered = apply_filters( 'kotlinskidev_theme_update_channel', $channel );

    return kotlinskidev_theme_update_valid_channel( $filtered ) ? $filtered : $channel;
}

function kotlinskidev_theme_update_repository_path(): string {
    return KOTLINSKIDEV_THEME_UPDATE_OWNER . '/' . KOTLINSKIDEV_THEME_UPDATE_REPO;
}

function kotlinskidev_theme_update_source(): array {
    $defaults = [
        'repository'    => 'https://github.com/' . kotlinskidev_theme_update_repository_path() . '/',
        'slug'          => KOTLINSKIDEV_THEME_UPDATE_SLUG,
        'asset_pattern' => '/kotlinskidev\.zip$/',
        'branch'        => 'master',
    ];

    $filtered = apply_filters( 'kotlinskidev_theme_update_source', [ 'branch' => $defaults['branch'] ] );
    $branch   = is_array( $filtered ) ? ( $filtered['branch'] ?? null ) : null;

    if ( is_string( $branch ) && '' !== $branch ) {
        $defaults['branch'] = $branch;
    }

    return $defaults;
}

function kotlinskidev_theme_update_package_pattern(): string {
    return '#^/' . preg_quote( kotlinskidev_theme_update_repository_path(), '#' ) . '/releases/download/v(\d+\.\d+\.\d+(?:-(?:beta|rc)\.\d+)?)/' . preg_quote( KOTLINSKIDEV_THEME_UPDATE_ASSET_NAME, '#' ) . '$#';
}

function kotlinskidev_theme_update_is_trusted_url( string $url ): bool {
    $parts = wp_parse_url( $url );

    if ( ! is_array( $parts ) || 'https' !== ( $parts['scheme'] ?? '' ) || 'github.com' !== ( $parts['host'] ?? '' ) ) {
        return false;
    }

    foreach ( [ 'query', 'fragment', 'user', 'pass', 'port' ] as $forbidden ) {
        if ( isset( $parts[ $forbidden ] ) ) {
            return false;
        }
    }

    if ( str_contains( $url, '..' ) || str_contains( $url, '?' ) || str_contains( $url, '#' ) || str_contains( $url, '@' ) ) {
        return false;
    }

    return 1 === preg_match( kotlinskidev_theme_update_package_pattern(), (string) ( $parts['path'] ?? '' ) );
}

function kotlinskidev_theme_under_version_control( string $directory, string $stop_at ): bool {
    $current = rtrim( $directory, '/' );
    $stop_at = rtrim( $stop_at, '/' );

    while ( '' !== $current ) {
        if ( file_exists( $current . '/.git' ) ) {
            return true;
        }

        $parent = dirname( $current );

        if ( $current === $stop_at || $parent === $current ) {
            return false;
        }

        $current = $parent;
    }

    return false;
}

function kotlinskidev_theme_update_context(): bool {
    return is_admin() || wp_doing_cron() || ( defined( 'WP_CLI' ) && WP_CLI );
}

function kotlinskidev_theme_update_skip_reason( ?callable $read_constant = null, ?string $theme_directory = null, ?string $stop_at = null ): ?string {
    $read_constant = $read_constant ?? 'kotlinskidev_theme_update_constant';

    if ( ! kotlinskidev_theme_update_context() ) {
        return 'context';
    }

    if ( true === $read_constant( KOTLINSKIDEV_THEME_UPDATE_DISABLED_CONST ) ) {
        return 'disabled';
    }

    $directory = $theme_directory ?? get_template_directory();
    $stop_at   = $stop_at ?? ABSPATH;

    return kotlinskidev_theme_under_version_control( $directory, $stop_at ) ? 'version-control' : null;
}

function kotlinskidev_theme_release_has_assets( object $release, string $asset_name ): bool {
    $names = [];

    foreach ( is_array( $release->assets ?? null ) ? $release->assets : [] as $asset ) {
        if ( is_object( $asset ) && is_string( $asset->name ?? null ) ) {
            $names[] = $asset->name;
        }
    }

    return in_array( $asset_name, $names, true ) && in_array( $asset_name . '.sha256', $names, true ) && in_array( $asset_name . '.sig', $names, true );
}

function kotlinskidev_theme_release_acceptable( string $version, object $release, string $channel ): bool {
    if ( 1 !== preg_match( KOTLINSKIDEV_THEME_UPDATE_VERSION_REGEX, $version ) ) {
        return false;
    }

    $is_prerelease = str_contains( $version, '-' ) || ! empty( $release->prerelease );

    if ( $is_prerelease && KOTLINSKIDEV_THEME_UPDATE_BETA !== $channel ) {
        return false;
    }

    return kotlinskidev_theme_release_has_assets( $release, KOTLINSKIDEV_THEME_UPDATE_ASSET_NAME );
}

function kotlinskidev_theme_update_only_release_strategy( mixed $strategies ): array {
    $strategies = is_array( $strategies ) ? $strategies : [];

    return array_intersect_key( $strategies, [ 'latest_release' => true ] );
}

function kotlinskidev_theme_update_parse_checksum( string $body ): ?string {
    return 1 === preg_match( '/^\s*([A-Fa-f0-9]{64})(\s|$)/', $body, $match ) ? strtolower( $match[1] ) : null;
}

function kotlinskidev_theme_update_package_version( string $package ): ?string {
    if ( 1 !== preg_match( '#/releases/download/v?([^/]+)/#', $package, $match ) ) {
        return null;
    }

    return 1 === preg_match( KOTLINSKIDEV_THEME_UPDATE_VERSION_REGEX, $match[1] ) ? $match[1] : null;
}

function kotlinskidev_theme_update_fetch_checksum( string $url ): ?string {
    $response = wp_safe_remote_get(
        $url,
        [
            'timeout'             => 10,
            'limit_response_size' => 1024,
        ]
    );

    if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
        return null;
    }

    return kotlinskidev_theme_update_parse_checksum( (string) wp_remote_retrieve_body( $response ) );
}

function kotlinskidev_theme_update_fetch_signature( string $url ): ?string {
    $response = wp_safe_remote_get(
        $url,
        [
            'timeout'             => 10,
            'limit_response_size' => 256,
        ]
    );

    if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
        return null;
    }

    $signature = base64_decode( trim( (string) wp_remote_retrieve_body( $response ) ), true );

    return is_string( $signature ) && SODIUM_CRYPTO_SIGN_BYTES === strlen( $signature ) ? $signature : null;
}

function kotlinskidev_theme_update_signature_valid( string $file, string $signature, string $public_key_base64 = KOTLINSKIDEV_THEME_UPDATE_PUBLIC_KEY ): bool {
    $public_key = base64_decode( $public_key_base64, true );
    $contents   = file_get_contents( $file );

    if ( ! is_string( $public_key ) || SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES !== strlen( $public_key ) || false === $contents ) {
        return false;
    }

    return sodium_crypto_sign_verify_detached( $signature, $contents, $public_key );
}

function kotlinskidev_theme_update_record_failure( string $package, string $message ): void {
    update_site_option(
        KOTLINSKIDEV_THEME_UPDATE_FAILURE_OPTION,
        [
            'version' => kotlinskidev_theme_update_package_version( $package ),
            'message' => $message,
        ]
    );
}

function kotlinskidev_theme_update_reject( string $code, string $package, string $message ): WP_Error {
    kotlinskidev_theme_update_record_failure( $package, $message );

    return new WP_Error( $code, $message );
}

function kotlinskidev_theme_verify_package( mixed $reply, mixed $package, mixed $upgrader = null, mixed $hook_extra = [] ): mixed {
    if ( false !== $reply || ! is_string( $package ) || ! is_array( $hook_extra ) || KOTLINSKIDEV_THEME_UPDATE_SLUG !== ( $hook_extra['theme'] ?? null ) ) {
        return $reply;
    }

    $checksum_url = $package . '.sha256';

    if ( ! kotlinskidev_theme_update_is_trusted_url( $package ) ) {
        return kotlinskidev_theme_update_reject( 'kotlinskidev_theme_untrusted_package', $package, __( 'The theme release is not served from the trusted GitHub release location, so it was not installed.', 'kotlinskidev' ) );
    }

    $expected = kotlinskidev_theme_update_fetch_checksum( $checksum_url );

    if ( null === $expected ) {
        return kotlinskidev_theme_update_reject( 'kotlinskidev_theme_checksum_missing', $package, __( 'This theme release has no SHA-256 checksum file, so it cannot be installed safely.', 'kotlinskidev' ) );
    }

    $signature = kotlinskidev_theme_update_fetch_signature( $package . '.sig' );

    if ( null === $signature ) {
        return kotlinskidev_theme_update_reject( 'kotlinskidev_theme_signature_missing', $package, __( 'This theme release has no valid signature file, so it cannot be installed safely.', 'kotlinskidev' ) );
    }

    $file = download_url( $package );

    if ( is_wp_error( $file ) ) {
        return $file;
    }

    $actual = hash_file( 'sha256', $file );

    if ( false === $actual || ! hash_equals( $expected, $actual ) ) {
        wp_delete_file( $file );

        return kotlinskidev_theme_update_reject( 'kotlinskidev_theme_checksum_mismatch', $package, __( 'The downloaded theme package does not match its SHA-256 checksum and was discarded.', 'kotlinskidev' ) );
    }

    if ( ! kotlinskidev_theme_update_signature_valid( $file, $signature ) ) {
        wp_delete_file( $file );

        return kotlinskidev_theme_update_reject( 'kotlinskidev_theme_signature_invalid', $package, __( 'The downloaded theme package does not match its signature and was discarded.', 'kotlinskidev' ) );
    }

    return $file;
}

function kotlinskidev_theme_update_expected_version(): ?string {
    $transient = get_site_transient( 'update_themes' );
    $entry     = is_object( $transient ) && is_array( $transient->response ?? null ) ? ( $transient->response[ KOTLINSKIDEV_THEME_UPDATE_SLUG ] ?? null ) : null;
    $package   = is_array( $entry ) ? ( $entry['package'] ?? null ) : null;

    if ( ! is_string( $package ) || ! kotlinskidev_theme_update_is_trusted_url( $package ) ) {
        return null;
    }

    return kotlinskidev_theme_update_package_version( $package );
}

function kotlinskidev_theme_update_source_problem( string $source, ?string $expected_version ): ?string {
    $directory = untrailingslashit( $source );

    if ( KOTLINSKIDEV_THEME_UPDATE_SLUG !== basename( $directory ) ) {
        return __( 'The theme package must contain a single "kotlinskidev" folder, so the update was cancelled.', 'kotlinskidev' );
    }

    foreach ( KOTLINSKIDEV_THEME_UPDATE_REQUIRED_FILES as $file ) {
        if ( ! file_exists( $directory . '/' . $file ) ) {
            return sprintf(
                /* translators: %s: missing file path inside the theme package */
                __( 'The theme package is missing %s, so the update was cancelled.', 'kotlinskidev' ),
                $file
            );
        }
    }

    $headers = get_file_data( $directory . '/style.css', [ 'Version' => 'Version' ] );

    if ( null === $expected_version || $expected_version !== ( $headers['Version'] ?? '' ) ) {
        return __( 'The theme package version does not match the release it was published under, so the update was cancelled.', 'kotlinskidev' );
    }

    return null;
}

function kotlinskidev_theme_verify_source( mixed $source, mixed $remote_source = null, mixed $upgrader = null, mixed $hook_extra = [] ): mixed {
    if ( ! is_string( $source ) || ! is_array( $hook_extra ) || KOTLINSKIDEV_THEME_UPDATE_SLUG !== ( $hook_extra['theme'] ?? null ) ) {
        return $source;
    }

    $problem = kotlinskidev_theme_update_source_problem( $source, kotlinskidev_theme_update_expected_version() );

    if ( null === $problem ) {
        return $source;
    }

    kotlinskidev_theme_update_record_failure( '', $problem );

    return new WP_Error( 'kotlinskidev_theme_package_invalid', $problem );
}

function kotlinskidev_theme_update_includes_theme( mixed $hook_extra ): bool {
    if ( ! is_array( $hook_extra ) || 'theme' !== ( $hook_extra['type'] ?? null ) ) {
        return false;
    }

    $themes = is_array( $hook_extra['themes'] ?? null ) ? $hook_extra['themes'] : [];

    return KOTLINSKIDEV_THEME_UPDATE_SLUG === ( $hook_extra['theme'] ?? null ) || in_array( KOTLINSKIDEV_THEME_UPDATE_SLUG, $themes, true );
}

function kotlinskidev_theme_update_after_upgrade( mixed $upgrader = null, mixed $hook_extra = [] ): void {
    if ( ! kotlinskidev_theme_update_includes_theme( $hook_extra ) ) {
        return;
    }

    delete_site_option( KOTLINSKIDEV_THEME_UPDATE_FAILURE_OPTION );
    delete_site_option( 'external_updates-' . kotlinskidev_theme_update_source()['slug'] );
    delete_site_transient( 'update_themes' );

    $theme = wp_get_theme( KOTLINSKIDEV_THEME_UPDATE_SLUG );

    if ( method_exists( $theme, 'delete_pattern_cache' ) ) {
        $theme->delete_pattern_cache();
    }
}

function kotlinskidev_theme_update_failure_notice(): void {
    if ( ! current_user_can( 'update_themes' ) ) {
        return;
    }

    $failure = get_site_option( KOTLINSKIDEV_THEME_UPDATE_FAILURE_OPTION, [] );

    if ( ! is_array( $failure ) || ! is_string( $failure['message'] ?? null ) || '' === $failure['message'] ) {
        return;
    }

    $failed_version = $failure['version'] ?? null;
    $installed      = wp_get_theme( KOTLINSKIDEV_THEME_UPDATE_SLUG )->get( 'Version' );

    if ( is_string( $failed_version ) && is_string( $installed ) && version_compare( $installed, $failed_version, '>=' ) ) {
        delete_site_option( KOTLINSKIDEV_THEME_UPDATE_FAILURE_OPTION );

        return;
    }

    printf(
        '<div class="notice notice-error"><p>%s</p></div>',
        esc_html( sprintf( 'Kotlinskidev theme update: %s', $failure['message'] ) )
    );
}

function kotlinskidev_theme_updater_register( string $factory = 'YahnisElsts\PluginUpdateChecker\v5\PucFactory' ): ?object {
    $autoload = get_template_directory() . '/vendor/autoload.php';

    if ( ! class_exists( $factory ) && file_exists( $autoload ) ) {
        require_once $autoload;
    }

    if ( ! class_exists( $factory ) ) {
        return null;
    }

    $source  = kotlinskidev_theme_update_source();
    $channel = kotlinskidev_theme_update_channel();
    $checker = $factory::buildUpdateChecker( $source['repository'], get_template_directory() . '/style.css', $source['slug'] );

    $checker->setBranch( $source['branch'] );

    $api = $checker->getVcsApi();
    $api->enableReleaseAssets( $source['asset_pattern'], 2 );
    $api->setReleaseFilter(
        static fn ( string $version, object $release ): bool => kotlinskidev_theme_release_acceptable( $version, $release, $channel ),
        KOTLINSKIDEV_THEME_UPDATE_BETA === $channel ? 3 : 1,
        KOTLINSKIDEV_THEME_UPDATE_RELEASE_LIMIT
    );

    add_filter( 'puc_vcs_update_detection_strategies_theme-' . $source['slug'], 'kotlinskidev_theme_update_only_release_strategy' );
    add_filter( 'upgrader_pre_download', 'kotlinskidev_theme_verify_package', 10, 4 );
    add_filter( 'upgrader_source_selection', 'kotlinskidev_theme_verify_source', 10, 4 );
    add_action( 'upgrader_process_complete', 'kotlinskidev_theme_update_after_upgrade', 10, 2 );
    add_action( 'admin_notices', 'kotlinskidev_theme_update_failure_notice' );

    return $checker;
}

function kotlinskidev_theme_updater_boot(): void {
    if ( null !== kotlinskidev_theme_update_skip_reason() ) {
        return;
    }

    kotlinskidev_theme_updater_register();
}
add_action( 'init', 'kotlinskidev_theme_updater_boot' );
