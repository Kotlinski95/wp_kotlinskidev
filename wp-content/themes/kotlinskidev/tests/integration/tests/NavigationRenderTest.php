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

it('applies the hamburger border class when showHamburgerBorder is enabled', function () {
    kotlinskidev_create_nav('nav-hamburger-border', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-hamburger-border', 'overlayMenu' => 'mobile', 'showHamburgerBorder' => true],
    ]);

    expect($html)->toContain('kt-hamburger-border');
});

it('omits the hamburger border class by default', function () {
    kotlinskidev_create_nav('nav-hamburger-border-default', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-hamburger-border-default', 'overlayMenu' => 'mobile'],
    ]);

    expect($html)->not->toContain('kt-hamburger-border');
});

it('applies the no-dividers class when hideAccordionDividers is enabled', function () {
    kotlinskidev_create_nav('nav-no-dividers', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-no-dividers', 'overlayMenu' => 'mobile', 'hideAccordionDividers' => true],
    ]);

    expect($html)->toContain('kt-hamburger-no-dividers');
});

it('omits the no-dividers class by default', function () {
    kotlinskidev_create_nav('nav-no-dividers-default', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-no-dividers-default', 'overlayMenu' => 'mobile'],
    ]);

    expect($html)->not->toContain('kt-hamburger-no-dividers');
});

it('applies the blur-siblings class to the mega bar when blurInactiveLinks is enabled', function () {
    kotlinskidev_create_nav('nav-mega-blur', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-mega-blur', 'blurInactiveLinks' => true],
    ]);

    expect($html)->toContain('kt-mega-nav--blur-siblings');
});

it('writes the blur amount as a CSS variable when both blurInactiveLinks and blurAmount are set', function () {
    kotlinskidev_create_nav('nav-mega-blur-amount', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-mega-blur-amount', 'blurInactiveLinks' => true, 'blurAmount' => '0.5rem'],
    ]);

    expect($html)->toContain('style="--kt-blur-amount:0.5rem"');
});

it('omits the blur amount CSS variable when blurInactiveLinks is off, even if blurAmount is set', function () {
    kotlinskidev_create_nav('nav-mega-blur-amount-off', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-mega-blur-amount-off', 'blurAmount' => '0.5rem'],
    ]);

    expect($html)->not->toContain('--kt-blur-amount');
});

it('omits the blur-siblings class from the mega bar by default', function () {
    kotlinskidev_create_nav('nav-mega-blur-default', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-mega-blur-default'],
    ]);

    expect($html)->not->toContain('kt-mega-nav--blur-siblings');
});

it('marks search and language panel items as utility but not a regular dropdown link', function () {
    kotlinskidev_create_nav(
        'nav-mega-utility-case',
        '<!-- wp:kotlinskidev/search-panel {"label":"Search"} -->'
        . '<!-- wp:paragraph --><p>Search widget</p><!-- /wp:paragraph -->'
        . '<!-- /wp:kotlinskidev/search-panel -->'
        . '<!-- wp:kotlinskidev/language-panel {"label":"Language"} -->'
        . '<!-- wp:paragraph --><p>Language widget</p><!-- /wp:paragraph -->'
        . '<!-- /wp:kotlinskidev/language-panel -->'
        . '<!-- wp:navigation-submenu {"label":"Services"} -->'
        . '<!-- wp:navigation-link {"label":"Web Design","url":"/web-design"} /-->'
        . '<!-- /wp:navigation-submenu -->'
    );

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-mega-utility-case'],
    ]);

    expect(substr_count($html, 'kt-mega-nav__item--utility'))->toBe(2);
    expect($html)->toContain('kt-mega-nav__item has-children kt-mega-nav__item--utility');
    expect($html)->toContain('kt-mega-nav__item has-children"');
});

it('adds the blur-include-utility class only when both blurInactiveLinks and blurIncludeUtility are on', function () {
    kotlinskidev_create_nav('nav-mega-blur-include-utility', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-mega-blur-include-utility', 'blurInactiveLinks' => true, 'blurIncludeUtility' => true],
    ]);

    expect($html)->toContain('kt-mega-nav--blur-include-utility');
});

it('omits the blur-include-utility class when blurIncludeUtility is on but blurInactiveLinks is off', function () {
    kotlinskidev_create_nav('nav-mega-blur-include-utility-off', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-mega-blur-include-utility-off', 'blurIncludeUtility' => true],
    ]);

    expect($html)->not->toContain('kt-mega-nav--blur-include-utility');
});

it('applies the desktop-only visibility class', function () {
    kotlinskidev_create_nav('nav-visibility-desktop', '<!-- wp:navigation-link {"label":"Home","url":"/"} /-->');

    $html = render_block([
        'blockName' => 'kotlinskidev/navigation',
        'attrs'     => ['menuSlug' => 'nav-visibility-desktop', 'visibility' => 'desktop'],
    ]);

    expect($html)->toContain('nav-desktop');
});
