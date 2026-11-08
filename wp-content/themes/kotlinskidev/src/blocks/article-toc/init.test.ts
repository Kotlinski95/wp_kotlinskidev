function buildFixture(headingTops: number[]): HTMLElement[] {
  document.body.innerHTML = "";
  document.documentElement.classList.remove("has-modal-open");

  const headings = headingTops.map((top, index) => {
    const heading = document.createElement("h2");
    heading.id = `section-${index}`;
    jest
      .spyOn(heading, "getBoundingClientRect")
      .mockImplementation(() => ({ top }) as unknown as DOMRect);
    return heading;
  });

  const buildList = (): HTMLElement => {
    const nav = document.createElement("nav");
    nav.className = "kt-article-toc";
    const ol = document.createElement("ol");
    ol.className = "kt-article-toc__list";
    headingTops.forEach((_, index) => {
      const item = document.createElement("li");
      item.className = "kt-article-toc__item";
      const link = document.createElement("a");
      link.className = "kt-article-toc__link";
      link.setAttribute("data-kt-toc-link", "");
      link.setAttribute("href", `#section-${index}`);
      link.textContent = `Heading ${index}`;
      item.appendChild(link);
      ol.appendChild(item);
    });
    nav.appendChild(ol);
    return nav;
  };

  const root = document.createElement("div");
  root.className = "wp-block-kotlinskidev-article-toc kt-article-toc-block";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "kt-article-toc-toggle";
  toggle.setAttribute("aria-expanded", "false");

  const dialog = document.createElement("dialog");
  dialog.className = "kt-article-toc-dialog";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "kt-article-toc-dialog__close";
  dialog.append(close, buildList());

  root.append(buildList(), toggle, dialog);

  document.body.append(root, ...headings);
  return headings;
}

function mockDialog(): void {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

function loadInit(): void {
  jest.isolateModules(() => {
    require("./init");
  });
}

function flushFrame(): void {
  jest.advanceTimersByTime(20);
}

function mainLinks(): HTMLAnchorElement[] {
  return Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      ".wp-block-kotlinskidev-article-toc [data-kt-toc-link]"
    )
  );
}

