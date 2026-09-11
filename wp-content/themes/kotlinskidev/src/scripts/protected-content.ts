/**
 * Protected Content Frontend Handler
 */

import DOMPurify from "dompurify";

interface ProtectionConfig {
  ajaxUrl: string;
  nonce: string;
  errorText: string;
}

interface DecryptItem {
  content: string;
  type: string;
}

interface DecryptResult {
  content: string;
  raw_content: string;
}

const BATCH_DEBOUNCE_MS = 50;
const OBSERVER_ROOT_MARGIN = "200px 0px";

const getConfig = (): ProtectionConfig => {
  if (!(window as any).kotlinskidevProtectionConfig) {
    (window as any).kotlinskidevProtectionConfig = {
      ajaxUrl: "/wp-admin/admin-ajax.php",
      nonce: "",
      errorText: "Failed to load protected content",
    };
  }

  return (window as any).kotlinskidevProtectionConfig;
};

const refreshNonce = async (): Promise<boolean> => {
  const config = getConfig();
  const formData = new FormData();
  formData.append("action", "kotlinskidev_get_fresh_nonce");

  const response = await fetch(config.ajaxUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();

  if (result.success) {
    (window as any).kotlinskidevProtectionConfig.nonce = result.data.nonce;
    return true;
  }

  return false;
};

const fetchDecryptedItems = async (
  items: DecryptItem[],
  hasRetried = false
): Promise<Record<number, DecryptResult | null>> => {
  const config = getConfig();
  const formData = new FormData();
  formData.append("action", "kotlinskidev_decrypt_content");
  formData.append("items", JSON.stringify(items));
  formData.append("nonce", config.nonce);

  const response = await fetch(config.ajaxUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.success) {
    return result.data.results;
  }

  if (result.data?.error_code === "nonce_expired" && !hasRetried && (await refreshNonce())) {
    return fetchDecryptedItems(items, true);
  }

  throw new Error(result.data?.message || result.data || "Unknown decryption error");
};

const revealContent = (element: HTMLElement, content: string, type: string): void => {
  element.innerHTML = DOMPurify.sanitize(content);
  element.classList.remove("protection-loading");
  element.classList.add("protection-loaded");
  element.removeAttribute("data-original-content");
  element.setAttribute("aria-label", `Protected ${type} content revealed`);
};

const showError = (element: HTMLElement, type: string): void => {
  const config = getConfig();
  element.innerHTML = DOMPurify.sanitize(config.errorText);
  element.classList.remove("protection-loading");
  element.classList.add("protection-error");
  element.setAttribute("aria-label", `Failed to load protected ${type} content`);
};

const showLoading = (element: HTMLElement): void => {
  const themeUrl =
    (window as any).kotlinskidevProtectionConfig?.themeUrl || "/wp-content/themes/kotlinskidev";
  element.replaceChildren();
  const spinner = document.createElement("img");
  spinner.src = `${themeUrl}/assets/images/loading.svg`;
  spinner.alt = "Loading...";
  spinner.className = "protection-loading-spinner";
  element.append(spinner);
  element.classList.add("protection-loading");
};

let pendingElements: HTMLElement[] = [];
let flushScheduled = false;

const flushPendingElements = async (): Promise<void> => {
  const elements = pendingElements;
  pendingElements = [];
  flushScheduled = false;

  if (elements.length === 0) {
    return;
  }

  const items: DecryptItem[] = elements.map((element) => ({
    content: element.getAttribute("data-original-content") || "",
    type: element.getAttribute("data-protection-type") || "text",
  }));

  elements.forEach(showLoading);

  try {
    const results = await fetchDecryptedItems(items);
    elements.forEach((element, index) => {
      const result = results[index];
      if (result) {
        revealContent(element, result.content, items[index].type);
      } else {
        showError(element, items[index].type);
      }
    });
  } catch (error) {
    console.error("Failed to decrypt protected content:", error);
    elements.forEach((element, index) => showError(element, items[index].type));
  }
};

const scheduleFlush = (): void => {
  if (flushScheduled) {
    return;
  }
  flushScheduled = true;
  setTimeout(flushPendingElements, BATCH_DEBOUNCE_MS);
};

const enqueueElement = (element: HTMLElement): void => {
  if (!element.getAttribute("data-original-content")) {
    console.warn("Protected element missing original content data");
    return;
  }

  pendingElements.push(element);
  scheduleFlush();
};

let intersectionObserver: IntersectionObserver | null = null;

const getIntersectionObserver = (): IntersectionObserver => {
  if (!intersectionObserver) {
    intersectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            enqueueElement(entry.target as HTMLElement);
          }
        });
      },
      { rootMargin: OBSERVER_ROOT_MARGIN }
    );
  }

  return intersectionObserver;
};

