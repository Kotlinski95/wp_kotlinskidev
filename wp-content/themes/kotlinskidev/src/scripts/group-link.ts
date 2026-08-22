(function () {
  const groups = document.querySelectorAll<HTMLElement>(".kt-group-link");

  if (!groups.length) {
    return;
  }

  const INTERACTIVE_SELECTOR =
    'a, button, input, textarea, select, [contenteditable="true"], [role="button"]';

  const closestInteractive = (target: EventTarget | null): Element | null => {
    if (!(target instanceof Element)) {
      return null;
    }
    return target.closest(INTERACTIVE_SELECTOR);
  };

  groups.forEach((group) => {
    const isRealLink = group.tagName === "A" && group.hasAttribute("href");

    if (isRealLink) {
      group.addEventListener("click", (event) => {
        const interactive = closestInteractive(event.target);
        if (interactive && interactive !== group) {
          event.preventDefault();
        }
      });
      return;
    }

    const url = group.dataset.ktGroupLinkUrl;
    if (!url) {
      return;
    }

    const navigate = () => {
      if (group.dataset.ktGroupLinkTarget === "_blank") {
        window.open(url, "_blank", "noopener");
      } else {
        window.location.href = url;
      }
    };

    group.addEventListener("click", (event) => {
      if (closestInteractive(event.target)) {
        return;
      }
      navigate();
    });

    group.addEventListener("keydown", (event) => {
      if (event.target !== group) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigate();
      }
    });
  });
})();
