<?php

uses(Tests\Integration\TestCase::class);

class KotlinskidevTestRedirect extends RuntimeException
{
}

function kotlinskidev_test_flow_die_handler(): void
{
    throw new RuntimeException('wp_die');
}

function kotlinskidev_test_flow_use_die_handler(): callable
{
    return 'kotlinskidev_test_flow_die_handler';
}

function kotlinskidev_test_flow_capture_redirect(string $location): string
{
    throw new KotlinskidevTestRedirect($location);
}

function kotlinskidev_test_flow_capture_mail($preempt, array $atts)
{
    $GLOBALS['kotlinskidev_test_mail'][] = $atts;

    return $GLOBALS['kotlinskidev_test_mail_result'];
}

function kotlinskidev_test_flow_capture_http($preempt, array $args, string $url)
{
    $GLOBALS['kotlinskidev_test_http'][] = ['url' => $url, 'args' => $args];
    $response = array_shift($GLOBALS['kotlinskidev_test_http_responses']);

    return $response ?? new WP_Error('no_stub', 'no stubbed response');
}

function kotlinskidev_test_flow_json_response(array $payload): array
{
    return ['headers' => [], 'body' => wp_json_encode($payload), 'response' => ['code' => 200, 'message' => 'OK'], 'cookies' => [], 'filename' => null];
}

function kotlinskidev_test_flow_submit(): array
{
    try {
        kotlinskidev_contact_form_handle_submit();
    } catch (KotlinskidevTestRedirect $redirect) {
        return ['location' => $redirect->getMessage()];
    } catch (RuntimeException $die) {
        return ['died' => $die->getMessage()];
    }

    return ['finished' => true];
}

function kotlinskidev_test_flow_page(string $content): int
{
    return (int) wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Contact', 'post_content' => wp_slash($content)]);
}

function kotlinskidev_test_flow_form_block(array $attrs): string
{
    return '<!-- wp:contact-form-ts/form ' . wp_json_encode($attrs) . ' /-->';
}

function kotlinskidev_test_flow_prepare(int $page_id, array $overrides = []): void
{
    $_POST = array_merge(
        [
            'kotlinskidev_contact_form_nonce' => wp_create_nonce('kotlinskidev_contact_form_submit'),
            'name'                            => 'Jane <b>Doe</b>',
            'email'                           => 'jane@example.com',
            'topic'                           => 'Pricing & scope',
            'message'                         => "Line one <i>x</i>\nLine two",
            'agree'                           => 'on',
        ],
        $overrides
    );
    $_SERVER['HTTP_REFERER'] = home_url('/?p=' . $page_id);
}

function kotlinskidev_test_flow_table_rows(): array
{
    global $wpdb;

    return $wpdb->get_results('SELECT * FROM ' . kotlinskidev_contact_submissions_table_name() . ' ORDER BY id ASC', ARRAY_A);
}

beforeEach(function () {
    $this->saved = [
        'server' => $_SERVER,
        'post'   => $_POST,
        'files'  => $_FILES,
        'error_log' => ini_get('error_log'),
    ];
    ini_set('error_log', '/dev/null');
    $GLOBALS['kotlinskidev_test_mail']           = [];
    $GLOBALS['kotlinskidev_test_mail_result']    = true;
    $GLOBALS['kotlinskidev_test_http']           = [];
    $GLOBALS['kotlinskidev_test_http_responses'] = [];
    add_filter('wp_die_handler', 'kotlinskidev_test_flow_use_die_handler', PHP_INT_MAX);
    add_filter('wp_redirect', 'kotlinskidev_test_flow_capture_redirect', PHP_INT_MAX);
    add_filter('pre_wp_mail', 'kotlinskidev_test_flow_capture_mail', 10, 2);
    add_filter('pre_http_request', 'kotlinskidev_test_flow_capture_http', 10, 3);
    kotlinskidev_contact_submissions_maybe_create_table();
    global $wpdb;
    $wpdb->query('DELETE FROM ' . kotlinskidev_contact_submissions_table_name());
    $_FILES = [];
    $_POST  = [];
});

