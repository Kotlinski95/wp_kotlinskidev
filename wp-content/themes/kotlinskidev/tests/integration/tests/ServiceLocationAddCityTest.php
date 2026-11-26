<?php

uses(Tests\Integration\TestCase::class);

it('rejects an empty city name', function () {
    expect(kotlinskidev_add_city_pages('   '))->toBe(['created' => [], 'existing' => [], 'error' => 'empty_city']);
});

it('creates a draft city page and then reports a duplicate', function () {
    $first = kotlinskidev_add_city_pages('Testville');

    expect(array_keys($first['created']))->toContain('en');
    expect($first['error'])->toBe('');
    $id = $first['created']['en'];
    expect(get_post_status($id))->toBe('draft');
    expect(get_post_type($id))->toBe('service_location');
    expect(get_post_meta($id, 'city', true))->toBe('Testville');
    expect(get_the_title($id))->toBe('Website Development – Testville');
    expect(kotlinskidev_find_city_post_id('Testville', ''))->toBe($id);

    $second = kotlinskidev_add_city_pages('Testville');
    expect($second['created'])->toBe([]);
    expect($second['existing']['en'])->toBe($id);
    expect($second['error'])->toBe('duplicate');
});

it('returns no id for a city that does not exist', function () {
    expect(kotlinskidev_find_city_post_id('Nowhereville', ''))->toBe(0);
});

it('lists the title prefixes and the add-city page url', function () {
    expect(kotlinskidev_add_city_title_prefixes())->toBe([
        'en' => 'Website Development – ',
        'pl' => 'Tworzenie stron internetowych – ',
    ]);
    expect(kotlinskidev_add_city_page_url(['kt_city' => 'X']))->toBe(
        admin_url('edit.php?post_type=service_location&page=kotlinskidev_add_city&kt_city=X')
    );
});

it('maps add-city error codes to messages', function () {
    expect(kotlinskidev_add_city_error_message('empty_city'))->toBe('Enter a city name.');
    expect(kotlinskidev_add_city_error_message('duplicate'))->toContain('already exists');
    expect(kotlinskidev_add_city_error_message('insert_failed'))->toBe('Could not create the city page.');
    expect(kotlinskidev_add_city_error_message('other'))->toBe('');
});

it('renders an error notice and a success notice from the redirect query', function () {
    $_GET = ['kt_error' => 'empty_city'];
    expect(kotlinskidev_add_city_result_notice())->toBe('<div class="notice notice-error"><p>Enter a city name.</p></div>');

    $_GET = [];
    expect(kotlinskidev_add_city_result_notice())->toBe('');
    $_GET = [];
});
