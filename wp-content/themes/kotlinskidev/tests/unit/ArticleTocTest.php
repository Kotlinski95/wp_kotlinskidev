<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/article-toc.php';

function kotlinskidev_toc_heading(string $text, array $attrs = array(), string $idAttr = ''): array
{
    $level = $attrs['level'] ?? 2;

    return array(
        'blockName' => 'core/heading',
        'attrs'     => $attrs,
        'innerHTML' => '<h' . $level . ' class="wp-block-heading"' . $idAttr . '>' . $text . '</h' . $level . '>',
    );
}

function kotlinskidev_toc_list(string $href): array
{
    return array(
        'blockName' => 'core/list',
        'attrs'     => array(),
        'innerHTML' => '<ul><li><a href="' . $href . '">x</a></li></ul>',
    );
}

function kotlinskidev_toc_paragraph(): array
{
    return array('blockName' => 'core/paragraph', 'attrs' => array(), 'innerHTML' => '<p>text</p>');
}

function kotlinskidev_toc_slug(string $title): string
{
    $title = strtr($title, array('ą' => 'a', 'ć' => 'c', 'ę' => 'e', 'ł' => 'l', 'ń' => 'n', 'ó' => 'o', 'ś' => 's', 'ź' => 'z', 'ż' => 'z'));

    return trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower($title)), '-');
}

function kotlinskidev_toc_stub(array $blocks): void
{
    Functions\when('parse_blocks')->justReturn($blocks);
    Functions\when('serialize_block')->alias(fn ($b) => $b['innerHTML']);
    Functions\when('wp_strip_all_tags')->alias(fn ($t) => strip_tags($t));
    Functions\when('sanitize_title')->alias('kotlinskidev_toc_slug');
}

it('keeps the anchor attribute as the id', function () {
    kotlinskidev_toc_stub(array(kotlinskidev_toc_heading('Intro', array('anchor' => 'my-anchor'))));

    expect(kotlinskidev_article_toc_items(''))->toBe(array(array('id' => 'my-anchor', 'label' => 'Intro')));
});

it('keeps an existing id found in the markup', function () {
    kotlinskidev_toc_stub(array(kotlinskidev_toc_heading('Intro', array(), ' id="legacy"')));

    expect(kotlinskidev_article_toc_items('')[0]['id'])->toBe('legacy');
});

it('generates a slug when no id exists and strips polish diacritics', function () {
    kotlinskidev_toc_stub(array(kotlinskidev_toc_heading('Zażółć gęślą jaźń')));

    expect(kotlinskidev_article_toc_items('')[0]['id'])->toBe('zazolc-gesla-jazn');
});

it('falls back to a section number when the slug is empty', function () {
    kotlinskidev_toc_stub(array(kotlinskidev_toc_heading('A'), kotlinskidev_toc_heading('!!!')));
    Functions\when('sanitize_title')->alias(fn ($t) => '!!!' === $t ? '' : 'a');

    expect(kotlinskidev_article_toc_items('')[1]['id'])->toBe('section-2');
});

it('dedupes repeated ids with numeric suffixes', function () {
    kotlinskidev_toc_stub(array(
        kotlinskidev_toc_heading('Same'),
        kotlinskidev_toc_heading('Same'),
        kotlinskidev_toc_heading('Same'),
    ));

    expect(array_column(kotlinskidev_article_toc_items(''), 'id'))->toBe(array('same', 'same-2', 'same-3'));
});

it('strips a leading numeric prefix from the label', function () {
    kotlinskidev_toc_stub(array(kotlinskidev_toc_heading('1. First'), kotlinskidev_toc_heading('12) Second')));

    expect(array_column(kotlinskidev_article_toc_items(''), 'label'))->toBe(array('First', 'Second'));
});

it('ignores h3 headings and non-heading blocks', function () {
    kotlinskidev_toc_stub(array(
        kotlinskidev_toc_heading('Deep', array('level' => 3)),
        kotlinskidev_toc_paragraph(),
        kotlinskidev_toc_heading('Top', array('level' => 2)),
    ));

    expect(array_column(kotlinskidev_article_toc_items(''), 'label'))->toBe(array('Top'));
});

