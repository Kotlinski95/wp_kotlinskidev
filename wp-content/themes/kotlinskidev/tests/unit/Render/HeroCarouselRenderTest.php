<?php

use Brain\Monkey\Functions;

function kotlinskidev_hero_carousel_slide_stub(int $index, string $html): object
{
    return new class ($index, $html) {
        public array $attributes = [];
        private string $html;

        public function __construct(int $index, string $html)
        {
            $this->html = $html;
        }

        public function render(): string
        {
            return '<div data-slide-index="' . ($this->attributes['slideIndex'] ?? '?') . '">' . $this->html . '</div>';
        }
    };
}

function kotlinskidev_hero_carousel_render(array $attributes, array $slides = []): string
{
    $block = (object) ['inner_blocks' => $slides];

    return kotlinskidev_render_block_file(
        __DIR__ . '/../../../src/blocks/hero-carousel/render.php',
        $attributes,
        '',
        $block
    );
}

beforeEach(function () {
    Functions\when('get_block_wrapper_attributes')->alias(
        fn ($extra = []) => 'class="' . ($extra['class'] ?? '') . '" style="' . ($extra['style'] ?? '') . '"'
    );
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    Functions\when('sanitize_key')->alias(fn ($t) => $t);
    Functions\when('sanitize_text_field')->alias(fn ($t) => $t);
    Functions\when('wp_json_encode')->alias('json_encode');
});

it('renders the nav and pagination inside the swiper by default', function () {
    $html = kotlinskidev_hero_carousel_render([]);

    $swiperOpen = strpos($html, 'hero-carousel__swiper');
    $navPos = strpos($html, 'carousel-nav ');
    $paginationPos = strpos($html, 'swiper-pagination');

    expect($navPos)->not->toBeFalse();
    expect($paginationPos)->not->toBeFalse();
    expect($navPos)->toBeGreaterThan($swiperOpen);
    expect($paginationPos)->toBeGreaterThan($swiperOpen);
});

it('shows the slide counter once arrowsPosition is not sides', function () {
    $html = kotlinskidev_hero_carousel_render(['arrowsPosition' => 'bottom']);

    expect($html)->toContain('carousel-nav__counter');
});

it('hides the slide counter for the default sides position', function () {
    $html = kotlinskidev_hero_carousel_render([]);

    expect($html)->not->toContain('carousel-nav__counter');
});

it('moves the nav outside the swiper and hides pagination when navPlacement is outside', function () {
    $html = kotlinskidev_hero_carousel_render(['arrowsPosition' => 'bottom', 'navPlacement' => 'outside']);

    expect($html)->toContain('carousel-nav--outside');
    expect($html)->not->toContain('swiper-pagination');
});

it('renders no nav markup when showArrows is false', function () {
    $html = kotlinskidev_hero_carousel_render(['showArrows' => false]);

    expect($html)->not->toContain('carousel-nav ');
});

it('renders no pagination markup when showPagination is false', function () {
    $html = kotlinskidev_hero_carousel_render(['showPagination' => false]);

    expect($html)->not->toContain('swiper-pagination');
});

it('applies the flat nav color css variable when hover is off', function () {
    $html = kotlinskidev_hero_carousel_render(['navColor' => '#ff0000', 'navColorOnHover' => false]);

    expect($html)->toContain('--carousel-nav-color: #ff0000');
});

it('applies the hover nav color css variable when hover is on', function () {
    $html = kotlinskidev_hero_carousel_render(['navColor' => '#ff0000', 'navColorOnHover' => true]);

    expect($html)->toContain('--carousel-nav-color-hover: #ff0000');
});

it('reflects the configured min height as a css variable', function () {
    $html = kotlinskidev_hero_carousel_render(['minHeight' => 60]);

    expect($html)->toContain('--hero-min-height: 60svh');
});

it('renders each inner slide block with its index injected', function () {
    $slides = [
        kotlinskidev_hero_carousel_slide_stub(0, 'Slide A'),
        kotlinskidev_hero_carousel_slide_stub(1, 'Slide B'),
    ];

    $html = kotlinskidev_hero_carousel_render([], $slides);

    expect($html)->toContain('<div data-slide-index="0">Slide A</div>');
    expect($html)->toContain('<div data-slide-index="1">Slide B</div>');
});

it('encodes the swiper settings as a json data attribute', function () {
    Functions\when('esc_attr')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));

    $html = kotlinskidev_hero_carousel_render(['autoplay' => true, 'autoplayDelay' => 3000]);

    preg_match('/data-carousel-settings="([^"]+)"/', $html, $matches);
    $settings = json_decode(htmlspecialchars_decode($matches[1]), true);

    expect($settings['autoplay'])->toBeTrue();
    expect($settings['autoplayDelay'])->toBe(3000);
});

it('defaults draggable to true in the swiper settings', function () {
    Functions\when('esc_attr')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));

    $html = kotlinskidev_hero_carousel_render([]);

    preg_match('/data-carousel-settings="([^"]+)"/', $html, $matches);
    $settings = json_decode(htmlspecialchars_decode($matches[1]), true);

    expect($settings['draggable'])->toBeTrue();
});

it('reflects draggable when explicitly disabled', function () {
    Functions\when('esc_attr')->alias(fn ($t) => htmlspecialchars((string) $t, ENT_QUOTES));

    $html = kotlinskidev_hero_carousel_render(['draggable' => false]);

    preg_match('/data-carousel-settings="([^"]+)"/', $html, $matches);
    $settings = json_decode(htmlspecialchars_decode($matches[1]), true);

    expect($settings['draggable'])->toBeFalse();
});
