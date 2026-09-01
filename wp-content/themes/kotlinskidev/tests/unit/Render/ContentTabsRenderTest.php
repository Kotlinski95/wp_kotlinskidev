<?php

use Brain\Monkey\Functions;

function kotlinskidev_content_tabs_nav_link_stub(string $html): object
{
    return new class ($html) {
        public string $name = 'kotlinskidev/content-tabs-nav-link';
        private string $html;

        public function __construct(string $html)
        {
            $this->html = $html;
        }

        public function render(): string
        {
            return $this->html;
        }
    };
}

function kotlinskidev_content_tabs_item_stub(array $inner_blocks): object
{
    return new class ($inner_blocks) {
        public string $name = 'kotlinskidev/content-tabs-item';
        public array $attributes = [];
        public array $inner_blocks;

        public function __construct(array $inner_blocks)
        {
            $this->inner_blocks = $inner_blocks;
        }

        public function render(): string
        {
            return '<div data-tab-id="' . ( $this->attributes['tabId'] ?? '' ) . '" data-panel-id="' . ( $this->attributes['panelId'] ?? '' ) . '" data-active="' . ( ( $this->attributes['isActive'] ?? false ) ? '1' : '0' ) . '"></div>';
        }
    };
}

function kotlinskidev_content_tabs_render(array $items): string
{
    $block = (object) [ 'inner_blocks' => $items ];

    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        [],
        '',
        $block
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ( $extra['class'] ?? '' ) . '"'
    );
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('wp_unique_id')->alias(fn ($prefix = '') => $prefix . '1');
});

it('builds one tab button per item, wrapping each nav-link render output', function () {
    $items = [
        kotlinskidev_content_tabs_item_stub([kotlinskidev_content_tabs_nav_link_stub('<span>One</span>')]),
        kotlinskidev_content_tabs_item_stub([kotlinskidev_content_tabs_nav_link_stub('<span>Two</span>')]),
    ];

    $html = kotlinskidev_content_tabs_render($items);

    expect($html)->toContain('role="tablist"');
    expect(substr_count($html, 'role="tab"'))->toBe(2);
    expect($html)->toContain('<span>One</span>');
    expect($html)->toContain('<span>Two</span>');
});

it('marks only the first tab as selected and focusable', function () {
    $items = [
        kotlinskidev_content_tabs_item_stub([kotlinskidev_content_tabs_nav_link_stub('One')]),
        kotlinskidev_content_tabs_item_stub([kotlinskidev_content_tabs_nav_link_stub('Two')]),
    ];

    $html = kotlinskidev_content_tabs_render($items);

    expect($html)->toContain('aria-selected="true" tabindex="0"');
    expect($html)->toContain('aria-selected="false" tabindex="-1"');
});

it('injects matching tabId/panelId/isActive onto each item before rendering it', function () {
    $items = [
        kotlinskidev_content_tabs_item_stub([]),
        kotlinskidev_content_tabs_item_stub([]),
    ];

    $html = kotlinskidev_content_tabs_render($items);

    expect($html)->toContain('data-active="1"');
    expect($html)->toContain('data-active="0"');

    preg_match_all('/aria-controls="([^"]+)"/', $html, $ariaControls);
    preg_match_all('/data-panel-id="([^"]+)"/', $html, $dataPanelIds);
    expect($ariaControls[1])->toBe($dataPanelIds[1]);

    preg_match_all('/id="([^"]+)" class="kt-content-tabs__nav-trigger"/', $html, $triggerIds);
    preg_match_all('/data-tab-id="([^"]+)"/', $html, $dataTabIds);
    expect($triggerIds[1])->toBe($dataTabIds[1]);
});

it('uses a horizontal orientation for top/bottom nav positions and vertical for left/right', function () {
    $top = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        ['navPosition' => 'top'],
        '',
        (object) ['inner_blocks' => []]
    );
    $left = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        ['navPosition' => 'left'],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($top)->toContain('aria-orientation="horizontal"');
    expect($left)->toContain('aria-orientation="vertical"');
});

it('skips non-content-tabs-item inner blocks', function () {
    $unrelated = (object) ['name' => 'core/paragraph'];
    $items = [ $unrelated, kotlinskidev_content_tabs_item_stub([]) ];

    $html = kotlinskidev_content_tabs_render($items);

    expect(substr_count($html, 'role="tab"'))->toBe(1);
});

it('skips the first nav-link child and renders the rest as panel content', function () {
    $navLink = kotlinskidev_content_tabs_nav_link_stub('<span>Label</span>');
    $paragraph = new class () {
        public string $name = 'core/paragraph';
        public function render(): string
        {
            return '<p>Body</p>';
        }
    };
    $block = (object) [ 'inner_blocks' => [ $navLink, $paragraph ] ];

    Functions\when('get_block_wrapper_attributes')->justReturn('class="kt-content-tabs__panel"');

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/item/render.php',
        ['tabId' => 'tab-0', 'panelId' => 'panel-0', 'isActive' => true],
        '',
        $block
    );

    expect($html)->not->toContain('<span>Label</span>');
    expect($html)->toContain('<p>Body</p>');
});

