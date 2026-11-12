<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/feature-toggles.php';
require_once __DIR__ . '/../../functions/seo-identity.php';
require_once __DIR__ . '/../../functions/seo-schema.php';

beforeEach(function () {
    Functions\when('get_option')->alias(fn ($name, $default = false) => $default);
});

function kt_schema_context(string $lang = 'pl', array $overrides = []): array
{
    return array_merge([
        'language' => $lang,
        'locale' => 'pl' === $lang ? 'pl-PL' : 'en-US',
        'root_url' => 'https://kotlinskidev.com/',
        'logo' => ['url' => 'https://kotlinskidev.com/logo.png', 'width' => 512, 'height' => 512],
        'social' => ['https://github.com/Kotlinski95', 'https://www.linkedin.com/in/adriankotlinski/'],
        'description' => 'pl' === $lang ? 'Opis' : 'Description',
        'contact_url' => 'pl' === $lang ? 'https://kotlinskidev.com/kontakt/' : 'https://kotlinskidev.com/en/contact/',
        'about_url' => 'pl' === $lang ? 'https://kotlinskidev.com/o-mnie/' : 'https://kotlinskidev.com/en/about/',
        'city' => '',
    ], $overrides);
}

function kt_yoast_graph(string $base): array
{
    $person = $base . '#/schema/person/abc123';
    return [
        ['@type' => 'WebPage', '@id' => $base, 'isPartOf' => ['@id' => $base . '#website'], 'about' => ['@id' => $person], 'inLanguage' => 'pl-PL'],
        ['@type' => 'BreadcrumbList', '@id' => $base . '#breadcrumb'],
        ['@type' => 'Article', '@id' => $base . '#article', 'author' => ['name' => 'admin', '@id' => $person], 'publisher' => ['@id' => $person], 'isPartOf' => ['@id' => $base]],
        [
            '@type' => 'WebSite',
            '@id' => $base . '#website',
            'name' => 'Kotlinskidev Web Development',
            'description' => 'English tagline',
            'publisher' => ['@id' => $person],
            'potentialAction' => [['@type' => 'SearchAction', 'target' => ['urlTemplate' => $base . '?s={q}']]],
            'inLanguage' => 'pl-PL',
        ],
        ['@type' => ['Person', 'Organization'], '@id' => $person, 'name' => 'admin', 'sameAs' => ['https://kotlinskidev.com']],
    ];
}

function kt_nodes_by_type(array $graph, string $type): array
{
    return array_values(array_filter($graph, fn ($n) => in_array($type, (array) $n['@type'], true)));
}

it('produces identical entity ids for PL and EN inputs', function () {
    $pl = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_schema_context('pl'));
    $en = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/en/home/'), kt_schema_context('en'));
    $entity = fn (array $g) => array_map(fn ($n) => $n['@id'], array_filter($g, fn ($n) => ! in_array($n['@type'], ['WebPage', 'BreadcrumbList', 'Article'], true)));

    expect(array_values($entity($pl)))->toBe(array_values($entity($en)));
    expect(array_values($entity($pl)))->toBe([
        'https://kotlinskidev.com/#website',
        'https://kotlinskidev.com/#organization',
        'https://kotlinskidev.com/#/schema/person/adrian-kotlinski',
    ]);
});

it('removes the admin representation node and keeps per-page ids', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/en/home/'), kt_schema_context('en'));
    $json = json_encode($graph);

    expect($json)->not->toContain('admin"');
    expect($json)->not->toContain('abc123');
    expect($json)->not->toContain('en\/home\/#website');
    $page = kt_nodes_by_type($graph, 'WebPage')[0];
    expect($page['@id'])->toBe('https://kotlinskidev.com/en/home/');
    expect($page['about'])->toBe(['@id' => 'https://kotlinskidev.com/#organization']);
    expect($page['isPartOf'])->toBe(['@id' => 'https://kotlinskidev.com/#website']);
    expect($page['inLanguage'])->toBe('pl-PL');
});

it('points article author at the person and publisher at the organization', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_schema_context('pl'));
    $article = kt_nodes_by_type($graph, 'Article')[0];

    expect($article['author'])->toBe(['@id' => 'https://kotlinskidev.com/#/schema/person/adrian-kotlinski']);
    expect($article['publisher'])->toBe(['@id' => 'https://kotlinskidev.com/#organization']);
});

