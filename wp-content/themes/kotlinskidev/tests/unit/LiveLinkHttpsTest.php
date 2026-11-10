<?php

require_once __DIR__ . '/../../functions/live-link-https.php';

it('upgrades http links for the given hosts only', function () {
    $html = '<a href="http://kotlinskidev.local/a/">x</a><a href="http://other.test/">y</a>';
    $out  = kotlinskidev_force_https_for_hosts($html, ['kotlinskidev.local']);
    expect($out)->toContain('https://kotlinskidev.local/a/');
    expect($out)->toContain('http://other.test/');
});

it('upgrades JSON-escaped urls', function () {
    $out = kotlinskidev_force_https_for_hosts('{"u":"http:\/\/kotlinskidev.local\/x"}', ['kotlinskidev.local']);
    expect($out)->toContain('https:\/\/kotlinskidev.local\/x');
});

it('ignores empty hosts and duplicates', function () {
    $out = kotlinskidev_force_https_for_hosts('http://a.test/', ['', 'a.test', 'a.test']);
    expect($out)->toBe('https://a.test/');
});

it('skips hosts that are not plain hostnames, so a spoofed header cannot rewrite arbitrary strings', function () {
    $html = 'http://a.test/ http://x/ <a href="http://evil">';
    expect(kotlinskidev_force_https_for_hosts($html, ['a', '"><script>', '', 'x', 'a.test:8080']))->toBe($html);
});

it('accepts hostnames with ports', function () {
    expect(kotlinskidev_is_valid_host('festive-orbit.localsite.io'))->toBeTrue();
    expect(kotlinskidev_is_valid_host('kotlinskidev.local:8080'))->toBeTrue();
    expect(kotlinskidev_is_valid_host('a'))->toBeFalse();
    expect(kotlinskidev_is_valid_host('bad host'))->toBeFalse();
});
