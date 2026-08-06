function buildDom() {
  document.body.innerHTML = "";
  const button = document.createElement("button");
  button.className = "language-selector-button";
  const modal = document.createElement("div");
  modal.className = "language-modal";
  document.body.append(button, modal);
  return { button, modal };
}

describe("language.ts", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("does not attach a click listener when the selector button is absent at load time", () => {
    document.body.innerHTML = "";

    expect(() => require("./language")).not.toThrow();
  });

  it("toggles the modal display from none to block on button click", () => {
    const { button, modal } = buildDom();
    require("./language");

    button.click();

    expect(modal.style.display).toBe("block");
  });

  it("toggles the modal display back to none on a second click", () => {
    const { button, modal } = buildDom();
    require("./language");

    button.click();
    button.click();

    expect(modal.style.display).toBe("none");
  });

  it("does nothing on click when the modal is missing", () => {
    document.body.innerHTML = "";
    const button = document.createElement("button");
    button.className = "language-selector-button";
    document.body.append(button);
    require("./language");

    expect(() => button.click()).not.toThrow();
  });

  it("closes the modal when clicking outside both the button and modal", () => {
    const { modal } = buildDom();
    require("./language");
    modal.style.display = "block";

    const outside = document.createElement("div");
    document.body.append(outside);
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(modal.style.display).toBe("none");
  });

  it("does not close the modal when clicking inside it", () => {
    const { modal } = buildDom();
    require("./language");
    modal.style.display = "block";

    modal.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(modal.style.display).toBe("block");
  });

  it("does nothing on an outside click when the modal or button is missing", () => {
    document.body.innerHTML = "";
    require("./language");

    expect(() =>
      document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    ).not.toThrow();
  });
});
