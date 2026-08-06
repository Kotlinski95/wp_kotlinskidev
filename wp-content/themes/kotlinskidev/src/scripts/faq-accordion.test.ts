function mockMatchMedia(reducedMotion: boolean) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    matches: query.includes("reduced-motion") ? reducedMotion : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

interface MockAnimation {
  onfinish: (() => void) | null;
}

function mockAnimate(): jest.Mock {
  const animateSpy = jest.fn().mockImplementation(() => {
    const animation: MockAnimation = { onfinish: null };
    return animation;
  });
  Element.prototype.animate = animateSpy as unknown as typeof Element.prototype.animate;
  return animateSpy;
}

function buildFaqItem() {
  document.body.innerHTML = `
    <details class="wp-block-details">
      <summary>Question</summary>
      <p>Answer</p>
    </details>
  `;
  const details = document.querySelector("details") as HTMLDetailsElement;
  const summary = document.querySelector("summary") as HTMLElement;
  let rectHeight = 0;
  jest.spyOn(details, "getBoundingClientRect").mockImplementation(
    () =>
      ({
        height: rectHeight,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect
  );
  return { details, summary, setRectHeight: (h: number) => (rectHeight = h) };
}

function loadModule() {
  jest.resetModules();
  require("./faq-accordion");
}

describe("faq-accordion.ts — animation", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    mockAnimate();
  });

  it("attaches a click handler that prevents default and animates", () => {
    const { details, summary } = buildFaqItem();
    loadModule();
    const animateSpy = Element.prototype.animate as jest.Mock;

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    summary.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(details.classList.contains("kt-details-animating")).toBe(true);
    expect(animateSpy).toHaveBeenCalledTimes(2);
  });

  it("opens a closed details element once the animation finishes", () => {
    const { details, summary } = buildFaqItem();
    loadModule();
    const animateSpy = Element.prototype.animate as jest.Mock;

    summary.click();
    const detailsAnimation = animateSpy.mock.results[0].value as MockAnimation;
    detailsAnimation.onfinish?.();

    expect(details.open).toBe(true);
    expect(details.classList.contains("kt-details-animating")).toBe(false);
    expect(details.style.height).toBe("");
  });

  it("closes an open details element once the animation finishes", () => {
    const { details, summary } = buildFaqItem();
    details.open = true;
    loadModule();
    const animateSpy = Element.prototype.animate as jest.Mock;

    summary.click();
    const detailsAnimation = animateSpy.mock.results[0].value as MockAnimation;
    detailsAnimation.onfinish?.();

    expect(details.open).toBe(false);
  });

  it("ignores a second click while an animation is already in progress", () => {
    const { details, summary } = buildFaqItem();
    loadModule();
    const animateSpy = Element.prototype.animate as jest.Mock;

    summary.click();
    summary.click();

    expect(animateSpy).toHaveBeenCalledTimes(2);
    expect(details.classList.contains("kt-details-animating")).toBe(true);
  });

  it("toggles instantly without animating when reduced motion is preferred", () => {
    mockMatchMedia(true);
    const { details, summary } = buildFaqItem();
    loadModule();
    const animateSpy = Element.prototype.animate as jest.Mock;

    summary.click();

    expect(details.open).toBe(true);
    expect(animateSpy).not.toHaveBeenCalled();
  });

  it("does not attach a handler when the summary's parent is not a real details element", () => {
    document.body.innerHTML = `
      <div class="wp-block-details">
        <summary>Question</summary>
      </div>
    `;
    loadModule();
    const animateSpy = Element.prototype.animate as jest.Mock;
    const summary = document.querySelector("summary") as HTMLElement;

    summary.click();

    expect(animateSpy).not.toHaveBeenCalled();
  });
});

describe("faq-accordion.ts — independent columns", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    mockAnimate();
  });

  function buildGroup(className: string, itemCount: number) {
    document.body.innerHTML = "";
    const group = document.createElement("div");
    group.className = className;
    for (let i = 0; i < itemCount; i += 1) {
      const details = document.createElement("details");
      details.className = "wp-block-details";
      const summary = document.createElement("summary");
      details.append(summary);
      group.append(details);
    }
    document.body.append(group);
    return group;
  }

  it("splits items into 2 columns for the base independent-columns class", () => {
    const group = buildGroup("kt-faq-independent-columns", 4);

    loadModule();

    const columns = group.querySelectorAll(".kt-faq-column");
    expect(columns).toHaveLength(2);
    expect(columns[0].children).toHaveLength(2);
    expect(columns[1].children).toHaveLength(2);
  });

  it("splits items into the count given by a kt-faq-independent-columns-N class", () => {
    const group = buildGroup("kt-faq-independent-columns-3", 9);

    loadModule();

    expect(group.querySelectorAll(".kt-faq-column")).toHaveLength(3);
  });

  it("does not split groups without an independent-columns class", () => {
    const group = buildGroup("wp-block-group", 4);

    loadModule();

    expect(group.querySelectorAll(".kt-faq-column")).toHaveLength(0);
  });

  it("does nothing for an independent-columns group with no detail items", () => {
    document.body.innerHTML = '<div class="kt-faq-independent-columns"></div>';
    const group = document.querySelector(".kt-faq-independent-columns") as HTMLElement;

    loadModule();

    expect(group.querySelectorAll(".kt-faq-column")).toHaveLength(0);
  });

  it("still attaches click handlers to items after they are redistributed into columns", () => {
    buildGroup("kt-faq-independent-columns", 2);

    loadModule();
    const animateSpy = Element.prototype.animate as jest.Mock;
    const summary = document.querySelector("summary") as HTMLElement;
    jest
      .spyOn(summary.parentElement as HTMLDetailsElement, "getBoundingClientRect")
      .mockReturnValue({ height: 0 } as DOMRect);

    summary.click();

    expect(animateSpy).toHaveBeenCalled();
  });
});
