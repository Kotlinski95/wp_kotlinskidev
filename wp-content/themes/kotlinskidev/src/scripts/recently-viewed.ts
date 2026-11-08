interface RecentlyViewedEntry {
  url: string;
  title: string;
  image: string;
  excerpt: string;
  date: string;
  isPage: boolean;
}

(function () {
  const STORAGE_KEY = "kt_recently_viewed_v2";
  const MAX_ENTRIES = 6;

  const getPostId = (): number | null => {
    const metaTag = document.querySelector('meta[name="post-id"]') as HTMLMetaElement | null;
    if (metaTag?.content) {
      const id = Number.parseInt(metaTag.content, 10);
      if (!Number.isNaN(id)) {
        return id;
      }
    }

    const bodyClasses = document.body.className.split(" ");
    for (const className of bodyClasses) {
      if (className.startsWith("postid-") || className.startsWith("page-id-")) {
        const id = Number.parseInt(className.replace(/^(postid-|page-id-)/, ""), 10);
        if (!Number.isNaN(id)) {
          return id;
        }
      }
    }

    return null;
  };

  const isExcludedPage = (): boolean => {
    const bodyClasses = document.body.className;
    return bodyClasses.includes("search") || bodyClasses.includes("error404");
  };

  const getMetaContent = (selector: string): string => {
    const tag = document.querySelector(selector) as HTMLMetaElement | null;
    return tag?.content ?? "";
  };

  const readEntries = (): RecentlyViewedEntry[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RecentlyViewedEntry[]) : [];
    } catch {
      return [];
    }
  };

  const writeEntries = (entries: RecentlyViewedEntry[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  };

  const recordView = (): void => {
    if (isExcludedPage() || !getPostId()) {
      return;
    }

    const publishedTime = getMetaContent('meta[property="article:published_time"]');
    const modifiedTime = getMetaContent('meta[property="article:modified_time"]');

    const entry: RecentlyViewedEntry = {
      url: window.location.href,
      title: document.title,
      image: getMetaContent('meta[property="og:image"]'),
      excerpt: getMetaContent('meta[property="og:description"], meta[name="description"]'),
      date: publishedTime || modifiedTime,
      isPage: !document.body.classList.contains("single-post"),
    };

    const entries = readEntries().filter((item) => item.url !== entry.url);
    entries.unshift(entry);
    writeEntries(entries.slice(0, MAX_ENTRIES));
  };

  const formatDate = (isoDate: string): string => {
    if (!isoDate) {
      return "";
    }
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const buildCard = (entry: RecentlyViewedEntry): HTMLDivElement => {
    const card = document.createElement("div");
    card.className = "kt-post-card-grid__card";

    const imageLink = document.createElement("a");
    imageLink.href = entry.url;
    imageLink.className = "kt-post-card-grid__image-link";

    if (entry.image) {
      const img = document.createElement("img");
      img.src = entry.image;
      img.alt = entry.title;
      img.className = "kt-post-card-grid__image";
      img.loading = "lazy";
      img.decoding = "async";
      imageLink.appendChild(img);
    } else {
      imageLink.innerHTML =
        '<span class="kt-post-card-grid__image-placeholder" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 6h16l8 8v28a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M29 6v8h8" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 26h14M17 32h14M17 20h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>';
    }
    card.appendChild(imageLink);

    const body = document.createElement("div");
    body.className = "kt-post-card-grid__body";

    const metaRow = document.createElement("div");
    metaRow.className = "kt-post-card-grid__meta-row";
    const dateLabel = formatDate(entry.date);
    if (dateLabel) {
      const dateEl = document.createElement("span");
      dateEl.className = "kt-post-card-grid__date";
      dateEl.textContent = dateLabel;
      metaRow.appendChild(dateEl);
    }
    const badge = document.createElement("span");
    badge.className = "kt-post-card-grid__badge";
    badge.textContent = entry.isPage ? "Page" : "Article";
    metaRow.appendChild(badge);
    body.appendChild(metaRow);

    const title = document.createElement("h3");
    title.className = "kt-post-card-grid__title";
    const titleLink = document.createElement("a");
    titleLink.href = entry.url;
    titleLink.className = "kt-post-card-grid__title-link";
    titleLink.textContent = entry.title;
    title.appendChild(titleLink);
    body.appendChild(title);

    if (entry.excerpt) {
      const excerpt = document.createElement("div");
      excerpt.className = "kt-post-card-grid__excerpt";
      excerpt.textContent = entry.excerpt;
      body.appendChild(excerpt);
    }

    const footer = document.createElement("div");
    footer.className = "kt-post-card-grid__footer";
    footer.appendChild(document.createElement("div"));
    const button = document.createElement("a");
    button.href = entry.url;
    button.className = "wp-element-button has-background has-text-color kt-post-card-grid__button";
    button.textContent = entry.isPage ? "View Page" : "Read Article";
    footer.appendChild(button);
    body.appendChild(footer);

    card.appendChild(body);

    return card;
  };

  const renderRecentlyViewed = (): void => {
    const container = document.getElementById("kt-recently-viewed");
    const grid = container?.querySelector(".kt-post-card-grid");
    if (!container || !grid) {
      return;
    }

    const entries = readEntries().filter((entry) => entry.url !== window.location.href);
    if (entries.length === 0) {
      return;
    }

    entries.forEach((entry) => grid.appendChild(buildCard(entry)));
    container.removeAttribute("hidden");
  };

  recordView();
  renderRecentlyViewed();
})();
