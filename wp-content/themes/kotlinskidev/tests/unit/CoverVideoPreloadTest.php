<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/above-fold-media.php';

beforeEach(function () {
    Functions\when('wp_high_priority_element_flag')->justReturn(true);
    Functions\when('wp_increase_content_media_count')->justReturn(1);
    Functions\when('wp_omit_loading_attr_threshold')->justReturn(3);
    Functions\when('esc_url')->alias(fn ($t) => $t);
    kotlinskidev_reset_above_fold_state();
});

function kotlinskidev_captured_preload(): string
{
    ob_start();
    kotlinskidev_print_lcp_preload();
    return ob_get_clean();
}

it('prints a high priority image preload for the claimed poster', function () {
    kotlinskidev_claim_lcp_slot([['href' => 'poster.jpg']]);

    expect(kotlinskidev_captured_preload())->toBe('<link rel="preload" as="image" fetchpriority="high" href="poster.jpg">' . "\n");
});

it('prints nothing when nothing has been claimed', function () {
    expect(kotlinskidev_captured_preload())->toBe('');
});

it('prints nothing when the claim carried no url', function () {
    kotlinskidev_claim_lcp_slot();

    expect(kotlinskidev_captured_preload())->toBe('');
});

it('lets only the first claim win and keeps its url', function () {
    expect(kotlinskidev_claim_lcp_slot([['href' => 'one.jpg']]))->toBeTrue();
    expect(kotlinskidev_claim_lcp_slot([['href' => 'two.jpg']]))->toBeFalse();

    expect(kotlinskidev_captured_preload())->toContain('href="one.jpg"');
});

it('stays true when the same owner re-renders but false for another owner', function () {
    expect(kotlinskidev_claim_lcp_slot([['href' => 'one.jpg']], 'slide-0'))->toBeTrue();
    expect(kotlinskidev_claim_lcp_slot([['href' => 'one.jpg']], 'slide-0'))->toBeTrue();
    expect(kotlinskidev_claim_lcp_slot([['href' => 'one.jpg']], 'slide-1'))->toBeFalse();
    expect(kotlinskidev_claim_lcp_slot([['href' => 'one.jpg']]))->toBeFalse();
});

it('flags the winner as the high priority element and bumps the media count once', function () {
    $calls = [];
    Functions\when('wp_high_priority_element_flag')->alias(function ($flag) use (&$calls) {
        $calls[] = ['flag', $flag];
        return true;
    });
    Functions\when('wp_increase_content_media_count')->alias(function ($n) use (&$calls) {
        $calls[] = ['count', $n];
        return $n;
    });

    kotlinskidev_claim_lcp_slot([['href' => 'a.jpg']]);
    kotlinskidev_claim_lcp_slot([['href' => 'b.jpg']]);

    expect($calls)->toBe([['flag', false], ['count', 3]]);
});

it('allows a new claim after the state is reset', function () {
    kotlinskidev_claim_lcp_slot([['href' => 'a.jpg']]);
    kotlinskidev_reset_above_fold_state();

    expect(kotlinskidev_claim_lcp_slot([['href' => 'b.jpg']]))->toBeTrue();
});


it('adds imagesrcset and imagesizes to the preload when the claim carries them', function () {
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    kotlinskidev_claim_lcp_slot([['href' => 'poster.jpg', 'srcset' => 'poster-800.jpg 800w, poster.jpg 1600w', 'sizes' => '100vw']]);

    expect(kotlinskidev_captured_preload())->toBe('<link rel="preload" as="image" fetchpriority="high" href="poster.jpg" imagesrcset="poster-800.jpg 800w, poster.jpg 1600w" imagesizes="100vw">' . "\n");
});

it('prints one preload per entry with its media query', function () {
    Functions\when('esc_attr')->alias(fn ($t) => $t);
    kotlinskidev_claim_lcp_slot([
        ['href' => 'm.jpg', 'srcset' => 'm.jpg 828w', 'sizes' => '100vw', 'media' => '(max-width: 781px)'],
        ['href' => 'd.jpg', 'srcset' => 'd.jpg 1600w', 'sizes' => '100vw', 'media' => '(min-width: 782px)'],
        ['href' => ''],
    ]);

    expect(kotlinskidev_captured_preload())->toBe(
        '<link rel="preload" as="image" fetchpriority="high" href="m.jpg" media="(max-width: 781px)" imagesrcset="m.jpg 828w" imagesizes="100vw">' . "\n"
        . '<link rel="preload" as="image" fetchpriority="high" href="d.jpg" media="(min-width: 782px)" imagesrcset="d.jpg 1600w" imagesizes="100vw">' . "\n"
    );
});
