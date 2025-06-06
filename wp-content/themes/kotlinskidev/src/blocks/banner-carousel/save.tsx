import React from 'react';
import { useBlockProps } from '@wordpress/block-editor';

type BannerCarouselAttributes = {
    images: { url: string; alt?: string }[];
    showPagination?: boolean;
    showScrollbar?: boolean;
};

export default function save({ attributes }: { attributes: BannerCarouselAttributes }) {
    const { images = [] } = attributes;
    return (
        <div {...useBlockProps.save()} className="swiper">
            <div className="swiper-wrapper">
                {images.map((img, i) => (
                    <div className="swiper-slide" key={i}>
                        <img src={img.url} alt={img.alt || ''} style={{ width: '100%' }} />
                    </div>
                ))}
            </div>
            {attributes.showPagination && <div className="swiper-pagination"></div>}
            {attributes.showScrollbar && <div className="swiper-scrollbar"></div>}
            <div className="swiper-button-prev"></div>
            <div className="swiper-button-next"></div>
        </div>
    );
}
