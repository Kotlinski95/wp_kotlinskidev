<?php
// This file is generated. Do not modify it manually.
return array(
	'google-maps-block' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'googlemaps/google-maps-block',
		'version' => '0.1.0',
		'title' => 'Google Maps Block',
		'category' => 'widgets',
		'icon' => 'smiley',
		'description' => 'A customizable Google Map block for your contact page.',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'google-maps-block',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js',
		'attributes' => array(
			'apiKey' => array(
				'type' => 'string',
				'default' => ''
			),
			'address' => array(
				'type' => 'string',
				'default' => ''
			),
			'lat' => array(
				'type' => 'string',
				'default' => ''
			),
			'lng' => array(
				'type' => 'string',
				'default' => ''
			),
			'zoom' => array(
				'type' => 'number',
				'default' => 14
			),
			'width' => array(
				'type' => 'string',
				'default' => '100%'
			),
			'height' => array(
				'type' => 'string',
				'default' => '400px'
			)
		)
	)
);
