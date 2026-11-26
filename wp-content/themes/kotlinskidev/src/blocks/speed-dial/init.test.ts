import { setBody } from "./dom-fixture";
import { initSpeedDial } from "./init";

const markup = (
  withA11y: boolean,
  items = '<li class="kt-speed-dial__item"><a href="#a">A</a></li>'
) => `
  ${withA11y ? '<div id="ka11y-root"></div>' : ""}
  <div data-kt-speed-dial hidden>
    <button class="kt-speed-dial__toggle" aria-expanded="false"></button>
    <ul class="kt-speed-dial__list" hidden>
      ${items}
      <li class="kt-speed-dial__item" data-kt-speed-dial-requires-a11y><button data-kt-speed-dial-a11y="open">Access</button></li>
    </ul>
  </div>`;

describe("speed dial init", () => {
  let teardown: () => void = () => undefined;

  afterEach(() => {
    teardown();
    setBody("");
  });

  it("removes a11y items without #ka11y-root and shows the root", () => {
    setBody(markup(false));
    teardown = initSpeedDial();
    const root = document.querySelector("[data-kt-speed-dial]") as HTMLElement;
    expect(root.hidden).toBe(false);
    expect(root.querySelector("[data-kt-speed-dial-requires-a11y]")).toBeNull();
  });

  it("keeps a11y items when the plugin host exists", () => {
    setBody(markup(true));
    teardown = initSpeedDial();
    expect(document.querySelector("[data-kt-speed-dial-requires-a11y]")).not.toBeNull();
  });

  it("keeps the root hidden when no items remain", () => {
    setBody(markup(false, ""));
    teardown = initSpeedDial();
    expect((document.querySelector("[data-kt-speed-dial]") as HTMLElement).hidden).toBe(true);
  });

  it("does nothing without a root", () => {
    setBody("");
    expect(() => {
      teardown = initSpeedDial();
    }).not.toThrow();
  });

  it("mounts only the first dial", () => {
    setBody(markup(true) + markup(true));
    teardown = initSpeedDial();
    const roots = document.querySelectorAll<HTMLElement>("[data-kt-speed-dial]");
    expect(roots[0].hidden).toBe(false);
    expect(roots[1].hidden).toBe(true);
  });
});
