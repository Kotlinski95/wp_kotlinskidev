<?php

use Brain\Monkey\Functions;

if (!defined('KOTLINSKIDEV_CACHE_PREFIX')) {
    define('KOTLINSKIDEV_CACHE_PREFIX', 'kotlinskidev_');
}

if (!defined('DAY_IN_SECONDS')) {
    define('DAY_IN_SECONDS', 86400);
}

if (!class_exists('WP_Error')) {
    class WP_Error
    {
        public function __construct(private string $code = '', private string $message = '')
        {
        }

        public function get_error_message(): string
        {
            return $this->message;
        }
    }
}

require_once __DIR__ . '/../../functions/mail-failure-alerts.php';

function kotlinskidev_test_stub_alert_environment(string $url, array &$transients, array &$requests): void
{
    Functions\when('get_option')->alias(fn ($name, $default = '') => 'kotlinskidev_ntfy_alert_url' === $name ? $url : $default);
    Functions\when('esc_url_raw')->returnArg();
    Functions\when('wp_parse_url')->alias(fn ($u, $component = -1) => parse_url($u, $component));
    Functions\when('apply_filters')->alias(fn ($hook, $value) => $value);
    Functions\when('home_url')->justReturn('https://kotlinski.dev');
    Functions\when('wp_strip_all_tags')->alias(fn ($s) => strip_tags($s));
    Functions\when('get_transient')->alias(function ($key) use (&$transients) {
        return $transients[$key] ?? false;
    });
    Functions\when('set_transient')->alias(function ($key, $value) use (&$transients) {
        $transients[$key] = $value;
        return true;
    });
    Functions\when('delete_transient')->alias(function ($key) use (&$transients) {
        unset($transients[$key]);
        return true;
    });
    Functions\when('wp_remote_post')->alias(function ($target, $args) use (&$requests) {
        $requests[] = ['url' => $target, 'args' => $args];
        return [];
    });
}

it('sends nothing when the option is empty', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('', $transients, $requests);

    expect(kotlinskidev_send_mail_failure_alert('SMTP Error'))->toBeFalse();
    expect($requests)->toBeEmpty();
});

it('accepts an https ntfy.sh url', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('', $transients, $requests);

    expect(kotlinskidev_sanitize_ntfy_alert_url('https://ntfy.sh/long-topic'))->toBe('https://ntfy.sh/long-topic');
});

it('rejects invalid, non-https and wrong-host urls', function (string $input) {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('', $transients, $requests);

    expect(kotlinskidev_sanitize_ntfy_alert_url($input))->toBe('');
})->with([
    'not a url' => 'nonsense',
    'http' => 'http://ntfy.sh/topic',
    'wrong host' => 'https://evil.example/topic',
    'lookalike host' => 'https://ntfy.sh.evil.example/topic',
    'empty' => '',
]);

it('accepts hosts added through the allowed hosts filter', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('', $transients, $requests);
    Functions\when('apply_filters')->alias(fn ($hook, $value) => 'kotlinskidev_ntfy_allowed_hosts' === $hook ? ['ntfy.sh', 'push.example.org'] : $value);

    expect(kotlinskidev_sanitize_ntfy_alert_url('https://push.example.org/t'))->toBe('https://push.example.org/t');
});

it('sends host and error but never an email address or the topic url', function () {
    $transients = [];
    $requests = [];
    $url = 'https://ntfy.sh/secret-topic-abc';
    kotlinskidev_test_stub_alert_environment($url, $transients, $requests);

    kotlinskidev_send_mail_failure_alert('Could not send to visitor@example.com: invalid_grant');

    expect($requests)->toHaveCount(1);
    expect($requests[0]['url'])->toBe($url);
    $args = $requests[0]['args'];
    expect($args['timeout'])->toBe(3);
    expect($args['blocking'])->toBeFalse();
    expect($args['headers']['Title'])->toBe('Mail failure on kotlinski.dev');
    expect($args['headers']['Priority'])->toBe('4');
    expect($args['headers']['Tags'])->toBe('warning,email');
    expect($args['body'])->toContain('kotlinski.dev')->toContain('invalid_grant')->toContain('UTC');
    expect($args['body'])->not->toContain('visitor@example.com')->not->toContain('@')->not->toContain('secret-topic-abc');
});

it('truncates the error message to 200 characters', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('https://ntfy.sh/t', $transients, $requests);

    expect(mb_strlen(kotlinskidev_mail_alert_clean_message(str_repeat('a', 500))))->toBe(200);
});