afterEach(function () {
    remove_filter('wp_die_handler', 'kotlinskidev_test_flow_use_die_handler', PHP_INT_MAX);
    remove_filter('wp_redirect', 'kotlinskidev_test_flow_capture_redirect', PHP_INT_MAX);
    remove_filter('pre_wp_mail', 'kotlinskidev_test_flow_capture_mail', 10);
    remove_filter('pre_http_request', 'kotlinskidev_test_flow_capture_http', 10);
    $_SERVER = $this->saved['server'];
    $_POST   = $this->saved['post'];
    $_FILES  = $this->saved['files'];
    ini_set('error_log', (string) $this->saved['error_log']);
});

it('registers the submit and nonce hooks for guests and users', function () {
    expect(has_action('admin_post_nopriv_kotlinskidev_contact_form_submit', 'kotlinskidev_contact_form_handle_submit'))->toBe(10);
    expect(has_action('admin_post_kotlinskidev_contact_form_submit', 'kotlinskidev_contact_form_handle_submit'))->toBe(10);
    expect(has_action('wp_ajax_nopriv_kotlinskidev_contact_form_nonce', 'kotlinskidev_contact_form_send_nonce'))->toBe(10);
    expect(has_action('wp_ajax_kotlinskidev_contact_form_nonce', 'kotlinskidev_contact_form_send_nonce'))->toBe(10);
});

it('redirects an oversized request before any other check', function () {
    $page = kotlinskidev_test_flow_page('x');
    $_SERVER['CONTENT_LENGTH'] = '99999999';
    $_SERVER['HTTP_REFERER']   = home_url('/?p=' . $page);

    $result = kotlinskidev_test_flow_submit();

    expect($result['location'])->toBe(home_url('/?p=' . $page) . '&contact-error=toolarge');
});

it('dies with 403 when the nonce is missing or wrong', function () {
    $page = kotlinskidev_test_flow_page('x');
    kotlinskidev_test_flow_prepare($page, ['kotlinskidev_contact_form_nonce' => 'bad']);
    expect(kotlinskidev_test_flow_submit())->toBe(['died' => 'wp_die']);

    unset($_POST['kotlinskidev_contact_form_nonce']);
    expect(kotlinskidev_test_flow_submit())->toBe(['died' => 'wp_die']);
    expect(kotlinskidev_test_flow_table_rows())->toBe([]);
    expect($GLOBALS['kotlinskidev_test_mail'])->toBe([]);
});

it('stores the submission, mails the admin and redirects with success', function () {
    $page = kotlinskidev_test_flow_page('plain content');
    kotlinskidev_test_flow_prepare($page);

    $result = kotlinskidev_test_flow_submit();

    expect($result['location'])->toBe(home_url('/?p=' . $page) . '&contact-success=1');
    $rows = kotlinskidev_test_flow_table_rows();
    expect($rows)->toHaveCount(1);
    expect($rows[0]['name'])->toBe('Jane Doe');
    expect($rows[0]['email'])->toBe('jane@example.com');
    expect($rows[0]['topic'])->toBe('Pricing & scope');
    expect($rows[0]['message'])->toBe("Line one x\nLine two");
    expect((int) $rows[0]['agree'])->toBe(1);
    expect((int) $rows[0]['email_sent'])->toBe(1);
    expect((int) $rows[0]['post_id'])->toBe($page);
    expect($rows[0]['attachments'])->toBeNull();

    $mail = $GLOBALS['kotlinskidev_test_mail'];
    expect($mail)->toHaveCount(1);
    expect($mail[0]['to'])->toBe(get_option('admin_email'));
    expect($mail[0]['subject'])->toBe('New Contact Form Submission');
    expect($mail[0]['headers'])->toBe(['Content-Type: text/html; charset=UTF-8', 'Reply-To: jane@example.com']);
    expect($mail[0]['attachments'])->toBe([]);

    $body = preg_replace('/\d{4}-\d{2}-\d{2} \d{2}:\d{2}<\/div>/', 'DATE</div>', $mail[0]['message']);
    $path = __DIR__ . '/../fixtures/contact-form-email-body.html';
    if (getenv('UPDATE_GOLDEN') === '1') {
        file_put_contents($path, $body);
    }
    expect($body)->toBe((string) file_get_contents($path));
});

