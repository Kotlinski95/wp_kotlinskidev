import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import './style.scss';

registerBlockType('kotlinskidev/banner-carousel', {
    title: 'Banner Carousel',
    icon: 'images-alt2',
    category: 'media',
    attributes: {
        images: { type: 'array', default: [] },
        showPagination: { type: 'boolean', default: true },
        showArrows: { type: 'boolean', default: true },
        slidesPerView: { type: 'number', default: 1 },
        enableAutoSwiping: { type: 'boolean', default: false },
        autoSwipingTime: { type: 'number', default: 5000 },
        enableLoopMode: { type: 'boolean', default: false },
        slidesPerMobile: { type: 'number', default: 1 },
        showScrollbar: { type: 'boolean', default: false },
        slidesPerTablet: { type: 'number', default: 1 },
        slidesPerDesktop: { type: 'number', default: 1 },
    },
    edit: Edit,
    save: Save,
});
