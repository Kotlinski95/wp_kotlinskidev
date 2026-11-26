import { activeElement, setBody } from "./dom-fixture";
import { createController, type SpeedDialController } from "./controller";
import { attachKeyboard } from "./keyboard";

const build = (direction: string, extraItem = "") => {
  setBody(`
    <div class="kt-speed-dial" data-kt-speed-dial style="--kt-speed-dial-direction:${direction}">
      <button class="kt-speed-dial__toggle" aria-expanded="false"></button>
      <ul class="kt-speed-dial__list" hidden>
        <li class="kt-speed-dial__item"><a id="a" href="#a">A</a></li>
        <li class="kt-speed-dial__item"><span>no focusable</span></li>
        <li class="kt-speed-dial__item"><a id="b" href="#b">B</a></li>
        <li class="kt-speed-dial__item"><a id="c" href="#c">C</a></li>
        ${extraItem}
      </ul>
    </div>`);
  const root = document.querySelector<HTMLElement>("[data-kt-speed-dial]") as HTMLElement;
  const toggle = root.querySelector<HTMLButtonElement>(
    ".kt-speed-dial__toggle"
  ) as HTMLButtonElement;
  const list = root.querySelector<HTMLElement>("ul") as HTMLElement;
  const controller = createController(root, toggle, list);
  const detach = attachKeyboard(controller);
  return {
    root,
    toggle,
    controller,
    teardown: () => {
      detach();
      controller.destroy();
    },
  };
};

const press = (target: Element, key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};

const focused = () => activeElement()?.id;

describe("speed dial keyboard", () => {
  let current: { teardown: () => void; controller: SpeedDialController } | null = null;
  const mount = (direction: string, extra = "") => {
    current = build(direction, extra);
    return current as ReturnType<typeof build>;
  };

  beforeEach(() => {
    window.matchMedia = jest
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    current?.teardown();
    current = null;
    setBody("");
  });

  it.each([
    ["up", "ArrowUp", "ArrowDown"],
    ["down", "ArrowDown", "ArrowUp"],
    ["left", "ArrowLeft", "ArrowRight"],
    ["right", "ArrowRight", "ArrowLeft"],
  ])(
    "direction %s: toward key opens and focuses first, then walks, away goes back",
    (direction, toward, away) => {
      const { toggle, controller } = mount(direction);
      toggle.focus();
      press(toggle, toward);
      expect(controller.isOpen()).toBe(true);
      expect(focused()).toBe("a");
      press(document.getElementById("a") as Element, toward);
      expect(focused()).toBe("b");
      press(document.getElementById("b") as Element, away);
      expect(focused()).toBe("a");
      press(document.getElementById("a") as Element, away);
      expect(activeElement()).toBe(toggle);
    }
  );

  it("ignores the away key on the toggle", () => {
    const { toggle, controller } = mount("up");
    const event = press(toggle, "ArrowDown");
    expect(controller.isOpen()).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it("wraps from last to first", () => {
    const { toggle } = mount("up");
    press(toggle, "ArrowUp");
    press(document.getElementById("c") as Element, "ArrowUp");
    expect(focused()).toBe("a");
  });

  it("supports Home and End", () => {
    const { toggle } = mount("up");
    press(toggle, "ArrowUp");
    press(document.getElementById("a") as Element, "End");
    expect(focused()).toBe("c");
    press(document.getElementById("c") as Element, "Home");
    expect(focused()).toBe("a");
  });

  it("Escape on an item closes and focuses the toggle", () => {
    const { toggle, controller } = mount("up");
    press(toggle, "ArrowUp");
    press(document.getElementById("b") as Element, "Escape");
    expect(controller.isOpen()).toBe(false);
    expect(activeElement()).toBe(toggle);
  });

  it("Escape on the toggle closes", () => {
    const { toggle, controller } = mount("up");
    controller.open();
    press(toggle, "Escape");
    expect(controller.isOpen()).toBe(false);
  });

  it("ignores modifier keys", () => {
    const { toggle, controller } = mount("up");
    press(toggle, "ArrowUp", { ctrlKey: true });
    expect(controller.isOpen()).toBe(false);
  });

  it("ignores already prevented events", () => {
    const { toggle, controller } = mount("up");
    toggle.addEventListener("keydown", (e) => e.preventDefault());
    press(toggle, "ArrowUp");
    expect(controller.isOpen()).toBe(false);
  });

  it("leaves fields inside custom items alone", () => {
    const { toggle } = mount("up", '<li class="kt-speed-dial__item"><input id="field" /></li>');
    press(toggle, "ArrowUp");
    const event = press(document.getElementById("field") as Element, "ArrowUp");
    expect(event.defaultPrevented).toBe(false);
  });

  it("falls back to up without a direction property", () => {
    const { toggle, controller } = mount("");
    press(toggle, "ArrowUp");
    expect(controller.isOpen()).toBe(true);
  });

  it("removes its listener on teardown", () => {
    const { toggle, controller, teardown } = mount("up");
    teardown();
    press(toggle, "ArrowUp");
    expect(controller.isOpen()).toBe(false);
  });
});
