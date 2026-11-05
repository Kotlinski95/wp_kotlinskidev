import { attachImageZoom } from "./attachImageZoom";

interface TouchPoint {
  clientX: number;
  clientY: number;
}

function touchEvent(type: string, touches: TouchPoint[]): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", { value: touches, configurable: true });
  return event;
}

function mockMatchMedia(matchesTouch: boolean) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    matches: query.includes("pointer: coarse") ? matchesTouch : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

function buildContainer() {
  const container = document.createElement("div");
  const img = document.createElement("img");
  container.append(img);
  jest.spyOn(container, "getBoundingClientRect").mockReturnValue({
    width: 200,
    height: 100,
    top: 0,
    left: 0,
    right: 200,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  jest.spyOn(img, "getBoundingClientRect").mockReturnValue({
    width: 200,
    height: 100,
    top: 0,
    left: 0,
    right: 200,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  return { container, img };
}

describe("attachImageZoom — pointer (mouse) devices", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it("sets the zoom-in cursor on the image on attach", () => {
    const { img, container } = buildContainer();

    attachImageZoom(container);

    expect(img.style.cursor).toBe("zoom-in");
  });

  it("zooms in on click and applies a transform", () => {
    const { img, container } = buildContainer();
    attachImageZoom(container);

    img.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 50, clientY: 50 }));

    expect(img.style.transform).toContain("scale(1.75)");
    expect(container.style.overflow).toBe("visible");
  });

  it("zooms out on a second click", () => {
    const { img, container } = buildContainer();
    attachImageZoom(container);

    img.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 50, clientY: 50 }));
    img.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 50, clientY: 50 }));
    img.dispatchEvent(new Event("transitionend"));

    expect(container.style.overflow).toBe("");
    expect(img.style.transform).toBe("");
  });

  it("does nothing on mousedown while not zoomed in", () => {
    const { img, container } = buildContainer();
    attachImageZoom(container);

    container.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, clientX: 10, clientY: 10 })
    );

    expect(img.style.cursor).toBe("zoom-in");
  });

  it("pans the image while zoomed in and dragging", () => {
    const { img, container } = buildContainer();
    attachImageZoom(container);
    img.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 50, clientY: 50 }));

    container.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, clientX: 10, clientY: 10 })
    );
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 30, clientY: 30 }));

    expect(img.style.cursor).toBe("grabbing");

    document.dispatchEvent(new MouseEvent("mouseup"));
    expect(img.style.cursor).toBe("grab");
  });

  it("treats a drag beyond the click threshold as a pan, not a re-toggle click", () => {
    const { img, container } = buildContainer();
    attachImageZoom(container);
    img.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 50, clientY: 50 }));

    container.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, clientX: 10, clientY: 10 })
    );
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 40, clientY: 40 }));
    document.dispatchEvent(new MouseEvent("mouseup"));

    img.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 40, clientY: 40 }));

    expect(container.style.overflow).toBe("visible");
  });

  it("tears down mouse listeners and resets styles", () => {
    const { img, container } = buildContainer();
    const teardown = attachImageZoom(container);
    img.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 50, clientY: 50 }));

    teardown();

    expect(container.style.overflow).toBe("");
    expect(img.style.transform).toBe("");
  });
});

describe("attachImageZoom — touch devices", () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  it("does not attach mouse listeners on a touch device", () => {
    const { img, container } = buildContainer();

    attachImageZoom(container);
    img.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 50, clientY: 50 }));

    expect(container.style.overflow).toBe("");
  });

  it("pinch-zooms between two touch points", () => {
    const { img, container } = buildContainer();
    attachImageZoom(container);

    container.dispatchEvent(
      touchEvent("touchstart", [
        { clientX: 50, clientY: 50 },
        { clientX: 100, clientY: 50 },
      ])
    );
    container.dispatchEvent(
      touchEvent("touchmove", [
        { clientX: 30, clientY: 50 },
        { clientX: 120, clientY: 50 },
      ])
    );

    expect(img.style.transform).toMatch(/scale\(/);
  });

  it("clamps pinch scale to the configured maximum", () => {
    const { img, container } = buildContainer();
    attachImageZoom(container);

    container.dispatchEvent(
      touchEvent("touchstart", [
        { clientX: 50, clientY: 50 },
        { clientX: 60, clientY: 50 },
      ])
    );
    container.dispatchEvent(
      touchEvent("touchmove", [
        { clientX: 0, clientY: 50 },
        { clientX: 1000, clientY: 50 },
      ])
    );

    expect(img.style.transform).toContain("scale(4)");
  });

  it("single-finger pans once zoomed in beyond the minimum scale", () => {
    const { img, container } = buildContainer();
    attachImageZoom(container);
    container.dispatchEvent(
      touchEvent("touchstart", [
        { clientX: 50, clientY: 50 },
        { clientX: 100, clientY: 50 },
      ])
    );
    container.dispatchEvent(
      touchEvent("touchmove", [
        { clientX: 30, clientY: 50 },
        { clientX: 130, clientY: 50 },
      ])
    );
    container.dispatchEvent(touchEvent("touchend", [{ clientX: 30, clientY: 50 }]));

    container.dispatchEvent(touchEvent("touchstart", [{ clientX: 30, clientY: 50 }]));
    container.dispatchEvent(touchEvent("touchmove", [{ clientX: 60, clientY: 50 }]));

    expect(img.style.transform).toMatch(/translate\(/);
  });

  it("resets once the last finger lifts near the minimum scale", () => {
    const { container } = buildContainer();
    attachImageZoom(container);

    container.dispatchEvent(touchEvent("touchend", []));

    expect(container.style.overflow).toBe("");
  });

  it("removes touch listeners on teardown", () => {
    const { container } = buildContainer();
    const teardown = attachImageZoom(container);

    teardown();
    container.dispatchEvent(
      touchEvent("touchstart", [
        { clientX: 50, clientY: 50 },
        { clientX: 100, clientY: 50 },
      ])
    );

    expect(container.style.overflow).toBe("");
  });
});
