(function () {
  const activeAnimations = new Map<HTMLElement, number>();

  const easingFunctions = {
    linear: (t: number) => t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    bounce: (t: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },
  };

  const formatNumber = (
    value: number,
    decimals: number = 0,
    useSeparator: boolean = false
  ): string => {
    const formatted = value.toFixed(decimals);

    if (useSeparator) {
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }

    return formatted;
  };

  const extractNumberInfo = (text: string) => {
    const numberPattern = /([^\d]*)(\d{1,3}(?:,\d{3})*(?:\.\d+)?)([^\d]*)/;
    const match = text.match(numberPattern);

    if (match) {
      const prefix = match[1] || "";
      const numberStr = match[2].replace(/,/g, "");
      const suffix = match[3] || "";
      const number = parseFloat(numberStr);
      const hasCommas = match[2].includes(",");
      const decimals = (match[2].split(".")[1] || "").length;

      const result = {
        number: isNaN(number) ? 100 : number,
        prefix: prefix.trim(),
        suffix: suffix.trim(),
        decimals,
        hasCommas,
      };

      return result;
    }

    const fallback = {
      number: 100,
      prefix: "",
      suffix: text.replace(/\d+/g, "").trim(),
      decimals: 0,
      hasCommas: false,
    };

    return fallback;
  };

  const animateCounter = (element: HTMLElement): void => {
    const originalText = element.textContent || "100";
    const numberInfo = extractNumberInfo(originalText);

    const startValue = 0;
    const endValue = numberInfo.number;
    const duration = parseInt(element.getAttribute("data-counter-duration") || "2000");
    const easingType = element.getAttribute("data-counter-easing") || "easeOut";

    const easingFunction =
      easingFunctions[easingType as keyof typeof easingFunctions] || easingFunctions.easeOut;

    let startTime: number | null = null;
    const range = endValue - startValue;
    let lastDisplayValue = -1;
    let animationId: number;

    const animate = (currentTime: number): void => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunction(progress);
      const currentValue = startValue + range * easedProgress;
      const displayValue = Math.max(0, Math.floor(currentValue));

      if (displayValue !== lastDisplayValue || progress === 1) {
        lastDisplayValue = displayValue;

        const formattedNumber = formatNumber(
          progress === 1 ? endValue : displayValue,
          numberInfo.decimals,
          numberInfo.hasCommas
        );
        const newText = `${numberInfo.prefix}${formattedNumber}${numberInfo.suffix}`;

        element.textContent = newText;
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
        activeAnimations.set(element, animationId);
      } else {
        activeAnimations.delete(element);
        element.setAttribute("data-counter-animated", "true");
      }
    };

    animationId = requestAnimationFrame(animate);
    activeAnimations.set(element, animationId);
  };

  let cachedReducedMotion: boolean | null = null;
  let motionMediaQuery: MediaQueryList | null = null;

  const getReducedMotionPreference = (): boolean => {
    if (cachedReducedMotion === null) {
      motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      cachedReducedMotion = motionMediaQuery.matches;

      motionMediaQuery.addEventListener("change", (e) => {
        cachedReducedMotion = e.matches;
      });
    }
    return cachedReducedMotion;
  };

  const initCounterAnimations = (): void => {
    const counterElements = document.querySelectorAll<HTMLElement>(
      ".animated-counter:not([data-counter-animated])"
    );

    if (counterElements.length === 0) {
      return;
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const element = entry.target as HTMLElement;

            if (entry.isIntersecting) {
              if (!element.hasAttribute("data-counter-animated")) {
                if (getReducedMotionPreference()) {
                  showFinalValue(element);
                } else {
                  if ("requestIdleCallback" in window) {
                    requestIdleCallback(() => animateCounter(element));
                  } else {
                    animateCounter(element);
                  }
                }
              }

              observer.unobserve(element);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -20px 0px",
        }
      );

      counterElements.forEach((element) => {
        observer.observe(element);
      });
    } else {
      const checkVisibility = (): void => {
        const windowHeight = window.innerHeight;

        counterElements.forEach((element) => {
          if (element.hasAttribute("data-counter-animated")) {
            return;
          }

          const rect = element.getBoundingClientRect();

          if (rect.top < windowHeight - 50 && rect.bottom > 0) {
            const prefersReducedMotion = window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches;

            if (prefersReducedMotion) {
              showFinalValue(element);
            } else {
              animateCounter(element);
            }
          }
        });
      };

      checkVisibility();
      (window as Window).addEventListener("scroll", checkVisibility, {
        passive: true,
      });
      (window as Window).addEventListener("resize", checkVisibility, {
        passive: true,
      });
    }
  };

  const showFinalValue = (element: HTMLElement): void => {
    const originalText = element.textContent || "100";
    const numberInfo = extractNumberInfo(originalText);

    const finalNumber = formatNumber(numberInfo.number, numberInfo.decimals, numberInfo.hasCommas);
    element.textContent = `${numberInfo.prefix}${finalNumber}${numberInfo.suffix}`;
    element.setAttribute("data-counter-animated", "true");
  };

  let mutationTimeout: number | null = null;

  const init = (): void => {
    initCounterAnimations();

    const mutationObserver = new MutationObserver((mutations) => {
      if (mutationTimeout) {
        clearTimeout(mutationTimeout);
      }

      mutationTimeout = window.setTimeout(() => {
        let hasNewElements = false;

        for (let i = 0; i < mutations.length && !hasNewElements; i++) {
          const mutation = mutations[i];
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            for (let j = 0; j < mutation.addedNodes.length; j++) {
              const node = mutation.addedNodes[j];
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (
                  element.classList?.contains("animated-counter") &&
                  !element.hasAttribute("data-counter-animated")
                ) {
                  hasNewElements = true;
                  break;
                }
                if (element.querySelector?.(".animated-counter:not([data-counter-animated])")) {
                  hasNewElements = true;
                  break;
                }
              }
            }
          }
        }

        if (hasNewElements) {
          if ("requestIdleCallback" in window) {
            requestIdleCallback(() => initCounterAnimations());
          } else {
            initCounterAnimations();
          }
        }

        mutationTimeout = null;
      }, 150);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false,
      attributes: false,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(init);
    } else {
      init();
    }
  }

  window.addEventListener("beforeunload", () => {
    activeAnimations.forEach((animationId, element) => {
      cancelAnimationFrame(animationId);
    });
    activeAnimations.clear();

    if (mutationTimeout) {
      clearTimeout(mutationTimeout);
    }
  });

  (window as any).kotlinskidevAnimateCounter = animateCounter;
  (window as any).kotlinskidevInitCounters = initCounterAnimations;
})();
