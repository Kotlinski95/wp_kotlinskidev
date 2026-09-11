import React, { createContext, useContext } from "react";
import { MOCK_IMAGE_ABOUT, MOCK_IMAGE_WORK } from "./mock-assets";

interface MockServerSideRenderProps {
  block: string;
  attributes?: Record<string, unknown>;
  className?: string;
}

export type BreadcrumbsRoute = "post" | "category" | "page";

export const BreadcrumbsRouteContext = createContext<BreadcrumbsRoute>("post");

type BlockMockRenderer = (attributes: Record<string, unknown>, breadcrumbsRoute: BreadcrumbsRoute) => string;

const GRADIENT_BORDER =
  "linear-gradient(to left, rgb(132, 83, 210) 0%, rgb(0, 71, 255) 60%, rgb(0, 120, 194) 100%)";

interface MockArticleCard {
  title: string;
}

export const ARTICLE_CARD_MOCK_CARDS: Record<number, MockArticleCard> = {
  1: { title: "Check what should a good website contain to generate profit" },
  2: { title: "5 mistakes killing your site's Core Web Vitals score" },
  3: { title: "Why every WordPress theme should ship its own Storybook" },
};

function renderArticleCard(attributes: Record<string, unknown>): string {
  const cardId = typeof attributes.cardId === "number" ? attributes.cardId : 1;
  const card = ARTICLE_CARD_MOCK_CARDS[cardId] ?? ARTICLE_CARD_MOCK_CARDS[1];

  return `
    <div class="wp-block-group kt-article-card has-global-padding is-layout-constrained wp-block-group-is-layout-constrained" style="box-shadow:6px 6px 9px rgba(0, 0, 0, 0.2)">
      <figure class="wp-block-image has-custom-border">
        <img src="${MOCK_IMAGE_ABOUT}" alt="Storybook mock article cover" style="border-top-left-radius:6px;border-top-right-radius:6px;border-bottom-left-radius:0;border-bottom-right-radius:0" />
      </figure>
      <p class="wp-block-paragraph has-foreground-color has-text-color has-link-color">${card.title}</p>
      <div class="wp-block-buttons is-layout-flex wp-block-buttons-is-layout-flex">
        <div class="wp-block-button is-style-outline is-style-outline--1">
          <a href="#" class="wp-block-button__link has-foreground-color has-text-color has-link-color wp-element-button kt-has-gradient-border" style="border-width:1px;--kt-border-gradient:${GRADIENT_BORDER};--kt-border-width:1px;">Read more&hellip;</a>
        </div>
      </div>
    </div>
  `;
}

interface MockProjectCard {
  title: string;
  description: string;
  tags: string;
}

export const PROJECT_CARD_MOCK_CARDS: Record<number, MockProjectCard> = {
  1: {
    title: "Kotlinskidev",
    description: "A personal portfolio built on WordPress, pairing clean code with deliberate UX.",
    tags: "WordPress Design",
  },
  2: {
    title: "Smart Shopping",
    description: "A mobile shopping-list app designed to eliminate wasted time and forgotten items.",
    tags: "Mobile App UX",
  },
  3: {
    title: "Hollister",
    description: "Built Hollister's global e-commerce platform from the ground up with Next.js and a headless CMS.",
    tags: "Next.js Headless CMS",
  },
};