it('suppresses an identical alert and allows a different signature', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('https://ntfy.sh/t', $transients, $requests);

    expect(kotlinskidev_send_mail_failure_alert('invalid_grant'))->toBeTrue();
    expect(kotlinskidev_send_mail_failure_alert('invalid_grant'))->toBeFalse();
    expect(kotlinskidev_send_mail_failure_alert('connection timed out'))->toBeTrue();
    expect($requests)->toHaveCount(2);
});

it('reports the number of suppressed alerts after the window expires', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('https://ntfy.sh/t', $transients, $requests);

    kotlinskidev_send_mail_failure_alert('invalid_grant');
    kotlinskidev_send_mail_failure_alert('invalid_grant');
    kotlinskidev_send_mail_failure_alert('invalid_grant');

    unset($transients[KOTLINSKIDEV_CACHE_PREFIX . 'mail_alert_lock_' . md5('invalid_grant')]);

    kotlinskidev_send_mail_failure_alert('invalid_grant');

    expect($requests)->toHaveCount(2);
    expect($requests[1]['args']['body'])->toContain('2 similar alerts suppressed');
    expect($requests[0]['args']['body'])->not->toContain('suppressed');
});

it('sends an alert from the wp_mail_failed handler using the error message', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('https://ntfy.sh/t', $transients, $requests);

    kotlinskidev_handle_wp_mail_failed(new WP_Error('wp_mail_failed', 'invalid_grant'));

    expect($requests)->toHaveCount(1);
    expect($requests[0]['args']['body'])->toContain('invalid_grant');
});

it('does not alert again from the contact form when wp_mail_failed already fired', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('https://ntfy.sh/t', $transients, $requests);
    Functions\when('did_action')->justReturn(1);

    kotlinskidev_alert_contact_mail_failure();

    expect($requests)->toBeEmpty();
});

it('alerts from the contact form when wp_mail_failed did not fire', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('https://ntfy.sh/t', $transients, $requests);
    Functions\when('did_action')->justReturn(0);

    kotlinskidev_alert_contact_mail_failure();

    expect($requests)->toHaveCount(1);
});

it('registers the failure, init and health check hooks', function () {
    $source = file_get_contents(__DIR__ . '/../../functions/mail-failure-alerts.php');

    expect($source)
        ->toContain("add_action('wp_mail_failed', 'kotlinskidev_handle_wp_mail_failed')")
        ->toContain("add_action('init', 'kotlinskidev_sync_mail_health_check_schedule')")
        ->toContain("add_action(KOTLINSKIDEV_MAIL_HEALTH_CHECK_HOOK, 'kotlinskidev_run_mail_health_check')");
});

it('schedules the weekly health check when the option is set', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('https://ntfy.sh/t', $transients, $requests);
    Functions\when('wp_next_scheduled')->justReturn(false);
    Functions\expect('wp_schedule_event')->once()->with(\Mockery::type('int'), 'weekly', 'kotlinskidev_mail_health_check');
    Functions\expect('wp_clear_scheduled_hook')->never();

    kotlinskidev_sync_mail_health_check_schedule();
});

it('does not schedule twice when already scheduled', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('https://ntfy.sh/t', $transients, $requests);
    Functions\when('wp_next_scheduled')->justReturn(12345);
    Functions\expect('wp_schedule_event')->never();

    kotlinskidev_sync_mail_health_check_schedule();
});

it('unschedules the health check when the option is empty', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('', $transients, $requests);
    Functions\when('wp_next_scheduled')->justReturn(12345);
    Functions\expect('wp_schedule_event')->never();
    Functions\expect('wp_clear_scheduled_hook')->once()->with('kotlinskidev_mail_health_check');

    kotlinskidev_sync_mail_health_check_schedule();
});

it('sends the weekly check mail to the admin address only when enabled', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('https://ntfy.sh/t', $transients, $requests);
    Functions\when('get_option')->alias(fn ($name, $default = '') => match ($name) {
        'kotlinskidev_ntfy_alert_url' => 'https://ntfy.sh/t',
        'admin_email' => 'admin@example.com',
        default => $default,
    });
    Functions\expect('wp_mail')->once()->with('admin@example.com', '[kotlinskidev] Weekly mail check', \Mockery::type('string'));

    kotlinskidev_run_mail_health_check();
});

it('skips the weekly check mail when the option is empty', function () {
    $transients = [];
    $requests = [];
    kotlinskidev_test_stub_alert_environment('', $transients, $requests);
    Functions\expect('wp_mail')->never();

    kotlinskidev_run_mail_health_check();
});
