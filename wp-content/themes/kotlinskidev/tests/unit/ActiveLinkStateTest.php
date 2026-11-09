<?php

require_once __DIR__ . '/../../functions/active-link-state.php';

it('matches home path', function () {
    expect(kotlinskidev_is_current_link_url('https://example.test/', '/', 'example.test'))->toBeTrue();
    expect(kotlinskidev_is_current_link_url('/', '/', 'example.test'))->toBeTrue();
});

it('matches ignoring trailing slashes', function () {
    expect(kotlinskidev_is_current_link_url('/about', '/about/', 'example.test'))->toBeTrue();
    expect(kotlinskidev_is_current_link_url('/about/', '/about', 'example.test'))->toBeTrue();
});

it('keeps EN and PL paths distinct', function () {
    expect(kotlinskidev_is_current_link_url('https://example.test/pl/', '/', 'example.test'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('https://example.test/', '/pl/', 'example.test'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('https://example.test/pl/o-mnie/', '/pl/o-mnie', 'example.test'))->toBeTrue();
    expect(kotlinskidev_is_current_link_url('/pl/o-mnie/', '/about/', 'example.test'))->toBeFalse();
});

it('ignores query string on the link', function () {
    expect(kotlinskidev_is_current_link_url('/blog/?page=2', '/blog/', 'example.test'))->toBeTrue();
});

it('rejects hashes, empty, other schemes and other hosts', function () {
    expect(kotlinskidev_is_current_link_url('', '/', 'example.test'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('#', '/', 'example.test'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('/about/#team', '/about/', 'example.test'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('mailto:a@b.test', '/', 'example.test'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('tel:123', '/', 'example.test'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('javascript:void(0)', '/', 'example.test'))->toBeFalse();
    expect(kotlinskidev_is_current_link_url('https://other.test/about/', '/about/', 'example.test'))->toBeFalse();
});
