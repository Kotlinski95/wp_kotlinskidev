import { debounce } from "./utils";

// /src/scripts/scroll-to-top.ts
(function () {
  const scrollToTopBtn = document.getElementById("scroll-to-top");
  if (!scrollToTopBtn) return;
  // Show/hide button based on scroll position
  const handleScroll = () => {
    if (
      document.body.scrollTop > 100 ||
      document.documentElement.scrollTop > 100
    ) {
      scrollToTopBtn.style.display = "block";
    } else {
      scrollToTopBtn.style.display = "none";
    }
  };

  handleScroll();

  const debouncedHandleScroll = debounce(handleScroll, 100);
  window.addEventListener("scroll", debouncedHandleScroll);

  // Scroll to top when the button is clicked
  scrollToTopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
