import { trackEvent } from "../../scripts/track-event";

const NONCE_MAX_AGE_MS = 10 * 60 * 1000;

interface NonceResponse {
  success?: boolean;
  data?: { nonce?: string };
}

const fetchNonce = async (form: HTMLFormElement): Promise<boolean> => {
  const url = form.dataset.nonceUrl;
  const field = form.querySelector<HTMLInputElement>(
    'input[name="kotlinskidev_contact_form_nonce"]'
  );
  if (!url || !field) {
    return false;
  }
  try {
    const response = await fetch(url, { cache: "no-store", credentials: "same-origin" });
    const payload = (await response.json()) as NonceResponse;
    const nonce = payload.data?.nonce;
    if (!payload.success || !nonce) {
      return false;
    }
    field.value = nonce;
    return true;
  } catch {
    return false;
  }
};

const keepNonceFresh = (form: HTMLFormElement): void => {
  let refreshedAt = 0;

  const refresh = async (): Promise<void> => {
    if (await fetchNonce(form)) {
      refreshedAt = Date.now();
    }
  };

  void refresh();

  form.addEventListener("submit", (event) => {
    if (Date.now() - refreshedAt < NONCE_MAX_AGE_MS) {
      return;
    }
    event.preventDefault();
    void refresh().then(() => {
      refreshedAt = Date.now();
      form.submit();
    });
  });
};

const init = (): void => {
  document.querySelectorAll<HTMLFormElement>(".contact-form-ts").forEach((form) => {
    form.addEventListener(
      "focusin",
      () => trackEvent("form_start", { form_name: "contact_form" }),
      {
        once: true,
      }
    );
    keepNonceFresh(form);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
