<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_create_nav(string $slug, string $content): int
{
    return test()->factory()->post->create([
        'post_type'    => 'wp_navigation',
        'post_title'   => $slug,
        'post_name'    => $slug,
        'post_content' => $content,
        'post_status'  => 'publish',
    ]);
}

it('renders nothing when menuSlug is empty', function () {
    $html = render_block(['blockName' => 'kotlinskidev/navigation', 'attrs' => ['menuSlug' => '']]);

    expect($html)->toBe('');
});

it('renders nothing when the referenced navigation post does not exist', function () {
    $html = render_block(['blockName' => 'kotlinskidev/navigation', 'attrs' => ['menuSlug' => 'nav-does-not-exist-xyz']]);

    expect($html)->toBe('');
});

it('delegates to core/navigation and applies the hamburger class when overlayMenu is enabled', function () {
    kotlinskidev_create_nav('nav-overlay-case', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-overlay-case', 'overlayMenu' => 'mobile'],
    ]);

    expect($html)->toContain('kt-hamburger-desktop');
    expect($html)->toContain('href="/"');
});

it('adds the left-slide class when overlaySlide is left', function () {
    kotlinskidev_create_nav('nav-overlay-left', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-overlay-left', 'overlayMenu' => 'mobile', 'overlaySlide' => 'left'],
    ]);

    expect($html)->toContain('kt-nav-slide-left');
});

it('renders a mobile footer bar with navigation links and pushes other blocks into extras', function () {
    kotlinskidev_create_nav(
        'nav-bar-case',
        '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->'
        . '<!-- wp:navigation-link {"label":"Contact","url":"/contact","className":"highlight"} /-->'
        . '<!-- wp:paragraph --><p>Extra content</p><!-- /wp:paragraph -->'
    );

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-bar-case', 'displayMode' => 'bar'],
    ]);

    expect($html)->toContain('id="mobile-footer-menu"');
    expect($html)->toContain('href="/"');
    expect($html)->toContain('href="/contact"');
    expect($html)->toContain('highlight');
    expect($html)->toContain('Home');
    expect($html)->toContain('Contact');
    expect($html)->toContain('Extra content');
});

it('renders nothing in bar mode when the navigation post has no usable blocks', function () {
    kotlinskidev_create_nav('nav-bar-empty', '');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-bar-empty', 'displayMode' => 'bar'],
    ]);

    expect($html)->toBe('');
});

it('groups submenu children into a labelled column and loose links into their own group in list mode', function () {
    kotlinskidev_create_nav(
        'nav-list-case',
        '<!-- wp:navigation-submenu {"label":"Services"} -->'
        . '<!-- wp:navigation-link {"label":"Web Design","url":"/web-design"} /-->'
        . '<!-- wp:navigation-link {"label":"SEO","url":"/seo"} /-->'
        . '<!-- /wp:navigation-submenu -->'
        . '<!-- wp:navigation-link {"label":"About","url":"/about"} /-->'
    );

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-list-case', 'displayMode' => 'list'],
    ]);

    expect($html)->toContain('kt-nav-list__columns');
    expect($html)->toContain('Services');
    expect($html)->toContain('Web Design');
    expect($html)->toContain('SEO');
    expect($html)->toContain('About');
    expect($html)->toContain('href="/web-design"');
});

it('renders nothing in list mode when the navigation post has no usable blocks', function () {
    kotlinskidev_create_nav('nav-list-empty', '');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-list-empty', 'displayMode' => 'list'],
    ]);

    expect($html)->toBe('');
});

it('renders the mega menu with top-level items and nested children by default', function () {
    kotlinskidev_create_nav(
        'nav-mega-case',
        '<!-- wp:navigation-submenu {"label":"Services"} -->'
        . '<!-- wp:navigation-link {"label":"Web Design","url":"/web-design"} /-->'
        . '<!-- wp:navigation-link {"label":"SEO","url":"/seo"} /-->'
        . '<!-- /wp:navigation-submenu -->'
        . '<!-- wp:navigation-link {"label":"About","url":"/about"} /-->'
    );

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-mega-case'],
    ]);

    expect($html)->toContain('kt-mega-nav__bar');
    expect($html)->toContain('kt-mega-nav__item has-children');
    expect($html)->toContain('data-panel="services"');
    expect($html)->toContain('Services');
    expect($html)->toContain('kt-mega-nav__l2-link');
    expect($html)->toContain('href="/web-design"');
    expect($html)->toContain('href="/seo"');
    expect($html)->toContain('href="/about"');
});

it('marks the wrapper with data-link-navigates when linkNavigatesOnClick is enabled', function () {
    kotlinskidev_create_nav('nav-mega-link-navigates', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-mega-link-navigates', 'linkNavigatesOnClick' => true],
    ]);

    expect($html)->toContain('data-link-navigates="true"');
});

it('applies the desktop-only visibility class', function () {
    kotlinskidev_create_nav('nav-visibility-desktop', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-visibility-desktop', 'visibility' => 'desktop'],
    ]);

    expect($html)->toContain('nav-desktop');
});
