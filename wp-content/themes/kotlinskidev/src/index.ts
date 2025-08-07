import './index.scss';
import './scripts/hamburger';
import './scripts/scroll-to-top';
import './scripts/language';
import './scripts/restoration';
import './scripts/theme-switcher';
import './scripts/scroll-animations';
import './scripts/image-lightbox';
import './scripts/smooth-scroll-offset';

document.addEventListener('DOMContentLoaded', function () {
	document.body.classList.add('loaded');
	console.log(
		'%cWelcome to KotlinskiDev site',
		'font-size: 24px; color: #4CAF50; font-weight: bold; font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 10px; border-radius: 5px;'
	);
});