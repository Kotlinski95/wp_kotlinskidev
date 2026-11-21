import type Swiper from "swiper";

const DEFAULT_PROGRESS_RADIUS = 16;

export function wireClickPauseResume(container: HTMLElement, swiper: Swiper): void {
  let userInteracted = false;

  const pause = () => {
    userInteracted = true;
    swiper.autoplay.pause();
  };

  const resume = (event?: Event) => {
    if (!event || (!container.contains(event.target as Node) && userInteracted)) {
      userInteracted = false;
      swiper.autoplay.resume();
    }
  };

  container.addEventListener("click", () => {
    pause();
  });

  document.addEventListener("click", (event) => {
    resume(event);
  });
}

export function wireProgressCircle(container: HTMLElement, swiper: Swiper): void {
  const progressCircle = container.querySelector<SVGCircleElement>(
    ":scope > .swiper-progress .swiper-progress-fill"
  );
  if (!progressCircle) {
    return;
  }

  const radius = Number.parseFloat(
    progressCircle.getAttribute("r") || `${DEFAULT_PROGRESS_RADIUS}`
  );
  const circumference = 2 * Math.PI * radius;
  progressCircle.style.strokeDasharray = `${circumference}`;
  progressCircle.style.strokeDashoffset = `${circumference}`;

  swiper.on(
    "autoplayTimeLeft",
    (_swiperInstance: Swiper, _timeLeft: number, percentage: number) => {
      progressCircle.style.strokeDashoffset = `${circumference * percentage}`;
    }
  );
}

interface SwiperWithActiveIndexSync {
  updateActiveIndex: () => void;
}

export function resyncActiveIndexOnAutoplayResume(swiper: Swiper): void {
  const syncableSwiper = swiper as unknown as SwiperWithActiveIndexSync;
  const resync = () => syncableSwiper.updateActiveIndex();

  swiper.on("autoplayStart", resync);
  swiper.on("autoplayResume", resync);
}
