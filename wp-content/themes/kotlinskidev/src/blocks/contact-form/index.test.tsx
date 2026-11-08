import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBlockType } from "@wordpress/blocks";

jest.mock("@wordpress/blocks", () => ({
  registerBlockType: jest.fn(),
}));

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import "./index";
import metadata from "./block.json";

function getDefinition() {
  const call = (registerBlockType as jest.Mock).mock.calls[0];
  return call[1];
}

function baseAttributes() {
  return {
    nameLabel: "Name",
    namePlaceholder: "Your Name",
    emailLabel: "Email",
    emailPlaceholder: "Your Email",
    topicLabel: "Topic",
    topicPlaceholder: "Topic",
    messageLabel: "Message",
    messagePlaceholder: "Your Message",
    agreeLabel: "I agree to be contacted via email.",
    submitLabel: "Send",
    successMessage: "Thank you! Your message has been sent.",
    errorMessage: "Sorry, there was an error. Please try again.",
    enableCaptcha: false,
    captchaProvider: "recaptcha" as const,
    recaptchaSiteKey: "",
    recaptchaSecretKey: "",
    turnstileSiteKey: "",
    turnstileSecretKey: "",
    redirectType: "query_param" as const,
    thankYouPageUrl: "",
  };
}

describe("contact-form registration", () => {
  it("registers under the block.json name with a null save", () => {
    const definition = getDefinition();

    expect(registerBlockType).toHaveBeenCalledWith(
      expect.objectContaining({ name: metadata.name }),
      expect.any(Object)
    );
    expect(definition.save()).toBeNull();
  });
});

