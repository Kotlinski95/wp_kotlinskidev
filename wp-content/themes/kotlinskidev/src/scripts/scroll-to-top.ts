import { debounce } from "./utils";

(function () {
  const scrollToTopBtn = document.getElementById("scroll-to-top");
  const scrollWrapper = document.querySelector('.scroll-to-top-wrapper') as HTMLElement;
  const progressRing = document.querySelector('.progress-ring__progress') as SVGCircleElement;
  
  if (!scrollToTopBtn || !scrollWrapper || !progressRing) return;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  
  progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
  progressRing.style.strokeDashoffset = `${circumference}`;

  const handleScroll = () => {
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (scrollTop > 100) {
      scrollToTopBtn.style.display = "block";
      scrollWrapper.classList.add('show');

      const scrollProgress = Math.min(scrollTop / scrollHeight, 1);
      const offset = circumference - (scrollProgress * circumference);

      progressRing.style.strokeDashoffset = `${offset}`;
    } else {
      scrollToTopBtn.style.display = "none";
      scrollWrapper.classList.remove('show');
    }
  };

  handleScroll();

  const debouncedHandleScroll = debounce(handleScroll, 16); // ~60fps for smooth animation
  window.addEventListener("scroll", debouncedHandleScroll);

  scrollToTopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
