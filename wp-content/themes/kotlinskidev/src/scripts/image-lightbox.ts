(() => {
  function createLightbox(
    src: string,
    alt: string,
    width: number,
    height: number
  ) {
    const modal = document.createElement("div");
    modal.className = "image-lightbox-modal";
    modal.innerHTML = `
      <div class="image-lightbox-backdrop"></div>
      <div class="image-lightbox-content">
        <img src="${src}" alt="${
          alt || ""
        }" class="no-lightbox image-lightbox-img image-lightbox-zoomable" width="${width}" height="${height}" />
        <button class="image-lightbox-close" aria-label="Close">&times;</button>
      </div>
    `;
    document.body.appendChild(modal);

    const img = modal.querySelector(".image-lightbox-img") as HTMLImageElement;
    let isZoomed = false;

    img.style.transition = "transform 0.25s cubic-bezier(.4,2,.6,1)";
    img.style.cursor = "zoom-in";
    img.style.transformOrigin = "center center";

    function setTransformOriginFromMouse(e: MouseEvent) {
      const rect = img.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
    }

    function handleMouseMove(e: MouseEvent) {
      if (isZoomed) {
        setTransformOriginFromMouse(e);
      }
    }

    img.addEventListener("mouseenter", (e) => {
      isZoomed = true;
      img.style.transform = "scale(1.5)";
      img.style.zIndex = "2";
      img.style.cursor = "zoom-out";
      setTransformOriginFromMouse(e as MouseEvent);
    });
    img.addEventListener("mousemove", handleMouseMove);
    img.addEventListener("mouseleave", () => {
      isZoomed = false;
      img.style.transform = "scale(1)";
      img.style.cursor = "zoom-in";
      img.style.transformOrigin = "center center";
    });

    function closeModal() {
      modal.remove();
      document.removeEventListener("keydown", escHandler);
      img.removeEventListener("mouseenter", () => {});
      img.removeEventListener("mousemove", handleMouseMove);
      img.removeEventListener("mouseleave", () => {});
    }
    function escHandler(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    (
      modal.querySelector(".image-lightbox-close") as HTMLButtonElement
    ).onclick = closeModal;
    (
      modal.querySelector(".image-lightbox-backdrop") as HTMLDivElement
    ).onclick = closeModal;
    document.addEventListener("keydown", escHandler);
  }

  document.addEventListener("click", function (e) {
    if ((window as any).kotlinskidevEnableLightbox !== false) {
      // Try to find an <img> element: if the target is a span or other sibling, check its siblings
      let img = (e.target as HTMLElement).closest("img");
      const parentElement = (e.target as HTMLElement).parentElement;
      if (!img && parentElement) {
        // Look for an img sibling if the target is not an img itself
        img =
          (Array.from(parentElement.children).find(
            (el) => el.tagName === "IMG"
          ) as HTMLImageElement | undefined) || null;
      }
      if (
        img &&
        !img.closest("a") &&
        !img.classList.contains("no-lightbox") &&
        !img.closest(".no-lightbox") &&
        img.naturalWidth > img.clientWidth // Only if image is scaled down
      ) {
        e.preventDefault();

        createLightbox(img.src, img.alt, img.naturalWidth, img.naturalHeight);
      }
    }
  });
})();
