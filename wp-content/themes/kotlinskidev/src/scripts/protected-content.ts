/**
 * Protected Content Frontend Handler
 */

interface ProtectionConfig {
  ajaxUrl: string;
  nonce: string;
  errorText: string;
}

const getConfig = (): ProtectionConfig => {
  return (
    (window as any).kotlinskidevProtectionConfig || {
      ajaxUrl: "/wp-admin/admin-ajax.php",
      nonce: "",
      errorText: "Failed to load protected content",
    }
  );
};

const decryptContent = async (
  element: HTMLElement,
  encryptedContent: string,
  type: string
): Promise<void> => {
  const config = getConfig();

  try {
    const formData = new FormData();
    formData.append("action", "kotlinskidev_decrypt_content");
    formData.append("content", encryptedContent);
    formData.append("type", type);
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
      revealContent(element, result.data.content, type);
    } else {
      if (result.data?.error_code === "nonce_expired") {
        await retryWithFreshNonce(element, encryptedContent, type);
      } else {
        throw new Error(result.data?.message || result.data || "Unknown decryption error");
      }
    }
  } catch (error) {
    console.error("Failed to decrypt protected content:", error);
    showError(element, type);
  }
};

const retryWithFreshNonce = async (
  element: HTMLElement,
  encryptedContent: string,
  type: string
): Promise<void> => {
  const config = getConfig();

  try {
    const nonceFormData = new FormData();
    nonceFormData.append("action", "kotlinskidev_get_fresh_nonce");

    const nonceResponse = await fetch(config.ajaxUrl, {
      method: "POST",
      body: nonceFormData,
    });

    if (nonceResponse.ok) {
      const nonceResult = await nonceResponse.json();
      if (nonceResult.success) {
        (window as any).kotlinskidevProtectionConfig.nonce = nonceResult.data.nonce;

        await decryptContent(element, encryptedContent, type);
        return;
      }
    }

    throw new Error("Failed to refresh security token");
  } catch (error) {
    console.error("Failed to get fresh nonce:", error);
    showError(element, type);
  }
};

const revealContent = (element: HTMLElement, content: string, type: string): void => {
  element.innerHTML = content;
  element.classList.remove("protection-loading");
  element.classList.add("protection-loaded");
  element.removeAttribute("data-original-content");
  element.setAttribute("aria-label", `Protected ${type} content revealed`);
};

const showError = (element: HTMLElement, type: string): void => {
  const config = getConfig();
  element.innerHTML = config.errorText;
  element.classList.remove("protection-loading");
  element.classList.add("protection-error");
  element.setAttribute("aria-label", `Failed to load protected ${type} content`);
};

const showLoading = (element: HTMLElement): void => {
  const themeUrl =
    (window as any).kotlinskidevProtectionConfig?.themeUrl || "/wp-content/themes/kotlinskidev";
  element.innerHTML = `<img src="${themeUrl}/assets/images/loading.svg" alt="Loading..." class="protection-loading-spinner" />`;
  element.classList.add("protection-loading");
};

const processElement = (element: HTMLElement): void => {
  const originalContent = element.getAttribute("data-original-content");
  const protectionType = element.getAttribute("data-protection-type") || "text";

  if (!originalContent) {
    console.warn("Protected element missing original content data");
    return;
  }

  showLoading(element);

  setTimeout(
    () => {
      decryptContent(element, originalContent, protectionType);
    },
    Math.random() * 500 + 200
  );
};

const processProtectedElements = (): void => {
  const protectedElements = document.querySelectorAll('[data-protected="true"]');
  protectedElements.forEach((element) => {
    processElement(element as HTMLElement);
  });
};

const observeDOM = (): void => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (element.hasAttribute("data-protected")) {
            processElement(element);
          }

          const protectedElements = element.querySelectorAll('[data-protected="true"]');
          protectedElements.forEach((protectedEl) => {
            processElement(protectedEl as HTMLElement);
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
  const config = getConfig();

  try {
    const formData = new FormData();
    formData.append("action", "kotlinskidev_decrypt_content");
    formData.append("content", encryptedText);
    formData.append("type", type);
    formData.append("nonce", config.nonce);

    const response = await fetch(config.ajaxUrl, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return result.data.raw_content;
    } else {
      if (result.data?.error_code === "nonce_expired") {
        return await retryDecryptTextWithFreshNonce(encryptedText, type);
      } else {
        throw new Error(result.data?.message || result.data || "Unknown decryption error");
      }
    }
  } catch (error) {
    console.error("Failed to decrypt text:", error);
    throw error;
  }
};

const retryDecryptTextWithFreshNonce = async (
  encryptedText: string,
  type: string
): Promise<string> => {
  const config = getConfig();

  const nonceFormData = new FormData();
  nonceFormData.append("action", "kotlinskidev_get_fresh_nonce");

  const nonceResponse = await fetch(config.ajaxUrl, {
    method: "POST",
    body: nonceFormData,
  });

  if (nonceResponse.ok) {
    const nonceResult = await nonceResponse.json();
    if (nonceResult.success) {
      (window as any).kotlinskidevProtectionConfig.nonce = nonceResult.data.nonce;

      const retryFormData = new FormData();
      retryFormData.append("action", "kotlinskidev_decrypt_content");
      retryFormData.append("content", encryptedText);
      retryFormData.append("type", type);
      retryFormData.append("nonce", nonceResult.data.nonce);

      const retryResponse = await fetch(config.ajaxUrl, {
        method: "POST",
        body: retryFormData,
      });

      const retryResult = await retryResponse.json();
      if (retryResult.success) {
        return retryResult.data.raw_content;
      }
    }
  }

  throw new Error("Failed to refresh security token and decrypt content");
};

const initProtection = (): void => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processProtectedElements);
  } else {
    processProtectedElements();
  }

  observeDOM();
};

const kotlinskidevProtection = {
  decryptText,
  processProtectedElements,
  processElement,
  initProtection,
};

initProtection();

(window as any).kotlinskidevProtection = kotlinskidevProtection;
