import "swiper/swiper-bundle.css";
import { initSwiper } from "@utils/carousel/initSwiper";
import type { CarouselSettings } from "@utils/carousel/types";

const parseSettings = (el: HTMLElement): Partial<CarouselSettings> => {
  try {
    return JSON.parse(el.dataset.carouselSettings ?? "{}");
  } catch {
    return {};
  }
};

const preloadSlideImages = (slide: HTMLElement): void => {
  slide.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    if (img.loading !== "lazy" || !img.src) {
      return;
    }
    img.loading = "eager";
  });
};

const prepareSlideVideo = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (!video) {
    return;
  }
  if (video.dataset.src) {
    video.src = video.dataset.src;
    delete video.dataset.src;
  }
  if (video.dataset.poster) {
    video.poster = video.dataset.poster;
    delete video.dataset.poster;
  }
};

const playSlideVideo = (slide: HTMLElement): void => {
  slide
    .querySelector<HTMLVideoElement>("video")
    ?.play()
    .catch(() => {});
};

const pauseSlideVideo = (slide: HTMLElement): void => {
  const video = slide.querySelector<HTMLVideoElement>("video");
  if (!video) {
    return;
  }
  video.pause();
  video.currentTime = 0;
};

const wireAutoplayHoverPause = (el: HTMLElement, swiper: ReturnType<typeof initSwiper>): void => {
  const container = el.closest<HTMLElement>(".hero-carousel") ?? el;
  let hovered = false;
  let focused = false;
  let pressed = false;

  const evaluate = () => {
    if (hovered || focused || pressed) {
      swiper.autoplay.pause();
    } else {
      swiper.autoplay.resume();
    }
  };

  container.addEventListener("mouseenter", () => {
    hovered = true;
    evaluate();
  });

  container.addEventListener("mouseleave", () => {
    hovered = false;
    evaluate();
  });

  container.addEventListener("focusin", () => {
    focused = true;
    evaluate();
  });

  container.addEventListener("focusout", (event) => {
    const nextFocusedElement = event.relatedTarget;
    if (nextFocusedElement instanceof Node && container.contains(nextFocusedElement)) {
      return;
    }
    focused = false;
    evaluate();
  });

  container.addEventListener("pointerdown", () => {
    pressed = true;
    evaluate();
  });

  const releasePress = (event: Event) => {
    if (!pressed) {
      return;
    }
    pressed = false;
    const pointerEvent = event as PointerEvent;
    if (!pointerEvent.pointerType || pointerEvent.pointerType === "mouse") {
      const rect = container.getBoundingClientRect();
      hovered =
        pointerEvent.clientX >= rect.left &&
        pointerEvent.clientX <= rect.right &&
        pointerEvent.clientY >= rect.top &&
        pointerEvent.clientY <= rect.bottom;
    }
    evaluate();
  };
  document.addEventListener("pointerup", releasePress);
  document.addEventListener("pointercancel", releasePress);
};

const initHeroCarousel = (el: HTMLElement): void => {
  el.style.visibility = "hidden";
  const swiper = initSwiper(el, parseSettings(el));
  el.style.visibility = "visible";

  wireAutoplayHoverPause(el, swiper);

  swiper.slides.forEach((slide, i) => {
    if (i !== swiper.activeIndex) {
      prepareSlideVideo(slide);
      preloadSlideImages(slide);
    }
  });

  const firstSlide = swiper.slides[swiper.activeIndex];
  if (firstSlide) {
    playSlideVideo(firstSlide);
  }

  swiper.on("slideChangeTransitionStart", () => {
    const prev = swiper.slides[swiper.previousIndex];
    if (prev) {
      pauseSlideVideo(prev);
    }
  });

  swiper.on("slideChangeTransitionEnd", () => {
    const active = swiper.slides[swiper.activeIndex];
    if (active) {
      playSlideVideo(active);
    }
  });
};

const init = (): void => {
  document
    .querySelectorAll<HTMLElement>(".hero-carousel__swiper[data-carousel-settings]")
    .forEach((el) => {
      const rootMargin = parseSettings(el).lazyLoad ? "0px" : "200px 0px";
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }
            initHeroCarousel(entry.target as HTMLElement);
            obs.unobserve(entry.target);
          });
        },
        { rootMargin }
      );
      observer.observe(el);
    });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