it('records a declined agreement and a failed delivery', function () {
    $page = kotlinskidev_test_flow_page('plain');
    kotlinskidev_test_flow_prepare($page);
    unset($_POST['agree']);
    $GLOBALS['kotlinskidev_test_mail_result'] = false;

    $result = kotlinskidev_test_flow_submit();

    expect($result['location'])->toBe(home_url('/?p=' . $page) . '&contact-success=1');
    $rows = kotlinskidev_test_flow_table_rows();
    expect((int) $rows[0]['agree'])->toBe(0);
    expect((int) $rows[0]['email_sent'])->toBe(0);
    expect($GLOBALS['kotlinskidev_test_mail'][0]['message'])->toContain('<span class="value">No</span>');
});

it('falls back to the home url when there is no referer', function () {
    $page = kotlinskidev_test_flow_page('plain');
    kotlinskidev_test_flow_prepare($page);
    unset($_SERVER['HTTP_REFERER']);

    $result = kotlinskidev_test_flow_submit();

    expect($result['location'])->toBe(home_url() . '?contact-success=1');
    $rows = kotlinskidev_test_flow_table_rows();
    expect($rows[0]['post_id'])->toBeNull();
});

it('redirects to the configured thank you page', function () {
    $block = kotlinskidev_test_flow_form_block(['redirectType' => 'thank_you_page', 'thankYouPageUrl' => home_url('/thanks/')]);
    $page  = kotlinskidev_test_flow_page($block);
    kotlinskidev_test_flow_prepare($page);

    expect(kotlinskidev_test_flow_submit()['location'])->toBe(home_url('/thanks/'));
});

it('falls back to the admin url when the thank you page host is not allowed', function () {
    $block = kotlinskidev_test_flow_form_block(['redirectType' => 'thank_you_page', 'thankYouPageUrl' => 'https://example.org/thanks']);
    $page  = kotlinskidev_test_flow_page($block);
    kotlinskidev_test_flow_prepare($page);

    expect(kotlinskidev_test_flow_submit()['location'])->toBe(admin_url());
});

it('redirects to the default thank you query when no page url is configured', function () {
    $block = kotlinskidev_test_flow_form_block(['redirectType' => 'thank_you_page']);
    $page  = kotlinskidev_test_flow_page($block);
    kotlinskidev_test_flow_prepare($page);

    expect(kotlinskidev_test_flow_submit()['location'])->toBe(home_url() . '?contact-thankyou=1');
});

it('requires a recaptcha response when recaptcha is enabled', function () {
    $block = kotlinskidev_test_flow_form_block(['enableCaptcha' => true, 'captchaProvider' => 'recaptcha', 'recaptchaSecretKey' => 'sekret']);
    $page  = kotlinskidev_test_flow_page($block);
    kotlinskidev_test_flow_prepare($page);

    expect(kotlinskidev_test_flow_submit()['location'])->toBe(home_url('/?p=' . $page) . '&contact-error=captcha');
    expect($GLOBALS['kotlinskidev_test_http'])->toBe([]);
    expect(kotlinskidev_test_flow_table_rows())->toBe([]);
});

it('verifies recaptcha against google and rejects failures', function () {
    $block = kotlinskidev_test_flow_form_block(['enableCaptcha' => true, 'captchaProvider' => 'recaptcha', 'recaptchaSecretKey' => 'sekret']);
    $page  = kotlinskidev_test_flow_page($block);
    $_SERVER['REMOTE_ADDR'] = '203.0.113.9';

    kotlinskidev_test_flow_prepare($page, ['g-recaptcha-response' => 'tok']);
    $GLOBALS['kotlinskidev_test_http_responses'] = [kotlinskidev_test_flow_json_response(['success' => false])];
    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-error=captcha');

    $call = $GLOBALS['kotlinskidev_test_http'][0];
    expect($call['url'])->toBe('https://www.google.com/recaptcha/api/siteverify');
    expect($call['args']['body'])->toBe(['secret' => 'sekret', 'response' => 'tok', 'remoteip' => '203.0.113.9']);
    expect($call['args']['timeout'])->toBe(10);

    $GLOBALS['kotlinskidev_test_http_responses'] = [];
    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-error=captcha');

    $GLOBALS['kotlinskidev_test_http_responses'] = [kotlinskidev_test_flow_json_response(['success' => true])];
    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-success=1');
    expect(kotlinskidev_test_flow_table_rows())->toHaveCount(1);
});

