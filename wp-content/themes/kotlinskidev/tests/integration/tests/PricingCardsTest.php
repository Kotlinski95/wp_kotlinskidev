<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_pricing_cards_render( array $cards ): string
{
    $tiers = '';
    foreach ( $cards as $index => $featured ) {
        $attrs  = $featured ? ' {"featured":true}' : '';
        $tiers .= '<!-- wp:kotlinskidev/pricing-card' . $attrs . ' -->'
            . '<!-- wp:heading {"level":3} --><h3 class="wp-block-heading">Tier ' . ( $index + 1 ) . '</h3><!-- /wp:heading -->'
            . '<!-- wp:paragraph --><p>Description ' . ( $index + 1 ) . '</p><!-- /wp:paragraph -->'
            . '<!-- /wp:kotlinskidev/pricing-card -->';
    }

    $blocks = parse_blocks( '<!-- wp:kotlinskidev/pricing-cards -->' . $tiers . '<!-- /wp:kotlinskidev/pricing-cards -->' );

    return render_block( $blocks[0] );
}

it( 'renders the pricing-cards wrapper class', function () {
    $html = kotlinskidev_pricing_cards_render( [ false, true, false ] );

    expect( $html )->toContain( 'pricing-cards' );
    expect( $html )->toContain( 'wp-block-kotlinskidev-pricing-cards' );
} );

it( 'renders one pricing-card per tier with its body', function () {
    $html = kotlinskidev_pricing_cards_render( [ false, true, false ] );

    expect( substr_count( $html, 'pricing-card__body' ) )->toBe( 3 );
    expect( $html )->toContain( 'Tier 1' );
    expect( $html )->toContain( 'Tier 3' );
} );

it( 'adds the featured class and badge only to a featured tier', function () {
    $html = kotlinskidev_pricing_cards_render( [ false, true, false ] );

    expect( substr_count( $html, 'pricing-card--featured' ) )->toBe( 1 );
    expect( substr_count( $html, 'pricing-card__badge' ) )->toBe( 1 );
    expect( $html )->toContain( 'Most popular' );
} );

it( 'omits the badge entirely when no tier is featured', function () {
    $html = kotlinskidev_pricing_cards_render( [ false, false ] );

    expect( $html )->not->toContain( 'pricing-card__badge' );
    expect( $html )->not->toContain( 'pricing-card--featured' );
} );

it( 'applies badgeFontSize and badgeTextColor as an inline style on the badge, scoped to just the badge span', function () {
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/pricing-cards -->'
        . '<!-- wp:kotlinskidev/pricing-card {"featured":true,"badgeFontSize":"1.25rem","badgeTextColor":"#ff0000"} -->'
        . '<!-- wp:paragraph --><p>Description</p><!-- /wp:paragraph -->'
        . '<!-- /wp:kotlinskidev/pricing-card -->'
        . '<!-- /wp:kotlinskidev/pricing-cards -->'
    );

    $html = render_block( $blocks[0] );

    expect( $html )->toMatch( '/<span class="pricing-card__badge" style="font-size:1\.25rem;color:#ff0000;">/' );
} );

it( 'renders badgeGradient as a background-clip:text style, taking precedence over badgeTextColor', function () {
    $blocks = parse_blocks(
        '<!-- wp:kotlinskidev/pricing-cards -->'
        . '<!-- wp:kotlinskidev/pricing-card {"featured":true,"badgeTextColor":"#ff0000","badgeGradient":"linear-gradient(135deg, #ff0000 0%, #0000ff 100%)"} -->'
        . '<!-- wp:paragraph --><p>Description</p><!-- /wp:paragraph -->'
        . '<!-- /wp:kotlinskidev/pricing-card -->'
        . '<!-- /wp:kotlinskidev/pricing-cards -->'
    );

    $html = render_block( $blocks[0] );

    expect( $html )->toContain( 'background-image:linear-gradient(135deg, #ff0000 0%, #0000ff 100%);' );
    expect( $html )->toContain( 'background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:transparent;' );
    expect( $html )->not->toContain( 'color:#ff0000' );
} );

it( 'leaves the badge without an inline style attribute when badgeFontSize and badgeTextColor are unset', function () {
    $html = kotlinskidev_pricing_cards_render( [ true ] );

    expect( $html )->toContain( '<span class="pricing-card__badge">' );
} );

it( 'scales from a single tier up to five or more', function () {
    $single = kotlinskidev_pricing_cards_render( [ false ] );
    $five   = kotlinskidev_pricing_cards_render( [ false, false, false, false, false ] );

    expect( substr_count( $single, 'pricing-card__body' ) )->toBe( 1 );
    expect( substr_count( $five, 'pricing-card__body' ) )->toBe( 5 );
} );
