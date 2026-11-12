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

interface AttachmentMessages {
  count: string;
  total: string;
  file: string;
  type: string;
  remove: string;
}

interface AttachmentConfig {
  maxFiles: number;
  maxTotal: number;
  maxFile: number;
  extensions: string[];
  messages: AttachmentMessages;
}

const BYTES_PER_MEGABYTE = 1024 * 1024;

const readAttachmentConfig = (form: HTMLFormElement): AttachmentConfig | null => {
  const { attachmentsMaxFiles, attachmentsMaxTotal, attachmentsMaxFile } = form.dataset;
  const { attachmentsExtensions, attachmentsMessages } = form.dataset;
  if (!attachmentsMaxFiles || !attachmentsMaxTotal || !attachmentsMaxFile) {
    return null;
  }
  try {
    return {
      maxFiles: Number(attachmentsMaxFiles),
      maxTotal: Number(attachmentsMaxTotal),
      maxFile: Number(attachmentsMaxFile),
      extensions: (attachmentsExtensions ?? "").split(",").filter(Boolean),
      messages: JSON.parse(attachmentsMessages ?? "{}") as AttachmentMessages,
    };
  } catch {
    return null;
  }
};

const formatBytes = (bytes: number): string =>
  bytes >= BYTES_PER_MEGABYTE
    ? `${(bytes / BYTES_PER_MEGABYTE).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const fillMessage = (template: string, value: string | number): string =>
  template.replace("%s", String(value));

const fileExtension = (name: string): string => {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot + 1).toLowerCase();
};

const validateAttachments = (files: File[], config: AttachmentConfig): string => {
  if (files.length > config.maxFiles) {
    return fillMessage(config.messages.count, config.maxFiles);
  }
  for (const file of files) {
    if (!config.extensions.includes(fileExtension(file.name))) {
      return fillMessage(config.messages.type, file.name);
    }
    if (file.size > config.maxFile) {
      return fillMessage(config.messages.file, file.name);
    }
  }
  const total = files.reduce((sum, file) => sum + file.size, 0);
  return total > config.maxTotal
    ? fillMessage(config.messages.total, formatBytes(config.maxTotal))
    : "";
};

const sameFile = (a: File, b: File): boolean =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

const syncInputFiles = (input: HTMLInputElement, files: File[]): boolean => {
  try {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
    return true;
  } catch {
    return false;
  }
};

const setupAttachments = (form: HTMLFormElement): void => {
  const config = readAttachmentConfig(form);
  const input = form.querySelector<HTMLInputElement>(".kt-contact-attachments__input");
  const list = form.querySelector<HTMLUListElement>(".kt-contact-attachments__list");
  const errorBox = form.querySelector<HTMLElement>(".kt-contact-attachments__error");
  if (!config || !input || !list || !errorBox) {
    return;
  }

  let selected: File[] = [];

  const render = (): void => {
    list.replaceChildren();
    selected.forEach((file) => {
      const item = document.createElement("li");
      item.className = "kt-contact-attachments__item";
      const label = document.createElement("span");
      label.textContent = `${file.name} (${formatBytes(file.size)})`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "kt-contact-attachments__remove";
      remove.textContent = "×";
      remove.setAttribute("aria-label", fillMessage(config.messages.remove, file.name));
      remove.addEventListener("click", () => {
        selected = selected.filter((candidate) => candidate !== file);
        syncInputFiles(input, selected);
        update();
        input.focus();
      });
      item.append(label, remove);
      list.append(item);
    });
  };

  const showError = (message: string): void => {
    errorBox.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const update = (): void => {
    render();
    showError(validateAttachments(selected, config));
  };

  input.addEventListener("change", () => {
    const incoming = Array.from(input.files ?? []);
    const added = incoming.filter((file) => !selected.some((known) => sameFile(known, file)));
    const merged = [...selected, ...added];
    selected = syncInputFiles(input, merged) ? merged : incoming;
    update();
  });

  form.addEventListener("submit", (event) => {
    const message = validateAttachments(selected, config);
    if (message) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showError(message);
      input.focus();
    }
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
    setupAttachments(form);
    keepNonceFresh(form);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
