function flushMicrotasks() {
  return new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
}

function mockMatchMedia(isTouch: boolean) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    matches: query.includes("pointer: coarse") ? isTouch : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

function buildLightboxMarkup({ active = false }: { active?: boolean } = {}) {
  document.body.innerHTML = `
    <figure class="wp-block-image is-style-rounded" style="--kt-x: 1;">
      <img src="a.jpg" alt="A photo" style="object-position: 10% 20%;" />
      <button class="lightbox-trigger" aria-label=""></button>
    </figure>
    <div class="wp-lightbox-overlay">
      <div class="lightbox-image-container">
        <img src="a-thumb.jpg" />
      </div>
      <div class="lightbox-image-container">
        <img src="a-large.jpg" />
      </div>
      <figure></figure>
      <button class="wp-lightbox-close-button"></button>
    </div>
  `;
  if (active) {
    document.querySelector(".wp-lightbox-overlay")?.classList.add("active");
  }
}

function loadModule() {
  jest.resetModules();
  require("./image-lightbox");
}

describe("image-lightbox.ts", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when there is no lightbox overlay", () => {
    document.body.innerHTML = "";

    expect(() => loadModule()).not.toThrow();
  });

  it("sets up the lightbox immediately when the overlay starts active", () => {
    buildLightboxMarkup({ active: true });

    loadModule();

    const [thumb] = document.querySelectorAll(".lightbox-image-container");
    expect((thumb as HTMLElement).style.display).toBe("none");
  });

  it("applies touch-action none on a touch device", () => {
    mockMatchMedia(true);
    buildLightboxMarkup({ active: true });

    loadModule();

    const overlay = document.querySelector(".wp-lightbox-overlay") as HTMLElement;
    expect(overlay.style.touchAction).toBe("none");
  });

  it("applies the captured figure's inline styles and style classes to the enlarged view", async () => {
    buildLightboxMarkup();
    loadModule();
    const figure = document.querySelector(".wp-block-image") as HTMLElement;
    figure.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const overlay = document.querySelector(".wp-lightbox-overlay") as HTMLElement;
    overlay.classList.add("active");
    await flushMicrotasks();

    const enlargedImg = overlay
      .querySelectorAll(".lightbox-image-container")[1]
      .querySelector("img") as HTMLImageElement;
    const lightboxFigure = overlay.querySelector("figure") as HTMLElement;
    expect(enlargedImg.style.objectPosition).toBe("10% 20%");
    expect(lightboxFigure.classList.contains("is-style-rounded")).toBe(true);
  });

  it("clears the pending context on a pointerdown before the overlay activates", async () => {
    buildLightboxMarkup();
    loadModule();
    const figure = document.querySelector(".wp-block-image") as HTMLElement;
    figure.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    document.dispatchEvent(new Event("pointerdown", { bubbles: true }));

    const overlay = document.querySelector(".wp-lightbox-overlay") as HTMLElement;
    overlay.classList.add("active");
    await flushMicrotasks();

    const enlargedImg = overlay
      .querySelectorAll(".lightbox-image-container")[1]
      .querySelector("img") as HTMLImageElement;
    expect(enlargedImg.style.objectPosition).toBe("");
  });

  it("hides the thumbnail and shows it again when the overlay deactivates", async () => {
    buildLightboxMarkup({ active: true });
    loadModule();
    const overlay = document.querySelector(".wp-lightbox-overlay") as HTMLElement;
    const [thumb] = overlay.querySelectorAll(".lightbox-image-container");
    expect((thumb as HTMLElement).style.display).toBe("none");

    overlay.classList.remove("active");
    await flushMicrotasks();

    expect((thumb as HTMLElement).style.display).toBe("");
  });

  it("clears the applied context once the overlay's own close transition ends", async () => {
    buildLightboxMarkup();
    loadModule();
    const figure = document.querySelector(".wp-block-image") as HTMLElement;
    figure.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const overlay = document.querySelector(".wp-lightbox-overlay") as HTMLElement;
    overlay.classList.add("active");
    await flushMicrotasks();

    overlay.classList.remove("active");
    await flushMicrotasks();
    const event = new Event("transitionend", { bubbles: true });
    Object.defineProperty(event, "target", { value: overlay });
    overlay.dispatchEvent(event);

    const lightboxFigure = overlay.querySelector("figure") as HTMLElement;
    expect(lightboxFigure.classList.contains("is-style-rounded")).toBe(false);
  });

  it("falls back to clearing context via timeout if no transitionend ever fires", async () => {
    buildLightboxMarkup();
    loadModule();
    const figure = document.querySelector(".wp-block-image") as HTMLElement;
    figure.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const overlay = document.querySelector(".wp-lightbox-overlay") as HTMLElement;
    overlay.classList.add("active");
    await flushMicrotasks();

    overlay.classList.remove("active");
    await new Promise((resolve) => setTimeout(resolve, 520));

    const lightboxFigure = overlay.querySelector("figure") as HTMLElement;
    expect(lightboxFigure.classList.contains("is-style-rounded")).toBe(false);
  });

  it("sets an aria-label on lightbox trigger buttons from the figure's image alt text", () => {
    buildLightboxMarkup();

    loadModule();

    const button = document.querySelector(".lightbox-trigger") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("A photo");
  });

  it("re-applies the aria-label if it is externally removed", async () => {
    buildLightboxMarkup();
    loadModule();
    const button = document.querySelector(".lightbox-trigger") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBe("A photo");

    button.removeAttribute("aria-label");
    await flushMicrotasks();

    expect(button.getAttribute("aria-label")).toBe("A photo");
  });

  it("blocks clicks on the overlay backdrop from bubbling further", () => {
    buildLightboxMarkup({ active: true });
    loadModule();
    const overlay = document.querySelector(".wp-lightbox-overlay") as HTMLElement;
    const documentClickHandler = jest.fn();
    document.addEventListener("click", documentClickHandler);

    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(documentClickHandler).not.toHaveBeenCalled();
  });

  it("allows clicks inside the lightbox image container to propagate", () => {
    buildLightboxMarkup({ active: true });
    loadModule();
    const overlay = document.querySelector(".wp-lightbox-overlay") as HTMLElement;
    const container = overlay.querySelector(".lightbox-image-container") as HTMLElement;
    const documentClickHandler = jest.fn();
    document.addEventListener("click", documentClickHandler);

    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(documentClickHandler).toHaveBeenCalled();
  });

  it("allows clicks on the close button to propagate", () => {
    buildLightboxMarkup({ active: true });
    loadModule();
    const overlay = document.querySelector(".wp-lightbox-overlay") as HTMLElement;
    const closeButton = overlay.querySelector(".wp-lightbox-close-button") as HTMLElement;
    const documentClickHandler = jest.fn();
    document.addEventListener("click", documentClickHandler);

    closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(documentClickHandler).toHaveBeenCalled();
  });
});
