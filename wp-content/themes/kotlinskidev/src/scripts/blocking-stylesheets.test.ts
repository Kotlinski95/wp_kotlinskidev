import { initBlockingStylesheets, isSameOriginReferrer } from "./blocking-stylesheets";

const setReferrer = (value: string): void => {
  Object.defineProperty(document, "referrer", { configurable: true, value });
};

const deferredLink = (): HTMLLinkElement => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.media = "print";
  link.setAttribute("onload", "this.media='all'");
  return link;
};

describe("blocking stylesheets on internal navigation", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("recognises same-origin referrers only", () => {
    expect(isSameOriginReferrer("", "http://a.test")).toBe(false);
    expect(isSameOriginReferrer("http://a.test/page/", "http://a.test")).toBe(true);
    expect(isSameOriginReferrer("http://b.test/page/", "http://a.test")).toBe(false);
    expect(isSameOriginReferrer("not a url", "http://a.test")).toBe(false);
  });

  it("leaves deferred stylesheets alone for external or missing referrers", () => {
    setReferrer("");
    initBlockingStylesheets();
    const link = deferredLink();
    document.head.appendChild(link);
    return Promise.resolve().then(() => expect(link.media).toBe("print"));
  });

  it("promotes deferred stylesheets, present and inserted later, on internal navigation", async () => {
    setReferrer(window.location.origin + "/previous/");
    const existing = deferredLink();
    document.head.appendChild(existing);
    initBlockingStylesheets();
    expect(existing.media).toBe("all");

    const later = deferredLink();
    document.head.appendChild(later);
    await Promise.resolve();
    expect(later.media).toBe("all");
  });

  it("does not touch stylesheets without the deferral onload", async () => {
    setReferrer(window.location.origin + "/previous/");
    initBlockingStylesheets();
    const plain = document.createElement("link");
    plain.rel = "stylesheet";
    plain.media = "print";
    document.head.appendChild(plain);
    await Promise.resolve();
    expect(plain.media).toBe("print");
  });
});
