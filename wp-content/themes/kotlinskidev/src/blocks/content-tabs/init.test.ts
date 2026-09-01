function buildFixture(orientation: "horizontal" | "vertical", count = 3): void {
  document.body.textContent = "";

  const root = document.createElement("div");
  root.className = "kt-content-tabs";

  const nav = document.createElement("div");
  nav.className = "kt-content-tabs__nav";
  nav.setAttribute("aria-orientation", orientation);

  const panelsWrapper = document.createElement("div");
  panelsWrapper.className = "kt-content-tabs__panels";

  for (let i = 0; i < count; i++) {
    const trigger = document.createElement("button");
    trigger.className = "kt-content-tabs__nav-trigger";
    trigger.id = `tab-${i}`;
    trigger.setAttribute("aria-controls", `panel-${i}`);
    trigger.setAttribute("aria-selected", i === 0 ? "true" : "false");
    trigger.setAttribute("tabindex", i === 0 ? "0" : "-1");
    trigger.textContent = `Tab ${i}`;
    nav.appendChild(trigger);

    const panel = document.createElement("div");
    panel.className = "kt-content-tabs__panel";
    panel.id = `panel-${i}`;
    if (i !== 0) {
      panel.setAttribute("hidden", "");
    }
    panelsWrapper.appendChild(panel);
  }

  root.appendChild(nav);
  root.appendChild(panelsWrapper);
  document.body.appendChild(root);
}

function getTrigger(index: number): HTMLElement {
  return document.getElementById(`tab-${index}`) as HTMLElement;
}

function getPanel(index: number): HTMLElement {
  return document.getElementById(`panel-${index}`) as HTMLElement;
}

function mockRaf(): void {
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
}

