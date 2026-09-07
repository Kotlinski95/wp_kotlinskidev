<?php

uses(Tests\Integration\TestCase::class);

function kotlinskidev_process_steps_render( int $count ): string
{
    $steps = '';
    for ( $i = 1; $i <= $count; $i++ ) {
        $steps .= '<!-- wp:kotlinskidev/process-step -->'
            . '<!-- wp:heading {"level":3} --><h3 class="wp-block-heading">Step ' . $i . '</h3><!-- /wp:heading -->'
            . '<!-- wp:paragraph --><p>Description ' . $i . '</p><!-- /wp:paragraph -->'
            . '<!-- /wp:kotlinskidev/process-step -->';
    }

    $blocks = parse_blocks( '<!-- wp:kotlinskidev/process-steps -->' . $steps . '<!-- /wp:kotlinskidev/process-steps -->' );

    return render_block( $blocks[0] );
}

it( 'renders the process-steps wrapper class', function () {
    $html = kotlinskidev_process_steps_render( 3 );

    expect( $html )->toContain( 'process-steps' );
    expect( $html )->toContain( 'wp-block-kotlinskidev-process-steps' );
} );

it( 'renders one process-step with a marker, number and body per step', function () {
    $html = kotlinskidev_process_steps_render( 3 );

    expect( substr_count( $html, 'process-step__marker' ) )->toBe( 3 );
    expect( substr_count( $html, 'process-step__number' ) )->toBe( 3 );
    expect( substr_count( $html, 'process-step__body' ) )->toBe( 3 );
    expect( $html )->toContain( 'Step 1' );
    expect( $html )->toContain( 'Step 3' );
} );

it( 'scales to any step count from a single step up to five or more', function () {
    $single = kotlinskidev_process_steps_render( 1 );
    $five   = kotlinskidev_process_steps_render( 5 );

    expect( substr_count( $single, 'process-step__marker' ) )->toBe( 1 );
    expect( substr_count( $five, 'process-step__marker' ) )->toBe( 5 );
    expect( $five )->toContain( 'Step 5' );
} );

it( 'passes arbitrary inner block content through unrestricted', function () {
    $html = kotlinskidev_process_steps_render( 1 );

    expect( $html )->toContain( 'Description 1' );
} );
