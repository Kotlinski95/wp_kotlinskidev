import { initNavSolidTransition } from "./nav-solid-transition";

const dispatchReveal = (viewTransition: unknown): void => {
  const event = new Event("pagereveal");
  Object.defineProperty(event, "viewTransition", { value: viewTransition });
  window.dispatchEvent(event);
};

describe("initNavSolidTransition", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.documentElement.className = "";
  });

  afterEach(() => jest.useRealTimers());

  it("marks html solid at start and releases after the page loads", () => {
    initNavSolidTransition();
    expect(document.documentElement.classList.contains("kt-nav-solid")).toBe(true);

    window.dispatchEvent(new Event("load"));
    jest.advanceTimersByTime(150);

    expect(document.documentElement.classList.contains("kt-nav-solid")).toBe(false);
  });

  it("releases by itself after the maximum solid time", () => {
    initNavSolidTransition();
    jest.advanceTimersByTime(2000 + 150);
    expect(document.documentElement.classList.contains("kt-nav-solid")).toBe(false);
  });

  it("turns solid again on pageswap so the outgoing snapshot is not see-through", () => {
    initNavSolidTransition();
    window.dispatchEvent(new Event("load"));
    jest.advanceTimersByTime(150);
    expect(document.documentElement.classList.contains("kt-nav-solid")).toBe(false);

    window.dispatchEvent(new Event("pageswap"));
    expect(document.documentElement.classList.contains("kt-nav-solid")).toBe(true);
  });

  it("releases when the view transition finishes", async () => {
    initNavSolidTransition();
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    dispatchReveal({ finished });

    finish();
    await finished;
    jest.advanceTimersByTime(150);

    expect(document.documentElement.classList.contains("kt-nav-solid")).toBe(false);
  });
});
