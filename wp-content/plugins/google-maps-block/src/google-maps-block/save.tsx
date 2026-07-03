import { useBlockProps } from '@wordpress/block-editor';
import React from 'react';

const GoogleMapsBlockSave = ({ attributes }: any) => {
    // The map is rendered dynamically in PHP, so nothing is saved to post content
    return <div {...useBlockProps()} />;
};

export default GoogleMapsBlockSave;