describe("article-toc init", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    window.scrollTo = jest.fn();
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 500 });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 0 });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 5000,
    });
    window.kotlinskidevProgrammaticScrollActive = false;
    mockDialog();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("moves the toggle and dialog to document.body", () => {
    buildFixture([100, 600, 1200]);
    loadInit();

    expect(document.querySelector(".kt-article-toc-toggle")?.parentElement).toBe(document.body);
    expect(document.querySelector(".kt-article-toc-dialog")?.parentElement).toBe(document.body);
  });

  it("marks the last heading above the threshold as active in both copies", () => {
    buildFixture([-400, 100, 900]);
    loadInit();

    const active = document.querySelectorAll(".kt-article-toc__link.is-active");
    expect(active).toHaveLength(2);
    active.forEach((link) => {
      expect(link.getAttribute("href")).toBe("#section-1");
      expect(link.getAttribute("aria-current")).toBe("location");
    });
  });

  it("marks nothing active above the first heading", () => {
    buildFixture([900, 1500, 2100]);
    loadInit();

    expect(document.querySelectorAll(".kt-article-toc__link.is-active")).toHaveLength(0);
  });

  it("marks the last item active at the bottom of the document", () => {
    buildFixture([900, 1500, 2100]);
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 4300 });
    loadInit();

    const active = mainLinks().filter((link) => link.classList.contains("is-active"));
    expect(active.map((link) => link.getAttribute("href"))).toEqual(["#section-2"]);
  });

  it("scrolls to the heading and pushes the hash on link click", () => {
    buildFixture([900, 1500, 2100]);
    loadInit();
    const pushState = jest.spyOn(history, "pushState");

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    mainLinks()[1].dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1500 - 0 - 16, behavior: "smooth" });
    expect(pushState).toHaveBeenCalledWith(null, "", "#section-1");
    expect(window.kotlinskidevProgrammaticScrollActive).toBe(true);
    expect(mainLinks()[1].classList.contains("is-active")).toBe(true);
  });

  it("uses instant scrolling under prefers-reduced-motion", () => {
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query.includes("reduced-motion"),
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    buildFixture([900, 1500, 2100]);
    loadInit();

    mainLinks()[0].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
  });

  it("releases the programmatic flag and focuses the heading after the scroll settles", () => {
    const headings = buildFixture([900, 1500, 2100]);
    loadInit();

    mainLinks()[2].dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    jest.advanceTimersByTime(1000);

    expect(window.kotlinskidevProgrammaticScrollActive).toBe(false);
    expect(headings[2].getAttribute("tabindex")).toBe("-1");
    expect((document.body.ownerDocument as Document).activeElement).toBe(headings[2]);
  });

  it("opens the dialog, locks scroll and focuses the first link", () => {
    buildFixture([900, 1500, 2100]);
    loadInit();
    const toggle = document.querySelector<HTMLElement>(".kt-article-toc-toggle") as HTMLElement;

    toggle.click();

    const dialog = document.querySelector(".kt-article-toc-dialog") as HTMLDialogElement;
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(document.documentElement.classList.contains("has-modal-open")).toBe(true);
    expect((document.body.ownerDocument as Document).activeElement).toBe(
      dialog.querySelector("[data-kt-toc-link]")
    );
  });

  it("closes on the close button, unlocks scroll and returns focus to the toggle", () => {
    buildFixture([900, 1500, 2100]);
    loadInit();
    const toggle = document.querySelector<HTMLElement>(".kt-article-toc-toggle") as HTMLElement;
    toggle.click();

    (document.querySelector(".kt-article-toc-dialog__close") as HTMLElement).click();

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.documentElement.classList.contains("has-modal-open")).toBe(false);
    expect((document.body.ownerDocument as Document).activeElement).toBe(toggle);
  });

  it("closes when the backdrop is clicked", () => {
    buildFixture([900, 1500, 2100]);
    loadInit();
    (document.querySelector(".kt-article-toc-toggle") as HTMLElement).click();
    const dialog = document.querySelector(".kt-article-toc-dialog") as HTMLDialogElement;

    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(dialog.hasAttribute("open")).toBe(false);
  });

  it("closes the dialog and scrolls when a dialog link is clicked", () => {
    buildFixture([900, 1500, 2100]);
    loadInit();
    (document.querySelector(".kt-article-toc-toggle") as HTMLElement).click();
    const dialog = document.querySelector(".kt-article-toc-dialog") as HTMLDialogElement;

    (dialog.querySelectorAll("[data-kt-toc-link]")[1] as HTMLElement).click();

    expect(dialog.hasAttribute("open")).toBe(false);
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("skips spy updates while a programmatic scroll is active", () => {
    buildFixture([-400, 100, 900]);
    window.kotlinskidevProgrammaticScrollActive = true;
    loadInit();
    flushFrame();

    expect(document.querySelectorAll(".kt-article-toc__link.is-active")).toHaveLength(0);
  });

  it("scrolls the card list container, not the page, when the active item changes", () => {
    buildFixture([-400, 100, 900]);
    const card = document.querySelector(".kt-article-toc") as HTMLElement;
    const containerScrollTo = jest.fn();
    card.scrollTo = containerScrollTo as unknown as typeof card.scrollTo;
    Object.defineProperty(card, "clientHeight", { configurable: true, value: 300 });
    Object.defineProperty(card, "scrollHeight", { configurable: true, value: 900 });
    jest
      .spyOn(card, "getBoundingClientRect")
      .mockImplementation(() => ({ top: 0, bottom: 300, height: 300 }) as DOMRect);
    const link = mainLinks()[1];
    jest
      .spyOn(link, "getBoundingClientRect")
      .mockImplementation(() => ({ top: 500, bottom: 540, height: 40 }) as DOMRect);
    loadInit();

    expect(containerScrollTo).toHaveBeenCalledWith({ top: 370, behavior: "smooth" });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("brings the active link into view when the dialog opens", () => {
    buildFixture([-400, 100, 900]);
    const dialog = document.querySelector(".kt-article-toc-dialog") as HTMLDialogElement;
    const list = dialog.querySelector(".kt-article-toc") as HTMLElement;
    const listScrollTo = jest.fn();
    list.scrollTo = listScrollTo as unknown as typeof list.scrollTo;
    Object.defineProperty(list, "clientHeight", { configurable: true, value: 300 });
    Object.defineProperty(list, "scrollHeight", { configurable: true, value: 900 });
    jest
      .spyOn(list, "getBoundingClientRect")
      .mockImplementation(() => ({ top: 0, bottom: 300, height: 300 }) as DOMRect);
    jest
      .spyOn(list.querySelectorAll("a")[1], "getBoundingClientRect")
      .mockImplementation(() => ({ top: 500, bottom: 540, height: 40 }) as DOMRect);
    loadInit();

    (document.querySelector(".kt-article-toc-toggle") as HTMLElement).click();

    expect(listScrollTo).toHaveBeenCalledWith({ top: 370, behavior: "auto" });
  });
});