it('emits no duplicate ids even when the input already has them', function () {
    $graph = kt_yoast_graph('https://kotlinskidev.com/');
    $graph[] = $graph[1];
    $result = kotlinskidev_seo_consolidate_schema_graph($graph, kt_schema_context('pl'));
    $ids = array_map(fn ($n) => $n['@id'], $result);

    expect($ids)->toBe(array_values(array_unique($ids)));
});

it('never emits email, phone or street keys', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_schema_context('pl', ['city' => 'Kraków']));
    $json = json_encode($graph);

    foreach (['email', 'telephone', 'streetAddress', 'postalCode', 'openingHours'] as $key) {
        expect($json)->not->toContain('"' . $key . '"');
    }
    $org = kt_nodes_by_type($graph, 'ProfessionalService')[0];
    expect($org['address'])->toBe(['@type' => 'PostalAddress', 'addressLocality' => 'Katowice', 'addressCountry' => 'PL']);
});

it('builds the organization with logo, contact point and social profiles', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/en/home/'), kt_schema_context('en'));
    $org = kt_nodes_by_type($graph, 'ProfessionalService')[0];

    expect($org['name'])->toBe('Kotlinskidev');
    expect($org['alternateName'])->toBe(['Kotlinskidev Web Development']);
    expect($org['url'])->toBe('https://kotlinskidev.com/');
    expect($org['logo']['@type'])->toBe('ImageObject');
    expect($org['logo']['url'])->toBe('https://kotlinskidev.com/logo.png');
    expect($org['contactPoint']['url'])->toBe('https://kotlinskidev.com/en/contact/');
    expect($org['contactPoint']['availableLanguage'])->toBe(['pl', 'en']);
    expect($org['sameAs'])->toBe(['https://github.com/Kotlinski95', 'https://www.linkedin.com/in/adriankotlinski/']);
    expect($org['founder'])->toBe(['@id' => 'https://kotlinskidev.com/#/schema/person/adrian-kotlinski']);
    expect($org['areaServed'])->toBe(['@type' => 'Country', 'name' => 'Poland']);
});

it('omits the logo when none is valid', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph([], kt_schema_context('pl', ['logo' => []]));
    $org = kt_nodes_by_type($graph, 'ProfessionalService')[0];
    $person = kt_nodes_by_type($graph, 'Person')[0];

    expect($org)->not->toHaveKey('logo');
    expect($org)->not->toHaveKey('image');
    expect($person)->not->toHaveKey('image');
});

it('adds the city as areaServed on location pages', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_schema_context('pl', ['city' => 'Kraków']));
    $org = kt_nodes_by_type($graph, 'ProfessionalService')[0];

    expect($org['areaServed'])->toBe([
        ['@type' => 'Country', 'name' => 'Poland'],
        ['@type' => 'City', 'name' => 'Kraków'],
    ]);
    expect(count(kt_nodes_by_type($graph, 'ProfessionalService')))->toBe(1);
});

it('uses language-aware job title, description and inLanguage', function () {
    $pl = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_schema_context('pl'));
    $en = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_schema_context('en'));

    expect(kt_nodes_by_type($pl, 'Person')[0]['jobTitle'])->toBe('Programista frontend (Senior)');
    expect(kt_nodes_by_type($en, 'Person')[0]['jobTitle'])->toBe('Senior Frontend Developer');
    expect(kt_nodes_by_type($pl, 'Person')[0]['url'])->toBe('https://kotlinskidev.com/o-mnie/');
    expect(kt_nodes_by_type($pl, 'WebSite')[0]['description'])->toBe('Opis');
    expect(kt_nodes_by_type($en, 'WebSite')[0]['inLanguage'])->toBe('en-US');
});

it('drops the website description when no matching-language text exists', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_schema_context('pl', ['description' => '']));
    $site = kt_nodes_by_type($graph, 'WebSite')[0];

    expect($site)->not->toHaveKey('description');
    expect($site['name'])->toBe('Kotlinskidev');
    expect($site['alternateName'])->toBe(['Kotlinskidev Web Development']);
    expect($site['publisher'])->toBe(['@id' => 'https://kotlinskidev.com/#organization']);
    expect($site['potentialAction'][0]['@type'])->toBe('SearchAction');
});