const observeElement = (element: HTMLElement): void => {
  getIntersectionObserver().observe(element);
};

const processProtectedElements = (): void => {
  const protectedElements = document.querySelectorAll('[data-protected="true"]');
  protectedElements.forEach((element) => observeElement(element as HTMLElement));
};

const observeDOM = (): void => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (element.hasAttribute("data-protected")) {
            observeElement(element);
          }

          const protectedElements = element.querySelectorAll('[data-protected="true"]');
          protectedElements.forEach((protectedEl) => {
            observeElement(protectedEl as HTMLElement);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

const decryptText = async (encryptedText: string, type: string = "text"): Promise<string> => {
  const results = await fetchDecryptedItems([{ content: encryptedText, type }]);
  const result = results[0];

  if (!result) {
    throw new Error("Unknown decryption error");
  }

  return result.raw_content;
};

const COPY_FEEDBACK_MS = 1500;

const copyButtonRevertTimeouts = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();

const copyWithExecCommand = (value: string): boolean => {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } catch {
    succeeded = false;
  }

  textarea.remove();
  return succeeded;
};

const copyToClipboard = async (value: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (error) {
      console.error("navigator.clipboard.writeText failed, falling back:", error);
    }
  }

  return copyWithExecCommand(value);
};

const handleCopyButtonClick = async (event: Event): Promise<void> => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".kt-copy-btn");
  if (!button) {
    return;
  }

  const value = button.getAttribute("data-copy-value");
  if (!value) {
    return;
  }

  const succeeded = await copyToClipboard(value);
  if (!succeeded) {
    console.error("Failed to copy to clipboard");
    return;
  }

  const copyLabel = button.getAttribute("data-copy-label") || "";
  const copiedLabel = button.getAttribute("data-copied-label") || copyLabel;

  const pendingTimeout = copyButtonRevertTimeouts.get(button);
  if (pendingTimeout) {
    clearTimeout(pendingTimeout);
  }

  button.classList.add("kt-copy-btn--copied", "kt-tooltip--visible");
  button.setAttribute("aria-label", copiedLabel);
  button.setAttribute("data-tooltip", copiedLabel);

  copyButtonRevertTimeouts.set(
    button,
    setTimeout(() => {
      button.classList.remove("kt-copy-btn--copied", "kt-tooltip--visible");
      button.setAttribute("aria-label", copyLabel);
      button.setAttribute("data-tooltip", copyLabel);
      copyButtonRevertTimeouts.delete(button);
    }, COPY_FEEDBACK_MS)
  );
};

const observeCopyButtons = (): void => {
  document.addEventListener("click", handleCopyButtonClick);
};

const initProtection = (): void => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processProtectedElements);
  } else {
    processProtectedElements();
  }

  observeDOM();
  observeCopyButtons();
};

const kotlinskidevProtection = {
  decryptText,
  processProtectedElements,
  processElement: observeElement,
  initProtection,
};

initProtection();

(window as any).kotlinskidevProtection = kotlinskidevProtection;
