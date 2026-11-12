<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../../functions/button-style-variants.php';

if (!function_exists('kotlinskidev_contact_attachment_is_uploaded')) {
    function kotlinskidev_contact_attachment_is_uploaded(string $path): bool
    {
        return is_file($path);
    }
}

if (!function_exists('kotlinskidev_contact_attachment_move_upload')) {
    function kotlinskidev_contact_attachment_move_upload(string $from, string $to): bool
    {
        return rename($from, $to);
    }
}

require_once __DIR__ . '/../../../functions/contact-form-attachments.php';

function kotlinskidev_contact_form_render(array $attributes): string
{
    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/contact-form/render.php',
        $attributes
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="contact-form-ts contact-form-block"');
    Functions\when('esc_html')->alias(fn ($t) => $t);
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('esc_url')->alias(fn ($t) => $t);
    Functions\when('get_template_directory')->justReturn(dirname(__DIR__, 3));
    Functions\when('esc_js')->alias(fn ($t) => $t);
    Functions\when('admin_url')->alias(fn ($path = '') => 'https://example.test/wp-admin/' . $path);
    Functions\when('wp_nonce_field')->justReturn('');
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
    Functions\when('apply_filters')->alias(fn ($hook, $value) => $value);
    Functions\when('wp_json_encode')->alias(fn ($v) => json_encode($v));
    Functions\when('absint')->alias(fn ($v) => abs((int) $v));
    Functions\stubTranslationFunctions();
    unset($_GET['contact-success'], $_GET['contact-error']);
});

it('renders the plain form with no success, error, or captcha markup by default', function () {
    $html = kotlinskidev_contact_form_render([]);

    expect($html)->not->toContain('contact-form-success');
    expect($html)->not->toContain('contact-form-error');
    expect($html)->not->toContain('g-recaptcha');
    expect($html)->toContain('action="https://example.test/wp-admin/admin-post.php"');
});

it('shows the default success message when the contact-success flag is present', function () {
    $_GET['contact-success'] = '1';

    $html = kotlinskidev_contact_form_render([]);

    expect($html)->toContain('id="contact-form-ts-success"');
    expect($html)->toContain('Thank you! Your message has been sent.');
});

it('shows a custom success message when configured', function () {
    $_GET['contact-success'] = '1';

    $html = kotlinskidev_contact_form_render(['successMessage' => 'All set!']);

    expect($html)->toContain('All set!');
});

it('shows the default error message for a generic error', function () {
    $_GET['contact-error'] = '1';

    $html = kotlinskidev_contact_form_render([]);

    expect($html)->toContain('contact-form-error');
    expect($html)->toContain('Sorry, there was an error. Please try again.');
});

it('shows the recaptcha-specific error message for a captcha error with the recaptcha provider', function () {
    $_GET['contact-error'] = 'captcha';

    $html = kotlinskidev_contact_form_render(['captchaProvider' => 'recaptcha']);

    expect($html)->toContain('Please complete the reCAPTCHA verification.');
});

it('shows the turnstile-specific error message for a captcha error with the turnstile provider', function () {
    $_GET['contact-error'] = 'captcha';

    $html = kotlinskidev_contact_form_render(['captchaProvider' => 'turnstile']);

    expect($html)->toContain('Please complete the Cloudflare Turnstile verification.');
});

it('enqueues and renders the recaptcha widget when enabled with a site key', function () {
    Functions\expect('wp_enqueue_script')->once()->with('google-recaptcha', Mockery::type('string'), [], null, true);

    $html = kotlinskidev_contact_form_render([
        'enableCaptcha' => true,
        'captchaProvider' => 'recaptcha',
        'recaptchaSiteKey' => 'site-key-123',
    ]);

    expect($html)->toContain('class="g-recaptcha" data-sitekey="site-key-123"');
});

it('enqueues and renders the turnstile widget when enabled with a site key', function () {
    Functions\expect('wp_enqueue_script')->once()->with('cloudflare-turnstile', Mockery::type('string'), [], null, true);

    $html = kotlinskidev_contact_form_render([
        'enableCaptcha' => true,
        'captchaProvider' => 'turnstile',
        'turnstileSiteKey' => 'site-key-456',
    ]);

    expect($html)->toContain('class="cf-turnstile" data-sitekey="site-key-456"');
});