it('adds x-default pointing at the default language url', function () {
    Functions\when('pll_default_language')->justReturn('pl');

    $result = kotlinskidev_hreflang_add_x_default([
        'pl' => 'https://kotlinskidev.com/kontakt/',
        'en' => 'https://kotlinskidev.com/en/contact/',
    ]);

    expect($result['x-default'])->toBe('https://kotlinskidev.com/kontakt/');
    expect(count($result))->toBe(3);
});

it('matches locale style hreflang keys and never duplicates x-default', function () {
    Functions\when('pll_default_language')->justReturn('pl');

    $locale = kotlinskidev_hreflang_add_x_default(['pl-PL' => 'https://a/pl/', 'en-US' => 'https://a/en/']);
    expect($locale['x-default'])->toBe('https://a/pl/');

    $existing = ['pl' => 'https://a/pl/', 'x-default' => 'https://a/other/'];
    expect(kotlinskidev_hreflang_add_x_default($existing))->toBe($existing);
});

it('leaves hreflang untouched when the default language has no url', function () {
    Functions\when('pll_default_language')->justReturn('pl');

    $only = ['en' => 'https://a/en/'];
    expect(kotlinskidev_hreflang_add_x_default($only))->toBe($only);
});

function kt_identity_context(string $lang, array $identity, array $overrides = []): array
{
    $resolved = kotlinskidev_seo_identity_resolve(array_merge(kotlinskidev_seo_identity_defaults(), $identity), $lang);
    return kt_schema_context($lang, array_merge(['identity' => $resolved], $overrides));
}

it('applies identity overrides to organization, website and person', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_identity_context('en', [
        'org_name' => 'Acme',
        'org_alternate_names' => ['Acme Inc'],
        'address_locality' => 'Berlin',
        'address_region' => 'BE',
        'address_country' => 'DE',
        'area_served' => 'Germany',
        'knows_about' => ['PHP'],
        'website_name' => 'Acme Site',
        'website_alternate_names' => ['Acme Web'],
        'person_name' => 'Jane Doe',
        'job_title' => ['en' => 'Engineer'],
    ]));
    $org = kt_nodes_by_type($graph, 'ProfessionalService')[0];

    expect($org['name'])->toBe('Acme');
    expect($org['alternateName'])->toBe(['Acme Inc']);
    expect($org['address'])->toBe(['@type' => 'PostalAddress', 'addressLocality' => 'Berlin', 'addressRegion' => 'BE', 'addressCountry' => 'DE']);
    expect($org['areaServed'])->toBe(['@type' => 'Country', 'name' => 'Germany']);
    expect($org['knowsAbout'])->toBe(['PHP']);
    expect($org['logo']['caption'])->toBe('Acme');
    expect(kt_nodes_by_type($graph, 'WebSite')[0]['name'])->toBe('Acme Site');
    expect(kt_nodes_by_type($graph, 'WebSite')[0]['alternateName'])->toBe(['Acme Web']);
    expect(kt_nodes_by_type($graph, 'Person')[0]['name'])->toBe('Jane Doe');
    expect(kt_nodes_by_type($graph, 'Person')[0]['jobTitle'])->toBe('Engineer');
});

it('omits addressRegion and organization description by default', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_schema_context('pl'));
    $org = kt_nodes_by_type($graph, 'ProfessionalService')[0];

    expect($org['address'])->not->toHaveKey('addressRegion');
    expect($org)->not->toHaveKey('description');
});

it('adds the identity description to organization and website only when set', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph(kt_yoast_graph('https://kotlinskidev.com/'), kt_identity_context('pl', ['description' => ['pl' => 'Własny opis']]));

    expect(kt_nodes_by_type($graph, 'ProfessionalService')[0]['description'])->toBe('Własny opis');
    expect(kt_nodes_by_type($graph, 'WebSite')[0]['description'])->toBe('Własny opis');
});