function renderProjectCard(attributes: Record<string, unknown>): string {
  const cardId = typeof attributes.cardId === "number" ? attributes.cardId : 1;
  const card = PROJECT_CARD_MOCK_CARDS[cardId] ?? PROJECT_CARD_MOCK_CARDS[1];

  return `
    <div class="wp-block-group kt-project-card hover-jump-subtle has-hover-opacity is-layout-flow wp-block-group-is-layout-flow" style="border-radius:12px;box-shadow:6px 6px 9px rgba(0, 0, 0, 0.2);--hover-opacity-from:0.9;--hover-opacity-to:1">
      <figure style="aspect-ratio:4/3" class="wp-block-post-featured-image kt-image-hover-overlay">
        <img src="${MOCK_IMAGE_WORK}" alt="Storybook mock project cover" style="border-top-left-radius:12px;border-top-right-radius:12px;border-bottom-left-radius:0;border-bottom-right-radius:0;width:100%;height:100%;object-fit:cover;" />
        <div class="kt-image-hover-overlay__content"><span class="kt-image-hover-overlay__description">${card.description}</span></div>
      </figure>
      <div class="wp-block-group kt-project-card__body is-content-justification-space-between is-nowrap is-layout-flex wp-block-group-is-layout-flex" style="padding:var(--wp--preset--spacing--40)">
        <h3 class="has-link-color wp-block-post-title has-text-color has-foreground-color">${card.title}</h3>
        <div class="wp-block-button kt-project-card__link is-style-fill">
          <a href="#" class="wp-block-button__link has-white-color has-fancy-text-gradient-background has-text-color has-background wp-element-button" style="border-radius:999px;line-height:1">&#10138;</a>
        </div>
      </div>
      <p class="kt-project-card__tags has-foreground-color has-text-color has-link-color wp-block-paragraph" style="padding:0 var(--wp--preset--spacing--40) var(--wp--preset--spacing--40)">${card.tags}</p>
    </div>
  `;
}

function renderCopyrights(): string {
  return `
    <section class="copyrights-container">
      <p class="copyrights">&copy; 2026 Kotlinskidev | Web Development</p>
      <p class="has-text-align-center" style="line-height:1.5">Proudly powered by <a href="#">Adrian Kotlinski</a> | All rights reserved</p>
    </section>
  `;
}

function renderThemeSwitcher(): string {
  return `
    <button class="theme-switcher kt-tooltip kt-tooltip--below" tabindex="0" aria-label="Toggle light and dark theme" data-tooltip="Toggle light and dark theme">
      <input type="checkbox" name="check" id="theme-toggle">
      <label for="theme-toggle">
        <span class="wrapper">
          <span class="icon light" data-theme-icon="light">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"></path></svg>
          </span>
          <span class="icon dark" data-theme-icon="dark">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"></path></svg>
          </span>
        </span>
      </label>
    </button>
  `;
}

interface BreadcrumbsCrumb {
  label: string;
  url?: string;
}

const BREADCRUMBS_TRAILS: Record<BreadcrumbsRoute, BreadcrumbsCrumb[]> = {
  post: [
    { label: "Home", url: "#" },
    { label: "Topics", url: "#" },
    { label: "AI in website development", url: "#" },
    { label: "How can I use artificial intelligence to improve my website?" },
  ],
  category: [
    { label: "Home", url: "#" },
    { label: "Topics", url: "#" },
    { label: "AI in website development" },
  ],
  page: [
    { label: "Home", url: "#" },
    { label: "Contact", url: "#" },
    { label: "Thank you page" },
  ],
};

function renderBreadcrumbs(_attributes: Record<string, unknown>, route: BreadcrumbsRoute): string {
  const trail = BREADCRUMBS_TRAILS[route];

  const items = trail
    .map((crumb) =>
      crumb.url
        ? `<a class="kt-breadcrumbs__item" href="${crumb.url}">${crumb.label}</a>`
        : `<span class="kt-breadcrumbs__current">${crumb.label}</span>`
    )
    .join('<span class="kt-breadcrumbs__separator">&rarr;</span>');

  return `
    <div class="kt-breadcrumbs wp-block-kotlinskidev-breadcrumbs">
      <nav class="kt-breadcrumbs__list">${items}</nav>
    </div>
  `;
}

const BLOCK_MOCKS: Record<string, BlockMockRenderer> = {
  "kotlinskidev/article-card": renderArticleCard,
  "kotlinskidev/breadcrumbs": renderBreadcrumbs,
  "kotlinskidev/project-card": renderProjectCard,
  "kotlinskidev/copyrights": renderCopyrights,
  "kotlinskidev/theme-switcher": renderThemeSwitcher,
};

export default function MockServerSideRender({ block, attributes, className }: MockServerSideRenderProps) {
  const renderMock = BLOCK_MOCKS[block];
  const breadcrumbsRoute = useContext(BreadcrumbsRouteContext);

  if (!renderMock) {
    return (
      <div className={className} style={{ padding: "1rem", border: "1px dashed currentColor", opacity: 0.6 }}>
        No Storybook mock configured yet for &quot;{block}&quot;.
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMock(attributes ?? {}, breadcrumbsRoute) }}
    />
  );
}
