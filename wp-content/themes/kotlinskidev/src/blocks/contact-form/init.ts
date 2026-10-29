import { trackEvent } from "../../scripts/track-event";

const init = (): void => {
  document.querySelectorAll<HTMLFormElement>(".contact-form-ts").forEach((form) => {
    form.addEventListener(
      "focusin",
      () => trackEvent("form_start", { form_name: "contact_form" }),
      {
        once: true,
      }
    );
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
