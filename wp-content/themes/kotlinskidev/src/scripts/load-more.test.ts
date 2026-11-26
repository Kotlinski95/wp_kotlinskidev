jest.mock("./track-event", () => ({ trackEvent: jest.fn() }));

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

    const trackEvent = require("./track-event").trackEvent as jest.Mock;
    expect(trackEvent).toHaveBeenCalledWith("load_more_click", { items_revealed: 2 });
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

  it("applies a valid font size preset and ignores an invalid one", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" data-kt-load-more-font-size="large">' +
      "<div>a</div><div>b</div></div>";
    loadScript();
    const button = document.querySelector<HTMLButtonElement>(".kt-load-more__button")!;
    expect(button.style.fontSize).toBe("var(--wp--preset--font-size--large)");
  });

  it("ignores a malformed font size slug", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" data-kt-load-more-font-size="a;b">' +
      "<div>a</div><div>b</div></div>";
    loadScript();
    const button = document.querySelector<HTMLButtonElement>(".kt-load-more__button")!;
    expect(button.style.fontSize).toBe("");
  });

  it("applies whitelisted typography and clamped padding", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" data-kt-load-more-font-weight="600"' +
      ' data-kt-load-more-letter-spacing="wide" data-kt-load-more-text-transform="uppercase"' +
      ' data-kt-load-more-padding-y="1" data-kt-load-more-padding-x="99">' +
      "<div>a</div><div>b</div></div>";
    loadScript();
    const button = document.querySelector<HTMLButtonElement>(".kt-load-more__button")!;
    expect(button.style.fontWeight).toBe("600");
    expect(button.style.letterSpacing).toBe("0.02em");
    expect(button.style.textTransform).toBe("uppercase");
    expect(button.style.paddingBlock).toBe("1rem");
    expect(button.style.paddingInline).toBe("4rem");
  });

  it("ignores invalid typography and padding values", () => {
    document.body.innerHTML =
      '<div data-kt-load-more-initial="1" data-kt-load-more-font-weight="900"' +
      ' data-kt-load-more-letter-spacing="constructor" data-kt-load-more-text-transform="x;y"' +
      ' data-kt-load-more-padding-y="abc" data-kt-load-more-padding-x="">' +
      "<div>a</div><div>b</div></div>";
    loadScript();
    const button = document.querySelector<HTMLButtonElement>(".kt-load-more__button")!;
    expect(button.style.fontWeight).toBe("");
    expect(button.style.letterSpacing).toBe("");
    expect(button.style.textTransform).toBe("");
    expect(button.style.paddingBlock).toBe("");
    expect(button.style.paddingInline).toBe("");
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
    expect(button.style.borderColor).toBe("rgb(130, 9, 211)");
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
