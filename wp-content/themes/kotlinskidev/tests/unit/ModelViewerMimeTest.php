<?php

use Brain\Monkey\Functions;

require_once __DIR__ . '/../../functions/model-viewer-mime.php';

it('adds the glb mime without disturbing existing entries', function () {
    $mimes = kotlinskidev_allow_glb_uploads(['jpg' => 'image/jpeg']);

    expect($mimes)->toBe([
        'jpg' => 'image/jpeg',
        'glb' => 'model/gltf-binary',
    ]);
});

it('leaves an already-resolved ext/type untouched', function () {
    $data = [
        'ext'             => 'jpg',
        'type'            => 'image/jpeg',
        'proper_filename' => 'photo.jpg',
    ];

    $result = kotlinskidev_check_glb_filetype_and_ext($data, '/tmp/photo.jpg', 'photo.jpg', []);

    expect($result)->toBe($data);
});

it('forces ext/type to glb for a .glb filename with empty incoming values', function () {
    Functions\when('wp_check_filetype')->justReturn(['ext' => 'glb', 'type' => 'model/gltf-binary']);

    $data = ['ext' => '', 'type' => '', 'proper_filename' => false];

    $result = kotlinskidev_check_glb_filetype_and_ext($data, '/tmp/model.glb', 'model.glb', []);

    expect($result['ext'])->toBe('glb');
    expect($result['type'])->toBe('model/gltf-binary');
});

it('leaves ext/type empty for a non-glb filename with empty incoming values', function () {
    Functions\when('wp_check_filetype')->justReturn(['ext' => '', 'type' => '']);

    $data = ['ext' => '', 'type' => '', 'proper_filename' => false];

    $result = kotlinskidev_check_glb_filetype_and_ext($data, '/tmp/file.xyz', 'file.xyz', []);

    expect($result['ext'])->toBe('');
    expect($result['type'])->toBe('');
});

it('does not throw when core calls the filter with a null $mimes argument', function () {
    Functions\when('wp_check_filetype')->justReturn(['ext' => 'glb', 'type' => 'model/gltf-binary']);

    $data = ['ext' => '', 'type' => '', 'proper_filename' => false];

    $result = kotlinskidev_check_glb_filetype_and_ext($data, '/tmp/model.glb', 'model.glb', null, 'model/gltf-binary');

    expect($result['ext'])->toBe('glb');
    expect($result['type'])->toBe('model/gltf-binary');
});
