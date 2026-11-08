<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/certificate.php';
require_once __DIR__ . '/../../functions/certificate-badge-fetch.php';

beforeEach(function () {
    Functions\when('__')->returnArg(1);
});

it('allows exact and subdomain matches of the allowlisted hosts', function () {
    expect(kotlinskidev_certificate_badge_host_allowed('credly.com'))->toBeTrue();
    expect(kotlinskidev_certificate_badge_host_allowed('www.credly.com'))->toBeTrue();
    expect(kotlinskidev_certificate_badge_host_allowed('api.accredible.com'))->toBeTrue();
});

it('rejects hosts outside the allowlist, including lookalike suffixes', function () {
    expect(kotlinskidev_certificate_badge_host_allowed('evil.com'))->toBeFalse();
    expect(kotlinskidev_certificate_badge_host_allowed('evilcredly.com'))->toBeFalse();
    expect(kotlinskidev_certificate_badge_host_allowed('credly.com.evil.com'))->toBeFalse();
});

it('rejects loopback and link-local hosts even if somehow allowlisted', function () {
    expect(kotlinskidev_certificate_badge_host_is_safe('localhost'))->toBeFalse();
    expect(kotlinskidev_certificate_badge_host_is_safe('127.0.0.1'))->toBeFalse();
});

it('formats a full issued date into a Month Year label', function () {
    expect(kotlinskidev_format_certificate_issued_label('2025-06-15'))->toBe('Issued Jun 2025');
});

it('formats a year-month issued date into a Month Year label', function () {
    expect(kotlinskidev_format_certificate_issued_label('2025-03'))->toBe('Issued Mar 2025');
});

it('formats a year-only issued date without a month', function () {
    expect(kotlinskidev_format_certificate_issued_label('2024'))->toBe('Issued 2024');
});

it('returns an empty label when no issued date is set', function () {
    expect(kotlinskidev_format_certificate_issued_label(''))->toBe('');
});
