<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_content_tabs_fixture(): string
{
    return '<!-- wp:kotlinskidev/content-tabs -->'
        . '<!-- wp:kotlinskidev/content-tabs-item -->'
        . '<!-- wp:kotlinskidev/content-tabs-nav-link {"label":"Creating Websites"} /-->'
        . '<!-- wp:group -->'
        . '<div class="wp-block-group">'
        . '<!-- wp:paragraph --><p>We build fast, accessible websites.</p><!-- /wp:paragraph -->'
        . '</div>'
        . '<!-- /wp:group -->'
        . '<!-- /wp:kotlinskidev/content-tabs-item -->'
        . '<!-- wp:kotlinskidev/content-tabs-item -->'
        . '<!-- wp:kotlinskidev/content-tabs-nav-link {"label":"Performance Analysis"} /-->'
        . '<!-- wp:paragraph --><p>We audit and improve Core Web Vitals.</p><!-- /wp:paragraph -->'
        . '<!-- /wp:kotlinskidev/content-tabs-item -->'
        . '<!-- /wp:kotlinskidev/content-tabs -->';
}

it('renders a tab button per tab item, wrapping each nav-link output', function () {
    $blocks = parse_blocks(kotlinskidev_content_tabs_fixture());
    $html = render_block($blocks[0]);

    expect($html)->toContain('role="tablist"');
    expect(substr_count($html, 'role="tab"'))->toBe(2);
    expect($html)->toContain('Creating Websites');
    expect($html)->toContain('Performance Analysis');
});

it('marks only the first tab active and its panel visible, the rest hidden', function () {
    $blocks = parse_blocks(kotlinskidev_content_tabs_fixture());
    $html = render_block($blocks[0]);

    expect($html)->toContain('aria-selected="true"');
    expect($html)->toContain('aria-selected="false"');
    expect(substr_count($html, 'hidden="hidden"'))->toBe(1);
});

it('links each trigger to its panel via matching aria-controls/id and aria-labelledby/id', function () {
    $blocks = parse_blocks(kotlinskidev_content_tabs_fixture());
    $html = render_block($blocks[0]);

    preg_match_all('/id="([^"]+)" class="kt-content-tabs__nav-trigger"[^>]*aria-controls="([^"]+)"/', $html, $triggers, PREG_SET_ORDER);
    expect($triggers)->toHaveCount(2);

    foreach ($triggers as $trigger) {
        [, $tab_id, $panel_id] = $trigger;
        expect($html)->toContain('id="' . $panel_id . '"');
        expect($html)->toContain('aria-labelledby="' . $tab_id . '"');
    }
});

it('preserves arbitrary nested block content inside the active panel', function () {
    $blocks = parse_blocks(kotlinskidev_content_tabs_fixture());
    $html = render_block($blocks[0]);

    expect($html)->toContain('wp-block-group');
    expect($html)->toContain('We build fast, accessible websites.');
});

it('does not repeat the nav-link label text inside the panel content', function () {
    $blocks = parse_blocks(kotlinskidev_content_tabs_fixture());
    $html = render_block($blocks[0]);

    expect(substr_count($html, 'Creating Websites'))->toBe(1);
});

it('reflects the navPosition attribute as an orientation and wrapper modifier class', function () {
    $markup = '<!-- wp:kotlinskidev/content-tabs {"navPosition":"left"} -->'
        . '<!-- wp:kotlinskidev/content-tabs-item -->'
        . '<!-- wp:kotlinskidev/content-tabs-nav-link {"label":"One"} /-->'
        . '<!-- wp:paragraph --><p>Body</p><!-- /wp:paragraph -->'
        . '<!-- /wp:kotlinskidev/content-tabs-item -->'
        . '<!-- /wp:kotlinskidev/content-tabs -->';
    $blocks = parse_blocks($markup);
    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-content-tabs--left');
    expect($html)->toContain('aria-orientation="vertical"');
});

