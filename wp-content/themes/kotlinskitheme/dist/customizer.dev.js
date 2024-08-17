"use strict";

(function ($) {
  wp.customize('background_color', function (value) {
    value.bind(function (newval) {
      $('body').css('background-color', newval);
    });
  });
  wp.customize('text_color', function (value) {
    value.bind(function (newval) {
      $('body').css('color', newval);
    });
  });
})(jQuery);