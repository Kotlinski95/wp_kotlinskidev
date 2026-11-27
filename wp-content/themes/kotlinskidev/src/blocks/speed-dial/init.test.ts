import { setBody } from "./dom-fixture";
import { initSpeedDial } from "./init";

const markup = (
  items = '<li class="kt-speed-dial__item"><a href="#a">A</a></li>' +
    '<li class="kt-speed-dial__item" data-kt-speed-dial-requires-a11y><button data-kt-speed-dial-a11y="open">Access</button></li>'
) => `
  <div data-kt-speed-dial hidden>
    <button class="kt-speed-dial__toggle" aria-expanded="false"></button>
    <ul class="kt-speed-dial__list" hidden>
      ${items}
    </ul>
  </div>`;

describe("speed dial init", () => {
  let teardown: () => void = () => undefined;

  afterEach(() => {
    teardown();
    setBody("");
  });

  it("shows the root and keeps server-rendered a11y items without waiting for the plugin script", () => {
    setBody(markup());
    teardown = initSpeedDial();
    const root = document.querySelector("[data-kt-speed-dial]") as HTMLElement;
    expect(root.hidden).toBe(false);
    expect(root.querySelector("[data-kt-speed-dial-requires-a11y]")).not.toBeNull();
  });

  it("keeps the root hidden when no items remain", () => {
    setBody(markup(""));
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
    setBody(markup() + markup());
    teardown = initSpeedDial();
    const roots = document.querySelectorAll<HTMLElement>("[data-kt-speed-dial]");
    expect(roots[0].hidden).toBe(false);
    expect(roots[1].hidden).toBe(true);
  });
});
