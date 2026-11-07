import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

const mockSetMeta = jest.fn();
let mockPostType = "kt_offer";
let mockMeta: Record<string, unknown> | undefined = {};

jest.mock("@wordpress/plugins", () => ({ registerPlugin: jest.fn() }), { virtual: true });
jest.mock(
  "@wordpress/editor",
  () => ({
    PluginDocumentSettingPanel: ({ children }: { children: unknown }) =>
      jest.requireActual("react").createElement("div", null, children),
  }),
  { virtual: true }
);
jest.mock("@wordpress/components", () => {
  const { createElement } = jest.requireActual("react");
  const stub = () => null;
  return {
    Button: ({ children, onClick, disabled }: Record<string, unknown>) =>
      createElement("button", { type: "button", onClick, disabled }, children as string),
    SelectControl: stub,
    TextControl: stub,
    ToggleControl: stub,
    __experimentalNumberControl: stub,
  };
});
jest.mock("@wordpress/data", () => ({
  useSelect: () => mockPostType,
}));
jest.mock("@wordpress/core-data", () => ({
  useEntityProp: () => [mockMeta, mockSetMeta],
}));

import { registerPlugin } from "@wordpress/plugins";
import {
  OfferPanel,
  createEmptyVariant,
  moveVariant,
  removeVariant,
  toNullableNumber,
  updateVariant,
} from "./panel";

describe("offer panel helpers", () => {
  it("creates empty variants with sequential keys", () => {
    expect(createEmptyVariant(0).key).toBe("variant-1");
    expect(createEmptyVariant(2)).toEqual(
      expect.objectContaining({ price_from: null, price_period: "once", duration_unit: "days" })
    );
  });

  it("moves, updates and removes variants immutably", () => {
    const a = { ...createEmptyVariant(0), key: "a" };
    const b = { ...createEmptyVariant(1), key: "b" };
    expect(moveVariant([a, b], 0, 1).map((v) => v.key)).toEqual(["b", "a"]);
    expect(moveVariant([a, b], 0, -1)).toEqual([a, b]);
    expect(updateVariant([a, b], 1, { label: "X" })[1].label).toBe("X");
    expect(removeVariant([a, b], 0)).toEqual([b]);
  });

  it("parses nullable numbers", () => {
    expect(toNullableNumber("")).toBeNull();
    expect(toNullableNumber(undefined)).toBeNull();
    expect(toNullableNumber("250")).toBe(250);
  });
});

describe("OfferPanel", () => {
  beforeEach(() => {
    mockSetMeta.mockClear();
    mockPostType = "kt_offer";
    mockMeta = { offer_key: "website", currency: "EUR", is_placeholder: false, variants: [] };
  });

  it("registers the plugin", () => {
    expect(registerPlugin).toHaveBeenCalledWith(
      "kotlinskidev-offer-panel",
      expect.objectContaining({ render: OfferPanel })
    );
  });

  it("renders nothing for other post types", () => {
    mockPostType = "post";
    const { container } = render(<OfferPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it("adds a variant to meta", () => {
    render(<OfferPanel />);
    fireEvent.click(screen.getByText("Add variant"));
    expect(mockSetMeta).toHaveBeenCalledWith(
      expect.objectContaining({
        variants: [expect.objectContaining({ key: "variant-1" })],
      })
    );
  });

  it("removes a variant from meta", () => {
    mockMeta = { ...mockMeta, variants: [createEmptyVariant(0)] };
    render(<OfferPanel />);
    fireEvent.click(screen.getByText("Remove variant"));
    expect(mockSetMeta).toHaveBeenCalledWith(expect.objectContaining({ variants: [] }));
  });
});
