function loadScript() {
  jest.resetModules();
  require("./active-link-state");
}

function setLocation(pathname: string) {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      pathname,
      origin: "http://example.test",
      href: `http://example.test${pathname}`,
    },
  });
}

describe("active-link-state.ts", () => {
  afterEach(() => {
    delete window.kotlinskidevActiveLinkState;
  });

  it("does nothing when the feature is disabled via config", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="http://example.test/some-page/">Some page</a>`;
    window.kotlinskidevActiveLinkState = { enabled: false };

    loadScript();

    expect(document.querySelector("a")).not.toHaveClass("kt-link-current");
  });

  it("treats an empty or hash-only href as not current", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `
      <a id="empty" href="">Empty</a>
      <a id="hash" href="#">Hash</a>
    `;

    loadScript();

    expect(document.getElementById("empty")).not.toHaveClass("kt-link-current");
    expect(document.getElementById("hash")).not.toHaveClass("kt-link-current");
  });

  it("never treats a same-page scroll anchor as current, regardless of the request path", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `
      <a id="bare" href="#kotlinskidev-main-services">Scroll</a>
      <a id="full" href="http://example.test/some-page/#kotlinskidev-main-services">Scroll full</a>
    `;

    loadScript();

    expect(document.getElementById("bare")).not.toHaveClass("kt-link-current");
    expect(document.getElementById("full")).not.toHaveClass("kt-link-current");
  });

  it("leaves a same-page scroll anchor fully clickable", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="#kotlinskidev-main-services">Learn more</a>`;

    loadScript();

    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link).not.toHaveClass("kt-link-current");
    expect(link.getAttribute("style") ?? "").not.toContain("pointer-events:none");
    expect(link.hasAttribute("aria-disabled")).toBe(false);
  });

  it("treats javascript, mailto, and tel links as never current", () => {
    setLocation("/");
    document.body.innerHTML = `
      <a id="js" href="javascript:void(0)">JS</a>
      <a id="mailto" href="mailto:test@example.com">Mail</a>
      <a id="tel" href="tel:+15551234567">Tel</a>
    `;

    loadScript();

    expect(document.getElementById("js")).not.toHaveClass("kt-link-current");
    expect(document.getElementById("mailto")).not.toHaveClass("kt-link-current");
    expect(document.getElementById("tel")).not.toHaveClass("kt-link-current");
  });

  it("treats a link to a different host as not current", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="https://not-this-site.example/some-page/">Other host</a>`;

    loadScript();

    expect(document.querySelector("a")).not.toHaveClass("kt-link-current");
  });

  it("marks a link matching the current path as current", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="http://example.test/some-page/">Some page</a>`;

    loadScript();

    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link).toHaveClass("kt-link-current");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("ignores a trailing slash difference when comparing paths", () => {
    setLocation("/some-page");
    document.body.innerHTML = `<a href="http://example.test/some-page/">Some page</a>`;

    loadScript();

    expect(document.querySelector("a")).toHaveClass("kt-link-current");
  });

  it("leaves a non-matching link without the current class", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="http://example.test/other-page/">Other page</a>`;

    loadScript();

    expect(document.querySelector("a")).not.toHaveClass("kt-link-current");
  });

  it("skips a link that already carries the current or no-gradient class", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="http://example.test/some-page/" class="kt-hover-no-link-gradient">Some page</a>`;

    loadScript();

    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link.hasAttribute("aria-current")).toBe(false);
  });

  it("disables pointer interaction on the current link when click-blocking is enabled (default)", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="http://example.test/some-page/">Some page</a>`;

    loadScript();

    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");
    expect(link.getAttribute("style")).toContain("pointer-events:none");
  });

  it("leaves the current link fully clickable when click-blocking is disabled via config", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="http://example.test/some-page/">Some page</a>`;
    window.kotlinskidevActiveLinkState = { blockClicks: false };

    loadScript();

    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link).toHaveClass("kt-link-current");
    expect(link.hasAttribute("aria-disabled")).toBe(false);
    expect(link.getAttribute("style") ?? "").not.toContain("pointer-events:none");
  });

  it("does not block clicks on a current mega-panel trigger unless it navigates on click", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="http://example.test/some-page/" aria-haspopup="true">Some page</a>`;

    loadScript();

    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link).toHaveClass("kt-link-current");
    expect(link.hasAttribute("aria-disabled")).toBe(false);
    expect(link.getAttribute("style") ?? "").not.toContain("pointer-events:none");
  });

  it("blocks pointer interaction (but not aria-disabled/tabindex) on a panel trigger that navigates on click", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `
      <div data-link-navigates="true">
        <a href="http://example.test/some-page/" aria-haspopup="true">Some page</a>
      </div>
    `;

    loadScript();

    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link).toHaveClass("kt-link-current");
    expect(link.hasAttribute("aria-disabled")).toBe(false);
    expect(link.getAttribute("style")).toContain("pointer-events:none");
  });

  it("appends pointer-events to an existing inline style without a trailing semicolon", () => {
    setLocation("/some-page/");
    document.body.innerHTML = `<a href="http://example.test/some-page/" style="color:red">Some page</a>`;

    loadScript();

    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("style")).toBe("color:red;pointer-events:none");
  });
});
