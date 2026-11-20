import { fetchDecryptedItems, type DecryptItem } from "./decrypt-api";
import { revealContent, showError, showLoading } from "./element-states";
import { createTagStrippingPurifier, loadPurifier, type Purifier } from "./purifier";

const BATCH_DEBOUNCE_MS = 50;

let pendingElements: HTMLElement[] = [];
let flushScheduled = false;

const toDecryptItem = (element: HTMLElement): DecryptItem => ({
  content: element.getAttribute("data-original-content") || "",
  type: element.getAttribute("data-protection-type") || "text",
});

const showResults = (
  elements: HTMLElement[],
  items: DecryptItem[],
  results: Awaited<ReturnType<typeof fetchDecryptedItems>>,
  purifier: Purifier
): void => {
  elements.forEach((element, index) => {
    const result = results[index];
    if (result) {
      revealContent(element, result.content, items[index].type, purifier);
    } else {
      showError(element, items[index].type, purifier);
    }
  });
};

const flushPendingElements = async (): Promise<void> => {
  const elements = pendingElements;
  pendingElements = [];
  flushScheduled = false;

  if (elements.length === 0) {
    return;
  }

  const items = elements.map(toDecryptItem);

  elements.forEach(showLoading);

  const purifierPromise = loadPurifier();

  try {
    const [results, purifier] = await Promise.all([fetchDecryptedItems(items), purifierPromise]);
    showResults(elements, items, results, purifier);
  } catch (error) {
    console.error("Failed to decrypt protected content:", error);
    const purifier = await purifierPromise.catch(createTagStrippingPurifier);
    elements.forEach((element, index) => showError(element, items[index].type, purifier));
  }
};

const scheduleFlush = (): void => {
  if (flushScheduled) {
    return;
  }
  flushScheduled = true;
  setTimeout(flushPendingElements, BATCH_DEBOUNCE_MS);
};

export const enqueueElement = (element: HTMLElement): void => {
  if (!element.getAttribute("data-original-content")) {
    console.warn("Protected element missing original content data");
    return;
  }

  pendingElements.push(element);
  scheduleFlush();
};
