<?php
function kotlinskidev_offer_current_lang(): string {
	if ( function_exists( 'pll_current_language' ) ) {
		$lang = pll_current_language();
		if ( is_string( $lang ) && '' !== $lang ) {
			return $lang;
		}
	}
	if ( function_exists( 'pll_default_language' ) ) {
		$lang = pll_default_language();
		if ( is_string( $lang ) && '' !== $lang ) {
			return $lang;
		}
	}
	return substr( (string) get_locale(), 0, 2 );
}

function kotlinskidev_offer_languages(): array {
	if ( function_exists( 'pll_languages_list' ) ) {
		$languages = pll_languages_list();
		if ( is_array( $languages ) && array() !== $languages ) {
			return $languages;
		}
	}
	return [ kotlinskidev_offer_current_lang() ];
}
