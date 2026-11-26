<?php
const KOTLINSKIDEV_SEO_IDENTITY_OPTION = 'kotlinskidev_seo_identity';
const KOTLINSKIDEV_SCHEMA_LOGO_OPTION  = 'kotlinskidev_schema_logo_id';

function kotlinskidev_seo_identity_defaults(): array
{
    return [
        'org_name'              => 'Kotlinskidev',
        'org_alternate_names'   => [ 'Kotlinskidev Web Development' ],
        'description'           => [],
        'logo_id'               => 0,
        'social_profiles'       => [
            'https://www.linkedin.com/in/adriankotlinski/',
            'https://github.com/Kotlinski95',
            'https://x.com/AdiKotlinski',
            'https://www.youtube.com/@adriankotlinski6927',
            'https://www.instagram.com/adriankotlinski',
            'https://www.facebook.com/adrian.kotlinski.9/',
        ],
        'person_name'           => 'Adrian Kotliński',
        'job_title'             => [
            'pl' => 'Programista frontend (Senior)',
            'en' => 'Senior Frontend Developer',
        ],
        'person_image_id'       => 0,
        'address_locality'      => 'Katowice',
        'address_region'        => '',
        'address_country'       => 'PL',
        'area_served'           => 'Poland',
        'knows_about'           => [
            'Web development',
            'Frontend development',
            'Next.js',
            'Angular',
            'WordPress',
            'Website performance optimization',
            'E-commerce development',
        ],
        'contact_type'          => 'customer service',
        'contact_languages'     => [ 'pl', 'en' ],
        'contact_page_slug'     => 'kontakt',
        'about_page_slug'       => 'o-mnie',
        'expose_contact'        => false,
        'website_name'          => 'Kotlinskidev',
        'website_alternate_names' => [ 'Kotlinskidev Web Development' ],
    ];
}

function kotlinskidev_seo_identity_translatable_keys(): array
{
    return [ 'description', 'job_title' ];
}

function kotlinskidev_seo_identity_overridable_keys(): array
{
    return [
        'org_name',
        'org_alternate_names',
        'logo_id',
        'person_name',
        'person_image_id',
        'website_name',
        'website_alternate_names',
        'social_profiles',
    ];
}
