<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/contact-form.php';

it('finds the contact-form block at the top level', function () {
    $blocks = [
        ['blockName' => 'core/paragraph'],
        ['blockName' => 'contact-form-ts/form', 'attrs' => ['enableCaptcha' => true]],
    ];

    $found = kotlinskidev_contact_form_find_block($blocks);

    expect($found['attrs']['enableCaptcha'])->toBeTrue();
});

it('finds the contact-form block nested inside inner blocks', function () {
    $blocks = [
        [
            'blockName' => 'core/group',
            'innerBlocks' => [
                ['blockName' => 'contact-form-ts/form', 'attrs' => ['redirectType' => 'thank_you_page']],
            ],
        ],
    ];

    $found = kotlinskidev_contact_form_find_block($blocks);

    expect($found['attrs']['redirectType'])->toBe('thank_you_page');
});

it('returns null when there is no contact-form block anywhere', function () {
    $blocks = [
        ['blockName' => 'core/paragraph'],
        ['blockName' => 'core/group', 'innerBlocks' => [['blockName' => 'core/image']]],
    ];

    expect(kotlinskidev_contact_form_find_block($blocks))->toBeNull();
});

class KotlinskidevTestRedirectException extends Exception
{
    public string $url;

    public function __construct(string $url)
    {
        parent::__construct('redirected');
        $this->url = $url;
    }
}

it('redirects with the given error type appended to the referer url', function () {
    Functions\when('wp_get_referer')->justReturn('https://example.test/contact/');
    Functions\when('add_query_arg')->alias(fn ($key, $value, $url) => "{$url}?{$key}={$value}");
    Functions\when('wp_safe_redirect')->alias(function ($url) {
        throw new KotlinskidevTestRedirectException($url);
    });

    try {
        kotlinskidev_contact_form_redirect_with_error('captcha');
        $this->fail('Expected redirect exception was not thrown');
    } catch (KotlinskidevTestRedirectException $e) {
        expect($e->url)->toBe('https://example.test/contact/?contact-error=captcha');
    }
});

it('falls back to the home url when there is no referer', function () {
    Functions\when('wp_get_referer')->justReturn(false);
    Functions\when('home_url')->justReturn('https://example.test');
    Functions\when('add_query_arg')->alias(fn ($key, $value, $url) => "{$url}?{$key}={$value}");
    Functions\when('wp_safe_redirect')->alias(function ($url) {
        throw new KotlinskidevTestRedirectException($url);
    });

    try {
        kotlinskidev_contact_form_redirect_with_error('captcha');
        $this->fail('Expected redirect exception was not thrown');
    } catch (KotlinskidevTestRedirectException $e) {
        expect($e->url)->toBe('https://example.test?contact-error=captcha');
    }
});
