import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import apiFetch from "@wordpress/api-fetch";

jest.mock("@wordpress/api-fetch", () => ({ __esModule: true, default: jest.fn() }));

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  BlockControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: ({ allowedBlocks }: { allowedBlocks: string[] }) => (
    <div data-testid="inner-blocks" data-allowed={allowedBlocks.join(",")} />
  ),
  __experimentalLinkControl: ({ onChange }: { onChange: (value: { url: string }) => void }) => (
    <button onClick={() => onChange({ url: "https://example.com" })}>link-control</button>
  ),
  __experimentalPanelColorGradientSettings: () => null,
}));

jest.mock("../../shared/nav-icon-picker", () => ({
  NavIconPicker: () => <div data-testid="nav-icon-picker" />,
}));

import Edit, { type SpeedDialItemAttributes } from "./edit";
import { buildTriggerOptions } from "./action-fields";

const mockedFetch = apiFetch as unknown as jest.Mock;

function baseAttributes(): SpeedDialItemAttributes {
  return {
    action: "phone",
    useSiteContact: true,
    value: "",
    triggerAction: "",
    label: "",
    ariaLabel: "",
    opensInNewTab: false,
    icon: "",
    iconId: 0,
    iconUrl: "",
    backgroundColor: "",
    textColor: "",
  };
}

function setup(attributes: Partial<SpeedDialItemAttributes> = {}) {
  const setAttributes = jest.fn();
  const utils = render(
    <Edit attributes={{ ...baseAttributes(), ...attributes }} setAttributes={setAttributes} />
  );
  return { ...utils, setAttributes };
}

describe("speed-dial item Edit", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedFetch.mockResolvedValue({ features: ["biggerText"], profiles: ["adhdFriendly"] });
    delete window.kotlinskidevSpeedDial;
  });

  it("shows the default label of the action on the canvas", () => {
    setup({ action: "email" });

    expect(screen.getByText("Email us")).toBeInTheDocument();
  });

  it("switches the action through the select", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup();

    await user.selectOptions(screen.getByRole("combobox", { name: "Action type" }), "url");

    expect(setAttributes).toHaveBeenCalledWith({ action: "url" });
  });

  it("shows the site-contact toggle for phone and reveals the value field when off", () => {
    const { unmount } = setup({ action: "phone" });
    expect(screen.getByRole("checkbox", { name: "Use the site contact details" })).toBeChecked();
    expect(screen.queryByRole("textbox", { name: "Phone number" })).not.toBeInTheDocument();
    unmount();

    setup({ action: "phone", useSiteContact: false });
    expect(screen.getByRole("textbox", { name: "Phone number" })).toBeInTheDocument();
  });

  it("hints at an invalid email override", () => {
    setup({ action: "email", useSiteContact: false, value: "nope" });

    expect(screen.getByText("Enter an address like name@example.com.")).toBeInTheDocument();
  });

  it("shows the link control and new-tab toggle for url and writes the url", async () => {
    const user = userEvent.setup();
    const { setAttributes } = setup({ action: "url" });

    await user.click(screen.getByRole("button", { name: "link-control" }));
    await user.click(screen.getByRole("checkbox", { name: "Open in a new tab" }));

    expect(setAttributes).toHaveBeenCalledWith({ value: "https://example.com" });
    expect(setAttributes).toHaveBeenCalledWith({ opensInNewTab: true });
  });

  it("warns about a javascript url", () => {
    setup({ action: "url", value: "javascript:alert(1)" });

    expect(screen.getAllByText(/Use a link starting with/).length).toBeGreaterThan(0);
  });

  it("loads trigger options from the accessibility plugin endpoint", async () => {
    setup({ action: "trigger" });

    await waitFor(() =>
      expect(mockedFetch).toHaveBeenCalledWith({ path: "/kotlinskidev-a11y/v1/trigger-options" })
    );
    expect(screen.getByRole("combobox", { name: "Accessibility action" })).toBeInTheDocument();
  });

  it("shows a notice when the trigger options request returns 404", async () => {
    mockedFetch.mockRejectedValue({ code: "rest_no_route", data: { status: 404 } });
    setup({ action: "trigger" });

    await waitFor(() =>
      expect(screen.getAllByText(/accessibility plugin did not answer/).length).toBeGreaterThan(0)
    );
  });

  it("flags an invalid trigger action", async () => {
    setup({ action: "trigger", triggerAction: "Bad Action" });

    expect(await screen.findByText(/Use a name like open/)).toBeInTheDocument();
    await waitFor(() => expect(mockedFetch).toHaveBeenCalled());
  });

  it("warns when the aria-label does not contain the visible label", async () => {
    const user = userEvent.setup();
    setup({ action: "phone", label: "Call us", ariaLabel: "Telephone" });
    await user.click(screen.getByRole("button", { name: "Label and icon" }));

    expect(screen.getAllByText(/WCAG 2.5.3/).length).toBeGreaterThan(0);
  });

  it("does not warn when the aria-label contains the visible label", async () => {
    const user = userEvent.setup();
    setup({ action: "phone", label: "Call us", ariaLabel: "Call us today" });
    await user.click(screen.getByRole("button", { name: "Label and icon" }));

    expect(document.querySelector(".components-notice")).toBeNull();
  });

  it("renders inner blocks limited to the localised allow-list for a custom action", () => {
    window.kotlinskidevSpeedDial = { customAllowedBlocks: ["core/html", "wpcode/snippet"] };
    setup({ action: "custom" });

    expect(screen.getByTestId("inner-blocks")).toHaveAttribute(
      "data-allowed",
      "core/html,wpcode/snippet"
    );
  });

  it("falls back to html and shortcode blocks when nothing was localised", () => {
    setup({ action: "custom" });

    expect(screen.getByTestId("inner-blocks")).toHaveAttribute(
      "data-allowed",
      "core/html,core/shortcode"
    );
  });
});

describe("buildTriggerOptions", () => {
  it("prefixes features and profiles and keeps the static actions", () => {
    const values = buildTriggerOptions({
      features: ["biggerText", { key: "contrast", label: "Contrast" }],
      profiles: ["adhdFriendly"],
    }).map((option) => option.value);

    expect(values).toEqual([
      "open",
      "close",
      "toggle",
      "reset",
      "feature:biggerText",
      "feature:contrast",
      "profile:adhdFriendly",
    ]);
  });
});
