/**
 * Swiper dependencies
 *
 * @see https://swiperjs.com/get-started
 */
import { Swiper } from 'swiper';
import {
	Autoplay,
	Keyboard,
	Navigation,
	Pagination,
	A11y,
	HashNavigation,
	Mousewheel,
	Parallax,
	Scrollbar,
	Thumbs,
	Zoom,
} from 'swiper/modules';

/**
 * Initialize the slider.
 *
 * @param {Element} container HTMLElement.
 * @param {Object}  options   Slider parameters.
 *
 * @return {Object} Returns initialized slider instance.
 *
 * @see https://swiperjs.com/swiper-api#parameters
 */
export function SwiperInit(container, options = {}) {
	console.log('SWIPER INIT: ', container, 'options: ', options);
	const parameters = {
		centeredSlides: options?.centerSlides ?? false,
		createElements: true,
		grabCursor: options?.grabCursor ?? true,
		initialSlide: 0,
		modules: [
			Autoplay,
			Keyboard,
			Navigation,
			Pagination,
			A11y,
			HashNavigation,
			Mousewheel,
			Parallax,
			Scrollbar,
			Thumbs,
			Zoom,
		],
		navigation: options?.navigation ?? false,
		// pagination: options?.pagination ?? false,
		simulateTouch: options?.simulateTouch ?? true,
		loop: options?.loop || true,
		autoplay:
			options?.autoplay && options?.autoplayTime
				? {
						delay: ( options?.autoplayTime || 1 ) * 1000,
				  }
				: options?.autoplay ?? true,
		slidesPerView: options?.slidesPerView || 1,
		breakpoints: {
			640: {
				slidesPerView: options?.slidesPerMobile || 1,
			},
			768: {
				slidesPerView: options?.slidesPerTablet || 1,
			},
			1024: {
				slidesPerView: options?.slidesPerDesktop || 1,
			},
		},
		zoom: {
			maxRatio: 5,
		},
		parallax: true,
		mousewheel: true,
		keyboard: {
			enabled: true,
			onlyInViewport: true,
		},
		lazy: {
			loadPrevNext: true,
			loadPrevNextAmount: 3,
			loadOnTransitionStart: true,
		},
		speed: 300,
	};

	if (!options?.scrollbar && options?.pagination) {
		console.log('options?.pagination', options?.pagination, 'container: ', container);
		parameters.pagination = true;
	}

	if (options?.scrollbar && !options.pagination) {
		console.log('options?.scrollbar', options?.scrollbar, 'container: ', container);
		parameters.scrollbar = true;
	}

	return new Swiper( container, parameters );
}
