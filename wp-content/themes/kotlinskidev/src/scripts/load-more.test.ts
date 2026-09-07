function loadScript() {
  jest.resetModules();
  require("./load-more");
}

describe("load-more.ts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when there is no load-more container on the page", () => {
    document.body.innerHTML = "<p>no cards here</p>";

    expect(() => loadScript()).not.toThrow();
  });

  it("does nothing when children count does not exceed the initial limit", () => {
    document.body.innerHTML = '<div data-kt-load-more-initial="3"><div>a</div><div>b</div></div>';

    loadScript();

    expect(document.querySelector(".kt-load-more__button")).not.toBeInTheDocument();
  });

  it("hides children beyond the initial count and inserts a button", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="2"><div>a</div><div>b</div><div>c</div><div>d</div></div>';

    loadScript();

    const children = Array.from(document.querySelectorAll("[data-kt-load-more-initial] > div"));
    expect(children[0]).not.toHaveClass("kt-load-more-hidden");
    expect(children[1]).not.toHaveClass("kt-load-more-hidden");
    expect(children[2]).toHaveClass("kt-load-more-hidden");
    expect(children[3]).toHaveClass("kt-load-more-hidden");

    const button = document.querySelector(".kt-load-more__button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Load more");
  });

  it("uses the custom label from the data attribute when present", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" data-kt-load-more-label="Pokaż więcej"><div>a</div><div>b</div></div>';

    loadScript();

    expect(document.querySelector(".kt-load-more__button")).toHaveTextContent("Pokaż więcej");
  });

  it("reveals the hidden children and removes the wrapper on click", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1"><div>a</div><div>b</div><div>c</div></div>';

    loadScript();

    const button = document.querySelector<HTMLButtonElement>(".kt-load-more__button")!;
    button.click();

    const hidden = document.querySelectorAll(".kt-load-more-hidden");
    expect(hidden).toHaveLength(0);
    expect(document.querySelector(".kt-load-more__wrapper")).not.toBeInTheDocument();
  });

  it("ignores an invalid or missing initial count", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="not-a-number"><div>a</div><div>b</div></div>';

    loadScript();

    expect(document.querySelector(".kt-load-more__button")).not.toBeInTheDocument();
  });

  it("wraps the button and left-aligns it by default", () => {
    document.body.innerHTML = '<div data-kt-load-more-initial="1"><div>a</div><div>b</div></div>';

    loadScript();

    const wrapper = document.querySelector<HTMLDivElement>(".kt-load-more__wrapper")!;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.style.textAlign).toBe("left");
    expect(wrapper.querySelector(".kt-load-more__button")).toBeInTheDocument();
  });

  it("aligns the wrapper per the data attribute", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" data-kt-load-more-align="center"><div>a</div><div>b</div></div>';

    loadScript();

    expect(document.querySelector<HTMLDivElement>(".kt-load-more__wrapper")!.style.textAlign).toBe(
      "center"
    );
  });

  it("applies text, background, border and underline styles from data attributes", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" ' +
      'data-kt-load-more-text-color="#ffffff" ' +
      'data-kt-load-more-bg-color="#111111" ' +
      'data-kt-load-more-border-color="#8209d3" ' +
      'data-kt-load-more-border-width="2" ' +
      'data-kt-load-more-border-radius="20" ' +
      'data-kt-load-more-underline="1">' +
      "<div>a</div><div>b</div></div>";

    loadScript();

    const button = document.querySelector<HTMLButtonElement>(".kt-load-more__button")!;
    expect(button.style.color).toBe("rgb(255, 255, 255)");
    expect(button.style.background).toBe("rgb(17, 17, 17)");
    expect(button.style.borderColor).toBe("#8209d3");
    expect(button.style.borderWidth).toBe("2px");
    expect(button.style.borderRadius).toBe("20px");
    expect(button.style.textDecoration).toBe("underline");
  });

  it("swaps to hover colors on mouseenter/focus and reverts on mouseleave/blur", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" ' +
      'data-kt-load-more-text-color="#ffffff" ' +
      'data-kt-load-more-bg-color="#111111" ' +
      'data-kt-load-more-hover-text-color="#000000" ' +
      'data-kt-load-more-hover-bg-color="#eeeeee">' +
      "<div>a</div><div>b</div></div>";

    loadScript();

    const button = document.querySelector<HTMLButtonElement>(".kt-load-more__button")!;
    expect(button.style.color).toBe("rgb(255, 255, 255)");

    button.dispatchEvent(new MouseEvent("mouseenter"));
    expect(button.style.color).toBe("rgb(0, 0, 0)");
    expect(button.style.background).toBe("rgb(238, 238, 238)");

    button.dispatchEvent(new MouseEvent("mouseleave"));
    expect(button.style.color).toBe("rgb(255, 255, 255)");
    expect(button.style.background).toBe("rgb(17, 17, 17)");
  });

  it("does not attach hover listeners when no hover color is set", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" data-kt-load-more-text-color="#ffffff">' +
      "<div>a</div><div>b</div></div>";

    loadScript();

    const button = document.querySelector<HTMLButtonElement>(".kt-load-more__button")!;
    button.dispatchEvent(new MouseEvent("mouseenter"));

    expect(button.style.color).toBe("rgb(255, 255, 255)");
  });
});
