import { revealAboveFoldForViewTransition } from "./view-transition-reveal";

const setRect = (el: Element, top: number, bottom: number): void => {
  el.getBoundingClientRect = () => ({ top, bottom }) as DOMRect;
};

describe("revealAboveFoldForViewTransition", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="above" class="fade-up-on-scroll"></div>
      <div id="below" class="fade-up-on-scroll"></div>
      <div data-kt-reveal-after-end><div id="deferred" class="fade-in-on-scroll"></div></div>
    `;
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 });
    setRect(document.getElementById("above")!, 100, 300);
    setRect(document.getElementById("below")!, 900, 1100);
    setRect(document.getElementById("deferred")!, 100, 300);
  });

  it("reveals only above-the-fold animated elements", () => {
    revealAboveFoldForViewTransition({ finished: Promise.resolve() });
    expect(document.getElementById("above")!.classList.contains("visible")).toBe(true);
    expect(document.getElementById("below")!.classList.contains("visible")).toBe(false);
    expect(document.getElementById("deferred")!.classList.contains("visible")).toBe(false);
  });

  it("reveals above-the-fold elements parsed after the reveal until the transition finishes", async () => {
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    revealAboveFoldForViewTransition({ finished });

    const late = document.createElement("div");
    late.className = "fade-in-on-scroll";
    setRect(late, 50, 200);
    document.body.appendChild(late);
    await Promise.resolve();
    expect(late.classList.contains("visible")).toBe(true);

    finish();
    await finished;
    await Promise.resolve();
    const afterStop = document.createElement("div");
    afterStop.className = "fade-in-on-scroll";
    setRect(afterStop, 50, 200);
    document.body.appendChild(afterStop);
    await Promise.resolve();
    expect(afterStop.classList.contains("visible")).toBe(false);
  });
});