it('reflects the navPositionMobile, per-breakpoint navGap, and active-tab-style toggles on a real render', function () {
    $markup = '<!-- wp:kotlinskidev/content-tabs ' . wp_json_encode([
        'navPosition' => 'left',
        'navPositionMobile' => 'bottom',
        'navGap' => ['desktop' => 24, 'tablet' => 16, 'mobile' => 4],
        'activeTabUnderline' => true,
        'activeTabTextColorEnabled' => true,
        'activeTabColor' => '#ffffff',
        'activeTabBackgroundEnabled' => true,
        'activeTabBackgroundColor' => '#8209d3',
    ]) . ' -->'
        . '<!-- wp:kotlinskidev/content-tabs-item -->'
        . '<!-- wp:kotlinskidev/content-tabs-nav-link {"label":"One"} /-->'
        . '<!-- wp:paragraph --><p>Body</p><!-- /wp:paragraph -->'
        . '<!-- /wp:kotlinskidev/content-tabs-item -->'
        . '<!-- /wp:kotlinskidev/content-tabs -->';
    $blocks = parse_blocks($markup);
    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-content-tabs--left');
    expect($html)->toContain('kt-content-tabs--mobile-bottom');
    expect($html)->toContain('kt-content-tabs--active-underline');
    expect($html)->toContain('kt-content-tabs--active-text-color');
    expect($html)->toContain('kt-content-tabs--active-background');
    expect($html)->toContain('--kt-content-tabs-nav-gap-desktop:24px');
    expect($html)->toContain('--kt-content-tabs-nav-gap-tablet:16px');
    expect($html)->toContain('--kt-content-tabs-nav-gap-mobile:4px');
    expect($html)->toContain('--kt-content-tabs-active-color:#ffffff');
    expect($html)->toContain('--kt-content-tabs-active-bg:#8209d3');
});

it('supports a gradient for the active tab text color, distinct from the background gradient', function () {
    $markup = '<!-- wp:kotlinskidev/content-tabs ' . wp_json_encode([
        'activeTabTextColorEnabled' => true,
        'activeTabColor' => 'linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)',
        'activeTabBackgroundEnabled' => true,
        'activeTabBackgroundColor' => 'linear-gradient(90deg,#000 0%,#fff 100%)',
    ]) . ' -->'
        . '<!-- wp:kotlinskidev/content-tabs-item -->'
        . '<!-- wp:kotlinskidev/content-tabs-nav-link {"label":"One"} /-->'
        . '<!-- wp:paragraph --><p>Body</p><!-- /wp:paragraph -->'
        . '<!-- /wp:kotlinskidev/content-tabs-item -->'
        . '<!-- /wp:kotlinskidev/content-tabs -->';
    $html = render_block(parse_blocks($markup)[0]);

    expect($html)->toContain('kt-content-tabs--active-text-gradient');
    expect($html)->toContain('--kt-content-tabs-active-color:linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)');
    expect($html)->toContain('--kt-content-tabs-active-bg:linear-gradient(90deg,#000 0%,#fff 100%)');
});

it('defaults to top/underline/8px desktop gap when the new attributes are not set', function () {
    $blocks = parse_blocks(kotlinskidev_content_tabs_fixture());
    $html = render_block($blocks[0]);

    expect($html)->toContain('kt-content-tabs--mobile-top');
    expect($html)->toContain('kt-content-tabs--active-underline');
    expect($html)->toContain('--kt-content-tabs-nav-gap-desktop:8px');
    expect($html)->not->toContain('--kt-content-tabs-nav-gap-tablet');
    expect($html)->not->toContain('--kt-content-tabs-nav-gap-mobile');
});

it('produces unique ids across two content-tabs instances on the same page', function () {
    $markup = kotlinskidev_content_tabs_fixture() . kotlinskidev_content_tabs_fixture();
    $blocks = parse_blocks($markup);
    $html = render_block($blocks[0]) . render_block($blocks[1]);

    preg_match_all('/id="(kt-content-tabs-[^"]+)"/', $html, $ids);
    expect(count($ids[1]))->toBe(count(array_unique($ids[1])));
});

it('parses and renders the shipped example pattern end-to-end', function () {
    ob_start();
    require dirname(__DIR__, 3) . '/patterns/content-tabs-services.php';
    $markup = ob_get_clean();

    $blocks = array_values(array_filter(parse_blocks($markup), fn ($b) => ! empty($b['blockName'])));
    expect($blocks)->toHaveCount(1);
    expect($blocks[0]['blockName'])->toBe('kotlinskidev/content-tabs');

    $items = array_values(array_filter(
        $blocks[0]['innerBlocks'],
        fn ($b) => 'kotlinskidev/content-tabs-item' === $b['blockName']
    ));
    expect($items)->toHaveCount(3);

    foreach ($items as $item) {
        $navLinks = array_values(array_filter(
            $item['innerBlocks'],
            fn ($b) => 'kotlinskidev/content-tabs-nav-link' === $b['blockName']
        ));
        expect($navLinks)->toHaveCount(1);
        expect($navLinks[0]['attrs']['label'] ?? '')->not->toBe('');
    }

    $html = render_block($blocks[0]);
    expect($html)->toContain('Creating Websites');
    expect($html)->toContain('Performance Analysis');
    expect($html)->toContain('Website Optimization');
    expect(substr_count($html, 'role="tab"'))->toBe(3);
});
