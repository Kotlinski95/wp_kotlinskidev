type ChangeListener = () => void;

function mockMatchMedia(initial: boolean): { setMatches: (value: boolean) => void } {
  let matches = initial;
  const listeners = new Set<ChangeListener>();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: () => ({
      get matches() {
        return matches;
      },
      addEventListener: (_type: string, listener: ChangeListener) => listeners.add(listener),
      removeEventListener: (_type: string, listener: ChangeListener) => listeners.delete(listener),
    }),
  });
  return {
    setMatches: (value: boolean) => {
      matches = value;
      listeners.forEach((listener) => listener());
    },
  };
}

describe("app-shell", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    document.body.className = "kt-app-shell";
    document.body.innerHTML = '<div class="wp-site-blocks"></div>';
  });

  it("re-applies the last scroll position and dispatches the change event on breakpoint crossing", () => {
    const media = mockMatchMedia(true);
    const container = document.querySelector<HTMLElement>(".wp-site-blocks") as HTMLElement;
    container.scrollTo = jest.fn() as unknown as typeof container.scrollTo;
    window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;
    const changed = jest.fn();
    window.addEventListener("kt:scroll-container-change", changed);

    require("./app-shell");

    container.scrollTop = 420;
    container.dispatchEvent(new Event("scroll"));
    media.setMatches(false);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 420, behavior: "instant" });
    expect(changed).toHaveBeenCalledTimes(1);
    window.removeEventListener("kt:scroll-container-change", changed);
  });
});
