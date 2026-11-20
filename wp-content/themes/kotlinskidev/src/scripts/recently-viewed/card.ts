import type { RecentlyViewedEntry } from "./entry-types";

const createElementWithClass = <Tag extends keyof HTMLElementTagNameMap>(
  tagName: Tag,
  className: string
): HTMLElementTagNameMap[Tag] => {
  const element = document.createElement(tagName);
  element.className = className;
  return element;
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

const buildImageLink = (entry: RecentlyViewedEntry): HTMLAnchorElement => {
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
  return imageLink;
};

const buildMetaRow = (entry: RecentlyViewedEntry): HTMLDivElement => {
  const metaRow = createElementWithClass("div", "kt-post-card-grid__meta-row");
  const dateLabel = formatDate(entry.date);
  if (dateLabel) {
    const dateEl = createElementWithClass("span", "kt-post-card-grid__date");
    dateEl.textContent = dateLabel;
    metaRow.appendChild(dateEl);
  }
  const badge = createElementWithClass("span", "kt-post-card-grid__badge");
  badge.textContent = entry.isPage ? "Page" : "Article";
  metaRow.appendChild(badge);
  return metaRow;
};

const buildTitle = (entry: RecentlyViewedEntry): HTMLHeadingElement => {
  const title = createElementWithClass("h3", "kt-post-card-grid__title");
  const titleLink = document.createElement("a");
  titleLink.href = entry.url;
  titleLink.className = "kt-post-card-grid__title-link";
  titleLink.textContent = entry.title;
  title.appendChild(titleLink);
  return title;
};

const buildFooter = (entry: RecentlyViewedEntry): HTMLDivElement => {
  const footer = createElementWithClass("div", "kt-post-card-grid__footer");
  footer.appendChild(document.createElement("div"));
  const button = document.createElement("a");
  button.href = entry.url;
  button.className = "wp-element-button has-background has-text-color kt-post-card-grid__button";
  button.textContent = entry.isPage ? "View Page" : "Read Article";
  footer.appendChild(button);
  return footer;
};

const buildBody = (entry: RecentlyViewedEntry): HTMLDivElement => {
  const body = createElementWithClass("div", "kt-post-card-grid__body");
  body.appendChild(buildMetaRow(entry));
  body.appendChild(buildTitle(entry));

  if (entry.excerpt) {
    const excerpt = createElementWithClass("div", "kt-post-card-grid__excerpt");
    excerpt.textContent = entry.excerpt;
    body.appendChild(excerpt);
  }

  body.appendChild(buildFooter(entry));
  return body;
};

export const buildCard = (entry: RecentlyViewedEntry): HTMLDivElement => {
  const card = createElementWithClass("div", "kt-post-card-grid__card");
  card.appendChild(buildImageLink(entry));
  card.appendChild(buildBody(entry));
  return card;
};