it('adds tabpanel role, id, and aria-labelledby to the panel wrapper', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="kt-content-tabs__panel"');

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/item/render.php',
        ['tabId' => 'tab-0', 'panelId' => 'panel-0', 'isActive' => true],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->toContain('id="panel-0"');
    expect($html)->toContain('role="tabpanel"');
    expect($html)->toContain('aria-labelledby="tab-0"');
    expect($html)->not->toContain('hidden');
});

it('hides the panel wrapper when it is not the active tab', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="kt-content-tabs__panel"');

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/item/render.php',
        ['tabId' => 'tab-1', 'panelId' => 'panel-1', 'isActive' => false],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->toContain('hidden="hidden"');
});

it('adds the mobile position and active-style classes alongside the desktop position class', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        [
            'navPosition' => 'left',
            'navPositionMobile' => 'bottom',
            'activeTabUnderline' => false,
            'activeTabBackgroundEnabled' => true,
            'activeTabBackgroundColor' => '#8209d3',
        ],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->toContain('kt-content-tabs--left');
    expect($html)->toContain('kt-content-tabs--mobile-bottom');
    expect($html)->toContain('kt-content-tabs--active-background');
});

it('defaults to top/underline classes and no gap custom property when no attributes are set', function () {
    $html = kotlinskidev_content_tabs_render([]);

    expect($html)->toContain('kt-content-tabs--top');
    expect($html)->toContain('kt-content-tabs--mobile-top');
    expect($html)->toContain('kt-content-tabs--active-underline');
    expect($html)->not->toContain('--kt-content-tabs-nav-gap-');
});

it('applies only the navGap devices that are actually set, as separate CSS custom properties', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        ['navGap' => ['desktop' => 24, 'mobile' => 4]],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->toContain('--kt-content-tabs-nav-gap-desktop:24px');
    expect($html)->toContain('--kt-content-tabs-nav-gap-mobile:4px');
    expect($html)->not->toContain('--kt-content-tabs-nav-gap-tablet');
});

it('omits the active color/background custom properties when they are not set', function () {
    $html = kotlinskidev_content_tabs_render([]);

    expect($html)->not->toContain('--kt-content-tabs-active-color');
    expect($html)->not->toContain('--kt-content-tabs-active-bg');
});

it('omits the active color/background custom properties when set but their toggle is off', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        [
            'activeTabTextColorEnabled' => false,
            'activeTabColor' => '#ffffff',
            'activeTabBackgroundEnabled' => false,
            'activeTabBackgroundColor' => '#8209d3',
        ],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->not->toContain('--kt-content-tabs-active-color');
    expect($html)->not->toContain('--kt-content-tabs-active-bg');
    expect($html)->not->toContain('kt-content-tabs--active-text-color');
    expect($html)->not->toContain('kt-content-tabs--active-background');
});

it('applies the activeTabColor and activeTabBackgroundColor attributes as CSS custom properties when their toggles are on', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        [
            'activeTabTextColorEnabled' => true,
            'activeTabColor' => '#ffffff',
            'activeTabBackgroundEnabled' => true,
            'activeTabBackgroundColor' => 'linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)',
        ],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->toContain('--kt-content-tabs-active-color:#ffffff');
    expect($html)->toContain('--kt-content-tabs-active-bg:linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)');
});

it('combines underline, text color, and background all at once when all three are enabled', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        [
            'activeTabUnderline' => true,
            'activeTabTextColorEnabled' => true,
            'activeTabColor' => '#ffffff',
            'activeTabBackgroundEnabled' => true,
            'activeTabBackgroundColor' => '#8209d3',
        ],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->toContain('kt-content-tabs--active-underline');
    expect($html)->toContain('kt-content-tabs--active-text-color');
    expect($html)->toContain('kt-content-tabs--active-background');
});

it('adds the text-gradient class when the active tab text color is a gradient', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        [
            'activeTabTextColorEnabled' => true,
            'activeTabColor' => 'linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)',
        ],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->toContain('kt-content-tabs--active-text-color');
    expect($html)->toContain('kt-content-tabs--active-text-gradient');
    expect($html)->toContain('--kt-content-tabs-active-color:linear-gradient(90deg,#8209d3 0%,#ff6b6b 100%)');
});

it('does not add the text-gradient class for a flat active tab text color', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        [
            'activeTabTextColorEnabled' => true,
            'activeTabColor' => '#ffffff',
        ],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->not->toContain('kt-content-tabs--active-text-gradient');
});

it('can disable the underline while keeping the other active-tab styles', function () {
    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/render.php',
        [
            'activeTabUnderline' => false,
            'activeTabTextColorEnabled' => true,
            'activeTabColor' => '#ffffff',
        ],
        '',
        (object) ['inner_blocks' => []]
    );

    expect($html)->not->toContain('kt-content-tabs--active-underline');
    expect($html)->toContain('kt-content-tabs--active-text-color');
});

it('renders the nav-link label wrapped in the native styling wrapper', function () {
    Functions\when('get_block_wrapper_attributes')->justReturn('class="wp-block-kotlinskidev-content-tabs-nav-link"');
    Functions\when('wp_kses_post')->alias(fn ($t) => $t);

    $html = kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/content-tabs/nav-link/render.php',
        ['label' => 'Creating Websites']
    );

    expect($html)->toBe('<span class="wp-block-kotlinskidev-content-tabs-nav-link">Creating Websites</span>');
});