it('adds contact email and telephone only when the context carries them', function () {
    $without = kotlinskidev_seo_consolidate_schema_graph([], kt_schema_context('pl'));
    $with = kotlinskidev_seo_consolidate_schema_graph([], kt_schema_context('pl', ['contact_email' => 'a@b.test', 'contact_phone' => '+48 123']));

    expect(kt_nodes_by_type($without, 'ProfessionalService')[0]['contactPoint'])->not->toHaveKey('email');
    expect(kt_nodes_by_type($without, 'ProfessionalService')[0]['contactPoint'])->not->toHaveKey('telephone');
    $point = kt_nodes_by_type($with, 'ProfessionalService')[0]['contactPoint'];
    expect($point['email'])->toBe('a@b.test');
    expect($point['telephone'])->toBe('+48 123');
});

it('uses the custom contact type and languages', function () {
    $graph = kotlinskidev_seo_consolidate_schema_graph([], kt_identity_context('en', ['contact_type' => 'sales', 'contact_languages' => ['de']]));
    $point = kt_nodes_by_type($graph, 'ProfessionalService')[0]['contactPoint'];

    expect($point['contactType'])->toBe('sales');
    expect($point['availableLanguage'])->toBe(['de']);
});

it('replaces the person logo reference with a person image object', function () {
    $image = ['url' => 'https://kotlinskidev.com/me.jpg', 'width' => 400, 'height' => 400];
    $graph = kotlinskidev_seo_consolidate_schema_graph([], kt_schema_context('pl', ['person_image' => $image]));
    $person = kt_nodes_by_type($graph, 'Person')[0];

    expect($person['image']['@type'])->toBe('ImageObject');
    expect($person['image']['url'])->toBe('https://kotlinskidev.com/me.jpg');
    expect($person['image']['width'])->toBe(400);
});

it('keeps applying the social profiles filter over stored profiles', function () {
    kotlinskidev_get_seo_identity(true);
    Functions\when('get_option')->justReturn([]);
    Functions\when('absint')->alias(fn ($v) => abs((int) $v));
    Functions\when('apply_filters')->alias(fn ($tag, $value) => array_merge($value, ['https://extra.test/']));

    $profiles = kotlinskidev_schema_social_profiles();

    expect($profiles)->toHaveCount(7);
    expect($profiles[6])->toBe('https://extra.test/');
    expect($profiles[0])->toBe('https://www.linkedin.com/in/adriankotlinski/');
    kotlinskidev_get_seo_identity(true);
});

it('builds the graph from the Yoast value when it overrides ours', function () {
    kotlinskidev_get_seo_identity(true);
    Functions\when('get_option')->alias(fn ($name, $default = false) => [
        'wpseo_titles' => ['company_or_person' => 'company', 'company_name' => 'Yoast Co'],
        'kotlinskidev_seo_identity' => ['org_name' => 'Ours'],
    ][$name] ?? $default);
    Functions\when('absint')->alias(fn ($v) => abs((int) $v));
    Functions\when('sanitize_text_field')->alias(fn ($v) => trim(strip_tags((string) $v)));
    Functions\when('apply_filters')->alias(fn ($tag, $value) => $value);

    $identity = kotlinskidev_seo_identity_resolve(kotlinskidev_get_effective_seo_identity(), 'en');
    $graph = kotlinskidev_seo_consolidate_schema_graph([], kt_schema_context('en', ['identity' => $identity]));

    expect(kt_nodes_by_type($graph, 'ProfessionalService')[0]['name'])->toBe('Yoast Co');
    kotlinskidev_get_seo_identity(true);
});

it('leaves the Yoast graph and hreflang untouched when the custom SEO feature is off', function () {
    Functions\when('get_option')->alias(fn ($name, $default = false) => ['project_cards']);
    Functions\when('pll_default_language')->justReturn('pl');
    $graph = kt_yoast_graph('https://kotlinskidev.com/');
    $hreflangs = ['pl-PL' => 'https://a/pl/', 'en-US' => 'https://a/en/'];

    expect(kotlinskidev_seo_schema_graph_filter($graph))->toBe($graph);
    expect(kotlinskidev_hreflang_add_x_default($hreflangs))->toBe($hreflangs);
});
