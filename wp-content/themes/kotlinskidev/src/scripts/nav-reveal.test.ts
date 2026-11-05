import { dispatchNavPanelOpen, dispatchNavPanelClose } from "@utils/nav-reveal-events";
import "./nav-reveal";

function buildContainer() {
  document.body.innerHTML = `
    <div class="kt-mega-nav__panel">
      <a class="appear-on-reveal" href="#z">Zeroth</a>
      <a class="fade-up-on-reveal" href="#a">First</a>
      <a class="fade-left-on-reveal" href="#b">Second</a>
      <a href="#c">Plain</a>
    </div>
  `;
  return document.querySelector(".kt-mega-nav__panel") as HTMLElement;
}

describe("nav-reveal.ts", () => {
  beforeEach(() => {
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("adds .visible to reveal-class descendants when the panel opens", () => {
    const container = buildContainer();

    dispatchNavPanelOpen(container);

    expect(container.querySelector(".appear-on-reveal")?.classList.contains("visible")).toBe(true);
    expect(container.querySelector(".fade-up-on-reveal")?.classList.contains("visible")).toBe(true);
    expect(container.querySelector(".fade-left-on-reveal")?.classList.contains("visible")).toBe(
      true
    );
  });

  it("waits two animation frames before revealing, so a display:none ancestor still transitions", () => {
    jest.restoreAllMocks();
    const rafSpy = jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation(() => 1 as unknown as number);
    const container = buildContainer();

    dispatchNavPanelOpen(container);

    expect(container.querySelector(".appear-on-reveal")?.classList.contains("visible")).toBe(false);
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it("reveals the dispatched container itself when it (not a descendant) carries the reveal class", () => {
    document.body.innerHTML = `<div class="kt-search-panel__modal appear-on-reveal"><p>Hi</p></div>`;
    const modal = document.querySelector(".kt-search-panel__modal") as HTMLElement;

    dispatchNavPanelOpen(modal);

    expect(modal.classList.contains("visible")).toBe(true);
  });

  it("un-reveals the dispatched container itself on close", () => {
    document.body.innerHTML = `<div class="kt-search-panel__modal appear-on-reveal"><p>Hi</p></div>`;
    const modal = document.querySelector(".kt-search-panel__modal") as HTMLElement;
    dispatchNavPanelOpen(modal);

    dispatchNavPanelClose(modal);

    expect(modal.classList.contains("visible")).toBe(false);
  });

  it("does not touch elements without a reveal class", () => {
    const container = buildContainer();

    dispatchNavPanelOpen(container);

    const plain = container.querySelector("a:not([class])");
    expect(plain?.classList.contains("visible")).toBe(false);
  });

  it("removes .visible from reveal-class descendants when the panel closes", () => {
    const container = buildContainer();
    dispatchNavPanelOpen(container);

    dispatchNavPanelClose(container);

    expect(container.querySelector(".fade-up-on-reveal")?.classList.contains("visible")).toBe(
      false
    );
  });
});
