<?php
add_filter( 'upload_mimes', 'kotlinskidev_allow_glb_uploads' );
add_filter( 'wp_check_filetype_and_ext', 'kotlinskidev_check_glb_filetype_and_ext', 10, 5 );

function kotlinskidev_allow_glb_uploads( array $mimes ): array {
	$mimes['glb'] = 'model/gltf-binary';
	return $mimes;
}

function kotlinskidev_check_glb_filetype_and_ext( array $data, string $file, string $filename, $mimes = null, $real_mime = '' ): array {
	if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
		return $data;
	}

	$filetype = wp_check_filetype( $filename, array( 'glb' => 'model/gltf-binary' ) );

	if ( 'glb' === $filetype['ext'] ) {
		$data['ext']  = 'glb';
		$data['type'] = 'model/gltf-binary';
	}

	return $data;
}