it('verifies turnstile against cloudflare and rejects failures', function () {
    $block = kotlinskidev_test_flow_form_block(['enableCaptcha' => true, 'captchaProvider' => 'turnstile', 'turnstileSecretKey' => 'tsekret']);
    $page  = kotlinskidev_test_flow_page($block);
    unset($_SERVER['REMOTE_ADDR']);

    kotlinskidev_test_flow_prepare($page);
    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-error=captcha');
    expect($GLOBALS['kotlinskidev_test_http'])->toBe([]);

    $_POST['cf-turnstile-response'] = 'ttok';
    $GLOBALS['kotlinskidev_test_http_responses'] = [kotlinskidev_test_flow_json_response(['success' => false])];
    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-error=captcha');
    $call = $GLOBALS['kotlinskidev_test_http'][0];
    expect($call['url'])->toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect($call['args']['body'])->toBe(['secret' => 'tsekret', 'response' => 'ttok', 'remoteip' => '']);

    $GLOBALS['kotlinskidev_test_http_responses'] = [];
    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-error=captcha');

    $GLOBALS['kotlinskidev_test_http_responses'] = [kotlinskidev_test_flow_json_response(['success' => true])];
    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-success=1');
});

it('skips captcha when the provider secret is empty or captcha is disabled', function () {
    $block = kotlinskidev_test_flow_form_block(['enableCaptcha' => true, 'captchaProvider' => 'turnstile']);
    $page  = kotlinskidev_test_flow_page($block);
    kotlinskidev_test_flow_prepare($page);
    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-success=1');

    $page = kotlinskidev_test_flow_page(kotlinskidev_test_flow_form_block(['enableCaptcha' => false, 'recaptchaSecretKey' => 's']));
    kotlinskidev_test_flow_prepare($page);
    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-success=1');
    expect($GLOBALS['kotlinskidev_test_http'])->toBe([]);
});

it('ignores uploads unless the block enables attachments', function () {
    $page = kotlinskidev_test_flow_page('plain');
    kotlinskidev_test_flow_prepare($page);
    $_FILES = ['attachments' => ['name' => ['a.pdf'], 'tmp_name' => ['/nonexistent'], 'error' => [UPLOAD_ERR_OK]]];

    expect(kotlinskidev_test_flow_submit()['location'])->toContain('contact-success=1');
});

it('rejects an attachment that is not a real upload', function () {
    $page = kotlinskidev_test_flow_page(kotlinskidev_test_flow_form_block(['enableAttachments' => true]));
    kotlinskidev_test_flow_prepare($page);
    $_SERVER['REMOTE_ADDR'] = '203.0.113.77';
    $_FILES = ['attachments' => ['name' => ['a.pdf'], 'tmp_name' => ['/nonexistent'], 'error' => [UPLOAD_ERR_OK]]];

    expect(kotlinskidev_test_flow_submit()['location'])->toBe(home_url('/?p=' . $page) . '&contact-error=attachment_failed');
    expect(kotlinskidev_test_flow_table_rows())->toBe([]);
    expect($GLOBALS['kotlinskidev_test_mail'])->toBe([]);
});

it('rate limits attachment attempts', function () {
    $page = kotlinskidev_test_flow_page(kotlinskidev_test_flow_form_block(['enableAttachments' => true]));
    $_SERVER['REMOTE_ADDR'] = '203.0.113.88';
    delete_transient(kotlinskidev_contact_attachment_rate_limit_key());
    $errors = [];

    for ($attempt = 0; $attempt < 6; $attempt++) {
        kotlinskidev_test_flow_prepare($page);
        $_FILES = ['attachments' => ['name' => ['a.pdf'], 'tmp_name' => ['/nonexistent'], 'error' => [UPLOAD_ERR_OK]]];
        $errors[] = kotlinskidev_test_flow_submit()['location'];
    }

    delete_transient(kotlinskidev_contact_attachment_rate_limit_key());
    expect(array_map(static fn (string $location): string => substr($location, strrpos($location, '=') + 1), $errors))->toBe([
        'attachment_failed', 'attachment_failed', 'attachment_failed', 'attachment_failed', 'attachment_failed', 'ratelimit',
    ]);
});

it('sends a nonce through the ajax endpoint helper', function () {
    expect(function_exists('kotlinskidev_contact_form_send_nonce'))->toBeTrue();
});