it('renders no captcha widget when enabled but no site key is configured', function () {
    Functions\expect('wp_enqueue_script')->never();

    $html = kotlinskidev_contact_form_render(['enableCaptcha' => true, 'captchaProvider' => 'recaptcha']);

    expect($html)->not->toContain('g-recaptcha');
});

it('fires a generate_lead analytics event on success', function () {
    $_GET['contact-success'] = '1';

    $html = kotlinskidev_contact_form_render([]);

    expect($html)->toContain("kotlinskiAnalytics.trackEvent('generate_lead', { form_name: 'contact_form' })");
});

it('fires a form_error analytics event with the error type on error', function () {
    $_GET['contact-error'] = 'captcha';

    $html = kotlinskidev_contact_form_render([]);

    expect($html)->toContain("kotlinskiAnalytics.trackEvent('form_error', { form_name: 'contact_form', error_type: 'captcha' })");
});

it('uses the configured field labels', function () {
    $html = kotlinskidev_contact_form_render(['nameLabel' => 'Full Name', 'submitLabel' => 'Get in touch']);

    expect($html)->toContain('<label for="name">Full Name</label>');
    expect($html)->toContain('<button type="submit" class="is-style-fill-adaptive">Get in touch</button>');
});

it('renders the submit button with the default fill-adaptive style', function () {
    expect(kotlinskidev_contact_form_render([]))
        ->toContain('<button type="submit" class="is-style-fill-adaptive">Send</button>');
});

it('renders the chosen submit style', function () {
    expect(kotlinskidev_contact_form_render(['submitButtonStyle' => 'primary-adaptive', 'submitLabel' => 'Wyślij']))
        ->toContain('<button type="submit" class="is-style-primary-adaptive">Wyślij</button>');
});

it('falls back to fill-adaptive for an invalid submit style', function () {
    expect(kotlinskidev_contact_form_render(['submitButtonStyle' => 'evil" onclick="x']))
        ->toContain('<button type="submit" class="is-style-fill-adaptive">');
});


it('renders no attachment markup and the plain action when the feature is off', function () {
    $html = kotlinskidev_contact_form_render([]);

    expect($html)->not->toContain('multipart/form-data');
    expect($html)->not->toContain('attachments[]');
    expect($html)->not->toContain('data-attachments');
    expect($html)->toContain('action="https://example.test/wp-admin/admin-post.php"');
});

it('renders enctype, the file input and the data attributes when attachments are on', function () {
    $html = kotlinskidev_contact_form_render(['enableAttachments' => true]);

    expect($html)->toContain('enctype="multipart/form-data"');
    expect($html)->toContain('name="attachments[]"');
    expect($html)->toContain('multiple');
    expect($html)->toContain('accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.png,.jpg,.jpeg,.zip"');
    expect($html)->toContain('data-attachments-max-files="3"');
    expect($html)->toContain('data-attachments-max-total="10485760"');
    expect($html)->toContain('data-attachments-max-file="8388608"');
    expect($html)->toContain('data-attachments-extensions="pdf,doc,docx,odt,rtf,txt,png,jpg,jpeg,zip"');
    expect($html)->toContain('for="kt-contact-attachments-input"');
    expect($html)->toContain('aria-describedby="kt-contact-attachments-help kt-contact-attachments-error"');
    expect($html)->toContain('id="kt-contact-attachments-error"');
    expect($html)->toContain('role="alert"');
    expect($html)->toContain('not stored on the website');
    expect($html)->toContain('action="https://example.test/wp-admin/admin-post.php?action=kotlinskidev_contact_form_submit"');
});

it('shows a specific alert message for every attachment error code', function (string $code, string $message) {
    $_GET['contact-error'] = $code;

    $html = kotlinskidev_contact_form_render([]);

    expect($html)->toContain('<div class="contact-form-error" role="alert">' . $message);
})->with([
    ['attachment_type', 'One of the files is not an allowed type'],
    ['attachment_size', 'The files are too large'],
    ['attachment_count', 'Too many files'],
    ['attachment_failed', 'The files could not be processed'],
    ['ratelimit', 'Too many submissions with attachments'],
    ['toolarge', 'The upload is too large'],
]);