it('ignores nested headings', function () {
    $group = array(
        'blockName'   => 'core/group',
        'attrs'       => array(),
        'innerHTML'   => '',
        'innerBlocks' => array(kotlinskidev_toc_heading('Nested')),
    );
    kotlinskidev_toc_stub(array($group, kotlinskidev_toc_heading('Top')));

    expect(array_column(kotlinskidev_article_toc_items(''), 'label'))->toBe(array('Top'));
});

it('skips headings with the kt-toc-exclude class', function () {
    kotlinskidev_toc_stub(array(
        kotlinskidev_toc_heading('Hidden', array('className' => 'foo kt-toc-exclude')),
        kotlinskidev_toc_heading('Shown'),
    ));

    expect(array_column(kotlinskidev_article_toc_items(''), 'label'))->toBe(array('Shown'));
});

it('returns nothing when a heading is followed by a legacy anchor list', function () {
    kotlinskidev_toc_stub(array(
        kotlinskidev_toc_heading('Contents'),
        kotlinskidev_toc_list('#intro'),
        kotlinskidev_toc_heading('Intro'),
    ));

    expect(kotlinskidev_article_toc_items(''))->toBe(array());
});

it('keeps items when the list after a heading has no anchor links', function () {
    kotlinskidev_toc_stub(array(kotlinskidev_toc_heading('Intro'), kotlinskidev_toc_list('https://example.com')));

    expect(kotlinskidev_article_toc_items(''))->toHaveCount(1);
});

it('memoises items per post', function () {
    $calls = 0;
    Functions\when('get_post')->alias(function () use (&$calls) {
        $calls++;

        return (object) array('post_content' => 'x');
    });
    kotlinskidev_toc_stub(array(kotlinskidev_toc_heading('One')));

    kotlinskidev_article_toc_items_for_post(9001);
    kotlinskidev_article_toc_items_for_post(9001);

    expect($calls)->toBe(1);
});

it('returns no items when the post is missing', function () {
    Functions\when('get_post')->justReturn(null);

    expect(kotlinskidev_article_toc_items_for_post(9002))->toBe(array());
});

it('injects a generated id into an id-less h2 exactly once per heading', function () {
    Functions\when('get_post')->justReturn((object) array('post_content' => 'x'));
    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_queried_object_id')->justReturn(9003);
    kotlinskidev_toc_stub(array(kotlinskidev_toc_heading('1. Alpha'), kotlinskidev_toc_heading('Beta')));

    $alpha = '<h2 class="wp-block-heading">1. Alpha</h2>';
    $beta  = '<h2 class="wp-block-heading">Beta</h2>';

    expect(kotlinskidev_article_toc_inject_heading_id($alpha, array()))->toContain('id="alpha"');
    expect(kotlinskidev_article_toc_inject_heading_id($alpha, array()))->toBe($alpha);
    expect(kotlinskidev_article_toc_inject_heading_id($beta, array()))->toContain('id="beta"');
});

it('leaves an h2 that already has an id untouched', function () {
    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_queried_object_id')->justReturn(9004);
    $html = '<h2 id="x" class="wp-block-heading">Alpha</h2>';

    expect(kotlinskidev_article_toc_inject_heading_id($html, array()))->toBe($html);
});

it('does not inject outside single posts', function () {
    Functions\when('is_singular')->justReturn(false);
    $html = '<h2 class="wp-block-heading">Alpha</h2>';

    expect(kotlinskidev_article_toc_inject_heading_id($html, array()))->toBe($html);
});

it('does not inject into h3 headings', function () {
    Functions\when('is_singular')->justReturn(true);
    Functions\when('get_queried_object_id')->justReturn(9005);
    $html = '<h3 class="wp-block-heading">Alpha</h3>';

    expect(kotlinskidev_article_toc_inject_heading_id($html, array()))->toBe($html);
});
