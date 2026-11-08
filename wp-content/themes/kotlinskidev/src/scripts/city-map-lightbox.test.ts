function buildExpandButton() {
  document.body.innerHTML = `
    <div class="kt-city-map">
      <button
        type="button"
        class="kt-city-map__expand"
        data-city-map-expand
        data-city-map-src="https://www.google.com/maps?q=Katowice&output=embed"
        data-city-map-title="Map of Katowice"
      ></button>
    </div>
  `;
}

function loadModule() {
  jest.resetModules();
  require("./city-map-lightbox");
}

describe("city-map-lightbox.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.classList.remove("has-modal-open");
  });

  it("does nothing when there is no expand button", () => {
    document.body.innerHTML = "";
    loadModule();

    expect(document.querySelector(".kt-city-map-lightbox")).toBeNull();
  });

  it("opens the lightbox with the button's src and title on click", () => {
    buildExpandButton();
    loadModule();

    document.querySelector<HTMLButtonElement>("[data-city-map-expand]")?.click();

    const overlay = document.querySelector(".kt-city-map-lightbox");
    const frame = document.querySelector<HTMLIFrameElement>(".kt-city-map-lightbox__frame");

    expect(overlay).not.toBeNull();
    expect(overlay?.classList.contains("is-open")).toBe(true);
    expect(frame?.src).toBe("https://www.google.com/maps?q=Katowice&output=embed");
    expect(frame?.title).toBe("Map of Katowice");
    expect(document.documentElement.classList.contains("has-modal-open")).toBe(true);
  });

  it("closes the lightbox and clears the iframe src on close-button click", () => {
    buildExpandButton();
    loadModule();
    document.querySelector<HTMLButtonElement>("[data-city-map-expand]")?.click();

    document.querySelector<HTMLButtonElement>("[data-city-map-close]")?.click();

    const overlay = document.querySelector(".kt-city-map-lightbox");
    const frame = document.querySelector<HTMLIFrameElement>(".kt-city-map-lightbox__frame");

    expect(overlay?.classList.contains("is-open")).toBe(false);
    expect(frame?.getAttribute("src")).toBe("");
    expect(document.documentElement.classList.contains("has-modal-open")).toBe(false);
  });

  it("closes the lightbox on backdrop click, but not on dialog click", () => {
    buildExpandButton();
    loadModule();
    document.querySelector<HTMLButtonElement>("[data-city-map-expand]")?.click();

    document
      .querySelector<HTMLElement>(".kt-city-map-lightbox__dialog")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(document.querySelector(".kt-city-map-lightbox")?.classList.contains("is-open")).toBe(
      true
    );

    document.querySelector<HTMLElement>(".kt-city-map-lightbox")?.click();
    expect(document.querySelector(".kt-city-map-lightbox")?.classList.contains("is-open")).toBe(
      false
    );
  });

  it("closes the lightbox on Escape", () => {
    buildExpandButton();
    loadModule();
    document.querySelector<HTMLButtonElement>("[data-city-map-expand]")?.click();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(document.querySelector(".kt-city-map-lightbox")?.classList.contains("is-open")).toBe(
      false
    );
  });
});
