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
	FreeMode,
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
			FreeMode,
		],
		navigation: options?.navigation ?? false,
		// pagination: options?.pagination ?? false,
		simulateTouch: options?.simulateTouch ?? true,
		loop: options?.loop || true,
		autoplay:
			options?.autoplay && options?.autoplayTime
				? {
						delay: options?.smoothTransition ? 1 : ( options?.autoplayTime || 1 ) * 1000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
				  }
				: options?.autoplay ?? true,
		slidesPerView: options?.slidesPerView || 1,
		spaceBetween: typeof options.spaceBetween === 'number' ? options.spaceBetween : 16,
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
		mousewheel: options?.mousewheel ?? false,
		keyboard: options?.keyboard ?? {
			enabled: true,
			onlyInViewport: true,
		},
		lazy: {
			loadPrevNext: true,
			loadPrevNextAmount: 3,
			loadOnTransitionStart: true,
		},
		speed: options?.smoothTransition ? (options?.autoplayTime || 5) * 1000 : 300,
		allowTouchMove: true,
		resistanceRatio: 0.85,
		// Add linear easing for smooth transition
		...(options?.smoothTransition && {
			cssMode: false,
			touchRatio: 1,
			touchAngle: 45,
			simulateTouch: true,
			followFinger: true,
			shortSwipes: true,
			longSwipes: true,
			freeMode: {
				enabled: true,
				momentum: false,
				sticky: false,
			},
		}),
	};

	if (!options?.scrollbar && options?.pagination) {
		parameters.pagination = true;
	}

	if (options?.scrollbar && !options.pagination) {
		parameters.scrollbar = true;
	}
	const swiper = new Swiper(container, parameters);

	// Add linear easing for smooth transitions
	if (options?.smoothTransition) {
		const swiperWrapper = container.querySelector('.swiper-wrapper');
		if (swiperWrapper) {
			swiperWrapper.style.transitionTimingFunction = 'linear';
		}
	}

	// Simple click outside to restart autoplay
	if (options?.autoplay) {
		let userInteracted = false;

		// Mark when user interacts with carousel
		container.addEventListener('click', () => {
			userInteracted = true;
			swiper.autoplay.stop();
		});

		// Restart autoplay when clicking outside
		document.addEventListener('click', (event) => {
			if (!container.contains(event.target) && userInteracted) {
				userInteracted = false;
				swiper.autoplay.start();
			}
		});
	}

	return swiper;
}
