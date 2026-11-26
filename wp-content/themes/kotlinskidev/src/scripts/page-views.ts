import { getScrollTop, onScroll as bindScroll } from "./utils";

interface PageViewAjaxConfig {
  ajaxurl?: string;
  nonce?: string;
}

interface ConsentCategoriesEventDetail {
  categories?: string[];
}

interface PageViewTracker {
  postId: number;
  ajaxUrl: string;
  nonce: string;
  statisticsConsentGranted: boolean;
  isTrackPending: boolean;
}

declare global {
  interface Window {
    kotlinskidev_ajax?: PageViewAjaxConfig;
  }
}

const DEFAULT_AJAX_URL = "/wp-admin/admin-ajax.php";
const POST_ID_BODY_CLASS_PREFIXES = ["postid-", "page-id-"];
const POST_ID_BODY_CLASS_PATTERN = /^(postid-|page-id-)/;
const STATISTICS_CONSENT_CATEGORY = "statistics";
const CONSENT_CATEGORIES_EVENT = "cmplz_fire_categories";
const XHR_DONE_STATE = 4;
const HTTP_OK = 200;
const MIN_TIME_ON_PAGE_MS = 3000;
const MIN_SCROLL_TOP_PX = 100;
const FALLBACK_TRACK_DELAY_MS = 10000;

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

function readPostId(): number | null {
  const metaTag = document.querySelector('meta[name="post-id"]') as HTMLMetaElement | null;
  if (metaTag && metaTag.content) {
    const metaId = parseId(metaTag.content);
    if (metaId !== null) {
      return metaId;
    }
  }

  for (const className of document.body.className.split(" ")) {
    if (POST_ID_BODY_CLASS_PREFIXES.some((prefix) => className.startsWith(prefix))) {
      const classId = parseId(className.replace(POST_ID_BODY_CLASS_PATTERN, ""));
      if (classId !== null) {
        return classId;
      }
    }
  }

  return null;
}

function buildStorageKey(postId: number): string {
  return `pv_${postId}_${new Date().toDateString()}`;
}

async function refreshNonce(tracker: PageViewTracker): Promise<void> {
  try {
    const response = await fetch(`${tracker.ajaxUrl}?action=kotlinskidev_page_view_nonce`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    const payload = await response.json();
    if (payload?.success && payload.data?.nonce) {
      tracker.nonce = payload.data.nonce;
    }
  } catch {
    tracker.nonce = tracker.nonce || "";
  }
}

function postPageView(tracker: PageViewTracker): void {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", tracker.ajaxUrl);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  const formData = new URLSearchParams({
    action: "kotlinskidev_track_page_view",
    post_id: tracker.postId.toString(),
    nonce: tracker.nonce,
  });

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XHR_DONE_STATE && xhr.status === HTTP_OK) {
      try {
        JSON.parse(xhr.responseText);
      } catch {
        console.error(
          `Something went wrong during increasing page view for page: ${tracker.postId}`
        );
      }
    }
  };

  xhr.send(formData.toString());
}

function sendPageViewOncePerDay(tracker: PageViewTracker): void {
  const storageKey = buildStorageKey(tracker.postId);

  if (localStorage.getItem(storageKey)) {
    return;
  }

  localStorage.setItem(storageKey, "1");
  postPageView(tracker);
}

function trackPageViewWhenConsented(tracker: PageViewTracker): void {
  if (!tracker.statisticsConsentGranted) {
    tracker.isTrackPending = true;
    return;
  }
  sendPageViewOncePerDay(tracker);
}

function listenForStatisticsConsent(tracker: PageViewTracker): void {
  document.addEventListener(CONSENT_CATEGORIES_EVENT, (event) => {
    const detail = (event as CustomEvent<ConsentCategoriesEventDetail>).detail;
    const categories = detail?.categories ?? [];
    tracker.statisticsConsentGranted = categories.includes(STATISTICS_CONSENT_CATEGORY);

    if (tracker.statisticsConsentGranted && tracker.isTrackPending) {
      tracker.isTrackPending = false;
      sendPageViewOncePerDay(tracker);
    }
  });
}

function scheduleEngagementTracking(tracker: PageViewTracker): void {
  let hasScrolled = false;
  const startTime = Date.now();

  const trackIfEngaged = () => {
    const timeSpent = Date.now() - startTime;

    if (timeSpent >= MIN_TIME_ON_PAGE_MS || hasScrolled) {
      trackPageViewWhenConsented(tracker);
      removeScrollListener();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };

  const onScrollPastThreshold = () => {
    if (getScrollTop() > MIN_SCROLL_TOP_PX) {
      hasScrolled = true;
      trackIfEngaged();
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      trackIfEngaged();
    }
  };

  const removeScrollListener = bindScroll(onScrollPastThreshold);
  document.addEventListener("visibilitychange", onVisibilityChange);

  setTimeout(trackIfEngaged, FALLBACK_TRACK_DELAY_MS);
}

function initPageViewTracking(): void {
  if (!window.kotlinskidev_ajax) {
    return;
  }

  const postId = readPostId();
  if (!postId) {
    return;
  }

  const tracker: PageViewTracker = {
    postId,
    ajaxUrl: window.kotlinskidev_ajax?.ajaxurl || DEFAULT_AJAX_URL,
    nonce: window.kotlinskidev_ajax?.nonce || "",
    statisticsConsentGranted: false,
    isTrackPending: false,
  };

  if (!localStorage.getItem(buildStorageKey(postId))) {
    void refreshNonce(tracker);
  }

  listenForStatisticsConsent(tracker);
  scheduleEngagementTracking(tracker);
}

initPageViewTracking();