describe("contact-form Edit", () => {
  function getEdit() {
    return getDefinition().edit;
  }

  function renderEdit(overrides: Partial<ReturnType<typeof baseAttributes>> = {}) {
    const Edit = getEdit();
    const setAttributes = jest.fn();
    const utils = render(
      <Edit attributes={{ ...baseAttributes(), ...overrides }} setAttributes={setAttributes} />
    );
    return { ...utils, setAttributes };
  }

  it("renders the preview inputs with their configured labels and placeholders", () => {
    renderEdit({ nameLabel: "Full Name", namePlaceholder: "Jane Doe" });

    const nameInput = screen.getByPlaceholderText("Jane Doe");
    expect(nameInput).toBeDisabled();
    expect(screen.getByText("Full Name")).toBeInTheDocument();
  });

  it("renders the submit button with the configured label, disabled", () => {
    renderEdit({ submitLabel: "Get in touch" });

    expect(screen.getByRole("button", { name: "Get in touch" })).toBeDisabled();
  });

  it("updates the name label", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Name Label"), "X");

    expect(setAttributes).toHaveBeenLastCalledWith({ nameLabel: "NameX" });
  });

  it("updates the message placeholder via the textarea control", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();

    await user.type(screen.getByLabelText("Message Placeholder"), "X");

    expect(setAttributes).toHaveBeenLastCalledWith({ messagePlaceholder: "Your MessageX" });
  });

  it("keeps the CAPTCHA panel collapsed by default", () => {
    renderEdit();

    expect(
      screen.queryByRole("checkbox", { name: "Enable CAPTCHA Protection" })
    ).not.toBeInTheDocument();
  });

  it("enables CAPTCHA protection", async () => {
    const user = userEvent.setup();
    const { setAttributes } = renderEdit();
    await user.click(screen.getByRole("button", { name: "CAPTCHA Settings" }));

    await user.click(screen.getByRole("checkbox", { name: "Enable CAPTCHA Protection" }));

    expect(setAttributes).toHaveBeenCalledWith({ enableCaptcha: true });
  });

  it("shows the recaptcha key fields by default once CAPTCHA is enabled", async () => {
    const user = userEvent.setup();
    renderEdit({ enableCaptcha: true });
    await user.click(screen.getByRole("button", { name: "CAPTCHA Settings" }));

    expect(screen.getByLabelText("reCAPTCHA Site Key")).toBeInTheDocument();
    expect(screen.getByLabelText("reCAPTCHA Secret Key")).toBeInTheDocument();
    expect(screen.queryByLabelText("Turnstile Site Key")).not.toBeInTheDocument();
  });

  it("switches to the turnstile key fields when that provider is selected", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    const Edit = getEdit();
    render(
      <Edit
        attributes={{ ...baseAttributes(), enableCaptcha: true }}
        setAttributes={setAttributes}
      />
    );
    await user.click(screen.getByRole("button", { name: "CAPTCHA Settings" }));

    await user.selectOptions(
      screen.getByRole("combobox", { name: "CAPTCHA Provider" }),
      "Cloudflare Turnstile"
    );

    expect(setAttributes).toHaveBeenCalledWith({ captchaProvider: "turnstile" });
  });

  it("renders the turnstile key fields once that provider is active", async () => {
    const user = userEvent.setup();
    renderEdit({ enableCaptcha: true, captchaProvider: "turnstile" });
    await user.click(screen.getByRole("button", { name: "CAPTCHA Settings" }));

    expect(screen.getByLabelText("Turnstile Site Key")).toBeInTheDocument();
    expect(screen.getByLabelText("Turnstile Secret Key")).toBeInTheDocument();
    expect(screen.queryByLabelText("reCAPTCHA Site Key")).not.toBeInTheDocument();
  });

  it("hides the CAPTCHA preview until a site key is configured", () => {
    renderEdit({ enableCaptcha: true, captchaProvider: "recaptcha", recaptchaSiteKey: "" });

    expect(screen.queryByText("reCAPTCHA will appear here")).not.toBeInTheDocument();
  });

  it("shows the recaptcha preview once a site key is set", () => {
    renderEdit({ enableCaptcha: true, captchaProvider: "recaptcha", recaptchaSiteKey: "abc" });

    expect(screen.getByText("reCAPTCHA will appear here")).toBeInTheDocument();
  });

  it("shows the turnstile preview once a site key is set", () => {
    renderEdit({ enableCaptcha: true, captchaProvider: "turnstile", turnstileSiteKey: "abc" });

    expect(screen.getByText("Cloudflare Turnstile will appear here")).toBeInTheDocument();
  });

  it("hides any CAPTCHA preview when CAPTCHA is disabled even with a site key set", () => {
    renderEdit({ enableCaptcha: false, recaptchaSiteKey: "abc" });

    expect(screen.queryByText("reCAPTCHA will appear here")).not.toBeInTheDocument();
  });

  it("keeps the Redirect Settings panel collapsed by default", () => {
    renderEdit();

    expect(
      screen.queryByRole("combobox", { name: "After Form Submission" })
    ).not.toBeInTheDocument();
  });

  it("hides the thank-you URL field for the default redirect type", async () => {
    const user = userEvent.setup();
    renderEdit({ redirectType: "query_param" });
    await user.click(screen.getByRole("button", { name: "Redirect Settings" }));

    expect(screen.queryByLabelText("Thank You Page URL")).not.toBeInTheDocument();
  });

  it("shows and wires the thank-you URL field for the thank-you-page redirect type", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    const Edit = getEdit();
    render(
      <Edit
        attributes={{ ...baseAttributes(), redirectType: "thank_you_page" }}
        setAttributes={setAttributes}
      />
    );
    await user.click(screen.getByRole("button", { name: "Redirect Settings" }));

    await user.type(screen.getByLabelText("Thank You Page URL"), "h");

    expect(setAttributes).toHaveBeenCalledWith({ thankYouPageUrl: "h" });
  });

  it("updates the redirect type", async () => {
    const user = userEvent.setup();
    const setAttributes = jest.fn();
    const Edit = getEdit();
    render(<Edit attributes={{ ...baseAttributes() }} setAttributes={setAttributes} />);
    await user.click(screen.getByRole("button", { name: "Redirect Settings" }));

    await user.selectOptions(
      screen.getByRole("combobox", { name: "After Form Submission" }),
      "Redirect to thank you page"
    );

    expect(setAttributes).toHaveBeenCalledWith({ redirectType: "thank_you_page" });
  });
});
