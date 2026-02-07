document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".swiper").forEach((el) => {
    // Hide the carousel initially

    if (!el.dataset.bannerCarouselSettings) return;
    el.style.visibility = "hidden";

    const settings = el.dataset.bannerCarouselSettings
      ? JSON.parse(el.dataset.bannerCarouselSettings)
      : {};

    if (typeof Swiper !== "undefined") {
      if (!settings.showArrows) {
        const nextArrow = el.querySelector(".swiper-button-next");
        const prevArrow = el.querySelector(".swiper-button-prev");
        if (nextArrow) nextArrow.style.display = "none";
        if (prevArrow) prevArrow.style.display = "none";
      }

      const swiperConfig = {
        loop: settings.enableLoopMode || false,
        autoplay: settings.enableAutoSwiping
          ? {
              delay: (settings.autoSwipingTime || 1) * 1000,
            }
          : false,
        navigation: settings.showArrows
          ? {
              nextEl: el.querySelector(".swiper-button-next"),
              prevEl: el.querySelector(".swiper-button-prev"),
            }
          : false,
        slidesPerView: settings.slidesPerView || 1,
        breakpoints: {
          640: {
            slidesPerView: settings.slidesPerMobile || 1,
          },
          768: {
            slidesPerView: settings.slidesPerTablet || 1,
          },
          1024: {
            slidesPerView: settings.slidesPerDesktop || 1,
          },
        },
        zoom: {
          maxRatio: 5,
        },
        simulateTouch: true,
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

      if (!settings.showScrollbar && settings.showPagination) {
        swiperConfig.pagination = {
          el: el.querySelector(".swiper-pagination"),
          clickable: true,
        };
      }

      if (settings.showScrollbar && !settings.showPagination) {
        swiperConfig.scrollbar = {
          el: el.querySelector(".swiper-scrollbar"),
          draggable: true,
        };
      }

      new Swiper(el, swiperConfig);

      // Show the carousel after Swiper is initialized
      el.style.visibility = "visible";
    } else {
      console.warn("Swiper is not defined");
    }
  });
});
