const STORAGE_KEY = "kt_recently_viewed_v2";

interface StoredEntry {
  url: string;
  title: string;
  image: string;
  excerpt: string;
  date: string;
  isPage: boolean;
}

function loadScript(): void {
  jest.resetModules();
  require("./recently-viewed");
}

function setPage(options: {
  bodyClass: string;
  postId?: string;
  title?: string;
  meta?: Record<string, string>;
}) {
  document.head.replaceChildren();
  const title = document.createElement("title");
  title.textContent = options.title ?? "Page title";
  document.head.append(title);
  if (options.postId) {
    document.head.append(metaTag("name", "post-id", options.postId));
  }
  Object.entries(options.meta ?? {}).forEach(([key, content]) => {
    const [attribute, value] = key.split("=");
    document.head.append(metaTag(attribute, value, content));
  });
  document.body.className = options.bodyClass;
}

function metaTag(attribute: string, value: string, content: string): HTMLMetaElement {
  const meta = document.createElement("meta");
  meta.setAttribute(attribute, value);
  meta.content = content;
  return meta;
}

function readStore(): StoredEntry[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
}

function entry(url: string): StoredEntry {
  return { url, title: url, image: "", excerpt: "", date: "", isPage: true };
}

describe("recently-viewed.ts", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    document.head.replaceChildren();
  });

  it("records the current page with its meta data", () => {
    setPage({
      bodyClass: "single single-post postid-7",
      title: "Hello",
      meta: {
        "property=og:image": "https://x.test/i.jpg",
        "name=description": "Desc",
        "property=article:published_time": "2024-01-02T00:00:00Z",
      },
    });

    loadScript();

    expect(readStore()).toEqual([
      {
        url: window.location.href,
        title: "Hello",
        image: "https://x.test/i.jpg",
        excerpt: "Desc",
        date: "2024-01-02T00:00:00Z",
        isPage: false,
      },
    ]);
  });

  it("resolves the post id from the page-id body class", () => {
    setPage({ bodyClass: "page-id-12" });

    loadScript();

    expect(readStore()).toHaveLength(1);
    expect(readStore()[0].isPage).toBe(true);
  });

  it("records nothing without a post id or on search and 404 pages", () => {
    setPage({ bodyClass: "home" });
    loadScript();
    setPage({ bodyClass: "search postid-3" });
    loadScript();
    setPage({ bodyClass: "error404 postid-3" });
    loadScript();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("moves a revisited url to the front and caps the list at six entries", () => {
    setPage({ bodyClass: "postid-1", postId: "1" });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        entry("https://a.test/1"),
        entry(window.location.href),
        entry("https://a.test/3"),
        entry("https://a.test/4"),
        entry("https://a.test/5"),
        entry("https://a.test/6"),
        entry("https://a.test/7"),
      ])
    );

    loadScript();

    const urls = readStore().map((item) => item.url);
    expect(urls).toHaveLength(6);
    expect(urls[0]).toBe(window.location.href);
    expect(urls.filter((url) => url === window.location.href)).toHaveLength(1);
  });

  it("survives a corrupt store", () => {
    setPage({ bodyClass: "postid-1" });
    localStorage.setItem(STORAGE_KEY, "{bad");

    expect(() => loadScript()).not.toThrow();
    expect(readStore()).toHaveLength(1);
  });

  it("renders cards for other pages and reveals the container", () => {
    setPage({ bodyClass: "search" });
    document.body.innerHTML =
      '<div id="kt-recently-viewed" hidden><div class="kt-post-card-grid"></div></div>';
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          url: "https://a.test/post",
          title: "Post",
          image: "https://a.test/p.jpg",
          excerpt: "Ex",
          date: "2024-05-06T00:00:00Z",
          isPage: false,
        },
        { ...entry("https://a.test/page"), title: "Page" },
      ])
    );

    loadScript();

    const container = document.getElementById("kt-recently-viewed")!;
    expect(container.hasAttribute("hidden")).toBe(false);
    const cards = container.querySelectorAll(".kt-post-card-grid__card");
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector("img")?.getAttribute("src")).toBe("https://a.test/p.jpg");
    expect(cards[0].querySelector(".kt-post-card-grid__badge")?.textContent).toBe("Article");
    expect(cards[0].querySelector(".kt-post-card-grid__excerpt")?.textContent).toBe("Ex");
    expect(cards[0].querySelector(".kt-post-card-grid__button")?.textContent).toBe("Read Article");
    expect(cards[1].querySelector(".kt-post-card-grid__image-placeholder")).not.toBeNull();
    expect(cards[1].querySelector(".kt-post-card-grid__date")).toBeNull();
    expect(cards[1].querySelector(".kt-post-card-grid__button")?.textContent).toBe("View Page");
  });

  it("keeps the container hidden when only the current page is stored", () => {
    setPage({ bodyClass: "search" });
    document.body.innerHTML =
      '<div id="kt-recently-viewed" hidden><div class="kt-post-card-grid"></div></div>';
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry(window.location.href)]));

    loadScript();

    expect(document.getElementById("kt-recently-viewed")!.hasAttribute("hidden")).toBe(true);
  });
});
