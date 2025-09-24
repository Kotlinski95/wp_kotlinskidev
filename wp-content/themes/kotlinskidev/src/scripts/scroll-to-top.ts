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
    // Use body for scroll progress when body is scrollable
    const scrollTop = document.body.scrollTop;
    const scrollHeight = document.body.scrollHeight - document.body.clientHeight;

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
  document.body.addEventListener("scroll", debouncedHandleScroll);
  window.addEventListener("scroll", debouncedHandleScroll);

  scrollToTopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
