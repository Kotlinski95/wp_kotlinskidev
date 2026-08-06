<?php

use Brain\Monkey\Functions;

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
    Functions\when('admin_url')->justReturn('https://example.test/wp-admin/admin-post.php');
    Functions\when('wp_nonce_field')->justReturn('');
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('wp_unslash')->alias(fn ($t) => $t);
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

it('uses the configured field labels', function () {
    $html = kotlinskidev_contact_form_render(['nameLabel' => 'Full Name', 'submitLabel' => 'Get in touch']);

    expect($html)->toContain('<label for="name">Full Name</label>');
    expect($html)->toContain('<button type="submit">Get in touch</button>');
});
