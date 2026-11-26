import { activeElement, setBody } from "./dom-fixture";
import { attachA11yBridge } from "./a11y-bridge";

const build = () => {
  setBody(`
    <div data-kt-speed-dial>
      <button class="kt-speed-dial__toggle" id="toggle"></button>
      <ul class="kt-speed-dial__list">
        <li><button id="open" data-ka11y="open" data-kt-speed-dial-a11y="open"></button></li>
        <li><button id="profile" data-ka11y="profile:adhdFriendly" data-kt-speed-dial-a11y="profile:adhdFriendly"></button></li>
        <li><a id="plain" href="#p">x</a></li>
      </ul>
    </div>`);
};

describe("a11y bridge", () => {
  let detach: () => void;
  let documentSpy: jest.Mock;
  let onHandled: jest.Mock;

  beforeEach(() => {
    build();
    onHandled = jest.fn();
    documentSpy = jest.fn();
    document.addEventListener("click", documentSpy, true);
    detach = attachA11yBridge(onHandled);
  });

  afterEach(() => {
    detach();
    document.removeEventListener("click", documentSpy, true);
    delete window.kotlinskidevA11y;
    setBody("");
  });

  it("opens through the API with the toggle as opener and stops propagation", () => {
    const api = { api: 1, open: jest.fn(), toggle: jest.fn() };
    window.kotlinskidevA11y = api;
    (document.getElementById("open") as HTMLElement).click();
    expect(api.open).toHaveBeenCalledWith(document.getElementById("toggle"));
    expect(documentSpy).not.toHaveBeenCalled();
    expect(onHandled).toHaveBeenCalledTimes(1);
  });

  it("toggles other actions through the API", () => {
    const api = { api: 1, open: jest.fn(), toggle: jest.fn() };
    window.kotlinskidevA11y = api;
    (document.getElementById("profile") as HTMLElement).click();
    expect(api.toggle).toHaveBeenCalledWith(
      "profile:adhdFriendly",
      document.getElementById("toggle")
    );
  });

  it("ignores unrelated clicks", () => {
    const api = { api: 1, open: jest.fn(), toggle: jest.fn() };
    window.kotlinskidevA11y = api;
    (document.getElementById("plain") as HTMLElement).click();
    expect(api.open).not.toHaveBeenCalled();
    expect(documentSpy).toHaveBeenCalled();
  });

  it("lets the click through without the API and refocuses the toggle on ka11y:close", () => {
    (document.getElementById("open") as HTMLElement).click();
    expect(documentSpy).toHaveBeenCalled();
    expect(onHandled).not.toHaveBeenCalled();
    document.dispatchEvent(new CustomEvent("ka11y:close"));
    expect(activeElement()).toBe(document.getElementById("toggle"));
  });

  it("ignores a wrong api version", () => {
    const api = { api: 2, open: jest.fn(), toggle: jest.fn() };
    window.kotlinskidevA11y = api;
    (document.getElementById("open") as HTMLElement).click();
    expect(api.open).not.toHaveBeenCalled();
    expect(documentSpy).toHaveBeenCalled();
  });

  it("does not refocus on ka11y:close without a pending opener", () => {
    document.dispatchEvent(new CustomEvent("ka11y:close"));
    expect(activeElement()).toBe(document.body);
  });

  it("does not steal focus when it already sits in a visible element", () => {
    (document.getElementById("open") as HTMLElement).click();
    const other = document.getElementById("plain") as HTMLElement;
    other.focus();
    document.dispatchEvent(new CustomEvent("ka11y:close"));
    expect(activeElement()).toBe(other);
  });

  it("removes listeners on detach", () => {
    detach();
    const api = { api: 1, open: jest.fn(), toggle: jest.fn() };
    window.kotlinskidevA11y = api;
    (document.getElementById("open") as HTMLElement).click();
    expect(api.open).not.toHaveBeenCalled();
    detach = attachA11yBridge(onHandled);
  });
});
