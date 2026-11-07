<?php

require_once __DIR__ . '/../../functions/contact-card.php';

it('splits a polish address into postal address parts', function () {
    expect(kotlinskidev_parse_postal_address('Dekerta 4, 40-143 Katowice, Poland'))->toBe([
        '@type' => 'PostalAddress',
        'addressCountry' => 'PL',
        'streetAddress' => 'Dekerta 4',
        'postalCode' => '40-143',
        'addressLocality' => 'Katowice',
    ]);
});

it('keeps the whole address as street when it cannot be split', function () {
    expect(kotlinskidev_parse_postal_address('Somewhere'))->toBe([
        '@type' => 'PostalAddress',
        'addressCountry' => 'PL',
        'streetAddress' => 'Somewhere',
    ]);
    expect(kotlinskidev_parse_postal_address(' , '))->toBe([]);
});

it('converts day ranges and hours to schema.org opening hours', function () {
    expect(kotlinskidev_format_opening_hours('Mon-Fri, 8:00-17:00'))->toBe('Mo-Fr 08:00-17:00');
    expect(kotlinskidev_format_opening_hours('Pon–Pt 9:30–16:00'))->toBe('Mo-Fr 09:30-16:00');
    expect(kotlinskidev_format_opening_hours('Sat 10:00-14:00'))->toBe('Sa 10:00-14:00');
});

it('omits opening hours it cannot parse', function () {
    expect(kotlinskidev_format_opening_hours('8:00-17:00'))->toBe('');
    expect(kotlinskidev_format_opening_hours('By appointment'))->toBe('');
    expect(kotlinskidev_format_opening_hours('Mon-Fri, 8:00-27:00'))->toBe('');
    expect(kotlinskidev_format_opening_hours(''))->toBe('');
});
