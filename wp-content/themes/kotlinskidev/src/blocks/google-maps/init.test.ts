function buildMarkup(): HTMLElement {
  const root = document.createElement("div");
  root.className = "kt-google-maps";
  root.setAttribute("data-kt-google-maps", "");
  const map = document.createElement("div");
  map.id = "google_maps_block_x";
  const placeholder = document.createElement("div");
  placeholder.className = "kt-google-maps__placeholder";
  placeholder.setAttribute("role", "status");
  placeholder.setAttribute("data-kt-google-maps-placeholder", "");
  const consent = document.createElement("button");
  consent.type = "button";
  consent.textContent = "Cookie settings";
  consent.setAttribute("data-kt-google-maps-consent", "");
  placeholder.append(consent);
  const reset = document.createElement("button");
  reset.type = "button";
  reset.hidden = true;
  reset.id = "reset-view-btn-google_maps_block_x";
  reset.textContent = "Reset View";
  root.append(map, placeholder, reset);
  return root;
}

function loadModule(): void {
  jest.resetModules();
  require("./init");
}

describe("google-maps init.ts", () => {
  const registered: [string, EventListener][] = [];
  const originalAdd = document.addEventListener.bind(document);

  beforeEach(() => {
    jest.spyOn(document, "addEventListener").mockImplementation((type, listener, options) => {
      registered.push([type, listener as EventListener]);
      originalAdd(type, listener, options);
    });
    document.body.replaceChildren(buildMarkup());
    loadModule();
  });

  afterEach(() => {
    registered.splice(0).forEach(([type, listener]) => {
      document.removeEventListener(type, listener);
    });
    jest.restoreAllMocks();
  });

  it("removes the placeholder and reveals the reset button on marketing consent", () => {
    document.dispatchEvent(
      new CustomEvent("cmplz_fire_categories", { detail: { categories: ["marketing"] } })
    );
    expect(document.querySelector("[data-kt-google-maps-placeholder]")).toBeNull();
    expect(document.querySelector<HTMLButtonElement>("button[id^=reset-view-btn-]")?.hidden).toBe(
      false
    );
  });

  it("reacts to cmplz_enable_category for marketing", () => {
    document.dispatchEvent(
      new CustomEvent("cmplz_enable_category", { detail: { category: "marketing" } })
    );
    expect(document.querySelector("[data-kt-google-maps-placeholder]")).toBeNull();
  });

  it("keeps the placeholder when marketing is not granted", () => {
    document.dispatchEvent(
      new CustomEvent("cmplz_fire_categories", { detail: { categories: ["statistics"] } })
    );
    expect(document.querySelector("[data-kt-google-maps-placeholder]")).not.toBeNull();
    expect(document.querySelector<HTMLButtonElement>("button[id^=reset-view-btn-]")?.hidden).toBe(
      true
    );
  });

  it("clicks the Complianz manage-consent element from the cookie settings button", () => {
    const manage = document.createElement("button");
    manage.className = "cmplz-btn cmplz-manage-consent";
    const onClick = jest.fn();
    manage.addEventListener("click", onClick);
    document.body.append(manage);
    document.querySelector<HTMLButtonElement>("[data-kt-google-maps-consent]")?.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does nothing harmful when the manage-consent element is absent", () => {
    expect(() =>
      document.querySelector<HTMLButtonElement>("[data-kt-google-maps-consent]")?.click()
    ).not.toThrow();
    expect(document.querySelector("[data-kt-google-maps-placeholder]")).not.toBeNull();
  });
});