describe("content-tabs init.ts", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("does nothing when no .kt-content-tabs instance is present", () => {
    document.body.innerHTML = "";

    expect(() => require("./init")).not.toThrow();
  });

  it("does nothing when trigger and panel counts mismatch", () => {
    document.body.innerHTML = `
      <div class="kt-content-tabs">
        <div class="kt-content-tabs__nav" aria-orientation="horizontal">
          <button class="kt-content-tabs__nav-trigger" id="tab-0"></button>
          <button class="kt-content-tabs__nav-trigger" id="tab-1"></button>
        </div>
        <div class="kt-content-tabs__panels">
          <div class="kt-content-tabs__panel" id="panel-0"></div>
        </div>
      </div>
    `;

    expect(() => require("./init")).not.toThrow();
    expect(getTrigger(0).getAttribute("aria-selected")).toBeNull();
  });

  it("switches active trigger/panel on click", () => {
    buildFixture("horizontal");
    require("./init");

    getTrigger(1).dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(getTrigger(0).getAttribute("aria-selected")).toBe("false");
    expect(getTrigger(0).getAttribute("tabindex")).toBe("-1");
    expect(getTrigger(1).getAttribute("aria-selected")).toBe("true");
    expect(getTrigger(1).getAttribute("tabindex")).toBe("0");
    expect(getPanel(0).hasAttribute("hidden")).toBe(true);
    expect(getPanel(1).hasAttribute("hidden")).toBe(false);
  });

  it("moves to the next tab with ArrowRight when horizontal", () => {
    buildFixture("horizontal");
    require("./init");
    jest.spyOn(getTrigger(1), "focus");

    getTrigger(0).dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
    );

    expect(getTrigger(1).getAttribute("aria-selected")).toBe("true");
    expect(getTrigger(1).focus).toHaveBeenCalled();
  });

  it("wraps to the first tab with ArrowRight from the last tab", () => {
    buildFixture("horizontal");
    require("./init");

    getTrigger(2).dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
    );

    expect(getTrigger(0).getAttribute("aria-selected")).toBe("true");
  });

  it("moves to the previous tab with ArrowLeft, wrapping to the last", () => {
    buildFixture("horizontal");
    require("./init");

    getTrigger(0).dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
    );

    expect(getTrigger(2).getAttribute("aria-selected")).toBe("true");
  });

  it("uses ArrowDown/ArrowUp instead of ArrowRight/ArrowLeft when vertical", () => {
    buildFixture("vertical");
    require("./init");

    getTrigger(0).dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
    );
    expect(getTrigger(0).getAttribute("aria-selected")).toBe("true");

    getTrigger(0).dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true })
    );
    expect(getTrigger(1).getAttribute("aria-selected")).toBe("true");
  });

  it("jumps to the first/last tab with Home/End", () => {
    buildFixture("horizontal");
    require("./init");

    getTrigger(0).dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true })
    );
    expect(getTrigger(2).getAttribute("aria-selected")).toBe("true");

    getTrigger(2).dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true })
    );
    expect(getTrigger(0).getAttribute("aria-selected")).toBe("true");
  });

  it("ignores unrelated keys", () => {
    buildFixture("horizontal");
    require("./init");

    getTrigger(0).dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true })
    );

    expect(getTrigger(0).getAttribute("aria-selected")).toBe("true");
    expect(getTrigger(1).getAttribute("aria-selected")).toBe("false");
  });

  it("wires up multiple content-tabs instances independently", () => {
    document.body.innerHTML = `
      <div class="kt-content-tabs" id="first">
        <div class="kt-content-tabs__nav" aria-orientation="horizontal">
          <button class="kt-content-tabs__nav-trigger" id="a-tab-0" aria-selected="true"></button>
          <button class="kt-content-tabs__nav-trigger" id="a-tab-1" aria-selected="false"></button>
        </div>
        <div class="kt-content-tabs__panels">
          <div class="kt-content-tabs__panel" id="a-panel-0"></div>
          <div class="kt-content-tabs__panel" id="a-panel-1" hidden></div>
        </div>
      </div>
      <div class="kt-content-tabs" id="second">
        <div class="kt-content-tabs__nav" aria-orientation="horizontal">
          <button class="kt-content-tabs__nav-trigger" id="b-tab-0" aria-selected="true"></button>
          <button class="kt-content-tabs__nav-trigger" id="b-tab-1" aria-selected="false"></button>
        </div>
        <div class="kt-content-tabs__panels">
          <div class="kt-content-tabs__panel" id="b-panel-0"></div>
          <div class="kt-content-tabs__panel" id="b-panel-1" hidden></div>
        </div>
      </div>
    `;
    require("./init");

    document.getElementById("b-tab-1")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(document.getElementById("a-tab-0")?.getAttribute("aria-selected")).toBe("true");
    expect(document.getElementById("b-tab-1")?.getAttribute("aria-selected")).toBe("true");
  });

  it("crossfades panels via transitionend when the fade transition class is present", () => {
    buildFixture("horizontal");
    document.querySelector(".kt-content-tabs")?.classList.add("kt-content-tabs--transition-fade");
    require("./init");

    getTrigger(1).dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(getPanel(0).hasAttribute("hidden")).toBe(false);
    expect(getPanel(0).classList.contains("kt-content-tabs__panel--fade-out")).toBe(true);
    expect(getPanel(1).hasAttribute("hidden")).toBe(true);

    getPanel(0).dispatchEvent(new Event("transitionend"));

    expect(getPanel(0).hasAttribute("hidden")).toBe(true);
    expect(getPanel(0).classList.contains("kt-content-tabs__panel--fade-out")).toBe(false);
    expect(getPanel(1).hasAttribute("hidden")).toBe(false);
  });

  it("reveals cards inside the newly active panel when the card-animation class is present", () => {
    mockRaf();
    buildFixture("horizontal");
    document
      .querySelector(".kt-content-tabs")
      ?.classList.add("kt-content-tabs--card-animation-fade-up");
    const card = document.createElement("div");
    card.className = "kt-project-card";
    getPanel(1).appendChild(card);
    require("./init");

    getTrigger(1).dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(card.classList.contains("fade-up-on-scroll")).toBe(true);
    expect(card.classList.contains("visible")).toBe(true);
  });
});
