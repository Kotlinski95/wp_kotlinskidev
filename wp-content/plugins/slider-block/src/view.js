/**
 * Shared Swiper config.
 */
import { SwiperInit } from './swiper-init';

document.addEventListener( 'DOMContentLoaded', () => {
	const containers = document.querySelectorAll( '.swiper' );

	// Return early, and often.
	if ( ! containers.length ) {
		return;
	}

	// Loop through all sliders and assign Swiper object.
	containers.forEach((element) => {
		console.log( 'SWIPER block INIT: ', element );
		if ( !element.dataset.swiper ) return;
		element.style.visibility = 'hidden';
		// We could pass in some unique options here.
		let options = {};

		try {
			options = JSON.parse( element.dataset.swiper );
		} catch ( e ) {
			// eslint-disable-next-line no-console
			console.error( e );
			return;
		}

		// Slider 🚀
		SwiperInit( element, options );
		element.style.visibility = 'visible';
	} );
} );
